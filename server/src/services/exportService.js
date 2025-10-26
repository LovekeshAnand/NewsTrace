import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import { join, dirname } from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url'; // <-- Make sure this is imported
import { outlet as _outlet } from '../config/database.js';
import { logger } from '../config/logger.js';

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


class ExportService {
  constructor() {
    this.exportsDir = join(__dirname, '../../exports');
    this.ensureExportsDir();
  }

  async ensureExportsDir() {
    try {
      await fs.mkdir(this.exportsDir, { recursive: true });
    } catch (error) {
      logger.error('Error creating exports directory:', error);
    }
  }

  async exportOutletToCSV(outletId) {
    try {
      const outlet = await _outlet.findUnique({
        where: { id: outletId },
        include: {
          journalists: {
            include: {
              articles: {
                orderBy: { publishedDate: 'desc' },
                take: 1
              },
              beats: {
                include: { topic: true }
              }
            }
          }
        }
      });

      if (!outlet) {
        throw new Error('Outlet not found');
      }

      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const filename = `${outlet.name.replace(/\s+/g, '_')}_${timestamp}.csv`;
      const filepath = join(this.exportsDir, filename);

      const csvWriter = createCsvWriter({
        path: filepath,
        header: [
          { id: 'name', title: 'Name' },
          { id: 'email', title: 'Email' },
          { id: 'profileUrl', title: 'Profile URL' },
          { id: 'articleCount', title: 'Article Count' },
          { id: 'lastArticleDate', title: 'Last Article Date' },
          { id: 'beats', title: 'Beats/Topics' },
          { id: 'latestArticle', title: 'Latest Article' },
          { id: 'twitter', title: 'Twitter' },
          { id: 'linkedin', title: 'LinkedIn' }
        ]
      });

      const records = outlet.journalists.map(j => ({
        name: j.name,
        email: j.email || '',
        profileUrl: j.profileUrl || '',
        articleCount: j.articleCount,
        lastArticleDate: j.lastArticleDate ? j.lastArticleDate.toISOString().split('T')[0] : '',
        beats: j.beats.map(b => b.topic.name).join(', '),
        latestArticle: j.articles[0]?.title || '',
        twitter: j.twitter || '',
        linkedin: j.linkedin || ''
      }));

      await csvWriter.writeRecords(records);

      logger.info(`Exported ${records.length} journalists to ${filename}`);

      return {
        filename,
        filepath,
        recordCount: records.length
      };
    } catch (error) {
      logger.error(`Error exporting outlet ${outletId} to CSV:`, error);
      throw error;
    }
  }

  async exportAllOutletsToCSV() {
    try {
      const outlets = await _outlet.findMany({
        include: {
          journalists: {
            include: {
              articles: {
                orderBy: { publishedDate: 'desc' },
                take: 1
              },
              beats: {
                include: { topic: true }
              }
            }
          }
        }
      });

      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const filename = `all_outlets_${timestamp}.csv`;
      const filepath = join(this.exportsDir, filename);

      const csvWriter = createCsvWriter({
        path: filepath,
        header: [
          { id: 'outlet', title: 'Outlet' },
          { id: 'name', title: 'Name' },
          { id: 'email', title: 'Email' },
          { id: 'profileUrl', title: 'Profile URL' },
          { id: 'articleCount', title: 'Article Count' },
          { id: 'lastArticleDate', title: 'Last Article Date' },
          { id: 'beats', title: 'Beats/Topics' },
          { id: 'latestArticle', title: 'Latest Article' },
          { id: 'twitter', title: 'Twitter' },
          { id: 'linkedin', title: 'LinkedIn' }
        ]
      });

      const records = [];
      outlets.forEach(outlet => {
        outlet.journalists.forEach(j => {
          records.push({
            outlet: outlet.name,
            name: j.name,
            email: j.email || '',
            profileUrl: j.profileUrl || '',
            articleCount: j.articleCount,
            lastArticleDate: j.lastArticleDate ? j.lastArticleDate.toISOString().split('T')[0] : '',
            beats: j.beats.map(b => b.topic.name).join(', '),
            latestArticle: j.articles[0]?.title || '',
            twitter: j.twitter || '',
            linkedin: j.linkedin || ''
          });
        });
      });

      await csvWriter.writeRecords(records);

      logger.info(`Exported ${records.length} journalists from ${outlets.length} outlets`);

      return {
        filename,
        filepath,
        recordCount: records.length,
        outletCount: outlets.length
      };
    } catch (error) {
      logger.error('Error exporting all outlets to CSV:', error);
      throw error;
    }
  }

  async exportGraphData(outletId) {
    try {
      const graphAnalyzer = require('../analysis/graphAnalyzer.js');
      const outlet = await _outlet.findUnique({
        where: { id: outletId },
        include: {
          journalists: {
            include: {
              articles: true,
              beats: {
                include: { topic: true }
              }
            }
          }
        }
      });

      if (!outlet) {
        throw new Error('Outlet not found');
      }

      const graph = graphAnalyzer.buildJournalistTopicGraph(outlet.journalists);
      const exportData = graphAnalyzer.exportForVisualization(graph);

      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const filename = `${outlet.name.replace(/\s+/g, '_')}_graph_${timestamp}.json`;
      const filepath = join(this.exportsDir, filename);

      await fs.writeFile(filepath, JSON.stringify(exportData, null, 2));

      logger.info(`Exported graph data to ${filename}`);

      return {
        filename,
        filepath,
        nodeCount: exportData.nodes.length,
        edgeCount: exportData.edges.length
      };
    } catch (error) {
      logger.error(`Error exporting graph data for outlet ${outletId}:`, error);
      throw error;
    }
  }

  async getExportedFiles() {
    try {
      const files = await fs.readdir(this.exportsDir);
      const fileStats = await Promise.all(
        files.map(async (file) => {
          const filepath = join(this.exportsDir, file);
          const stats = await fs.stat(filepath);
          return {
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
      );

      return fileStats.sort((a, b) => b.created - a.created);
    } catch (error) {
      logger.error('Error getting exported files:', error);
      return [];
    }
  }
}

const exportService = new ExportService();

export const exportOutletToCSV = exportService.exportOutletToCSV.bind(exportService);
export const exportAllOutletsToCSV = exportService.exportAllOutletsToCSV.bind(exportService);
export const exportGraphData = exportService.exportGraphData.bind(exportService);
export const getExportedFiles = exportService.getExportedFiles.bind(exportService);

export default exportService;
