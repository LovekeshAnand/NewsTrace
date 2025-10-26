import Queue from 'bull';
import { redis as _redis } from './index.js';

const scrapeQueue = new Queue('scrape-jobs', {
  redis: {
    host: _redis.host,
    port: _redis.port,
    password: _redis.password,
    tls: {},
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true, // Changed to true to prevent memory issues
    removeOnFail: false,
    timeout: 600000 // 10 minute timeout per job
  },
  settings: {
    lockDuration: 600000, // 10 minutes - prevents stalling
    lockRenewTime: 300000, // 5 minutes
    stalledInterval: 300000, // Check for stalled jobs every 5 minutes
    maxStalledCount: 1 // Allow 1 stall before failing
  }
});

scrapeQueue.on('error', (error) => console.error('Queue error:', error));
scrapeQueue.on('failed', (job, err) => console.error(`Job ${job.id} failed:`, err));
scrapeQueue.on('stalled', (job) => console.warn(`Job ${job.id} stalled, will retry`));

export const add = (...args) => scrapeQueue.add(...args);
export const process = (...args) => scrapeQueue.process(...args);
export const getJobs = (...args) => scrapeQueue.getJobs(...args);
export const getWaitingCount = () => scrapeQueue.getWaitingCount();
export const getActiveCount = () => scrapeQueue.getActiveCount();
export const getCompletedCount = () => scrapeQueue.getCompletedCount();
export const getFailedCount = () => scrapeQueue.getFailedCount();

export default scrapeQueue;