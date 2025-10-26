import { getJournalistsByOutlet as _getJournalistsByOutlet, getJournalistById as _getJournalistById, getTopJournalists as _getTopJournalists, searchJournalists as _searchJournalists, getJournalistStats as _getJournalistStats } from '../services/journalistService.js';
import { findSimilarJournalists as _findSimilarJournalists } from '../services/analysisService.js';
import { logger} from '../config/logger.js';

class JournalistController {
  async getJournalistsByOutlet(req, res) {
    try {
      const { outletId } = req.params;
      const { search, sortBy, limit, offset } = req.query;

      const filters = {
        search,
        sortBy,
        limit: limit ? parseInt(limit) : 100,
        offset: offset ? parseInt(offset) : 0
      };

      const journalists = await _getJournalistsByOutlet(
        outletId,
        filters
      );

      res.json({
        success: true,
        data: journalists,
        count: journalists.length
      });
    } catch (error) {
      logger.error('Error getting journalists by outlet:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getJournalistById(req, res) {
    try {
      const { id } = req.params;
      const journalist = await _getJournalistById(id);

      if (!journalist) {
        return res.status(404).json({ error: 'Journalist not found' });
      }

      res.json({
        success: true,
        data: journalist
      });
    } catch (error) {
      logger.error('Error getting journalist:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getTopJournalists(req, res) {
    try {
      const { limit } = req.query;
      const journalists = await _getTopJournalists(
        limit ? parseInt(limit) : 10
      );

      res.json({
        success: true,
        data: journalists
      });
    } catch (error) {
      logger.error('Error getting top journalists:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async searchJournalists(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const journalists = await _searchJournalists(q);

      res.json({
        success: true,
        data: journalists,
        count: journalists.length
      });
    } catch (error) {
      logger.error('Error searching journalists:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getJournalistStats(req, res) {
    try {
      const { id } = req.params;
      const stats = await _getJournalistStats(id);

      if (!stats) {
        return res.status(404).json({ error: 'Journalist not found' });
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting journalist stats:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async findSimilarJournalists(req, res) {
    try {
      const { id } = req.params;
      const { limit } = req.query;

      const similar = await _findSimilarJournalists(
        id,
        limit ? parseInt(limit) : 10
      );

      res.json({
        success: true,
        data: similar
      });
    } catch (error) {
      logger.error('Error finding similar journalists:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

const controller = new JournalistController();

export const getTopJournalists = controller.getTopJournalists.bind(controller);
export const searchJournalists = controller.searchJournalists.bind(controller);
export const getJournalistById = controller.getJournalistById.bind(controller);
export const getJournalistStats = controller.getJournalistStats.bind(controller);
export const findSimilarJournalists = controller.findSimilarJournalists.bind(controller);
export const getJournalistsByOutlet = controller.getJournalistsByOutlet.bind(controller);

export default controller;