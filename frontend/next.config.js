const { PHASE_PRODUCTION_BUILD } = require("next/constants");
const { supabaseImagePatterns } = require("./config/supabase-image-patterns");

/** @type {import('next').NextConfig} */
const buildConfig = (isProductionBuild) => ({
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      ...supabaseImagePatterns(process.env, isProductionBuild),
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 85, 90],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; img-src 'self' data: blob: https:; frame-src 'self' https://www.google.com https://maps.google.com; child-src 'self' https://www.google.com https://maps.google.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://maps.google.com; style-src 'self' 'unsafe-inline' https://www.google.com https://maps.google.com; font-src 'self' https:; connect-src 'self' https: wss:;",
          },
        ],
      },
    ];
  },
});

module.exports = (phase) =>
  buildConfig(phase === PHASE_PRODUCTION_BUILD || (phase !== "phase-development-server" && !!process.env.VERCEL));
