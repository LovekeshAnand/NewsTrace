import Outlet from '../models/Outlet.js';
import Journalist from '../models/Journalist.js';
import Article from '../models/Article.js';
import Topic from '../models/Topic.js';
import ScrapeJob from '../models/ScrapeJob.js';
import { buildJournalistTopicGraph, calculateMetrics, exportForVisualization } from '../analysis/graphAnalyzer.js';
import nlpAnalyzer from '../analysis/nlpAnalyzer.js';
import { logger } from '../config/logger.js';

export const analyzeOutlet = async (outletId) => {
  const outlet = await Outlet.findById(outletId).lean();
  if (!outlet) throw new Error('Outlet not found');

  const journalists = await Journalist.find({ outlet: outletId }).lean();
  const articles = await Article.find({
    journalist: { $in: journalists.map(j => j._id) }
  }).lean();

  const journalistsWithArticles = journalists.map(j => ({
    ...j,
    articles: articles.filter(a => a.journalist.toString() === j._id.toString())
  }));

  const graph = buildJournalistTopicGraph(journalistsWithArticles);
  const metrics = calculateMetrics(graph);
  const trends = nlpAnalyzer.analyzeTrends(articles);

  return {
    outlet: { name: outlet.name, website: outlet.website },
    summary: {
      totalJournalists: journalists.length,
      totalArticles: articles.length,
      avgArticlesPerJournalist: journalists.length > 0
        ? (articles.length / journalists.length).toFixed(1) : 0
    },
    graph: exportForVisualization(graph),
    metrics, trends
  };
};

export const compareOutlets = async (outletIds) => {
  const analyses = await Promise.all(outletIds.map(id => analyzeOutlet(id)));

  const allTopics = {};
  const allKeywords = {};

  analyses.forEach(a => {
    (a.trends.topCategories || []).forEach(c => {
      allTopics[c.name] = (allTopics[c.name] || 0) + c.count;
    });
    (a.trends.topKeywords || []).forEach(k => {
      allKeywords[k.name] = (allKeywords[k.name] || 0) + k.count;
    });
  });

  return {
    outlets: analyses.map(a => ({
      name: a.outlet.name,
      journalistCount: a.summary.totalJournalists,
      articleCount: a.summary.totalArticles,
      topTopics: (a.trends.topCategories || []).slice(0, 5)
    })),
    crossOutletInsights: {
      commonTopics: Object.entries(allTopics).sort((a, b) => b[1] - a[1]).slice(0, 10)
        .map(([name, count]) => ({ name, count })),
      commonKeywords: Object.entries(allKeywords).sort((a, b) => b[1] - a[1]).slice(0, 20)
        .map(([name, count]) => ({ name, count }))
    }
  };
};

export const getGlobalStats = async () => {
  const [outlets, journalists, articles, topTopics, recentJobs] = await Promise.all([
    Outlet.countDocuments(),
    Journalist.countDocuments(),
    Article.countDocuments(),
    Topic.find().sort({ articleCount: -1 }).limit(10).lean(),
    ScrapeJob.find({ status: 'completed' }).sort({ completedAt: -1 }).limit(10)
      .populate('outlet', 'name').lean()
  ]);

  return {
    totals: { outlets, journalists, articles },
    topTopics: topTopics.map(t => ({ name: t.name, articleCount: t.articleCount })),
    recentActivity: recentJobs.map(j => ({
      outlet: j.outlet?.name, journalistsFound: j.totalFound, completedAt: j.completedAt
    }))
  };
};

export const findSimilarJournalists = async (journalistId, limit = 10) => {
  const journalist = await Journalist.findById(journalistId).lean();
  if (!journalist) throw new Error('Journalist not found');

  const targetTopics = new Set((journalist.beats || []).map(b => b.topic));
  if (targetTopics.size === 0) return [];

  const candidates = await Journalist.find({
    _id: { $ne: journalistId },
    'beats.topic': { $in: Array.from(targetTopics) }
  }).populate('outlet', 'name').limit(limit * 2).lean();

  return candidates.map(j => {
    const jTopics = new Set((j.beats || []).map(b => b.topic));
    const intersection = [...targetTopics].filter(t => jTopics.has(t));
    const union = new Set([...targetTopics, ...jTopics]);
    return {
      id: j._id, name: j.name, outlet: j.outlet?.name,
      similarity: intersection.length / union.size,
      commonTopics: intersection, articleCount: j.articleCount
    };
  }).sort((a, b) => b.similarity - a.similarity).slice(0, limit);
};
