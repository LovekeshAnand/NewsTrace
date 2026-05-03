import mongoose from 'mongoose';
import { logger } from './logger.js';

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  });
  logger.info(`MongoDB connected: ${conn.connection.host}`);
};

mongoose.connection.on('error', err => logger.error('MongoDB error:', err));
mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

export default connectDB;
