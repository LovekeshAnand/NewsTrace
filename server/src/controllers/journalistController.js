import * as journalistService from '../services/journalistService.js';
import { findSimilarJournalists as findSimilar } from '../services/analysisService.js';

// List journalists for a given outlet
export const getJournalistsByOutlet = async (req, res, next) => {
  try {
    const { search, sortBy, limit, offset } = req.query;
    const journalists = await journalistService.getJournalistsByOutlet(
      req.params.outletId,
      { search, sortBy, limit: limit ? +limit : 100, offset: offset ? +offset : 0 }
    );
    res.json({ success: true, data: journalists, count: journalists.length });
  } catch (err) { next(err); }
};

// Get top journalists by article count
export const getTopJournalists = async (req, res, next) => {
  try {
    const journalists = await journalistService.getTopJournalists(req.query.limit ? +req.query.limit : 10);
    res.json({ success: true, data: journalists });
  } catch (err) { next(err); }
};

// Search journalists by name or bio
export const searchJournalists = async (req, res, next) => {
  try {
    if (!req.query.q) return res.status(400).json({ success: false, error: 'Query required' });
    const journalists = await journalistService.searchJournalists(req.query.q);
    res.json({ success: true, data: journalists, count: journalists.length });
  } catch (err) { next(err); }
};

// Get a single journalist with articles
export const getJournalistById = async (req, res, next) => {
  try {
    const journalist = await journalistService.getJournalistById(req.params.id);
    if (!journalist) return res.status(404).json({ success: false, error: 'Journalist not found' });
    res.json({ success: true, data: journalist });
  } catch (err) { next(err); }
};

// Get detailed stats for a journalist
export const getJournalistStats = async (req, res, next) => {
  try {
    const stats = await journalistService.getJournalistStats(req.params.id);
    if (!stats) return res.status(404).json({ success: false, error: 'Journalist not found' });
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

// Find journalists with similar beat coverage
export const findSimilarJournalists = async (req, res, next) => {
  try {
    const similar = await findSimilar(req.params.id, req.query.limit ? +req.query.limit : 10);
    res.json({ success: true, data: similar });
  } catch (err) { next(err); }
};