import BaseScraper from './baseScraper.js';
import { logger } from '../config/logger.js';

class JournalistScraper extends BaseScraper {
  constructor() {
    super();
    this.journalists = [];
    this.visitedUrls = new Set();
  }

 async scrapeOutlet(website, targetCount = 30) {
  try {
    logger.info(`🚀 Starting ENHANCED scrape for ${website}`);
    this.journalists = [];
    this.visitedUrls = new Set();

    // Step 1: Discover journalist pages
    const startTime = Date.now();
    const journalistUrls = await this.discoverJournalistPages(website);
    logger.info(`📋 Found ${journalistUrls.length} potential journalist pages in ${(Date.now() - startTime) / 1000}s`);

    // Step 2: Scrape profiles with TIMEOUT
    if (journalistUrls.length > 0) {
      const maxUrls = Math.min(journalistUrls.length, targetCount * 2, 50); // Max 50 URLs
      const urlsToScrape = journalistUrls.slice(0, maxUrls);
      
      logger.info(`🎯 Scraping ${urlsToScrape.length} profiles...`);
      
      // Scrape with timeout protection
      const scrapeTasks = urlsToScrape.map(url => 
        this.queue.add(async () => {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile scrape timeout')), 30000)
          );
          
          const scrapePromise = this.scrapeJournalistProfile(url, website);
          
          return Promise.race([scrapePromise, timeoutPromise]).catch(err => {
            logger.debug(`Timeout or error for ${url}: ${err.message}`);
          });
        })
      );

      await Promise.allSettled(scrapeTasks);
      logger.info(`✅ Scraped ${this.journalists.length} journalists from profiles`);
    }

    // Step 3: If not enough, try alternative methods
    if (this.journalists.length < targetCount) {
      logger.info(`⚠️  Only found ${this.journalists.length} journalists, trying article extraction`);
      
      const articlesTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Article extraction timeout')), 120000) // 2 min max
      );
      
      const articlesPromise = this.scrapeFromArticles(website, targetCount);
      
      await Promise.race([articlesPromise, articlesTimeout]).catch(err => {
        logger.warn(`Article extraction stopped: ${err.message}`);
      });
    }

    logger.info(`🎉 Final count: ${this.journalists.length} journalists from ${website}`);
    return this.journalists.slice(0, targetCount);
  } catch (error) {
    logger.error(`❌ Error scraping outlet ${website}:`, error);
    throw error;
  } finally {
    await this.closeBrowser();
  }
}

  async discoverJournalistPages(website) {
  const journalistUrls = new Set();

  try {
    logger.info(`🔍 Using Puppeteer for discovery on ${website}`);
    
    const html = await this.fetchWithPuppeteer(website);
    const $ = this.parseHTML(html);
    
    const mainPageUrls = this.findJournalistPages($, website);
    mainPageUrls.forEach(url => journalistUrls.add(url));
    logger.info(`Found ${mainPageUrls.length} URLs from main page`);

    // OPTIMIZED: Only check most likely paths
    const priorityPaths = [
      '/authors', '/journalists', '/staff', '/writers',
      '/toireporter', '/blogs', '/contributors',
      '/team', '/profiles'
    ];

    for (const path of priorityPaths) {
      try {
        const url = new URL(path, website).href;
        logger.debug(`Trying path: ${path}`);
        
        const html = await this.fetchWithPuppeteer(url);
        const $ = this.parseHTML(html);
        
        const urls = this.findJournalistPages($, website);
        const before = journalistUrls.size;
        urls.forEach(u => journalistUrls.add(u));
        const added = journalistUrls.size - before;
        
        if (added > 0) {
          logger.info(`✅ Found ${added} new URLs from ${path} (Total: ${journalistUrls.size})`);
        }

        // Look for links in list/directory format
        $('ul li a, .author-list a, .team-list a, .staff-list a, .blog-authors a').each((i, el) => {
          const href = $(el).attr('href');
          if (href && this.looksLikeJournalistUrl(href)) {
            const fullUrl = this.resolveUrl(website, href);
            if (fullUrl) journalistUrls.add(fullUrl);
          }
        });

        // OPTIMIZATION: If we found enough URLs, stop searching
        if (journalistUrls.size >= 50) {
          logger.info(`🎯 Found enough URLs (${journalistUrls.size}), stopping discovery`);
          break;
        }

        await this.delay(1000); // Reduced delay
      } catch (error) {
        logger.debug(`Could not fetch ${path}:`, error.message);
      }
    }

  } catch (error) {
    logger.error('Error discovering journalist pages:', error);
  }

  logger.info(`📊 Total discovered URLs: ${journalistUrls.size}`);
  return Array.from(journalistUrls);
}
async scrapeJournalistProfile(url, baseUrl) {
  if (this.visitedUrls.has(url)) return;
  this.visitedUrls.add(url);

  try {
    const html = await this.fetchWithPuppeteer(url);
    const $ = this.parseHTML(html);

    const info = this.extractJournalistInfo($, url);
    
    if (!info.name) {
      logger.debug(`❌ No name found for ${url}`);
      return;
    }

    // Extract articles (don't scroll unless necessary)
    let articles = this.extractArticles($, baseUrl);
    
    const journalist = {
      ...info,
      articles,
      articleCount: articles.length,
      lastArticleDate: articles.length > 0 ? articles[0].publishedDate : null
    };

    this.journalists.push(journalist);
    logger.info(`✅ ${this.journalists.length}/${targetCount || 30}: ${journalist.name} (${articles.length} articles)`);
    
    await this.delay(500); // Reduced delay
  } catch (error) {
    logger.debug(`Error scraping profile ${url}:`, error.message);
  }
}

  extractArticlesFromLinks($, baseUrl) {
    const articles = [];
    const seen = new Set();

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

    return articles.slice(0, 30);
  }

