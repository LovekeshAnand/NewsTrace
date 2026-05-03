import dotenv from 'dotenv';
dotenv.config();

export const server = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development'
};

export const serp = {
  apiKey: process.env.SERP_API_KEY,
  baseUrl: 'https://serpapi.com/search'
};

export const jwt = {
  secret: process.env.JWT_SECRET || 'fallback_secret',
  expire: process.env.JWT_EXPIRE || '7d'
};

export const scraping = {
  maxConcurrent: parseInt(process.env.MAX_CONCURRENT_SCRAPES) || 3,
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
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 200
};