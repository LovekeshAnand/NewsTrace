import  get  from 'axios';
import { load } from 'cheerio';
import { launch } from 'puppeteer';
import { scraping } from '../config/index.js';
import { logger } from '../config/logger.js';
import PQueue from 'p-queue';

class BaseScraper {
  constructor() {
    this.queue = new PQueue({ 
      concurrency: scraping.maxConcurrent,
      interval: 2000,
      intervalCap: 1
    });
    this.browser = null;
  }

  getRandomUserAgent() {
    const agents = scraping.userAgents;
    return agents[Math.floor(Math.random() * agents.length)];
  }

  async fetchHTML(url, useJavaScript = false) {
    try {
      if (useJavaScript) {
        return await this.fetchWithPuppeteer(url);
      }

      const response = await get(url, {
        timeout: scraping.timeout,
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      return response.data;
    } catch (error) {
      logger.debug(`Error fetching ${url}:`, error.message);
      // Fallback to Puppeteer if axios fails
      try {
        logger.info(`Falling back to Puppeteer for ${url}`);
        return await this.fetchWithPuppeteer(url);
      } catch (puppeteerError) {
        logger.error(`Both fetch methods failed for ${url}`);
        throw error;
      }
    }
  }

 async fetchWithPuppeteer(url) {
  let page;
  try {
    if (!this.browser) {
      this.browser = await launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-software-rasterizer'
        ]
      });
    }

    page = await this.browser.newPage();
    
    // Set smaller viewport for faster rendering
    await page.setViewport({ width: 1280, height: 720 });
    
    await page.setUserAgent(this.getRandomUserAgent());
    
    // AGGRESSIVE resource blocking
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      const url = req.url();
      
      // Block everything except documents and scripts
      if (
        resourceType === 'image' ||
        resourceType === 'stylesheet' ||
        resourceType === 'font' ||
        resourceType === 'media' ||
        url.includes('analytics') ||
        url.includes('ads') ||
        url.includes('tracking')
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Navigate with shorter timeout
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', // Changed from networkidle0
      timeout: 20000 // 20 seconds max
    });

    // Wait less time
    await page.waitForTimeout(1000);

