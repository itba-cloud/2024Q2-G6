/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    API_KEY: process.env.API_KEY,
    API_BASE: process.env.API_BASE,
    LOGIN_URL: process.env.LOGIN_URL,
    LOGIN_CLIENT_ID:  process.env.LOGIN_CLIENT_ID,
    REDIRECT_URI:  process.env.REDIRECT_URI,
    AUTH_URL:  process.env.AUTH_URL
  },
};

module.exports = nextConfig;
