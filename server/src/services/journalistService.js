import Journalist from '../models/Journalist.js';
import Article from '../models/Article.js';
import Topic from '../models/Topic.js';
import { analyzeArticleBatch } from '../analysis/nlpAnalyzer.js';
import nlpAnalyzer from '../analysis/nlpAnalyzer.js';
import { logger } from '../config/logger.js';

export const saveJournalists = async (outletId, journalists) => {
  const saved = [];

  for (const data of journalists) {
    try {
      let journalist = await Journalist.findOne({ name: data.name, outlet: outletId });

      if (journalist) {
        Object.assign(journalist, {
          email: data.email || journalist.email,
          profileUrl: data.profileUrl || journalist.profileUrl,
          bio: data.bio || journalist.bio,
          imageUrl: data.imageUrl || journalist.imageUrl,
          twitter: data.twitter || journalist.twitter,
          linkedin: data.linkedin || journalist.linkedin,
          articleCount: data.articles?.length || journalist.articleCount,
          lastArticleDate: data.lastArticleDate || journalist.lastArticleDate
        });
        await journalist.save();
      } else {
        journalist = await Journalist.create({
          name: data.name, email: data.email, profileUrl: data.profileUrl,
          bio: data.bio, imageUrl: data.imageUrl, twitter: data.twitter,
          linkedin: data.linkedin, outlet: outletId,
          articleCount: data.articles?.length || 0, lastArticleDate: data.lastArticleDate
        });
      }

      if (data.articles?.length > 0) {
        await saveArticles(journalist._id, data.articles);
      }

      saved.push(journalist);
    } catch (err) {
      logger.error(`Error saving journalist ${data.name}: ${err.message}`);
    }
  }
  return saved;
};

const saveArticles = async (journalistId, articles) => {
  const analyzed = analyzeArticleBatch(articles);
  let count = 0;
  let latest = null;
  const beatMap = {};

  for (const a of analyzed) {
    try {
      const pubDate = a.publishedDate ? new Date(a.publishedDate) : null;
      const exists = await Article.findOne({ url: a.url });
      if (exists) continue;

      await Article.create({
        title: a.title, url: a.url, publishedDate: pubDate,
        section: a.section || a.category || null,
        keywords: a.keywords || [], entities: a.entities || {},
        journalist: journalistId,
        topics: a.category ? [{ name: a.category }] : []
      });

      count++;
      if (pubDate && (!latest || pubDate > latest)) latest = pubDate;

      if (a.category) {
        beatMap[a.category] = (beatMap[a.category] || 0) + 1;
        await Topic.findOneAndUpdate(
          { name: a.category.toLowerCase() },
          { $inc: { articleCount: 1 } },
          { upsert: true }
        );
      }
    } catch (err) {
      if (err.code !== 11000) logger.debug(`Article save error: ${err.message}`);
    }
  }

  if (count > 0) {
    const beats = Object.entries(beatMap).map(([topic, articleCount]) => ({ topic, articleCount }));
    await Journalist.findByIdAndUpdate(journalistId, {
      $inc: { articleCount: count },
      ...(latest && { lastArticleDate: latest }),
      ...(beats.length > 0 && { $push: { beats: { $each: beats } } })
    });
  }
};

export const getJournalistsByOutlet = async (outletId, filters = {}) => {
  const query = { outlet: outletId };
  if (filters.search) query.name = { $regex: filters.search, $options: 'i' };

  return Journalist.find(query)
    .sort(filters.sortBy === 'name' ? { name: 1 } : { articleCount: -1 })
    .skip(filters.offset || 0)
    .limit(filters.limit || 100)
    .populate('outlet', 'name')
    .lean();
};

export const getJournalistById = async (id) => {
  const journalist = await Journalist.findById(id).populate('outlet', 'name website').lean();
  if (!journalist) return null;
  const articles = await Article.find({ journalist: id }).sort({ publishedDate: -1 }).lean();
  return { ...journalist, articles };
};

export const getTopJournalists = async (limit = 10) => {
  return Journalist.find().sort({ articleCount: -1 }).limit(limit)
    .populate('outlet', 'name').lean();
};

export const searchJournalists = async (query) => {
  return Journalist.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { bio: { $regex: query, $options: 'i' } }
    ]
  }).limit(50).populate('outlet', 'name').lean();
};

export const getJournalistStats = async (id) => {
  const journalist = await getJournalistById(id);
  if (!journalist) return null;

  const trends = nlpAnalyzer.analyzeTrends(journalist.articles || []);

  return {
    journalist: {
      name: journalist.name, email: journalist.email,
      profileUrl: journalist.profileUrl, outlet: journalist.outlet?.name
    },
    stats: {
      totalArticles: journalist.articleCount,
      beats: journalist.beats || [],
      recentArticles: (journalist.articles || []).slice(0, 5),
      trends
    }
  };
};
