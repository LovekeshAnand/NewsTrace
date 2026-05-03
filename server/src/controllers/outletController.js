import * as outletService from '../services/outletService.js';
import * as scrapeService from '../services/scrapeService.js';
import * as analysisService from '../services/analysisService.js';
import { exportGraphData, exportOutletToCSV } from '../services/exportService.js';

// Create or find an outlet by name
export const createOutlet = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Outlet name is required' });
    const outlet = await outletService.findOrCreateOutlet(name);
    res.status(201).json({ success: true, data: outlet });
  } catch (err) { next(err); }
};

// List all outlets with journalist counts
export const getAllOutlets = async (req, res, next) => {
  try {
    const outlets = await outletService.getAllOutlets();
    res.json({ success: true, data: outlets, count: outlets.length });
  } catch (err) { next(err); }
};

// Search outlets by name or website
export const searchOutlets = async (req, res, next) => {
  try {
    if (!req.query.q) return res.status(400).json({ success: false, error: 'Query required' });
    const outlets = await outletService.searchOutlets(req.query.q);
    res.json({ success: true, data: outlets, count: outlets.length });
  } catch (err) { next(err); }
};

// Get outlet by ID with journalists
export const getOutletById = async (req, res, next) => {
  try {
    const outlet = await outletService.getOutletWithJournalists(req.params.id);
    if (!outlet) return res.status(404).json({ success: false, error: 'Outlet not found' });
    res.json({ success: true, data: outlet });
  } catch (err) { next(err); }
};

// Get aggregated stats for an outlet
export const getOutletStats = async (req, res, next) => {
  try {
    const stats = await outletService.getOutletStats(req.params.id);
    if (!stats) return res.status(404).json({ success: false, error: 'Outlet not found' });
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

// Start a scraping job for an outlet
export const startScrape = async (req, res, next) => {
  try {
    const { name, targetCount } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Outlet name is required' });
    const result = await scrapeService.startScrape(name, req.user._id, targetCount || 30);
    res.status(202).json({ success: true, message: 'Scrape job started', data: result });
  } catch (err) { next(err); }
};

// Run NLP/graph analysis on an outlet
export const analyzeOutlet = async (req, res, next) => {
  try {
    const analysis = await analysisService.analyzeOutlet(req.params.id);
    res.json({ success: true, data: analysis });
  } catch (err) { next(err); }
};

// Export outlet data as CSV or graph JSON
export const exportOutlet = async (req, res, next) => {
  try {
    const result = req.query.format === 'graph'
      ? await exportGraphData(req.params.id)
      : await exportOutletToCSV(req.params.id);
    res.json({ success: true, message: 'Export completed', data: result });
  } catch (err) { next(err); }
};