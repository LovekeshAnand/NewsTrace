import * as scrapeService from '../services/scrapeService.js';

// Get status of a specific scrape job
export const getScrapeJobStatus = async (req, res, next) => {
  try {
    const status = await scrapeService.getScrapeJobStatus(req.params.id);
    res.json({ success: true, data: status });
  } catch (err) { next(err); }
};

// List all scrape jobs with optional filters
export const getAllScrapeJobs = async (req, res, next) => {
  try {
    const { status, outletId, limit } = req.query;
    const jobs = await scrapeService.getAllScrapeJobs({ status, outletId, limit: limit ? +limit : 50 });
    res.json({ success: true, data: jobs, count: jobs.length });
  } catch (err) { next(err); }
};

// Get aggregate queue statistics
export const getQueueStats = async (req, res, next) => {
  try {
    const stats = await scrapeService.getQueueStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};
