export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

export const dedupe = (arr, key) => {
  const seen = new Set();
  return arr.filter(item => {
    const v = key ? item[key] : item;
    if (seen.has(v)) return false;
    seen.add(v);
    return true;
  });
};

export const sanitize = (str) => str ? str.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim() : '';

export const isValidUrl = (s) => { try { new URL(s); return true; } catch { return false; } };

export const extractDomain = (url) => { try { return new URL(url).hostname; } catch { return null; } };

export const truncate = (text, max = 100) => {
  if (!text || text.length <= max) return text;
  return text.substring(0, max) + '...';
};

export const retry = async (fn, attempts = 3, delay = 1000) => {
  let last;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); } catch (e) {
      last = e;
      if (i < attempts - 1) await sleep(delay * Math.pow(2, i));
    }
  }
  throw last;
};