const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// --- Simple in-memory cache class ---
class APICache {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  set(key, data, ttl = 30000) {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new APICache();
const inflightRequests = new Map(); // Track ongoing fetches

// --- Fetch helper with caching + in-flight request protection ---
async function fetchWithCache(url, cacheKey, ttl = 30000) {
  // 1️⃣ Return cached result if valid
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('✅ Using cached data for:', cacheKey);
    return cached;
  }

  // 2️⃣ If the same request is already in-flight, reuse it
  if (inflightRequests.has(cacheKey)) {
    console.log('⏳ Awaiting existing request for:', cacheKey);
    return inflightRequests.get(cacheKey);
  }

  // 3️⃣ Otherwise, make a new network request
  console.log('🌐 Fetching fresh data for:', cacheKey);
  const fetchPromise = fetch(url)
    .then(async (response) => {
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      cache.set(cacheKey, data, ttl);
      return data;
    })
    .catch((err) => {
      console.error(`❌ Fetch failed for ${cacheKey}:`, err.message);
      throw err;
    })
    .finally(() => {
      inflightRequests.delete(cacheKey);
    });

  inflightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

// --- API wrapper functions ---
export const api = {
  // 📰 Outlets
  getOutlets: async () => {
    return fetchWithCache(`${API_BASE}/outlets`, 'outlets', 60000); // 1 min cache
  },

  getOutletById: async (id) => {
    return fetchWithCache(`${API_BASE}/outlets/${id}`, `outlet-${id}`, 30000);
  },

  getOutletStats: async (id) => {
    return fetchWithCache(`${API_BASE}/outlets/${id}/stats`, `outlet-stats-${id}`, 30000);
  },

  startScrape: async (name, targetCount) => {
    const response = await fetch(`${API_BASE}/outlets/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, targetCount }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    cache.clear(); // Clear all cached data after starting scrape
    return response.json();
  },

  // 🧑‍💼 Journalists
  getJournalists: async (limit = 50) => {
    return fetchWithCache(
      `${API_BASE}/journalists?limit=${limit}`,
      `journalists-${limit}`,
      60000
    );
  },

  searchJournalists: async (query) => {
    // Don't cache search (dynamic)
    const response = await fetch(
      `${API_BASE}/journalists/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  getJournalistById: async (id) => {
    return fetchWithCache(`${API_BASE}/journalists/${id}`, `journalist-${id}`, 30000);
  },

  getJournalistStats: async (id) => {
    return fetchWithCache(`${API_BASE}/journalists/${id}/stats`, `journalist-stats-${id}`, 30000);
  },

  // ⚙️ Scrape Jobs (frequent updates — use small but safe TTL)
  getScrapeJobs: async (limit = 20) => {
    return fetchWithCache(
      `${API_BASE}/scrape/jobs?limit=${limit}`,
      `scrape-jobs-${limit}`,
      15000 // Increased to 15s to prevent rate-limit
    );
  },

  getJobStatus: async (id) => {
    return fetchWithCache(
      `${API_BASE}/scrape/jobs/${id}`,
      `job-${id}`,
      5000 // Slightly longer than before
    );
  },

  getQueueStats: async () => {
    return fetchWithCache(`${API_BASE}/scrape/queue/stats`, 'queue-stats', 10000);
  },

  // 📊 Analytics
  getGlobalStats: async () => {
    return fetchWithCache(`${API_BASE}/analysis/global-stats`, 'globalStats', 120000); // 2 min cache
  },

  compareOutlets: async (outletIds) => {
    const response = await fetch(`${API_BASE}/analysis/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outletIds }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // 🧹 Manual cache control
  clearCache: () => {
    cache.clear();
    console.log('🗑️ API cache cleared manually');
  },
};
