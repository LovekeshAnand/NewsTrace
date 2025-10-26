import NodeCache from 'node-cache';
import { cache } from '../config';

class CacheManager {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: cache.ttl,
      checkperiod: cache.checkPeriod
    });
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value, ttl = cache.ttl) {
    return this.cache.set(key, value, ttl);
  }

  del(key) {
    return this.cache.del(key);
  }

  flush() {
    return this.cache.flushAll();
  }

  getStats() {
    return this.cache.getStats();
  }

  has(key) {
    return this.cache.has(key);
  }

  keys() {
    return this.cache.keys();
  }
}

export default new CacheManager();