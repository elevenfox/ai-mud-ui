/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy API and static files to backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
      {
        source: '/static/:path*',
        destination: 'http://localhost:8000/static/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
