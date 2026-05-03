import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import { join, dirname } from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import Outlet from '../models/Outlet.js';
import Journalist from '../models/Journalist.js';
import Article from '../models/Article.js';
import { buildJournalistTopicGraph, exportForVisualization } from '../analysis/graphAnalyzer.js';
import { logger } from '../config/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXPORTS_DIR = join(__dirname, '../../exports');

const ensureDir = async () => { await fs.mkdir(EXPORTS_DIR, { recursive: true }); };

export const exportOutletToCSV = async (outletId) => {
  await ensureDir();
  const outlet = await Outlet.findById(outletId).lean();
  if (!outlet) throw new Error('Outlet not found');

  const journalists = await Journalist.find({ outlet: outletId }).lean();
  const ts = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const filename = `${outlet.name.replace(/\s+/g, '_')}_${ts}.csv`;
  const filepath = join(EXPORTS_DIR, filename);

  const writer = createCsvWriter({
    path: filepath,
    header: [
      { id: 'name', title: 'Name' }, { id: 'email', title: 'Email' },
      { id: 'profileUrl', title: 'Profile URL' }, { id: 'articleCount', title: 'Articles' },
      { id: 'beats', title: 'Beats' }, { id: 'twitter', title: 'Twitter' },
      { id: 'linkedin', title: 'LinkedIn' }
    ]
  });

  const records = journalists.map(j => ({
    name: j.name, email: j.email || '', profileUrl: j.profileUrl || '',
    articleCount: j.articleCount, beats: (j.beats || []).map(b => b.topic).join(', '),
    twitter: j.twitter || '', linkedin: j.linkedin || ''
  }));

  await writer.writeRecords(records);
  logger.info(`Exported ${records.length} journalists to ${filename}`);
  return { filename, filepath, recordCount: records.length };
};

export const exportAllOutletsToCSV = async () => {
  await ensureDir();
  const outlets = await Outlet.find().lean();
  const ts = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const filename = `all_outlets_${ts}.csv`;
  const filepath = join(EXPORTS_DIR, filename);

  const writer = createCsvWriter({
    path: filepath,
    header: [
      { id: 'outlet', title: 'Outlet' }, { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' }, { id: 'articleCount', title: 'Articles' },
      { id: 'beats', title: 'Beats' }
    ]
  });

  const records = [];
  for (const outlet of outlets) {
    const journalists = await Journalist.find({ outlet: outlet._id }).lean();
    journalists.forEach(j => records.push({
      outlet: outlet.name, name: j.name, email: j.email || '',
      articleCount: j.articleCount, beats: (j.beats || []).map(b => b.topic).join(', ')
    }));
  }

  await writer.writeRecords(records);
  return { filename, filepath, recordCount: records.length, outletCount: outlets.length };
};

export const exportGraphData = async (outletId) => {
  await ensureDir();
  const outlet = await Outlet.findById(outletId).lean();
  if (!outlet) throw new Error('Outlet not found');

  const journalists = await Journalist.find({ outlet: outletId }).lean();
  const articles = await Article.find({
    journalist: { $in: journalists.map(j => j._id) }
  }).lean();

  const withArticles = journalists.map(j => ({
    ...j, articles: articles.filter(a => a.journalist.toString() === j._id.toString())
  }));

  const graph = buildJournalistTopicGraph(withArticles);
  const data = exportForVisualization(graph);
  const ts = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const filename = `${outlet.name.replace(/\s+/g, '_')}_graph_${ts}.json`;
  const filepath = join(EXPORTS_DIR, filename);

  await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  return { filename, filepath, nodeCount: data.nodes.length, edgeCount: data.edges.length };
};

export const getExportedFiles = async () => {
  await ensureDir();
  const files = await fs.readdir(EXPORTS_DIR);
  const stats = await Promise.all(files.map(async f => {
    const s = await fs.stat(join(EXPORTS_DIR, f));
    return { filename: f, size: s.size, created: s.birthtime };
  }));
  return stats.sort((a, b) => b.created - a.created);
};
