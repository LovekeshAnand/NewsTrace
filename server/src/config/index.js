import dotenv from 'dotenv'

dotenv.config()

export const server = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
};
export const database = {
    url: process.env.DATABASE_URL
};
export const serp = {
    apiKey: process.env.SERP_API_KEY,
    baseUrl: 'https://serpapi.com/search'
};
export const redis = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || '',
};

export const scraping = {
  maxConcurrent: 3, // Increased back to 3 for parallel processing
  timeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
  maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
  ]
};

export const rateLimit = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
};
export const cache = {
    ttl: 3600, // 1 hour
    checkPeriod: 600 // 10 minutes
};