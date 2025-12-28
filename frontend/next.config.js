/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; frame-src 'self' https://www.google.com https://maps.google.com; child-src 'self' https://www.google.com https://maps.google.com; script-src 'self' 'unsafe-inline' https://www.google.com https://maps.google.com; style-src 'self' 'unsafe-inline' https://www.google.com https://maps.google.com;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
