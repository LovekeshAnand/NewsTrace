
import BaseScraper from '../scrapers/baseScraper.js';
import nlpAnalyzer from '../analysis/nlpAnalyzer.js';
import JournalistScraper from '../scrapers/journalistScraper.js';
import { load } from 'cheerio';

async function runTests() {
  console.log('🚀 Starting Verification Tests...');

  const baseScraper = new BaseScraper();
  const journalistScraper = new JournalistScraper();

  // Test 1: looksLikeName
  console.log('\n--- Test 1: looksLikeName ---');
  const nameTests = [
    { name: 'John Doe', expected: true },
    { name: 'Suhasini Haidar', expected: true },
    { name: 'News Desk', expected: false },
    { name: 'Staff Reporter', expected: false },
    { name: 'John123', expected: false },
    { name: 'Associated Press', expected: false },
    { name: 'Reuters', expected: false },
    { name: 'John', expected: false } // No space
  ];

  nameTests.forEach(t => {
    const result = baseScraper.looksLikeName(t.name);
    console.log(`Name: "${t.name}" | Expected: ${t.expected} | Result: ${result} | ${result === t.expected ? '✅' : '❌'}`);
  });

  // Test 2: extractStructuredData
  console.log('\n--- Test 2: extractStructuredData ---');
  const html = `
    <html>
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "author": {
            "@type": "Person",
            "name": "Jane Smith"
          }
        }
      </script>
      <script type="application/ld+json">
        {
          "@graph": [
            {
              "@type": "Person",
              "name": "Bob Wilson"
            }
          ]
        }
      </script>
    </html>
  `;
  const $ = load(html);
  const authors = baseScraper.extractStructuredData($);
  console.log('Extracted Authors:', authors);
  const expectedAuthors = ['Jane Smith', 'Bob Wilson'];
  const authorsMatch = expectedAuthors.every(a => authors.includes(a));
  console.log(`Structured Data Test: ${authorsMatch ? '✅' : '❌'}`);

  // Test 3: categorizeTopic
  console.log('\n--- Test 3: categorizeTopic ---');
  const topicTests = [
    { text: 'New election results are in', expected: 'politics' },
    { text: 'Stock market crashes after trade war', expected: 'business' },
    { text: 'AI innovation in smartphone industry', expected: 'technology' },
    { text: 'Cricket match score update', expected: 'sports' },
    { text: 'New movie trailer released on Netflix', expected: 'entertainment' },
    { text: 'International summit on climate change', expected: 'science' }, // 'climate' is science
    { text: 'Police arrest suspect in murder case', expected: 'crime' },
    { text: 'University campus reopened for students', expected: 'education' }
  ];

  topicTests.forEach(t => {
    const result = nlpAnalyzer.categorizeTopic(t.text);
    console.log(`Text: "${t.text}" | Expected: ${t.expected} | Result: ${result} | ${result === t.expected ? '✅' : '❌'}`);
  });

  console.log('\n--- Verification Finished ---');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
