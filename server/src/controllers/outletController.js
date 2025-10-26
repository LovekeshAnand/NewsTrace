import { findOrCreateOutlet, getAllOutlets as _getAllOutlets, searchOutlets as _searchOutlets, getOutletById as _getOutletById, getOutletStats as _getOutletStats } from '../services/outletService.js';
import { startScrape as _startScrape } from '../services/scrapeService.js';
import analysisService from '../services/analysisService.js';
import { exportGraphData, exportOutletToCSV } from '../services/exportService.js';
import { logger } from '../config/logger.js';

class OutletController {
  async createOutlet(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Outlet name is required' });
      }

      const outlet = await findOrCreateOutlet(name);
      
      res.status(201).json({
        success: true,
        data: outlet
      });
    } catch (error) {
      logger.error('Error creating outlet:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getAllOutlets(req, res) {
    try {
      const outlets = await _getAllOutlets();
      
      res.json({
        success: true,
        data: outlets,
        count: outlets.length
      });
    } catch (error) {
      logger.error('Error getting outlets:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async searchOutlets(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const outlets = await _searchOutlets(q);

      res.json({
        success: true,
        data: outlets,
        count: outlets.length
      });
    } catch (error) {
      logger.error('Error searching outlets:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getOutletById(req, res) {
    try {
      const { id } = req.params;
      const outlet = await _getOutletById(id);

      if (!outlet) {
        return res.status(404).json({ error: 'Outlet not found' });
      }

      res.json({
        success: true,
        data: outlet
      });
    } catch (error) {
      logger.error('Error getting outlet:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getOutletStats(req, res) {
    try {
      const { id } = req.params;
      const stats = await _getOutletStats(id);

      if (!stats) {
        return res.status(404).json({ error: 'Outlet not found' });
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting outlet stats:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async startScrape(req, res) {
    try {
      const { name, targetCount } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Outlet name is required' });
      }

      const result = await _startScrape(
        name,
        targetCount || 30
      );

      res.status(202).json({
        success: true,
        message: 'Scrape job started',
        data: result
      });
    } catch (error) {
      logger.error('Error starting scrape:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async analyzeOutlet(req, res) {
    try {
      const { id } = req.params;
      const analysis = await analysisService.analyzeOutlet(id);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error analyzing outlet:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async exportOutlet(req, res) {
    try {
      const { id } = req.params;
      const { format } = req.query;

      let result;
      if (format === 'graph') {
        result = await exportGraphData(id);
      } else {
        result = await exportOutletToCSV(id);
      }

      res.json({
        success: true,
        message: 'Export completed',
        data: result
      });
    } catch (error) {
      logger.error('Error exporting outlet:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

const outletController = new OutletController();

export const createOutlet = outletController.createOutlet.bind(outletController);
export const getAllOutlets = outletController.getAllOutlets.bind(outletController);
export const searchOutlets = outletController.searchOutlets.bind(outletController);
export const getOutletById = outletController.getOutletById.bind(outletController);
export const getOutletStats = outletController.getOutletStats.bind(outletController);
export const startScrape = outletController.startScrape.bind(outletController);
export const analyzeOutlet = outletController.analyzeOutlet.bind(outletController);
export const exportOutlet = outletController.exportOutlet.bind(outletController);

export default outletController;