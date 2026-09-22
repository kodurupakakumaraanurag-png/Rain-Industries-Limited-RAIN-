/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./prisma/**/*'],
      '/**/*': ['./prisma/**/*'],
    },
  },
};

module.exports = nextConfig;
