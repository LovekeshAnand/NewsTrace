import rateLimit from 'express-rate-limit';
import { rateLimit as _rateLimit, server } from '../config/index.js';
import { logger } from '../config/logger.js';

// Rate limiter
const limiter = rateLimit({
  windowMs: _rateLimit.windowMs,
  max: _rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Error handler
const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(server.env === 'development' && { stack: err.stack })
  });
};

// Not found handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
};

// Request logger
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
};

export default {
  limiter,
  errorHandler,
  notFoundHandler,
  requestLogger
};