import rateLimit from 'express-rate-limit';
import { rateLimit as rlConfig, server } from '../config/index.js';
import { logger } from '../config/logger.js';

export const limiter = rateLimit({
  windowMs: rlConfig.windowMs,
  max: rlConfig.maxRequests,
  message: { success: false, error: 'Too many requests, slow down.' },
  standardHeaders: true,
  legacyHeaders: false
});

export const errorHandler = (err, req, res, _next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(server.env === 'development' && { stack: err.stack })
  });
};

export const notFound = (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
};

export const requestTimer = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
};
