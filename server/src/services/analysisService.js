import { outlet as _outlet, journalist as _journalist, article, topic as _topic, scrapeJob } from '../config/database.js';
import { buildJournalistTopicGraph, calculateMetrics, exportForVisualization } from '../analysis/graphAnalyzer.js';
import  analyzeTrends  from '../analysis/nlpAnalyzer.js';
import  { logger } from '../config/logger.js';

class AnalysisService {
  async analyzeOutlet(outletId) {
    try {
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

      if (!outlet) {
        throw new Error('Outlet not found');
      }

      // Build graph
      const graph = buildJournalistTopicGraph(outlet.journalists);
      const graphMetrics = calculateMetrics(graph);

      // Analyze trends
      const allArticles = outlet.journalists.flatMap(j => j.articles);
      const trends = analyzeTrends(allArticles);

      return {
        outlet: {
          name: outlet.name,
          website: outlet.website
        },
        summary: {
          totalJournalists: outlet.journalists.length,
          totalArticles: allArticles.length,
          averageArticlesPerJournalist: (allArticles.length / outlet.journalists.length).toFixed(2)
        },
        graph: exportForVisualization(graph),
        metrics: graphMetrics,
        trends
      };
    } catch (error) {
      logger.error(`Error analyzing outlet ${outletId}:`, error);
      throw error;
    }
  }

  async compareOutlets(outletIds) {
    try {
      const outlets = await Promise.all(
        outletIds.map(id => this.analyzeOutlet(id))
      );

      const comparison = {
        outlets: outlets.map(o => ({
          name: o.outlet.name,
          journalistCount: o.summary.totalJournalists,
          articleCount: o.summary.totalArticles,
          avgArticlesPerJournalist: o.summary.averageArticlesPerJournalist,
          topTopics: o.trends.topCategories.slice(0, 5)
        })),
        crossOutletInsights: this.findCrossOutletPatterns(outlets)
      };

      return comparison;
    } catch (error) {
      logger.error('Error comparing outlets:', error);
      throw error;
    }
  }

  findCrossOutletPatterns(outletAnalyses) {
    const allTopics = {};
    const allKeywords = {};

    outletAnalyses.forEach(analysis => {
      analysis.trends.topCategories.forEach(cat => {
        allTopics[cat.name] = (allTopics[cat.name] || 0) + cat.count;
      });

      analysis.trends.topKeywords.forEach(kw => {
        allKeywords[kw.name] = (allKeywords[kw.name] || 0) + kw.count;
      });
    });

    return {
      commonTopics: Object.entries(allTopics)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count })),
      commonKeywords: Object.entries(allKeywords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([name, count]) => ({ name, count }))
    };
  }

  async getGlobalStats() {
    try {
      const [
        totalOutlets,
        totalJournalists,
        totalArticles,
        topTopics
      ] = await Promise.all([
        _outlet.count(),
        _journalist.count(),
        article.count(),
        _topic.findMany({
          include: {
            _count: {
              select: { articles: true }
            }
          },
          orderBy: {
            articles: {
              _count: 'desc'
            }
          },
          take: 10
        })
      ]);

      const recentActivity = await scrapeJob.findMany({
        where: { status: 'completed' },
        orderBy: { completedAt: 'desc' },
        take: 10,
        include: { outlet: true }
      });

      return {
        totals: {
          outlets: totalOutlets,
          journalists: totalJournalists,
          articles: totalArticles
        },
        topTopics: topTopics.map(t => ({
          name: t.name,
          articleCount: t._count.articles
        })),
        recentActivity: recentActivity.map(job => ({
          outlet: job.outlet.name,
          journalistsFound: job.totalFound,
          completedAt: job.completedAt
        }))
      };
    } catch (error) {
      logger.error('Error getting global stats:', error);
      throw error;
    }
  }

  async findSimilarJournalists(journalistId, limit = 10) {
    try {
      const journalist = await _journalist.findUnique({
        where: { id: journalistId },
        include: {
          articles: true,
          beats: {
            include: { topic: true }
          }
        }
      });

      if (!journalist) {
        throw new Error('Journalist not found');
      }

      const targetTopics = new Set(journalist.beats.map(b => b.topic.name));

      // Find journalists with overlapping topics
      const similarJournalists = await _journalist.findMany({
        where: {
          id: { not: journalistId },
          beats: {
            some: {
              topic: {
                name: {
                  in: Array.from(targetTopics)
                }
              }
            }
          }
        },
        include: {
          outlet: true,
          beats: {
            include: { topic: true }
          }
        },
        take: limit * 2
      });

      // Calculate similarity scores
      const scored = similarJournalists.map(j => {
        const jTopics = new Set(j.beats.map(b => b.topic.name));
        const intersection = new Set([...targetTopics].filter(x => jTopics.has(x)));
        const union = new Set([...targetTopics, ...jTopics]);
        const similarity = intersection.size / union.size;

        return {
          id: j.id,
          name: j.name,
          outlet: j.outlet.name,
          similarity: similarity,
          commonTopics: Array.from(intersection),
          articleCount: j.articleCount
        };
      });

      return scored
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    } catch (error) {
      logger.error(`Error finding similar journalists for ${journalistId}:`, error);
      throw error;
    }
  }
}

const analysisService = new AnalysisService();

export const analyzeOutlet = analysisService.analyzeOutlet.bind(analysisService);
export const compareOutlets = analysisService.compareOutlets.bind(analysisService);
export const getGlobalStats = analysisService.getGlobalStats.bind(analysisService);
export const findSimilarJournalists = analysisService.findSimilarJournalists.bind(analysisService);

export default analysisService;
