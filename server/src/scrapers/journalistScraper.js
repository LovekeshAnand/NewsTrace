import BaseScraper from './baseScraper.js';
import { logger } from '../config/logger.js';

class JournalistScraper extends BaseScraper {
  constructor() {
    super();
    this.journalists = [];
    this.visited = new Set();
  }

  async scrapeOutlet(website, targetCount = 30) {
    try {
      this.journalists = [];
      this.visited = new Set();

      const urls = await this.discoverPages(website);
      logger.info(`Found ${urls.length} journalist page candidates`);

      if (urls.length > 0) {
        const batch = urls.slice(0, Math.min(urls.length, targetCount * 2, 50));
        const tasks = batch.map(url =>
          this.queue.add(async () => {
            const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 30000));
            await Promise.race([this.scrapeProfile(url, website), timeout]).catch(() => {});
          })
        );
        await Promise.allSettled(tasks);
      }

      if (this.journalists.length < targetCount) {
        await Promise.race([
          this.scrapeFromArticles(website, targetCount),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 120000))
        ]).catch(() => {});
      }

      logger.info(`Scraped ${this.journalists.length} journalists from ${website}`);
      return this.journalists.slice(0, targetCount);
    } finally {
      await this.closeBrowser();
    }
  }

  async discoverPages(website) {
    const urls = new Set();
    try {
      const html = await this.fetchWithPuppeteer(website);
      const $ = this.parseHTML(html);
      this.findJournalistPages($, website).forEach(u => urls.add(u));

      const paths = ['/authors', '/journalists', '/staff', '/writers', '/contributors', '/team', '/profiles'];
      for (const path of paths) {
        try {
          const pageHtml = await this.fetchWithPuppeteer(new URL(path, website).href);
          const $p = this.parseHTML(pageHtml);
          this.findJournalistPages($p, website).forEach(u => urls.add(u));

          $p('ul li a, .author-list a, .team-list a, .staff-list a').each((_, el) => {
            const href = $p(el).attr('href');
            if (href && this.isJournalistUrl(href)) {
              const full = this.resolveUrl(website, href);
              if (full) urls.add(full);
            }
          });

          if (urls.size >= 50) break;
          await this.delay(1000);
        } catch {}
      }
    } catch (err) {
      logger.error('Discovery error:', err.message);
    }
    return Array.from(urls);
  }

  async scrapeProfile(url, baseUrl) {
    if (this.visited.has(url)) return;
    this.visited.add(url);

    try {
      const html = await this.fetchWithPuppeteer(url);
      const $ = this.parseHTML(html);
      const info = this.extractJournalistInfo($, url);
      if (!info.name) return;

      const articles = this.extractArticles($, baseUrl);
      this.journalists.push({
        ...info, articles, articleCount: articles.length,
        lastArticleDate: articles.length > 0 ? articles[0].publishedDate : null
      });
      await this.delay(500);
    } catch {}
  }

  async scrapeFromArticles(website, targetCount) {
    try {
      let html;
      try { html = await this.fetchHTML(website, false); } catch { html = await this.fetchWithPuppeteer(website); }
      const $ = this.parseHTML(html);
      const articles = this.extractArticles($, website);
      const authorMap = new Map();

      for (const article of articles.slice(0, 30)) {
        if (authorMap.size >= targetCount) break;
        try {
          let aHtml;
          try { aHtml = await this.fetchHTML(article.url, false); } catch { aHtml = await this.fetchWithPuppeteer(article.url); }
          const $a = this.parseHTML(aHtml);
          const name = this.extractAuthor($a);

          if (name) {
            if (!authorMap.has(name)) {
              authorMap.set(name, { name, articles: [], articleCount: 0, profileUrl: article.url });
            }
            const j = authorMap.get(name);
            j.articles.push(article);
            j.articleCount++;
            j.lastArticleDate = article.publishedDate;
          }
          await this.delay(500);
        } catch {}
      }

      authorMap.forEach(j => {
        if (!this.journalists.find(existing => existing.name === j.name)) {
          this.journalists.push(j);
        }
      });
    } catch (err) {
      logger.error('Article extraction error:', err.message);
    }
  }

  extractAuthor($) {
    const selectors = [
      '.author-name', '.byline', '[rel="author"]', '.article-author',
      'span.author', 'a.author', '[itemprop="author"]', '.posted-by',
      '.byline a', '.auth_details a', '.pst-by_lnk', '.pst-by',
      '.metadata__byline__author', '.byline__name',
      'meta[name="author"]', 'meta[property="article:author"]',
      '[class*="author"]', '[class*="byline"]'
    ];

    for (const sel of selectors) {
      try {
        const content = $(sel).attr('content');
        if (content && this.isValidName(content)) return this.cleanText(content);
        const text = $(sel).first().text();
        if (text) {
          const cleaned = this.cleanText(text)
            .replace(/^(by|written by|posted by|author:)\s+/i, '')
            .replace(/\s*[,|].*$/, '').trim();
          if (this.isValidName(cleaned)) return cleaned;
        }
      } catch {}
    }
    return null;
  }

  isValidName(name) {
    if (!name || name.length < 3 || name.length > 100 || !name.includes(' ') || /^\d/.test(name)) return false;
    const bad = ['updated', 'published', 'posted', 'ago', 'share', 'follow', 'subscribe', 'http', 'read more'];
    if (bad.some(w => name.toLowerCase().includes(w))) return false;
    const alpha = (name.match(/[a-zA-Z]/g) || []).length;
    return alpha >= name.length * 0.7;
  }
}

export default JournalistScraper;