/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  output: "standalone",
};
module.exports = nextConfig;
