import { outlet as _outlet } from '../config/database.js';
import  serpService  from './serpService.js';
import { logger } from '../config/logger.js';

class OutletService {
  async findOrCreateOutlet(outletName) {
    try {
      // Check if outlet already exists
      let outlet = await _outlet.findFirst({ // <-- use _outlet, not prisma
        where: { name: { equals: outletName, mode: 'insensitive' } }
      });


      if (outlet) {
        logger.info(`Outlet ${outletName} already exists in database`);
        return outlet;
      }

      // Discover website using SERP API
      logger.info(`Discovering website for ${outletName}`);
      const websiteInfo = await serpService.findOutletWebsite(outletName);

      // Create outlet
      outlet = await _outlet.create({
        data: {
          name: outletName,
          website: websiteInfo.website,
          domain: websiteInfo.domain,
          metadata: {
            title: websiteInfo.title,
            description: websiteInfo.description
          }
        }
      });

      logger.info(`Created outlet: ${outlet.name} - ${outlet.website}`);
      return outlet;
    } catch (error) {
      logger.error(`Error finding/creating outlet ${outletName}:`, error);
      throw error;
    }
  }

  async getOutletById(outletId) {
    return await _outlet.findUnique({
      where: { id: outletId },
      include: {
        journalists: {
          include: {
            articles: true,
            beats: {
              include: { topic: true }
            }
          }
        }
      }
    });
  }

  async getAllOutlets() {
    return await _outlet.findMany({
      include: {
        _count: {
          select: {
            journalists: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateOutletLastScrape(outletId) {
    return await _outlet.update({
      where: { id: outletId },
      data: { lastScrapedAt: new Date() }
    });
  }

  async getOutletStats(outletId) {
    const outlet = await _outlet.findUnique({
      where: { id: outletId },
      include: {
        journalists: {
          include: {
            articles: true,
            beats: {
              include: { topic: true }
            }
          }
        }
      }
    });

    if (!outlet) return null;

    const totalArticles = outlet.journalists.reduce(
      (sum, j) => sum + j.articles.length,
      0
    );

    const topicDistribution = {};
    outlet.journalists.forEach(journalist => {
      journalist.beats.forEach(beat => {
        const topicName = beat.topic.name;
        topicDistribution[topicName] = (topicDistribution[topicName] || 0) + beat.articleCount;
      });
    });

    const topJournalists = outlet.journalists
      .sort((a, b) => b.articleCount - a.articleCount)
      .slice(0, 10)
      .map(j => ({
        name: j.name,
        articleCount: j.articleCount,
        profileUrl: j.profileUrl
      }));

    return {
      outlet: {
        name: outlet.name,
        website: outlet.website,
        lastScrapedAt: outlet.lastScrapedAt
      },
      stats: {
        totalJournalists: outlet.journalists.length,
        totalArticles,
        averageArticlesPerJournalist: outlet.journalists.length > 0
          ? (totalArticles / outlet.journalists.length).toFixed(2)
          : 0,
        topicDistribution,
        topJournalists
      }
    };
  }

  async searchOutlets(query) {
    return await _outlet.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { website: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        _count: {
          select: { journalists: true }
        }
      }
    });
  }
}


// Assuming these functions are already defined in outletService.js:
// findOrCreateOutlet, getAllOutlets, searchOutlets, getOutletById, getOutletStats


const outletService = new OutletService();

export const findOrCreateOutlet = outletService.findOrCreateOutlet.bind(outletService);
export const getAllOutlets = outletService.getAllOutlets.bind(outletService);
export const searchOutlets = outletService.searchOutlets.bind(outletService);
export const getOutletById = outletService.getOutletById.bind(outletService);
export const getOutletStats = outletService.getOutletStats.bind(outletService);

export default outletService;
