import natural from 'natural';
import compromise from 'compromise';

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
  'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
]);

const CATEGORIES = {
  politics: ['election', 'government', 'minister', 'parliament', 'congress', 'vote', 'policy', 'law', 'bill'],
  business: ['economy', 'market', 'stock', 'company', 'business', 'trade', 'finance', 'investment'],
  technology: ['tech', 'software', 'ai', 'digital', 'internet', 'app', 'computer', 'data', 'cyber'],
  sports: ['cricket', 'football', 'match', 'player', 'team', 'score', 'championship', 'tournament'],
  entertainment: ['film', 'movie', 'music', 'celebrity', 'actor', 'show', 'bollywood', 'hollywood'],
  world: ['international', 'global', 'country', 'nation', 'foreign', 'world', 'diplomatic'],
  health: ['health', 'medical', 'hospital', 'doctor', 'disease', 'vaccine', 'patient', 'treatment'],
  science: ['research', 'study', 'scientist', 'discovery', 'science', 'space', 'climate'],
  education: ['school', 'university', 'student', 'education', 'exam', 'college', 'teacher'],
  crime: ['police', 'crime', 'arrest', 'court', 'judge', 'murder', 'investigation']
};

class NLPAnalyzer {
  extractKeywords(text, limit = 10) {
    if (!text) return [];
    const doc = compromise(text);
    const proper = [...doc.people().out('array'), ...doc.places().out('array'), ...doc.organizations().out('array')];
    const tokens = tokenizer.tokenize(text.toLowerCase()).filter(t => t.length > 3 && !STOP.has(t) && /^[a-z]+$/.test(t));

    const freq = {};
    tokens.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

    const combined = new Map();
    proper.forEach(n => combined.set(n.toLowerCase(), 10));
    Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20)
      .forEach(([w, c]) => { if (!combined.has(w)) combined.set(w, c); });

    return [...combined.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([w]) => w);
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
    const lower = text.toLowerCase();
    let best = 'general', bestScore = 0;

    Object.entries(CATEGORIES).forEach(([cat, words]) => {
      const score = words.reduce((s, w) => {
        const m = lower.match(new RegExp(`\\b${w}\\b`, 'gi'));
        return s + (m ? m.length : 0);
      }, 0);
      if (score > bestScore) { bestScore = score; best = cat; }
    });
    return best;
  }

  analyzeArticleBatch(articles) {
    const tfidf = new TfIdf();
    articles.forEach(a => { if (a.title) tfidf.addDocument(a.title); });

    return articles.map((article, i) => {
      const kw = [];
      tfidf.listTerms(i).slice(0, 5).forEach(t => kw.push(t.term));
      return {
        ...article,
        keywords: kw.length > 0 ? kw : this.extractKeywords(article.title, 5),
        entities: this.extractEntities(article.title),
        category: this.categorizeTopic(article.title)
      };
    });
  }

  analyzeTrends(articles) {
    const kw = {}, cats = {}, entities = { people: {}, places: {}, organizations: {} }, timeDist = {};

    articles.forEach(a => {
      (a.keywords || []).forEach(k => { kw[k] = (kw[k] || 0) + 1; });
      const cat = this.categorizeTopic(a.title);
      cats[cat] = (cats[cat] || 0) + 1;

      const ent = this.extractEntities(a.title);
      ent.people.forEach(p => { entities.people[p] = (entities.people[p] || 0) + 1; });
      ent.places.forEach(p => { entities.places[p] = (entities.places[p] || 0) + 1; });
      ent.organizations.forEach(o => { entities.organizations[o] = (entities.organizations[o] || 0) + 1; });

      if (a.publishedDate) {
        const d = new Date(a.publishedDate);
        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        timeDist[m] = (timeDist[m] || 0) + 1;
      }
    });

    const topN = (obj, n) => Object.entries(obj).sort((a, b) => b[1] - a[1])
      .slice(0, n).map(([name, count]) => ({ name, count }));

    return {
      topKeywords: topN(kw, 20), topCategories: topN(cats, 10),
      topPeople: topN(entities.people, 10), topPlaces: topN(entities.places, 10),
      topOrganizations: topN(entities.organizations, 10), timeDistribution: timeDist
    };
  }
}

const nlpAnalyzer = new NLPAnalyzer();
export default nlpAnalyzer;
export const analyzeArticleBatch = nlpAnalyzer.analyzeArticleBatch.bind(nlpAnalyzer);