    const html = await page.content();
    await page.close();
    return html;
  } catch (error) {
    if (page) await page.close();
    logger.debug(`Puppeteer error for ${url}: ${error.message}`);
    throw error;
  }
}

  async fetchWithScroll(url) {
    let page;
    try {
      if (!this.browser) {
        this.browser = await launch({
          headless: 'new',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
          ]
        });
      }

      page = await this.browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(this.getRandomUserAgent());
      
      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: scraping.timeout 
      });

      // Aggressive scrolling for lazy-loaded content
      await this.autoScroll(page);
      
      await page.waitForTimeout(3000);
      const html = await page.content();
      await page.close();
      return html;
    } catch (error) {
      if (page) await page.close();
      logger.error(`Puppeteer scroll error for ${url}:`, error.message);
      throw error;
    }
  }

  async autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 300;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 200);
      });
    });
  }

  parseHTML(html) {
    return load(html);
  }

  extractEmails(text) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = text.match(emailRegex);
    return emails ? [...new Set(emails)] : [];
  }

  extractTwitterHandle(text) {
    const twitterRegex = /@([A-Za-z0-9_]{1,15})/g;
    const handles = text.match(twitterRegex);
    return handles ? handles[0] : null;
  }

  extractLinks($, selector) {
    const links = [];
    $(selector).each((i, el) => {
      const href = $(el).attr('href');
      if (href) links.push(href);
    });
    return links;
  }

  resolveUrl(baseUrl, relativeUrl) {
    try {
      if (!relativeUrl) return null;
      if (relativeUrl.startsWith('http')) return relativeUrl;
      return new URL(relativeUrl, baseUrl).href;
    } catch {
      return null;
    }
  }

  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .replace(/\t+/g, ' ')
      .trim();
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // ENHANCED: Find journalist pages with aggressive search
  findJournalistPages($, baseUrl) {
    const journalistUrls = new Set();
    
    // Extended patterns for ALL news sites
    const patterns = [
      // Standard patterns
      'a[href*="/author/"]', 'a[href*="/authors/"]',
      'a[href*="/writer/"]', 'a[href*="/journalist/"]',
      'a[href*="/staff/"]', 'a[href*="/by/"]',
      'a[href*="/profile/"]', 'a[href*="/people/"]',
      'a[href*="/contributor/"]', 'a[href*="/contributors/"]',
      
      // Times of India specific
      'a[href*="/toireporter/"]', 'a[href*="/photostory/"]',
      
      // Indian news sites
      'a[href*="/reporters/"]', 'a[href*="/correspondent/"]',
      'a[href*="/anchor/"]', 'a[href*="/editor/"]',
      'a[href*="/columnist/"]', 'a[href*="/blogs/"]',
      
      // International sites
      'a[href*="/profiles/"]', 'a[href*="/byline/"]',
      'a[href*="/team/"]', 'a[href*="/about/"]',
      
      // Class and attribute-based selectors
      'a.author-link', 'a.journalist-link', 'a.byline-link',
      'a.reporter-link', 'a.writer-link', 'a.contributor-link',
      '.author-name a', '.byline a', '.reporter a',
      '.journalist a', '.correspondent a',
      '[rel="author"]', '[itemprop="author"] a',
      
      // Generic person links
      'a[href*="/person/"]', 'a[href*="/bio/"]'
    ];

    patterns.forEach(pattern => {
      try {
        $(pattern).each((i, el) => {
          const href = $(el).attr('href');
          if (href) {
            const fullUrl = this.resolveUrl(baseUrl, href);
            if (fullUrl && !fullUrl.includes('#') && fullUrl !== baseUrl) {
              journalistUrls.add(fullUrl);
            }
          }
        });
      } catch (e) {
        // Continue with other patterns
      }
    });

    // AGGRESSIVE: Also search in text for author names and try to find their pages
    $('a').each((i, el) => {
      const text = $(el).text().trim().toLowerCase();
      const href = $(el).attr('href');
      
      if (href && (
        text.includes('view profile') ||
        text.includes('see more') ||
        text.includes('all articles') ||
        text.includes('more from') ||
        text.includes('by ')
      )) {
        const fullUrl = this.resolveUrl(baseUrl, href);
        if (fullUrl && this.looksLikeJournalistUrl(fullUrl)) {
          journalistUrls.add(fullUrl);
        }
      }
    });

    logger.info(`Found ${journalistUrls.size} potential journalist URLs`);
    return Array.from(journalistUrls);
  }

