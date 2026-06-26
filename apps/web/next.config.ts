import type { NextConfig } from 'next'

const config: NextConfig = {
  experimental: { typedRoutes: true },
  env: { API_URL: process.env.API_URL || 'http://localhost:3000' },
}

export default config
