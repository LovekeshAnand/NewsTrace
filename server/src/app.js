import dotenv from 'dotenv'
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { server } from './config/index.js';
import routes from './routes/index.js';
import middleware from './utils/middleware.js';


dotenv.config()
const { limiter, errorHandler, notFoundHandler, requestLogger } = middleware;

import { logger } from './config/logger.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(compression());

// Body parsing
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (server.env === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Rate limiting
app.use('/api/', limiter);

// Routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = server.port;

app.listen(PORT, () => {
  logger.info(`NewsTrace server running on port ${PORT}`);
  logger.info(`Environment: ${server.env}`);
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║     NewsTrace API Server Started         ║
  ║                                           ║
  ║  Port: ${PORT}                              ║
  ║  Environment: ${server.env}               ║
  ║  Ready to trace journalists! 🚀          ║
  ╚═══════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    logger.info('HTTP server closed');
  });
});

export default app;