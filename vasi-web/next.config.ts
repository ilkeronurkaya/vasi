import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Local dev'de API isteklerini wrangler dev'e yönlendir
    // Production'da Cloudflare Pages, aynı domain üzerinde çalışır
    const apiBase = process.env.API_BASE_URL ?? 'http://localhost:8787'
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiBase}/api/v1/:path*`,
      },
    ]
  },
}

export default nextConfig;
