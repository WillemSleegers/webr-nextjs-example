/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://unrivaled-cranachan-f0332f.netlify.app",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