looksLikeJournalistUrl(url) {
  if (!url) return false;
  const urlLower = url.toLowerCase();
  
  // STRICT good patterns - must match at least one
  const goodPatterns = [
    '/author/', '/writer/', '/journalist/', '/reporter/',
    '/staff/', '/by/', '/profile/', '/people/',
    '/contributor/', '/correspondent/', '/anchor/',
    '/editor/', '/columnist/', '/toireporter/',
    '/blogs/author/'  // Times of India blog authors
  ];
  
  // STRICT bad patterns - if any match, reject immediately
  const badPatterns = [
    '/photostory/', '/photoset/', '/gallery/',
    '/slideshow/', '/listshow/', '/video/',
    '/search', '/category', '/tag', '/archive',
    '/page/', '.jpg', '.png', '.pdf', 'login', 'signup',
    '/entertainment/', '/sports/', '/business/',  // Avoid article sections
    '/news/', '/india/', '/world/', '/tech/',
    '/city/', '/lifestyle/', '/movies/',
    '-news-', '-article-', '/articleshow/'
  ];
  
  const hasGood = goodPatterns.some(p => urlLower.includes(p));
  const hasBad = badPatterns.some(p => urlLower.includes(p));
  
  return hasGood && !hasBad;
}
  // ENHANCED: Extract journalist info with maximum selectors
  extractJournalistInfo($, url) {
    const info = {
      name: null,
      email: null,
      bio: null,
      imageUrl: null,
      twitter: null,
      linkedin: null,
      profileUrl: url
    };

    // MAXIMUM name selectors
    const nameSelectors = [
      'h1.author-name', 'h1.journalist-name', 'h1.reporter-name',
      'h1.correspondent-name', 'h1.writer-name',
      '.profile-name', '.author-header h1', '.profile-header h1',
      'h1[itemprop="name"]', 'h1.byline-name',
      '.author-title h1', '.correspondent-name',
      '.author-info h1', '.reporter-info h1',
      'h1.name', 'h1.full-name', 'h2.author-name',
      '[class*="author"] h1', '[class*="writer"] h1',
      '[class*="journalist"] h1', '[class*="reporter"] h1',
      'h1', 'h2' // Ultimate fallbacks
    ];

    for (const selector of nameSelectors) {
      try {
        const name = $(selector).first().text();
        if (name && name.length > 2 && name.length < 100) {
          const cleaned = this.cleanText(name)
            .replace(/^by\s+/i, '')
            .replace(/^written by\s+/i, '')
            .replace(/^posted by\s+/i, '')
            .replace(/\s*-\s*.*$/, '')
            .replace(/\s*\|.*$/, '')
            .trim();
          
          if (cleaned.length > 2 && cleaned.length < 100 && this.looksLikeName(cleaned)) {
            info.name = cleaned;
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    // Bio selectors
    const bioSelectors = [
      '.author-bio', '.journalist-bio', '.profile-bio',
      '.author-description', '.reporter-bio', '.correspondent-bio',
      'p.bio', '[itemprop="description"]', '.about-author',
      '.profile-description', 'p.description', '.bio-text',
      '[class*="author-bio"]', '[class*="profile-bio"]'
    ];

    for (const selector of bioSelectors) {
      try {
        const bio = $(selector).first().text();
        if (bio && bio.length > 10) {
          info.bio = this.cleanText(bio);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // Image selectors
    const imgSelectors = [
      '.author-image img', '.profile-image img',
      '.journalist-photo img', 'img.avatar',
      '.author-avatar img', '[itemprop="image"]',
      '.profile-pic img', '.reporter-image img',
      '[class*="author"] img', '[class*="profile"] img'
    ];

    for (const selector of imgSelectors) {
      try {
        const imgSrc = $(selector).first().attr('src');
        if (imgSrc) {
          info.imageUrl = this.resolveUrl(url, imgSrc);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // Extract social links
    try {
      const pageText = $.text();
      info.email = this.extractEmails(pageText)[0] || null;
      info.twitter = this.extractTwitterHandle(pageText);

      $('a[href*="linkedin.com"]').each((i, el) => {
        info.linkedin = $(el).attr('href');
      });
    } catch (e) {
      // Continue
    }

    return info;
  }

  looksLikeName(text) {
    if (!text) return false;
    
    // Must have at least one space (first and last name)
    if (!text.includes(' ')) return false;
    
    // Should not contain numbers
    if (/\d/.test(text)) return false;
    
    // Should not be too long
    if (text.length > 50) return false;
    
    // Should not contain common non-name words
    const badWords = ['updated', 'published', 'posted', 'ago', 'min', 'hours', 'days'];
    if (badWords.some(word => text.toLowerCase().includes(word))) return false;
    
    return true;
  }

  // ENHANCED: Extract articles with MAXIMUM selectors
  extractArticles($, baseUrl) {
    const articles = [];
    const seen = new Set();
    
    // MAXIMUM selector strategies for ALL sites
    const articleSelectors = [
      // Times of India
      { container: '.list5, .list9, .briefs-list', title: 'a, span', link: 'a', date: '.time, .meta, time' },
      
      // The Hindu
      { container: '.story-card', title: 'h3.title, h2.headline', link: 'a', date: 'time, .date' },
      
      // NDTV
      { container: '.news_Itm, .lisingNews, .new_storylising', title: 'h2, .newsHdng, h3', link: 'a', date: 'span.posted-on, .posted, time' },
      
      // Aajtak
      { container: '.article-list-item, .story-card, .uk-card', title: 'h2, h3, .headline, .article-title', link: 'a', date: 'time, .date, .datetime, .story-date' },
      
      // CNN
      { container: '.container__item, .cd__wrapper, .card', title: '.container__headline, .cd__headline, h3', link: 'a', date: 'time, .metadata__date, .timestamp' },
      
      // BBC
      { container: 'article, .gs-c-promo, .nw-c-promo', title: 'h3, .gs-c-promo-heading, .nw-o-link-split__text', link: 'a', date: 'time, .gs-o-bullet-list__item, .date' },
      
      // Generic fallback
      { container: 'article, .article, .story, .post, .item, .card, li', title: 'h2, h3, h4, .title, .headline, a', link: 'a', date: 'time, .date, .published, .datetime, .meta' }
    ];

    for (const selector of articleSelectors) {
      try {
        $(selector.container).each((i, el) => {
          const $article = $(el);
          
          let title = '';
          let url = '';
          let dateStr = '';

          // Extract title
          const titleEl = $article.find(selector.title).first();
          if (titleEl.length) {
            title = this.cleanText(titleEl.text());
          }

          // Extract link
          const linkEl = $article.find(selector.link).first();
          if (linkEl.length) {
            const href = linkEl.attr('href');
            url = this.resolveUrl(baseUrl, href);
          }

          // Extract date
          const dateEl = $article.find(selector.date).first();
          if (dateEl.length) {
            dateStr = dateEl.attr('datetime') || dateEl.text();
          }

          if (title && url && title.length > 10 && !seen.has(url)) {
            seen.add(url);
            articles.push({
              title,
              url,
              publishedDate: this.parseDate(dateStr),
              section: this.extractSection(url)
            });
          }
        });

        // If we found enough articles, break
        if (articles.length > 20) break;
      } catch (e) {
        continue;
      }
    }

    // FALLBACK: If no articles found, extract from ALL links
    if (articles.length === 0) {
      logger.warn(`No articles found with structured selectors, trying link extraction`);
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        
        if (href && text && text.length > 20 && text.length < 200) {
          const url = this.resolveUrl(baseUrl, href);
          
          if (url && !seen.has(url) && this.looksLikeArticleUrl(url)) {
            seen.add(url);
            articles.push({
              title: this.cleanText(text),
              url: url,
              publishedDate: null,
              section: this.extractSection(url)
            });
          }
        }
      });
    }

    logger.info(`Found ${articles.length} articles on ${baseUrl}`);
    return articles.slice(0, 50); // Return up to 50 articles
  }

  looksLikeArticleUrl(url) {
    if (!url) return false;
    const urlLower = url.toLowerCase();
    
    // Should look like an article
    const goodPatterns = [
      '/article', '/story', '/news', '/20', '-', '_',
      '/politics', '/business', '/sports', '/tech', '/world'
    ];
    
    const badPatterns = [
      '/category', '/tag', '/page', '/search', 'javascript:',
      '#', '/author', '/profile', '.jpg', '.png', '/video'
    ];
    
    const hasGood = goodPatterns.some(p => urlLower.includes(p));
    const hasBad = badPatterns.some(p => urlLower.includes(p));
    
    return hasGood && !hasBad;
  }

  parseDate(dateStr) {
    if (!dateStr) return null;
    
    try {
      const cleanStr = dateStr
        .replace(/published|updated|posted|on/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      const date = new Date(cleanStr);
      if (!isNaN(date.getTime()) && date.getFullYear() > 2000) {
        return date;
      }
      
      return null;
    } catch {
      return null;
    }
  }

  extractSection(url) {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(p => p && p.length > 2);
      
      if (pathParts.length > 0) {
        const section = pathParts[0];
        const commonSections = [
          'politics', 'business', 'technology', 'sports', 'tech',
          'entertainment', 'world', 'opinion', 'science', 'india',
          'health', 'education', 'environment', 'cities', 'news',
          'international', 'economy', 'lifestyle', 'culture'
        ];
        
        if (commonSections.includes(section.toLowerCase())) {
          return section;
        }
      }
    } catch {
      return null;
    }
    return null;
  }
}

export default BaseScraper;