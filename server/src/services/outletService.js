import Outlet from '../models/Outlet.js';
import Journalist from '../models/Journalist.js';
import serpService from './serpService.js';
import { logger } from '../config/logger.js';

export const findOrCreateOutlet = async (outletName) => {
  let outlet = await Outlet.findOne({ name: new RegExp(`^${outletName}$`, 'i') });
  if (outlet) return outlet;

  logger.info(`Discovering website for ${outletName}`);
  const info = await serpService.findOutletWebsite(outletName);

  outlet = await Outlet.create({
    name: outletName,
    website: info.website,
    domain: info.domain,
    metadata: { title: info.title, description: info.description }
  });
  logger.info(`Created outlet: ${outlet.name}`);
  return outlet;
};

export const getOutletById = async (id) => {
  return Outlet.findById(id).lean();
};

export const getOutletWithJournalists = async (id) => {
  const outlet = await Outlet.findById(id).lean();
  if (!outlet) return null;
  const journalists = await Journalist.find({ outlet: id })
    .sort({ articleCount: -1 }).lean();
  return { ...outlet, journalists };
};

export const getAllOutlets = async () => {
  const outlets = await Outlet.find().sort({ createdAt: -1 }).lean();
  const counts = await Journalist.aggregate([
    { $group: { _id: '$outlet', count: { $sum: 1 } } }
  ]);
  const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]));
  return outlets.map(o => ({ ...o, journalistCount: countMap[o._id.toString()] || 0 }));
};

export const searchOutlets = async (query) => {
  return Outlet.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { website: { $regex: query, $options: 'i' } }
    ]
  }).lean();
};

export const getOutletStats = async (id) => {
  const outlet = await Outlet.findById(id).lean();
  if (!outlet) return null;

  const journalists = await Journalist.find({ outlet: id }).lean();
  const totalArticles = journalists.reduce((s, j) => s + j.articleCount, 0);

  const topicDist = {};
  journalists.forEach(j => {
    (j.beats || []).forEach(b => {
      topicDist[b.topic] = (topicDist[b.topic] || 0) + b.articleCount;
    });
  });

  return {
    outlet: { name: outlet.name, website: outlet.website, lastScrapedAt: outlet.lastScrapedAt },
    stats: {
      totalJournalists: journalists.length,
      totalArticles,
      avgArticlesPerJournalist: journalists.length > 0 ? (totalArticles / journalists.length).toFixed(1) : 0,
      topicDistribution: topicDist,
      topJournalists: journalists.sort((a, b) => b.articleCount - a.articleCount).slice(0, 10)
        .map(j => ({ name: j.name, articleCount: j.articleCount }))
    }
  };
};
