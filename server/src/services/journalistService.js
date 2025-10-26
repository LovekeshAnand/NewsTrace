import { prisma } from '../config/database.js';
import  { analyzeArticleBatch } from '../analysis/nlpAnalyzer.js';
import analyzeTrends from '../analysis/nlpAnalyzer.js';
import { logger } from '../config/logger.js';

class JournalistService {
  async saveJournalists(outletId, journalists) {
    const savedJournalists = [];

    for (const journalistData of journalists) {
      try {
        let journalist = await prisma.journalist.findFirst({
          where: { name: journalistData.name, outletId }
        });

        if (journalist) {
          // Update existing journalist
          journalist = await prisma.journalist.update({
            where: { id: journalist.id },
            data: {
              email: journalistData.email || journalist.email,
              profileUrl: journalistData.profileUrl || journalist.profileUrl,
              bio: journalistData.bio || journalist.bio,
              imageUrl: journalistData.imageUrl || journalist.imageUrl,
              twitter: journalistData.twitter || journalist.twitter,
              linkedin: journalistData.linkedin || journalist.linkedin,
              articleCount: journalistData.articles?.length || journalist.articleCount,
              lastArticleDate: journalistData.lastArticleDate || journalist.lastArticleDate
            }
          });
        } else {
          // Create new journalist
          journalist = await prisma.journalist.create({
            data: {
              name: journalistData.name,
              email: journalistData.email,
              profileUrl: journalistData.profileUrl,
              bio: journalistData.bio,
              imageUrl: journalistData.imageUrl,
              twitter: journalistData.twitter,
              linkedin: journalistData.linkedin,
              outletId,
              articleCount: journalistData.articles?.length || 0,
              lastArticleDate: journalistData.lastArticleDate
            }
          });
        }

        // Save articles if any
        if (journalistData.articles?.length > 0) {
          await this.saveArticles(journalist.id, journalistData.articles);
        }

        savedJournalists.push(journalist);
        logger.info(`Saved journalist: ${journalist.name}`);
      } catch (error) {
        logger.error(`Error saving journalist ${journalistData.name}: ${error.message}`);
      }
    }

    return savedJournalists;
  }

  async saveArticles(journalistId, articles) {
    const analyzedArticles = analyzeArticleBatch(articles);

    let savedCount = 0;
    let latestDate = null;

    for (const articleData of analyzedArticles) {
      try {
        const publishedDate = articleData.publishedDate ? new Date(articleData.publishedDate) : null;

        let article = await prisma.article.findUnique({
          where: { url: articleData.url }
        });

        if (!article) {
          article = await prisma.article.create({
            data: {
              title: articleData.title,
              url: articleData.url,
              publishedDate,
              section: articleData.section || articleData.category || null,
              keywords: articleData.keywords || [],
              entities: articleData.entities || {},
              journalistId
            }
          });

          savedCount++;
          if (publishedDate && (!latestDate || publishedDate > latestDate)) {
            latestDate = publishedDate;
          }

          // Link article to topic
          if (articleData.category) {
            await this.linkArticleToTopic(article.id, journalistId, articleData.category);
          }
        }
      } catch (error) {
        logger.debug(`Error saving article ${articleData.url}: ${error.message}`);
      }
    }

    // Update journalist articleCount and lastArticleDate
    if (savedCount > 0) {
      await prisma.journalist.update({
        where: { id: journalistId },
        data: {
          articleCount: { increment: savedCount },
          lastArticleDate: latestDate
        }
      });
    }
  }

  async linkArticleToTopic(articleId, journalistId, topicName) {
    try {
      let topic = await prisma.topic.findUnique({ where: { name: topicName } });

      if (!topic) {
        topic = await prisma.topic.create({ data: { name: topicName } });
      }

      // Link article to topic
      await prisma.articleTopic.upsert({
        where: {
          articleId_topicId: {
            articleId,
            topicId: topic.id
          }
        },
        create: { articleId, topicId: topic.id },
        update: {}
      });

      // Link journalist to topic (beat)
      await prisma.journalistBeat.upsert({
        where: {
          journalistId_topicId: {
            journalistId,
            topicId: topic.id
          }
        },
        create: { journalistId, topicId: topic.id, articleCount: 1 },
        update: { articleCount: { increment: 1 } }
      });
    } catch (error) {
      logger.debug(`Error linking topic ${topicName}: ${error.message}`);
    }
  }

  async getJournalistsByOutlet(outletId, filters = {}) {
    const where = { outletId };
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    return await prisma.journalist.findMany({
      where,
      include: {
        articles: { orderBy: { publishedDate: 'desc' }, take: 5 },
        beats: { include: { topic: true } }
      },
      orderBy: filters.sortBy === 'name' ? { name: 'asc' } : { articleCount: 'desc' },
      take: filters.limit || 100,
      skip: filters.offset || 0
    });
  }

  async getJournalistById(journalistId) {
    return await prisma.journalist.findUnique({
      where: { id: journalistId },
      include: {
        outlet: true,
        articles: { orderBy: { publishedDate: 'desc' } },
        beats: { include: { topic: true } }
      }
    });
  }

  async getTopJournalists(limit = 10) {
    return await prisma.journalist.findMany({
      orderBy: { articleCount: 'desc' },
      take: limit,
      include: {
        outlet: true,
        beats: { include: { topic: true } }
      }
    });
  }

  async searchJournalists(query) {
    return await prisma.journalist.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        outlet: true,
        beats: { include: { topic: true } }
      },
      take: 50
    });
  }

  async getJournalistStats(journalistId) {
    const journalist = await this.getJournalistById(journalistId);
    if (!journalist) return null;

    const articles = journalist.articles;
    const trends = analyzeTrends(articles);

    return {
      journalist: {
        name: journalist.name,
        email: journalist.email,
        profileUrl: journalist.profileUrl,
        outlet: journalist.outlet.name
      },
      stats: {
        totalArticles: journalist.articleCount,
        beats: journalist.beats.map(b => ({
          topic: b.topic.name,
          articleCount: b.articleCount
        })),
        recentArticles: articles.slice(0, 5),
        trends
      }
    };
  }
}

const journalistService = new JournalistService();

export const saveJournalists = journalistService.saveJournalists.bind(journalistService);
export const getJournalistsByOutlet = journalistService.getJournalistsByOutlet.bind(journalistService);
export const getJournalistById = journalistService.getJournalistById.bind(journalistService);
export const getTopJournalists = journalistService.getTopJournalists.bind(journalistService);
export const searchJournalists = journalistService.searchJournalists.bind(journalistService);
export const getJournalistStats = journalistService.getJournalistStats.bind(journalistService);
export const saveArticles = journalistService.saveArticles.bind(journalistService);

export default journalistService;
