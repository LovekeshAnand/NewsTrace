import axios from 'axios';
import { load } from 'cheerio';
import { launch } from 'puppeteer';
import { scraping } from '../config/index.js';
import { logger } from '../config/logger.js';
import PQueue from 'p-queue';

class BaseScraper {
  constructor() {
    this.queue = new PQueue({ concurrency: scraping.maxConcurrent, interval: 2000, intervalCap: 1 });
    this.browser = null;
  }

  getRandomUA() {
    const a = scraping.userAgents;
    return a[Math.floor(Math.random() * a.length)];
  }

  async fetchHTML(url, useJS = false) {
    if (useJS) return this.fetchWithPuppeteer(url);
    try {
      const { data } = await axios.get(url, {
        timeout: scraping.timeout,
        headers: {
          'User-Agent': this.getRandomUA(),
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.5', 'DNT': '1'
        }
      });
      return data;
    } catch {
      return this.fetchWithPuppeteer(url);
    }
  }

  async fetchWithPuppeteer(url) {
    let page;
    try {
      if (!this.browser) {
        this.browser = await launch({
          headless: 'new',
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
            '--disable-gpu', '--no-first-run', '--no-zygote']
        });
      }
      page = await this.browser.newPage();
      await page.setViewport({ width: 1280, height: 720 });
      await page.setUserAgent(this.getRandomUA());
      await page.setRequestInterception(true);
      page.on('request', req => {
        const t = req.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(t) ||
          req.url().includes('analytics') || req.url().includes('ads')) req.abort();
        else req.continue();
      });
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await new Promise(r => setTimeout(r, 1000));
      const html = await page.content();
      await page.close();
      return html;
    } catch (err) {
      if (page) await page.close().catch(() => {});
      throw err;
    }
  }

  parseHTML(html) { return load(html); }

  resolveUrl(base, rel) {
    try {
      if (!rel) return null;
      if (rel.startsWith('http')) return rel;
      return new URL(rel, base).href;
    } catch { return null; }
  }

  cleanText(text) {
    return text ? text.replace(/\s+/g, ' ').trim() : '';
  }

  async delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  async closeBrowser() {
    if (this.browser) { await this.browser.close().catch(() => {}); this.browser = null; }
  }

  extractEmails(text) {
    const m = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    return m ? [...new Set(m)] : [];
  }

  extractTwitter(text) {
    const m = text.match(/@([A-Za-z0-9_]{1,15})/g);
    return m ? m[0] : null;
  }

  findJournalistPages($, baseUrl) {
    const urls = new Set();
    const patterns = [
      'a[href*="/author/"]', 'a[href*="/authors/"]', 'a[href*="/writer/"]',
      'a[href*="/journalist/"]', 'a[href*="/staff/"]', 'a[href*="/by/"]',
      'a[href*="/profile/"]', 'a[href*="/people/"]', 'a[href*="/contributor/"]',
      'a[href*="/contributors/"]', 'a[href*="/toireporter/"]', 'a[href*="/reporters/"]',
      'a[href*="/correspondent/"]', 'a[href*="/editor/"]', 'a[href*="/columnist/"]',
      'a[href*="/profiles/"]', 'a[href*="/byline/"]', 'a[href*="/team/"]',
      'a.author-link', '.author-name a', '.byline a', '[rel="author"]',
      '[itemprop="author"] a', 'a[href*="/person/"]', 'a[href*="/bio/"]'
    ];

    patterns.forEach(p => {
      try {
        $(p).each((_, el) => {
          const href = $(el).attr('href');
          if (href) {
            const full = this.resolveUrl(baseUrl, href);
            if (full && !full.includes('#') && full !== baseUrl) urls.add(full);
          }
        });
      } catch {}
    });

    $('a').each((_, el) => {
      const text = $(el).text().trim().toLowerCase();
      const href = $(el).attr('href');
      if (href && (text.includes('view profile') || text.includes('all articles') || text.includes('more from'))) {
        const full = this.resolveUrl(baseUrl, href);
        if (full && this.isJournalistUrl(full)) urls.add(full);
      }
    });

    return Array.from(urls);
  }

  isJournalistUrl(url) {
    if (!url) return false;
    const u = url.toLowerCase();
    const good = ['/author/', '/writer/', '/journalist/', '/reporter/', '/staff/', '/by/',
      '/profile/', '/people/', '/contributor/', '/correspondent/', '/editor/', '/columnist/', '/toireporter/'];
    const bad = ['/gallery/', '/slideshow/', '/video/', '/search', '/category', '/tag',
      '/page/', '.jpg', '.png', '.pdf', 'login', '/articleshow/', '-news-', '-article-'];
    return good.some(p => u.includes(p)) && !bad.some(p => u.includes(p));
  }

  extractJournalistInfo($, url) {
    const info = { name: null, email: null, bio: null, imageUrl: null, twitter: null, linkedin: null, profileUrl: url };

    const nameSelectors = [
      'h1.author-name', '.profile-name', '.author-header h1', 'h1[itemprop="name"]',
      '.author-info h1', 'h1.name', '[class*="author"] h1', 'h1', 'h2'
    ];
    for (const sel of nameSelectors) {
      try {
        const text = $(sel).first().text();
        if (text && text.length > 2 && text.length < 100) {
          const cleaned = this.cleanText(text).replace(/^by\s+/i, '').replace(/\s*[-|].*$/, '').trim();
          if (cleaned.length > 2 && cleaned.length < 100 && this.looksLikeName(cleaned)) {
            info.name = cleaned; break;
          }
        }
      } catch {}
    }

    const bioSelectors = ['.author-bio', '.profile-bio', '.author-description', 'p.bio',
      '[itemprop="description"]', '.about-author', '[class*="author-bio"]'];
    for (const sel of bioSelectors) {
      try {
        const bio = $(sel).first().text();
        if (bio && bio.length > 10) { info.bio = this.cleanText(bio); break; }
      } catch {}
    }

    const imgSelectors = ['.author-image img', '.profile-image img', 'img.avatar',
      '.author-avatar img', '[itemprop="image"]', '[class*="author"] img'];
    for (const sel of imgSelectors) {
      try {
        const src = $(sel).first().attr('src');
        if (src) { info.imageUrl = this.resolveUrl(url, src); break; }
      } catch {}
    }

    try {
      const pageText = $.text();
      info.email = this.extractEmails(pageText)[0] || null;
      info.twitter = this.extractTwitter(pageText);
      $('a[href*="linkedin.com"]').each((_, el) => { info.linkedin = $(el).attr('href'); });
    } catch {}

    return info;
  }

  looksLikeName(text) {
    if (!text || !text.includes(' ') || /\d/.test(text) || text.length > 50) return false;
    const bad = ['updated', 'published', 'posted', 'ago', 'min', 'hours', 'days'];
    return !bad.some(w => text.toLowerCase().includes(w));
  }

  extractArticles($, baseUrl) {
    const articles = [];
    const seen = new Set();

    const strategies = [
      { container: '.story-card', title: 'h3.title, h2.headline', link: 'a', date: 'time, .date' },
      { container: '.news_Itm, .lisingNews', title: 'h2, .newsHdng, h3', link: 'a', date: 'span.posted-on, time' },
      { container: 'article, .article, .story, .post, .card, li', title: 'h2, h3, h4, .title, .headline, a', link: 'a', date: 'time, .date, .published, .meta' }
    ];

    for (const s of strategies) {
      try {
        $(s.container).each((_, el) => {
          const $el = $(el);
          const title = this.cleanText($el.find(s.title).first().text());
          const href = $el.find(s.link).first().attr('href');
          const url = this.resolveUrl(baseUrl, href);
          const dateEl = $el.find(s.date).first();
          const dateStr = dateEl.attr('datetime') || dateEl.text();

          if (title && url && title.length > 10 && !seen.has(url)) {
            seen.add(url);
            articles.push({ title, url, publishedDate: this.parseDate(dateStr), section: this.extractSection(url) });
          }
        });
        if (articles.length > 20) break;
      } catch {}
    }

    if (articles.length === 0) {
      $('a').each((_, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        if (href && text && text.length > 20 && text.length < 200) {
          const url = this.resolveUrl(baseUrl, href);
          if (url && !seen.has(url) && this.looksLikeArticle(url)) {
            seen.add(url);
            articles.push({ title: this.cleanText(text), url, publishedDate: null, section: this.extractSection(url) });
          }
        }
      });
    }
    return articles.slice(0, 50);
  }

  looksLikeArticle(url) {
    if (!url) return false;
    const u = url.toLowerCase();
    const good = ['/article', '/story', '/news', '/20', '-', '_'];
    const bad = ['/category', '/tag', '/page', '/search', 'javascript:', '#', '/author', '.jpg', '.png'];
    return good.some(p => u.includes(p)) && !bad.some(p => u.includes(p));
  }

  parseDate(str) {
    if (!str) return null;
    try {
      const d = new Date(str.replace(/published|updated|posted|on/gi, '').trim());
      return !isNaN(d.getTime()) && d.getFullYear() > 2000 ? d : null;
    } catch { return null; }
  }

  extractSection(url) {
    try {
      const parts = new URL(url).pathname.split('/').filter(p => p && p.length > 2);
      const sections = ['politics', 'business', 'technology', 'sports', 'tech', 'entertainment',
        'world', 'opinion', 'science', 'india', 'health', 'education', 'environment', 'news'];
      if (parts.length > 0 && sections.includes(parts[0].toLowerCase())) return parts[0];
    } catch {}
    return null;
  }
}

export default BaseScraper;