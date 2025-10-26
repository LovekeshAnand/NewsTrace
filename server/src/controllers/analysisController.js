import { compareOutlets as _compareOutlets, getGlobalStats as _getGlobalStats } from '../services/analysisService.js';
import { exportAllOutletsToCSV, getExportedFiles as _getExportedFiles } from '../services/exportService.js';
import { logger } from '../config/logger.js';

class AnalysisController {
  async compareOutlets(req, res) {
    try {
      const { outletIds } = req.body;

      if (!outletIds || !Array.isArray(outletIds) || outletIds.length < 2) {
        return res.status(400).json({ 
          error: 'At least 2 outlet IDs are required for comparison' 
        });
      }

      const comparison = await _compareOutlets(outletIds);

      res.json({
        success: true,
        data: comparison
      });
    } catch (error) {
      logger.error('Error comparing outlets:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getGlobalStats(req, res) {
    try {
      const stats = await _getGlobalStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting global stats:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async exportAllOutlets(req, res) {
    try {
      const result = await exportAllOutletsToCSV();

      res.json({
        success: true,
        message: 'Export completed',
        data: result
      });
    } catch (error) {
      logger.error('Error exporting all outlets:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getExportedFiles(req, res) {
    try {
      const files = await _getExportedFiles();

      res.json({
        success: true,
        data: files
      });
    } catch (error) {
      logger.error('Error getting exported files:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

const analysisController = new AnalysisController();

export const compareOutlets = analysisController.compareOutlets.bind(analysisController);
export const getGlobalStats = analysisController.getGlobalStats.bind(analysisController);
export const exportAllOutlets = analysisController.exportAllOutlets.bind(analysisController);
export const getExportedFiles = analysisController.getExportedFiles.bind(analysisController);

export default analysisController;