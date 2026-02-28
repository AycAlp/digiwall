import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'

/** @type {import('next').NextConfig} */
const nextConfig = {}

// Set up Cloudflare dev platform for local development
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform()
}

export default nextConfig
