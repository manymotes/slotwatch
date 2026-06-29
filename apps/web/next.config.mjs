/** @type {import('next').NextConfig} */
const config = {
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3000',
  },
}
export default config
