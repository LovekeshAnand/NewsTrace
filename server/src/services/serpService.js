import axios from 'axios';
import { serp } from '../config/index.js';
import { logger } from '../config/logger.js';

class SerpService {
  constructor() {
    this.apiKey = serp.apiKey;
    this.baseUrl = serp.baseUrl;
  }

  async findOutletWebsite(outletName) {
    try {
      const { data } = await axios.get(this.baseUrl, {
        params: { api_key: this.apiKey, q: `${outletName} official website news`, num: 5 }
      });

      if (data?.organic_results) {
        const match = data.organic_results.find(r => {
          const url = r.link.toLowerCase();
          const title = r.title.toLowerCase();
          const name = outletName.toLowerCase();
          return url.includes(name.replace(/\s+/g, '')) || title.includes(name) || this.looksLikeNews(url);
        });

        if (match) {
          const u = new URL(match.link);
          return { website: match.link, domain: u.hostname, title: match.title, description: match.snippet };
        }
      }
      throw new Error('Could not find official website');
    } catch (err) {
      logger.error('SERP lookup failed:', err.message);
      throw new Error(`Failed to find website for ${outletName}: ${err.message}`);
    }
  }

  looksLikeNews(url) {
    return ['news', 'times', 'post', 'journal', 'daily', 'tribune', 'herald', 'press']
      .some(w => url.includes(w));
  }

  async searchJournalistPages(domain) {
    const queries = ['authors', 'journalists', 'writers', 'contributors', 'staff']
      .map(q => `site:${domain} ${q}`);

    const results = [];
    for (const q of queries) {
      try {
        const { data } = await axios.get(this.baseUrl, {
          params: { api_key: this.apiKey, q, num: 10 }
        });
        if (data?.organic_results) results.push(...data.organic_results);
      } catch { /* skip failed queries */ }
    }
    return [...new Set(results.map(r => r.link))];
  }
  async searchTopic(query) {
    try {
      const { data } = await axios.get(this.baseUrl, {
        params: { api_key: this.apiKey, q: query, num: 8, tbm: 'nws' }
      });
      if (data?.news_results) {
        return data.news_results.map(r => ({
          title: r.title,
          link: r.link,
          snippet: r.snippet,
          source: r.source,
          date: r.date
        }));
      }
      return [];
    } catch (err) {
      logger.error('SERP topic search failed:', err.message);
      return [];
    }
  }
}

export default new SerpService();