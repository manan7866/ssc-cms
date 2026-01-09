/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,
  async headers() {
    // Use environment variable for allowed origin, with fallback to localhost for development
    // For production deployment, this should be set in Vercel environment variables
    const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:6020';

    return [
      {
        // Apply CORS headers to API routes specifically
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: websiteUrl, // Allow requests from the specified website URL
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Accept, Authorization, Range',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Vary',
            value: 'Origin',
          },
        ],
      },
      {
        // Apply general headers to all other routes
        source: '/((?!api/).*)', // Match all routes except /api/*
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: websiteUrl,
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Accept, Authorization',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'; // Fallback URL
    return [
      {
        source: "/v1/:path*",
        destination: `${backendUrl}/v1/:path*`,
      },
    ];
  },
};
export default nextConfig;
