import { getScrapeJobStatus as _getScrapeJobStatus, getAllScrapeJobs as _getAllScrapeJobs, getQueueStats as _getQueueStats } from '../services/scrapeService.js';
import { logger } from '../config/logger.js';

class ScrapeController {
  async getScrapeJobStatus(req, res) {
    try {
      const { id } = req.params;
      const status = await _getScrapeJobStatus(id);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      logger.error('Error getting scrape job status:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getAllScrapeJobs(req, res) {
    try {
      const { status, outletId, limit } = req.query;

      const filters = {
        status,
        outletId,
        limit: limit ? parseInt(limit) : 50
      };

      const jobs = await _getAllScrapeJobs(filters);

      res.json({
        success: true,
        data: jobs,
        count: jobs.length
      });
    } catch (error) {
      logger.error('Error getting scrape jobs:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getQueueStats(req, res) {
    try {
      const stats = await _getQueueStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting queue stats:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

const controller = new ScrapeController();

export const getAllScrapeJobs = controller.getAllScrapeJobs.bind(controller);
export const getScrapeJobStatus = controller.getScrapeJobStatus.bind(controller);
export const getQueueStats = controller.getQueueStats.bind(controller);

export default controller;
