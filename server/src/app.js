import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { server } from './config/index.js';
import { logger } from './config/logger.js';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import { limiter, errorHandler, notFound, requestTimer } from './middleware/error.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: ['https://news-trace-sigma.vercel.app/', 'https://newstrace-k9mf.onrender.com'], credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (server.env === 'development') app.use(morgan('dev'));
app.use(requestTimer);
app.use('/api/', limiter);
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
    app.listen(server.port, () => {
      logger.info(`NewsTrace running on port ${server.port} [${server.env}]`);
      console.log(`\n  NewsTrace API → http://localhost:${server.port}\n`);
    });
  } catch (err) {
    logger.error('Startup failed:', err);
    process.exit(1);
  }
};

start();

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  process.exit(0);
});

export default app;