import  get  from 'axios';
import { serp } from '../config/index.js';
import { logger as _error } from '../config/logger.js';

class SerpService {
  constructor() {
    this.apiKey = serp.apiKey;
    this.baseUrl = serp.baseUrl;
  }

  async findOutletWebsite(outletName) {
    try {
      const params = {
        api_key: this.apiKey,
        q: `${outletName} official website news`,
        num: 5
      };

      const response = await get(this.baseUrl, { params });
      
      if (response.data && response.data.organic_results) {
        const results = response.data.organic_results;
        
        // Filter for official looking domains
        const officialResult = results.find(result => {
          const url = result.link.toLowerCase();
          const title = result.title.toLowerCase();
          const outletLower = outletName.toLowerCase();
          
          return (
            url.includes(outletLower.replace(/\s+/g, '')) ||
            title.includes(outletLower) ||
            this.isNewsWebsite(url)
          );
        });

        if (officialResult) {
          const url = new URL(officialResult.link);
          return {
            website: officialResult.link,
            domain: url.hostname,
            title: officialResult.title,
            description: officialResult.snippet
          };
        }
      }

      throw new Error('Could not find official website');
    } catch (error) {
      _error('SERP API error:', error);
      throw new Error(`Failed to find website for ${outletName}: ${error.message}`);
    }
  }

  isNewsWebsite(url) {
    const newsIndicators = [
      '.com', '.news', '.in', '.org',
      'news', 'times', 'post', 'journal',
      'daily', 'tribune', 'herald', 'press'
    ];
    
    return newsIndicators.some(indicator => url.includes(indicator));
  }

  async searchJournalistPages(domain, outletName) {
    try {
      const queries = [
        `site:${domain} authors`,
        `site:${domain} journalists`,
        `site:${domain} writers`,
        `site:${domain} contributors`,
        `site:${domain} staff`
      ];

      const allResults = [];

      for (const query of queries) {
        const params = {
          api_key: this.apiKey,
          q: query,
          num: 10
        };

        const response = await get(this.baseUrl, { params });
        
        if (response.data && response.data.organic_results) {
          allResults.push(...response.data.organic_results);
        }
      }

      // Deduplicate and return unique URLs
      const uniqueUrls = [...new Set(allResults.map(r => r.link))];
      return uniqueUrls;
    } catch (error) {
      _error('Error searching journalist pages:', error);
      return [];
    }
  }
}

export default new SerpService();