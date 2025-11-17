const fetch = require('node-fetch');

// Simple in-memory cache for QuickScores (scoped to this service only)
const cache = new Map();
function cacheGet(key) {
  const ent = cache.get(key);
  if (!ent) return null;
  const { value, expiry } = ent;
  if (Date.now() > expiry) { cache.delete(key); return null; }
  return value;
}
function cacheSet(key, value, ttlMs) {
  cache.set(key, { value, expiry: Date.now() + ttlMs });
}

const NEWS_FEEDS = {
  top: 'https://feeds.npr.org/1001/rss.xml',
  world: 'https://feeds.npr.org/1004/rss.xml',
  business: 'https://feeds.npr.org/1006/rss.xml',
  technology: 'https://feeds.npr.org/1019/rss.xml',
  science: 'https://feeds.npr.org/1007/rss.xml',
  health: 'https://feeds.npr.org/1128/rss.xml',
  politics: 'https://feeds.npr.org/1014/rss.xml',
  us: 'https://feeds.npr.org/1003/rss.xml',
  culture: 'https://feeds.npr.org/1008/rss.xml'
};

const CACHE_TTL_NEWS = 5 * 60 * 1000; // 5 minutes

function toETISO(dateLike) {
  try {
    const d = new Date(dateLike);
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(d);
    const year = parts.find(p => p.type === 'year').value;
    const month = parts.find(p => p.type === 'month').value;
    const day = parts.find(p => p.type === 'day').value;
    return `${year}-${month}-${day}`;
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function toETTime(dateLike) {
  try {
    const d = new Date(dateLike);
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      minute: '2-digit'
    }).format(d).replace(' AM', ' AM').replace(' PM', ' PM');
  } catch {
    return '';
  }
}

async function fetchTextWithRetry(url, { timeout = 8000, retries = 1 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { timeout });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        const backoff = 300 * (attempt + 1);
        await new Promise(r => setTimeout(r, backoff));
        continue;
      }
    }
  }
  throw lastErr;
}

function parseRSS(xml) {
  if (!xml || typeof xml !== 'string') return [];
  const items = [];
  const segments = xml.split(/<item\b/i).slice(1);
  for (const seg of segments) {
    const itemXML = '<item' + seg;
    const title = (itemXML.match(/<title><!\[CDATA\[(.*?)]]><\/title>|<title>(.*?)<\/title>/i) || [])[1] || (itemXML.match(/<title>(.*?)<\/title>/i) || [])[1] || '';
    const link = (itemXML.match(/<link>(.*?)<\/link>/i) || [])[1] || '';
    const pubDate = (itemXML.match(/<pubDate>(.*?)<\/pubDate>/i) || [])[1] || '';
    const description = (itemXML.match(/<description><!\[CDATA\[(.*?)]]><\/description>|<description>(.*?)<\/description>/i) || [])[1] || '';
    const clean = (s) => (s || '')
      .replace(/<!\[CDATA\[|]]>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
    items.push({
      title: clean(title),
      link: clean(link),
      publishedAt: pubDate ? new Date(pubDate).toISOString() : null,
      summary: clean(description)
    });
  }
  return items;
}

function normalizeArticles(items, category, source = 'NPR') {
  return (items || []).map(a => {
    const date = a.publishedAt ? toETISO(a.publishedAt) : toETISO(Date.now());
    const time = a.publishedAt ? toETTime(a.publishedAt) : '';
    return {
      id: `${category}:${a.link || a.title}`,
      category,
      source,
      title: (a.title || '').trim(),
      summary: (a.summary || '').trim(),
      link: a.link || '',
      date,
      time
    };
  });
}

async function fetchCategory(category) {
  const key = `news:${category}`;
  const cached = cacheGet(key);
  if (cached) return cached;
  const url = NEWS_FEEDS[category];
  if (!url) throw new Error(`Unknown news category: ${category}`);
  try {
    const xml = await fetchTextWithRetry(url, { timeout: 8000, retries: 1 });
    const items = parseRSS(xml);
    const normalized = normalizeArticles(items, category);
    cacheSet(key, normalized, CACHE_TTL_NEWS);
    return normalized;
  } catch (e) {
    console.error(`❌ Error fetching news for ${category}:`, e.message);
    return [];
  }
}

async function fetchAllNews() {
  const results = {};
  const cats = Object.keys(NEWS_FEEDS);
  await Promise.all(cats.map(async c => {
    try {
      results[c] = await fetchCategory(c);
    } catch {
      results[c] = [];
    }
  }));
  return results;
}

module.exports = {
  NEWS_FEEDS,
  fetchCategory,
  fetchAllNews
};

