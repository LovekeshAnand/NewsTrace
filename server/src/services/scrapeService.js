import { process, add, getJobs, getWaitingCount, getActiveCount, getCompletedCount, getFailedCount } from '../config/queue.js';
import { prisma } from '../config/database.js';
import JournalistScraper from '../scrapers/journalistScraper.js';
import outletService from './outletService.js';
import { saveJournalists } from './journalistService.js';
import { logger } from '../config/logger.js';

class ScrapeService {
  constructor() {
    this.initializeWorker();
  }

  initializeWorker() {
    process('scrape-outlet', 1, async (job) => {
      return await this.processScrapeJob(job);
    });
  }

  async startScrape(outletName, targetCount = 30) {
    try {
      const outlet = await outletService.findOrCreateOutlet(outletName);

      const scrapeJob = await prisma.scrapeJob.create({
        data: {
          outletId: outlet.id,
          status: 'pending',
          metadata: { targetCount }
        }
      });

      const job = await add('scrape-outlet', {
        scrapeJobId: scrapeJob.id,
        outletId: outlet.id,
        outletName: outlet.name,
        website: outlet.website,
        targetCount
      }, { 
        priority: 1,
        timeout: 600000 // 10 minute timeout
      });

      logger.info(`Started scrape job ${scrapeJob.id} for ${outletName}`);

      return {
        scrapeJobId: scrapeJob.id,
        queueJobId: job.id,
        outlet: {
          id: outlet.id,
          name: outlet.name,
          website: outlet.website
        }
      };
    } catch (error) {
      logger.error(`Error starting scrape for ${outletName}:`, error);
      throw error;
    }
  }

  async processScrapeJob(job) {
    const { scrapeJobId, outletId, website, targetCount } = job.data;

    try {
      await prisma.scrapeJob.update({
        where: { id: scrapeJobId },
        data: { status: 'processing' }
      });

      logger.info(`🚀 Processing scrape job ${scrapeJobId} for ${website}`);

      // Update progress periodically
      const progressInterval = setInterval(async () => {
        try {
          await job.progress(25);
        } catch (e) {
          // Ignore progress update errors
        }
      }, 30000); // Update every 30 seconds

      const scraper = new JournalistScraper();
      const journalists = await scraper.scrapeOutlet(website, targetCount);

      clearInterval(progressInterval);
      await job.progress(50);

      logger.info(`💾 Saving ${journalists.length} journalists to database`);
      const savedJournalists = await saveJournalists(outletId, journalists);

      await job.progress(80);
      await outletService.updateOutletLastScrape(outletId);

      await prisma.scrapeJob.update({
        where: { id: scrapeJobId },
        data: {
          status: 'completed',
          progress: 100,
          totalFound: savedJournalists.length,
          completedAt: new Date()
        }
      });

      await job.progress(100);

      logger.info(`✅ Completed scrape job ${scrapeJobId}. Found ${savedJournalists.length} journalists`);

      return {
        success: true,
        journalistsFound: savedJournalists.length,
        outlet: website
      };
    } catch (error) {
      logger.error(`❌ Error processing scrape job ${scrapeJobId}:`, error);

      await prisma.scrapeJob.update({
        where: { id: scrapeJobId },
        data: {
          status: 'failed',
          errors: { message: error.message, stack: error.stack },
          completedAt: new Date()
        }
      });

      throw error;
    }
  }

  async getScrapeJobStatus(scrapeJobId) {
    const scrapeJob = await prisma.scrapeJob.findUnique({
      where: { id: scrapeJobId },
      include: { outlet: true }
    });

    if (!scrapeJob) throw new Error('Scrape job not found');

    let queueStatus = null;
    if (scrapeJob.status === 'processing' || scrapeJob.status === 'pending') {
      const jobs = await getJobs(['active', 'waiting', 'delayed']);
      const queueJob = jobs.find(j => j.data.scrapeJobId === scrapeJobId);

      if (queueJob) {
        queueStatus = {
          progress: await queueJob.progress(),
          state: await queueJob.getState()
        };
      }
    }

    return {
      id: scrapeJob.id,
      status: scrapeJob.status,
      progress: queueStatus?.progress || scrapeJob.progress,
      totalFound: scrapeJob.totalFound,
      outlet: {
        name: scrapeJob.outlet.name,
        website: scrapeJob.outlet.website
      },
      startedAt: scrapeJob.startedAt,
      completedAt: scrapeJob.completedAt,
      errors: scrapeJob.errors
    };
  }

  async getAllScrapeJobs(filters = {}) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.outletId) where.outletId = filters.outletId;

    return await prisma.scrapeJob.findMany({
      where,
      include: { outlet: true },
      orderBy: { startedAt: 'desc' },
      take: filters.limit || 50
    });
  }

  async getQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      getWaitingCount(),
      getActiveCount(),
      getCompletedCount(),
      getFailedCount()
    ]);

    return { waiting, active, completed, failed, total: waiting + active + completed + failed };
  }
}

const scrapeService = new ScrapeService();

export const startScrape = scrapeService.startScrape.bind(scrapeService);
export const getScrapeJobStatus = scrapeService.getScrapeJobStatus.bind(scrapeService);
export const getAllScrapeJobs = scrapeService.getAllScrapeJobs.bind(scrapeService);
export const getQueueStats = scrapeService.getQueueStats.bind(scrapeService);

export default scrapeService;