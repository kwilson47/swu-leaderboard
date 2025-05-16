/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['cdn.discordapp.com'],
  },
  // Explicitly expose environment variables to the browser
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    MONGODB_URI: process.env.MONGODB_URI
  },
  // Force dynamic rendering for all pages
  // This ensures pages are rendered at request time with fresh data
  output: 'standalone',
  staticPageGenerationTimeout: 1000,
  experimental: {
    // Force dynamic rendering
    workerThreads: false,
    cpus: 1
  },
}

module.exports = nextConfig 