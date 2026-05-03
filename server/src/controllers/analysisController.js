import * as analysisService from '../services/analysisService.js';
import { exportAllOutletsToCSV, getExportedFiles as listExports } from '../services/exportService.js';

// Compare multiple outlets side by side
export const compareOutlets = async (req, res, next) => {
  try {
    const { outletIds } = req.body;
    if (!outletIds || !Array.isArray(outletIds) || outletIds.length < 2) {
      return res.status(400).json({ success: false, error: 'At least 2 outlet IDs required' });
    }
    const comparison = await analysisService.compareOutlets(outletIds);
    res.json({ success: true, data: comparison });
  } catch (err) { next(err); }
};

// Get platform-wide statistics
export const getGlobalStats = async (req, res, next) => {
  try {
    const stats = await analysisService.getGlobalStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

// Export all outlets to a single CSV
export const exportAllOutlets = async (req, res, next) => {
  try {
    const result = await exportAllOutletsToCSV();
    res.json({ success: true, message: 'Export completed', data: result });
  } catch (err) { next(err); }
};

// List previously exported files
export const getExportedFiles = async (req, res, next) => {
  try {
    const files = await listExports();
    res.json({ success: true, data: files });
  } catch (err) { next(err); }
};