import natural from 'natural';

const TfIdf = natural.TfIdf;
const WordTokenizer = natural.WordTokenizer;

import compromise from 'compromise';

class NLPAnalyzer {
  constructor() {
    this.TfIdf = TfIdf;
    this.tokenizer = new WordTokenizer();
    this.stopwords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
      'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ]);

    this.topicCategories = {
      politics: ['election', 'government', 'minister', 'parliament', 'congress', 'senate', 'vote', 'policy', 'law', 'bill', 'legislation'],
      business: ['economy', 'market', 'stock', 'company', 'business', 'trade', 'finance', 'investment', 'revenue', 'profit'],
      technology: ['tech', 'software', 'ai', 'digital', 'internet', 'app', 'smartphone', 'computer', 'data', 'cyber'],
      sports: ['cricket', 'football', 'match', 'player', 'team', 'score', 'championship', 'tournament', 'game', 'sport'],
      entertainment: ['film', 'movie', 'music', 'celebrity', 'actor', 'show', 'entertainment', 'bollywood', 'hollywood'],
      world: ['international', 'global', 'country', 'nation', 'foreign', 'world', 'diplomatic', 'treaty'],
      health: ['health', 'medical', 'hospital', 'doctor', 'disease', 'vaccine', 'patient', 'treatment', 'covid'],
      science: ['research', 'study', 'scientist', 'discovery', 'experiment', 'science', 'space', 'climate'],
      education: ['school', 'university', 'student', 'education', 'exam', 'college', 'learning', 'teacher'],
      crime: ['police', 'crime', 'arrest', 'court', 'judge', 'murder', 'theft', 'investigation', 'case']
    };
  }

  extractKeywords(text, limit = 10) {
    if (!text) return [];
    
    const doc = compromise(text);
    
    // Extract nouns and proper nouns
    const nouns = doc.nouns().out('array');
    const properNouns = doc.people().out('array')
      .concat(doc.places().out('array'))
      .concat(doc.organizations().out('array'));

    // Tokenize and filter
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    const filtered = tokens.filter(token => 
      token.length > 3 && 
      !this.stopwords.has(token) &&
      /^[a-z]+$/.test(token)
    );

    // Count frequencies
    const freq = {};
    filtered.forEach(word => {
      freq[word] = (freq[word] || 0) + 1;
    });

    // Combine and prioritize proper nouns
    const combined = [
      ...properNouns.map(n => ({ word: n, score: 10 })),
      ...nouns.slice(0, 20).map(n => ({ word: n, score: 5 })),
      ...Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([word, count]) => ({ word, score: count }))
    ];

    // Deduplicate and sort
    const unique = new Map();
    combined.forEach(({ word, score }) => {
      const key = word.toLowerCase();
      if (!unique.has(key) || unique.get(key) < score) {
        unique.set(key, score);
      }
    });

    return Array.from(unique.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word]) => word);
  }

  extractEntities(text) {
    if (!text) return { people: [], places: [], organizations: [] };
    
    const doc = compromise(text);
    
    return {
      people: doc.people().out('array'),
      places: doc.places().out('array'),
      organizations: doc.organizations().out('array')
    };
  }

  categorizeTopic(text) {
    if (!text) return 'general';
    
    const textLower = text.toLowerCase();
    const scores = {};

    Object.entries(this.topicCategories).forEach(([category, keywords]) => {
      scores[category] = keywords.reduce((score, keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = textLower.match(regex);
        return score + (matches ? matches.length : 0);
      }, 0);
    });

    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'general';

    return Object.entries(scores)
      .find(([_, score]) => score === maxScore)[0];
  }

  analyzeArticleBatch(articles) {
    const tfidf = new this.TfIdf();
    
    articles.forEach(article => {
      if (article.title) {
        tfidf.addDocument(article.title);
      }
    });

    const results = articles.map((article, index) => {
      const keywords = [];
      tfidf.listTerms(index).slice(0, 5).forEach(item => {
        keywords.push(item.term);
      });

      return {
        ...article,
        keywords: keywords.length > 0 ? keywords : this.extractKeywords(article.title, 5),
        entities: this.extractEntities(article.title),
        category: this.categorizeTopic(article.title)
      };
    });

    return results;
  }

  analyzeTrends(articles) {
    const trends = {
      topKeywords: {},
      topCategories: {},
      topEntities: { people: {}, places: {}, organizations: {} },
      timeDistribution: {}
    };

    articles.forEach(article => {
      // Keywords
      if (article.keywords) {
        article.keywords.forEach(keyword => {
          trends.topKeywords[keyword] = (trends.topKeywords[keyword] || 0) + 1;
        });
      }

      // Categories
      const category = this.categorizeTopic(article.title);
      trends.topCategories[category] = (trends.topCategories[category] || 0) + 1;

      // Entities
      const entities = this.extractEntities(article.title);
      entities.people.forEach(person => {
        trends.topEntities.people[person] = (trends.topEntities.people[person] || 0) + 1;
      });
      entities.places.forEach(place => {
        trends.topEntities.places[place] = (trends.topEntities.places[place] || 0) + 1;
      });
      entities.organizations.forEach(org => {
        trends.topEntities.organizations[org] = (trends.topEntities.organizations[org] || 0) + 1;
      });

      // Time distribution
      if (article.publishedDate) {
        const date = new Date(article.publishedDate);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        trends.timeDistribution[month] = (trends.timeDistribution[month] || 0) + 1;
      }
    });

    return {
      topKeywords: this.getTopN(trends.topKeywords, 20),
      topCategories: this.getTopN(trends.topCategories, 10),
      topPeople: this.getTopN(trends.topEntities.people, 10),
      topPlaces: this.getTopN(trends.topEntities.places, 10),
      topOrganizations: this.getTopN(trends.topEntities.organizations, 10),
      timeDistribution: trends.timeDistribution
    };
  }

  getTopN(obj, n) {
    return Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([key, value]) => ({ name: key, count: value }));
  }

  calculateSimilarity(text1, text2) {
    const tokens1 = new Set(this.tokenizer.tokenize(text1.toLowerCase()));
    const tokens2 = new Set(this.tokenizer.tokenize(text2.toLowerCase()));
    
    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);
    
    return intersection.size / union.size;
  }
}

const nlpAnalyzer = new NLPAnalyzer();
export default nlpAnalyzer;
export const analyzeArticleBatch = nlpAnalyzer.analyzeArticleBatch.bind(nlpAnalyzer);
