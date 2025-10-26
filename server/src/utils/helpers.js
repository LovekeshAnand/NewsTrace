/**
 * Utility helper functions
 */

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const deduplicateArray = (array, key) => {
  const seen = new Set();
  return array.filter(item => {
    const value = key ? item[key] : item;
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

const sanitizeString = (str) => {
  if (!str) return '';
  return str
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
};

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const randomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = typeof key === 'function' ? key(item) : item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
};

const sortByKey = (array, key, descending = false) => {
  return array.sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key];
    const bVal = typeof key === 'function' ? key(b) : b[key];
    
    if (aVal < bVal) return descending ? 1 : -1;
    if (aVal > bVal) return descending ? -1 : 1;
    return 0;
  });
};

const retry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await sleep(delay * Math.pow(2, i));
      }
    }
  }
  
  throw lastError;
};

const parseQueryParams = (query) => {
  const params = {};
  
  if (query.limit) params.limit = parseInt(query.limit);
  if (query.offset) params.offset = parseInt(query.offset);
  if (query.page) params.page = parseInt(query.page);
  if (query.sortBy) params.sortBy = query.sortBy;
  if (query.order) params.order = query.order;
  if (query.search) params.search = query.search;
  
  return params;
};

export default {
  sleep,
  chunk,
  deduplicateArray,
  sanitizeString,
  isValidUrl,
  isValidEmail,
  extractDomain,
  formatBytes,
  calculatePercentage,
  generateSlug,
  truncateText,
  randomElement,
  groupBy,
  sortByKey,
  retry,
  parseQueryParams
};