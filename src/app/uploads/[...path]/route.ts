const BACKEND_URL = process.env.API_BASE_URL?.replace(/\/api\/?$/, "") ?? "http://localhost:4000";

const HOP_BY_HOP_HEADERS = ["host", "content-length", "transfer-encoding", "connection"];

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join("/");
  const search = new URL(req.url).search;
  const target = `${BACKEND_URL}/uploads/${path}${search}`;

  const headers = new Headers(req.headers);
  HOP_BY_HOP_HEADERS.forEach((h) => headers.delete(h));

  const res = await fetch(target, { headers });

  return new Response(res.body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/octet-stream",
      "cache-control": res.headers.get("cache-control") ?? "public, max-age=31536000",
    },
  });
}