async scrapeFromArticles(website, targetCount) {
  try {
    logger.info(`📰 Extracting journalists from articles on ${website}`);
    
    // Use regular fetch first (faster)
    let html;
    try {
      html = await this.fetchHTML(website, false);
    } catch {
      html = await this.fetchWithPuppeteer(website);
    }
    
    const $ = this.parseHTML(html);

    const articles = this.extractArticles($, website);
    logger.info(`Found ${articles.length} articles to analyze`);
    
    const journalistMap = new Map();
    const maxArticlesToCheck = 30; // Reduced from 100

    for (const article of articles.slice(0, maxArticlesToCheck)) {
      // Skip if we have enough
      if (journalistMap.size >= targetCount) {
        logger.info(`✅ Reached target, stopping article extraction`);
        break;
      }

      try {
        // Try regular fetch first
        let articleHtml;
        try {
          articleHtml = await this.fetchHTML(article.url, false);
        } catch {
          articleHtml = await this.fetchWithPuppeteer(article.url);
        }
        
        const $article = this.parseHTML(articleHtml);
        const authorName = this.extractAuthorFromArticle($article);
        
        if (authorName) {
          if (!journalistMap.has(authorName)) {
            journalistMap.set(authorName, {
              name: authorName,
              articles: [],
              articleCount: 0,
              profileUrl: article.url
            });
          }
          
          const journalist = journalistMap.get(authorName);
          journalist.articles.push(article);
          journalist.articleCount++;
          journalist.lastArticleDate = article.publishedDate;
          
          logger.debug(`Found article by ${authorName}`);
        }

        await this.delay(500); // Reduced delay
        
      } catch (error) {
        logger.debug(`Error scraping article ${article.url}:`, error.message);
      }
    }

    journalistMap.forEach(journalist => {
      if (!this.journalists.find(j => j.name === journalist.name)) {
        this.journalists.push(journalist);
        logger.info(`✅ Added ${journalist.name} from articles (${journalist.articleCount} articles)`);
      }
    });

    logger.info(`📊 Extracted ${journalistMap.size} journalists from articles`);

  } catch (error) {
    logger.error('Error scraping from articles:', error);
  }
}

  async scrapeFromSitemap(website, targetCount) {
    try {
      logger.info(`🗺️  Trying sitemap method for ${website}`);
      
      const sitemapUrls = [
        '/sitemap.xml',
        '/sitemap_index.xml',
        '/news-sitemap.xml',
        '/sitemap-news.xml',
        '/post-sitemap.xml'
      ];

      const journalistUrls = new Set();

      for (const sitemapPath of sitemapUrls) {
        try {
          const sitemapUrl = new URL(sitemapPath, website).href;
          const html = await this.fetchHTML(sitemapUrl);
          const $ = this.parseHTML(html);
          
          $('loc').each((i, el) => {
            const url = $(el).text();
            if (this.looksLikeJournalistUrl(url)) {
              journalistUrls.add(url);
            }
          });

          logger.info(`Found ${journalistUrls.size} journalist URLs from ${sitemapPath}`);
        } catch (error) {
          logger.debug(`Could not fetch sitemap ${sitemapPath}`);
        }
      }

      // Scrape discovered URLs
      const scrapeTasks = Array.from(journalistUrls)
        .slice(0, targetCount * 2)
        .map(url => this.queue.add(() => this.scrapeJournalistProfile(url, website)));

      await Promise.allSettled(scrapeTasks);

    } catch (error) {
      logger.error('Error with sitemap method:', error);
    }
  }

  extractAuthorFromArticle($) {
    const authorSelectors = [
      // Standard selectors
      '.author-name', '.byline', '[rel="author"]',
      '.article-author', 'span.author', 'a.author',
      '[itemprop="author"]', '.posted-by',
      
      // Times of India specific
      '.byline a', '.auth_details a', '.authors a',
      
      // NDTV specific
      '.pst-by_lnk', '.pst-by', '.author-link',
      '.posted-by a', '.postedby',
      
      // Aajtak specific
      '.article-author-name', '.by-name', '.correspondent',
      '.story-by', '.author-info',
      
      // CNN specific
      '.metadata__byline__author', '.byline__name',
      '.Article__subtitle',
      
      // BBC specific
      '.ssrcss-68pt20-Text-TextContributorName',
      '.gel-long-primer-bold', 'strong.author',
      
      // Generic fallbacks
      'meta[name="author"]', 'meta[property="article:author"]',
      '.writer', '.journalist-name', '.reporter-name',
      '[class*="author"]', '[class*="byline"]'
    ];

    for (const selector of authorSelectors) {
      try {
        // Try attribute first for meta tags
        const metaContent = $(selector).attr('content');
        if (metaContent) {
          const cleaned = this.cleanText(metaContent);
          if (this.isValidAuthorName(cleaned)) {
            return cleaned;
          }
        }
        
        // Try text content
        const author = $(selector).first().text();
        if (author) {
          const cleaned = this.cleanText(author)
            .replace(/^by\s+/i, '')
            .replace(/^written by\s+/i, '')
            .replace(/^posted by\s+/i, '')
            .replace(/^author:\s*/i, '')
            .replace(/\s*,\s*.*$/, '')
            .replace(/\s*\|.*$/, '')
            .trim();
          
          if (this.isValidAuthorName(cleaned)) {
            return cleaned;
          }
        }
      } catch (e) {
        continue;
      }
    }

    return null;
  }

  isValidAuthorName(name) {
    if (!name || name.length < 3 || name.length > 100) return false;
    
    // Must have at least one space (first and last name)
    if (!name.includes(' ')) return false;
    
    // Should not start with numbers
    if (/^\d/.test(name)) return false;
    
    // Should not contain common non-name indicators
    const badWords = [
      'updated', 'published', 'posted', 'ago', 'min', 'hours', 'days',
      'share', 'follow', 'subscribe', 'http', 'www', 'read more'
    ];
    
    const nameLower = name.toLowerCase();
    if (badWords.some(word => nameLower.includes(word))) return false;
    
    // Should have reasonable character composition
    const alphaCount = (name.match(/[a-zA-Z]/g) || []).length;
    if (alphaCount < name.length * 0.7) return false;
    
    return true;
  }
}

export default JournalistScraper;