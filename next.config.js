/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    '/api/**/*': ['./prisma/**/*'],
    '/**/*': ['./prisma/**/*'],
  },
};

module.exports = nextConfig;
