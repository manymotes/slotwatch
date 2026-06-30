/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    API_URL: process.env.API_URL || '',
  },
}
export default config
