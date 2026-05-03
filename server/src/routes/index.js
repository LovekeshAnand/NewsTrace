import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as auth from '../controllers/authController.js';
import * as outlet from '../controllers/outletController.js';
import * as journalist from '../controllers/journalistController.js';
import * as scrape from '../controllers/scrapeController.js';
import * as analysis from '../controllers/analysisController.js';
import * as research from '../controllers/researchController.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', protect, auth.me);

router.post('/outlets', protect, outlet.createOutlet);
router.get('/outlets', protect, outlet.getAllOutlets);
router.get('/outlets/search', protect, outlet.searchOutlets);
router.get('/outlets/:id', protect, outlet.getOutletById);
router.get('/outlets/:id/stats', protect, outlet.getOutletStats);
router.post('/outlets/scrape', protect, outlet.startScrape);
router.get('/outlets/:id/analyze', protect, outlet.analyzeOutlet);
router.get('/outlets/:id/export', protect, outlet.exportOutlet);

router.get('/journalists', protect, journalist.getTopJournalists);
router.get('/journalists/search', protect, journalist.searchJournalists);
router.get('/journalists/:id', protect, journalist.getJournalistById);
router.get('/journalists/:id/stats', protect, journalist.getJournalistStats);
router.get('/journalists/:id/similar', protect, journalist.findSimilarJournalists);
router.get('/outlets/:outletId/journalists', protect, journalist.getJournalistsByOutlet);

router.get('/scrape/jobs', protect, scrape.getAllScrapeJobs);
router.get('/scrape/jobs/:id', protect, scrape.getScrapeJobStatus);
router.get('/scrape/queue/stats', protect, scrape.getQueueStats);

router.post('/analysis/compare', protect, analysis.compareOutlets);
router.get('/analysis/global-stats', protect, analysis.getGlobalStats);
router.get('/analysis/exports', protect, analysis.getExportedFiles);
router.post('/analysis/export-all', protect, analysis.exportAllOutlets);

router.post('/research', protect, research.researchQuery);

export default router;