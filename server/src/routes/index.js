import { Router } from 'express';
import { createOutlet, getAllOutlets, searchOutlets, getOutletById, getOutletStats, startScrape, analyzeOutlet, exportOutlet } from '../controllers/outletController.js';
import { getTopJournalists, searchJournalists, getJournalistById, getJournalistStats, findSimilarJournalists, getJournalistsByOutlet } from '../controllers/journalistController.js';
import { getAllScrapeJobs, getScrapeJobStatus, getQueueStats } from '../controllers/scrapeController.js';
import { compareOutlets, getGlobalStats, getExportedFiles, exportAllOutlets } from '../controllers/analysisController.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Outlet routes
router.post('/outlets', createOutlet);
router.get('/outlets', getAllOutlets);
router.get('/outlets/search', searchOutlets);
router.get('/outlets/:id', getOutletById);
router.get('/outlets/:id/stats', getOutletStats);
router.post('/outlets/scrape', startScrape);
router.get('/outlets/:id/analyze', analyzeOutlet);
router.get('/outlets/:id/export', exportOutlet);

// Journalist routes
router.get('/journalists', getTopJournalists);
router.get('/journalists/search', searchJournalists);
router.get('/journalists/:id', getJournalistById);
router.get('/journalists/:id/stats', getJournalistStats);
router.get('/journalists/:id/similar', findSimilarJournalists);
router.get('/outlets/:outletId/journalists', getJournalistsByOutlet);

// Scrape job routes
router.get('/scrape/jobs', getAllScrapeJobs);
router.get('/scrape/jobs/:id', getScrapeJobStatus);
router.get('/scrape/queue/stats', getQueueStats);

// Analysis routes
router.post('/analysis/compare', compareOutlets);
router.get('/analysis/global-stats', getGlobalStats);
router.get('/analysis/exports', getExportedFiles);
router.post('/analysis/export-all', exportAllOutlets);

export default router;