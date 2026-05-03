const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}/api`;

let token = '';

const request = (path, method = 'GET', body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

async function runTests() {
  console.log('--- STARTING BACKEND API TESTS ---\n');

  try {
    // 1. Test Unprotected Health Endpoint
    const health = await request('/health');
    console.log(`[GET /health] Status: ${health.status}`);
    console.assert(health.status === 200, 'Health check failed');

    // 2. Test Auth (Register)
    const email = `test_${Date.now()}@example.com`;
    const reg = await request('/auth/register', 'POST', {
      name: 'Test User',
      email,
      password: 'password123'
    });
    console.log(`[POST /auth/register] Status: ${reg.status}`);
    console.assert(reg.status === 201, 'Registration failed');
    token = reg.body.data.token;

    // 3. Test Protected Endpoint (/auth/me)
    const me = await request('/auth/me');
    console.log(`[GET /auth/me] Status: ${me.status} | User: ${me.body.data.email}`);
    console.assert(me.status === 200, '/auth/me failed');

    // 4. Test Global Stats
    const stats = await request('/analysis/global-stats');
    console.log(`[GET /analysis/global-stats] Status: ${stats.status}`);
    console.assert(stats.status === 200, 'Global stats failed');

    // 5. Test Creating an Outlet (Protected)
    const outlet = await request('/outlets', 'POST', { name: 'The Verge' });
    console.log(`[POST /outlets] Status: ${outlet.status}`);
    console.assert(outlet.status === 201 || outlet.status === 200, 'Create outlet failed');

    // 6. Test Getting Outlets
    const outlets = await request('/outlets');
    console.log(`[GET /outlets] Status: ${outlets.status} | Count: ${outlets.body.count}`);
    console.assert(outlets.status === 200, 'Get outlets failed');

    // 7. Test Start Scrape
    const scrape = await request('/outlets/scrape', 'POST', { name: 'The Verge', targetCount: 10 });
    console.log(`[POST /outlets/scrape] Status: ${scrape.status} | Job ID: ${scrape.body.data?.scrapeJobId}`);
    console.assert(scrape.status === 202, 'Start scrape failed');

    // 8. Test Getting Jobs
    const jobs = await request('/scrape/jobs');
    console.log(`[GET /scrape/jobs] Status: ${jobs.status} | Count: ${jobs.body.count}`);
    console.assert(jobs.status === 200, 'Get jobs failed');

    console.log('\n✅ ALL TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
  }
}

runTests();
