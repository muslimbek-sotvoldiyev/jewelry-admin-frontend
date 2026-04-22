const BACKEND_URL = process.env.API_BASE_URL;

const HOP_BY_HOP_HEADERS = [
  "host",
  "content-length",
  "transfer-encoding",
  "connection",
];

async function handler(req: Request, { params }: { params: Promise<any> }) {
  const path = (await params).path.join("/");
  const search = new URL(req.url).search;
  const target = `${BACKEND_URL}/${path}${search}`;

  // Clean headers: remove hop-by-hop headers that cause issues when proxying
  const headers = new Headers(req.headers);

  HOP_BY_HOP_HEADERS.forEach((h) => headers.delete(h));

  // Read body as raw bytes to preserve exact content (only for non-GET/HEAD)
  const hasBody = req.method !== "GET" && req.method !== "HEAD";

  const body = hasBody ? await req.arrayBuffer() : undefined;

  const res = await fetch(target, { method: req.method, headers, body });

  return new Response(await res.text(), { status: res.status });
}

export { handler as DELETE, handler as GET, handler as PATCH, handler as POST, handler as PUT };
