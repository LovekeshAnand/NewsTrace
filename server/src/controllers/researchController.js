import serpService from '../services/serpService.js';
import nlpAnalyzer from '../analysis/nlpAnalyzer.js'; // Actually let's use nlpAnalyzer directly

export const researchQuery = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, error: 'Query is required' });

    // Fetch news articles from SERP
    const articles = await serpService.searchTopic(query);
    
    // Synthesize a summary (Perplexity style)
    let summary = `We found ${articles.length} recent articles related to "${query}". `;
    if (articles.length > 0) {
      const sources = articles.map(a => a.source).filter(Boolean);
      const uniqueSources = [...new Set(sources)];
      summary += `Coverage spans across major outlets including ${uniqueSources.slice(0, 3).join(', ')}. `;
    }

    res.json({
      success: true,
      data: {
        query,
        summary,
        articles: articles.slice(0, 8)
      }
    });
  } catch (err) {
    next(err);
  }
};
