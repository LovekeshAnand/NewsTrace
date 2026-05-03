import ScrapeJob from '../models/ScrapeJob.js';
import Outlet from '../models/Outlet.js';
import JournalistScraper from '../scrapers/journalistScraper.js';
import { findOrCreateOutlet } from './outletService.js';
import { saveJournalists } from './journalistService.js';
import { logger } from '../config/logger.js';

// Starts a scrape job and processes it in the background
export const startScrape = async (outletName, userId, targetCount = 30) => {
  const outlet = await findOrCreateOutlet(outletName);

  const job = await ScrapeJob.create({
    outlet: outlet._id, user: userId, status: 'pending', metadata: { targetCount }
  });

  processScrapeJob(job._id, outlet, targetCount).catch(err => {
    logger.error(`Background scrape failed for ${outletName}: ${err.message}`);
  });

  return {
    scrapeJobId: job._id,
    outlet: { id: outlet._id, name: outlet.name, website: outlet.website }
  };
};

const processScrapeJob = async (jobId, outlet, targetCount) => {
  try {
    await ScrapeJob.findByIdAndUpdate(jobId, { status: 'processing' });
    logger.info(`Processing scrape for ${outlet.website}`);

    const scraper = new JournalistScraper();
    const journalists = await scraper.scrapeOutlet(outlet.website, targetCount);

    await ScrapeJob.findByIdAndUpdate(jobId, { progress: 50 });
    const saved = await saveJournalists(outlet._id, journalists);

    await Outlet.findByIdAndUpdate(outlet._id, { lastScrapedAt: new Date() });
    await ScrapeJob.findByIdAndUpdate(jobId, {
      status: 'completed', progress: 100,
      totalFound: saved.length, completedAt: new Date()
    });

    logger.info(`Scrape complete: ${saved.length} journalists from ${outlet.name}`);
  } catch (err) {
    await ScrapeJob.findByIdAndUpdate(jobId, {
      status: 'failed', errorLog: { message: err.message }, completedAt: new Date()
    });
    throw err;
  }
};

export const getScrapeJobStatus = async (id) => {
  const job = await ScrapeJob.findById(id).populate('outlet', 'name website').populate('user', 'name email').lean();
  if (!job) throw Object.assign(new Error('Job not found'), { statusCode: 404 });
  return job;
};

export const getAllScrapeJobs = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.outletId) query.outlet = filters.outletId;

  return ScrapeJob.find(query)
    .populate('outlet', 'name website')
    .populate('user', 'name email')
    .sort({ startedAt: -1 })
    .limit(filters.limit || 50)
    .lean();
};

export const getQueueStats = async () => {
  const [pending, processing, completed, failed] = await Promise.all([
    ScrapeJob.countDocuments({ status: 'pending' }),
    ScrapeJob.countDocuments({ status: 'processing' }),
    ScrapeJob.countDocuments({ status: 'completed' }),
    ScrapeJob.countDocuments({ status: 'failed' })
  ]);
  return { pending, processing, completed, failed, total: pending + processing + completed + failed };
};