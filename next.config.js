/** @type {import('next').NextConfig} */

// 后端服务地址，从环境变量读取
const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';

const nextConfig = {
  // Proxy API and static files to backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/static/:path*',
        destination: `${backendUrl}/static/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
