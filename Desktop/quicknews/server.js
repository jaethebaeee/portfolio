const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const fs = require('fs').promises;
const twilio = require('twilio');
require('dotenv').config();

const { NEWS_FEEDS, fetchCategory, fetchAllNews } = require('./services/newsApi');

// Twilio setup
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve styles.css: prefer local copy under public; fallback to parent repo's styles.css when present
// Static middleware serves /styles.css directly from public

// API docs
app.get('/api', (req, res) => {
  res.json({
    message: 'QuickScores API',
    version: '1.0.0',
    caching: '5 minutes per category',
    categories: Object.keys(NEWS_FEEDS),
    endpoints: {
      'GET /api/news': 'All categories',
      'GET /api/news/:category': 'One category',
      'GET /api/news/categories': 'List categories'
    }
  });
});

app.get('/api/news/categories', (req, res) => {
  res.json({ categories: Object.keys(NEWS_FEEDS) });
});

app.get('/api/news', async (req, res) => {
  try {
    const all = await fetchAllNewsWithNotifications();
    res.json(all);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch news', message: e.message });
  }
});

app.get('/api/news/:category', async (req, res) => {
  const { category } = req.params;
  if (!NEWS_FEEDS[category]) {
    return res.status(400).json({ error: 'Unknown category', categories: Object.keys(NEWS_FEEDS) });
  }
  try {
    const items = await fetchCategoryWithNotifications(category);
    res.json({ category, items });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch category', message: e.message });
  }
});

// Subscription endpoints
const SUBSCRIPTIONS_FILE = path.join(__dirname, 'subscriptions.json');

// Helper function to read subscriptions
async function readSubscriptions() {
  try {
    const data = await fs.readFile(SUBSCRIPTIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty object
    return {};
  }
}

// Helper function to write subscriptions
async function writeSubscriptions(subscriptions) {
  await fs.writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));
}

// SMS notification function
async function sendSMSNotification(phoneNumber, message) {
  try {
    if (!twilioClient || !twilioPhoneNumber) {
      console.warn('Twilio not configured, skipping SMS notification');
      return;
    }

    await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: `+1${phoneNumber}`
    });

    console.log(`SMS sent to ${phoneNumber}`);
  } catch (error) {
    console.error('Failed to send SMS:', error);
  }
}

// Store last seen article IDs for each category
const lastSeenArticles = new Map();

// Function to send news updates to subscribers
async function sendNewsUpdates(category, newArticles) {
  try {
    const subscriptions = await readSubscriptions();

    // Get subscribers for this category
    const categorySubscribers = Object.values(subscriptions)
      .filter(sub => sub.categories.includes(category));

    if (categorySubscribers.length === 0) {
      return;
    }

    // Get previously seen article IDs
    const lastSeen = lastSeenArticles.get(category) || new Set();

    // Find truly new articles (not seen before)
    const trulyNewArticles = newArticles.filter(article =>
      !lastSeen.has(article.id || article.title)
    );

    if (trulyNewArticles.length === 0) {
      return;
    }

    // Update last seen articles (keep only recent ones)
    const newArticleIds = new Set(trulyNewArticles.map(article => article.id || article.title));
    lastSeenArticles.set(category, new Set([...lastSeen, ...newArticleIds]));

    // Send notification for new articles (limit to 2 to avoid spam)
    const articlesToNotify = trulyNewArticles.slice(0, 2);

    for (const article of articlesToNotify) {
      const message = `QuickScores ${category.toUpperCase()}: ${article.title.substring(0, 80)}${article.title.length > 80 ? '...' : ''}`;

      for (const subscriber of categorySubscribers) {
        await sendSMSNotification(subscriber.phoneNumber, message);
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log(`Sent ${articlesToNotify.length} news updates to ${categorySubscribers.length} subscribers for ${category}`);

  } catch (error) {
    console.error('Failed to send news updates:', error);
  }
}

// Modified fetchCategory that triggers notifications
async function fetchCategoryWithNotifications(category) {
  const { fetchCategory } = require('./services/newsApi');

  try {
    const articles = await fetchCategory(category);

    // Send notifications for new articles
    if (articles && articles.length > 0) {
      await sendNewsUpdates(category, articles);
    }

    return articles;
  } catch (error) {
    console.error(`Error fetching category ${category}:`, error);
    return [];
  }
}

// Modified fetchAllNews that triggers notifications
async function fetchAllNewsWithNotifications() {
  const { fetchAllNews } = require('./services/newsApi');

  try {
    const allNews = await fetchAllNews();

    // Send notifications for each category
    for (const [category, articles] of Object.entries(allNews)) {
      if (articles && articles.length > 0) {
        await sendNewsUpdates(category, articles);
      }
    }

    return allNews;
  } catch (error) {
    console.error('Error fetching all news:', error);
    return {};
  }
}

// POST /api/subscribe - Subscribe to notifications
app.post('/api/subscribe', async (req, res) => {
  try {
    const { phoneNumber, categories } = req.body;

    // Validate input
    if (!phoneNumber || !categories || !Array.isArray(categories)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Phone number and categories are required'
      });
    }

    // Basic phone number validation (US format)
    const phoneRegex = /^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      return res.status(400).json({
        error: 'Invalid phone number',
        message: 'Please enter a valid phone number'
      });
    }

    // Validate categories
    const validCategories = Object.keys(NEWS_FEEDS);
    const invalidCategories = categories.filter(cat => !validCategories.includes(cat));
    if (invalidCategories.length > 0) {
      return res.status(400).json({
        error: 'Invalid categories',
        message: `Invalid categories: ${invalidCategories.join(', ')}`
      });
    }

    // Read existing subscriptions
    const subscriptions = await readSubscriptions();

    // Clean phone number for storage
    const cleanPhone = phoneNumber.replace(/\D/g, '').replace(/^1/, '');

    // Store subscription
    subscriptions[cleanPhone] = {
      phoneNumber: cleanPhone,
      categories,
      subscribedAt: new Date().toISOString()
    };

    // Write back to file
    await writeSubscriptions(subscriptions);

    res.json({
      success: true,
      message: 'Successfully subscribed to notifications!',
      categories: categories
    });

  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process subscription'
    });
  }
});

// GET /api/subscriptions - Get all subscriptions (for debugging)
app.get('/api/subscriptions', async (req, res) => {
  try {
    const subscriptions = await readSubscriptions();
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read subscriptions' });
  }
});

// Fallback to index.html
// Basic health check for uptime monitors
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`📰 QuickScores listening on http://localhost:${PORT}`);
});
