// QuickScores: minimal client to render RSS-backed news using the same look

(function(){
  const API = (path) => path;

  // Cross-browser timeout helper for fetch signals
  function getTimeoutSignal(ms) {
    try {
      if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
        return AbortSignal.timeout(ms);
      }
    } catch {}
    if (typeof AbortController !== 'undefined') {
      const controller = new AbortController();
      setTimeout(() => {
        try { controller.abort(); } catch {}
      }, ms);
      return controller.signal;
    }
    return undefined;
  }

  const DEFAULT_CATEGORIES = ['top','world','business','technology','us','politics','science','health','culture'];
  const BOX_WIDTH = 24; // internal width inside the ASCII box
  const TITLE_LINES = 3; // number of title lines inside the box
  let CATEGORIES = DEFAULT_CATEGORIES.slice();

  function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      body.classList.remove('light-mode');
      body.classList.add('dark-mode');
    }
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-mode')) {
          body.classList.remove('light-mode');
          body.classList.add('dark-mode');
          localStorage.setItem('theme', 'dark');
        } else {
          body.classList.remove('dark-mode');
          body.classList.add('light-mode');
          localStorage.setItem('theme', 'light');
        }
      });
    }
  }

  function initSubscriptionModal() {
    const subscriptionToggle = document.getElementById('subscription-toggle');
    const modal = document.getElementById('subscription-modal');
    const modalClose = document.querySelector('.modal-close');
    const subscriptionForm = document.getElementById('subscription-form');
    const statusMessage = document.getElementById('subscription-status');

    // Open modal
    if (subscriptionToggle) {
      subscriptionToggle.addEventListener('click', () => {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
      });
    }

    // Close modal
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });

    // Handle form submission
    if (subscriptionForm) {
      subscriptionForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const phoneInput = document.getElementById('phone-number');
        const phoneNumber = phoneInput.value.replace(/\D/g, ''); // Remove non-digits
        const selectedCategories = Array.from(document.querySelectorAll('.category-option input:checked')).map(cb => cb.value);

        // Validate phone number
        if (phoneNumber.length !== 10) {
          showStatus('Please enter a valid 10-digit phone number', 'error');
          return;
        }

        if (selectedCategories.length === 0) {
          showStatus('Please select at least one category', 'error');
          return;
        }

        // Show loading
        showStatus('Subscribing...', 'loading');

        try {
          const response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phoneNumber: phoneNumber,
              categories: selectedCategories
            })
          });

          const result = await response.json();

          if (response.ok) {
            showStatus('Successfully subscribed! You will receive notifications for selected categories.', 'success');
            setTimeout(() => {
              modal.style.display = 'none';
              document.body.style.overflow = 'auto';
              subscriptionForm.reset();
            }, 3000);
          } else {
            showStatus(result.error || 'Subscription failed. Please try again.', 'error');
          }
        } catch (error) {
          showStatus('Network error. Please check your connection and try again.', 'error');
        }
      });
    }

    function showStatus(message, type) {
      statusMessage.textContent = message;
      statusMessage.className = `status-message ${type}`;

      if (type !== 'loading') {
        setTimeout(() => {
          statusMessage.className = 'status-message';
        }, 5000);
      }
    }

    // Format phone number input
    const phoneInput = document.getElementById('phone-number');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 6) {
          value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6,10)}`;
        } else if (value.length >= 3) {
          value = `(${value.slice(0,3)}) ${value.slice(3)}`;
        } else if (value.length > 0) {
          value = `(${value}`;
        }
        e.target.value = value;
      });
    }
  }

  function formatETNow() {
    const et = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const hours = et.getHours();
    const minutes = String(et.getMinutes()).padStart(2, '0');
    const seconds = String(et.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hh = hours % 12 || 12;
    return `${hh}:${minutes}:${seconds} ${ampm} ET`;
  }

  function updateDataLoadTime() {
    const el = document.getElementById('data-load-time');
    if (el) el.textContent = formatETNow();
  }

  function cap(s){ return (s||'').charAt(0).toUpperCase() + (s||'').slice(1); }

  function conciseDate(dateStr) {
    if (!dateStr) return '';
    // Expecting YYYY-MM-DD; fall back to Date parsing
    const m = /^\s*(\d{4})-(\d{2})-(\d{2})\s*$/.exec(dateStr);
    if (m) {
      const mm = String(parseInt(m[2], 10));
      const dd = String(parseInt(m[3], 10));
      return `${mm}/${dd}`;
    }
    try {
      const d = new Date(dateStr);
      if (!isNaN(d)) {
        return `${d.getMonth()+1}/${d.getDate()}`;
      }
    } catch {}
    return '';
  }

  function wrapTitle(title, maxLines = TITLE_LINES, width = BOX_WIDTH - 1) {
    const words = (title || '').split(/\s+/);
    const lines = [];
    let curr = '';
    let usedAll = true;
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const next = curr ? (curr + ' ' + w) : w;
      if (next.length <= width) {
        curr = next;
      } else {
        if (curr) lines.push(curr);
        else lines.push(w.slice(0, width));
        curr = '';
        if (lines.length >= maxLines) { usedAll = false; break; }
      }
      if (lines.length >= maxLines) { usedAll = false; break; }
      if (i === words.length - 1 && curr) lines.push(curr);
    }
    while (lines.length < maxLines) lines.push('');
    if (!usedAll && maxLines > 0) {
      const last = lines[maxLines - 1] || '';
      const trimmed = last.slice(0, Math.max(0, width - 1)).trimEnd();
      lines[maxLines - 1] = (trimmed + '…').slice(0, width);
    }
    return lines.map(l => l.slice(0, width));
  }

  function createArticleBox(article) {
    const box = document.createElement('div');
    box.className = 'game-box';
    const cat = (article.category || 'News').toUpperCase();
    const titleLines = wrapTitle(article.title || '', TITLE_LINES, BOX_WIDTH - 1);
    const bottomInfo = [article.time || '', conciseDate(article.date)].filter(Boolean).join(' • ');
    const top = '+' + '-'.repeat(BOX_WIDTH) + '+';
    const header = ('  ' + cat).slice(0, BOX_WIDTH).padEnd(BOX_WIDTH);
    const line1 = ' ' + (titleLines[0] || '').padEnd(BOX_WIDTH - 1);
    const line2 = ' ' + (titleLines[1] || '').padEnd(BOX_WIDTH - 1);
    const line3 = ' ' + (titleLines[2] || '').padEnd(BOX_WIDTH - 1);
    const time = (bottomInfo || ' ').slice(0, BOX_WIDTH).padEnd(BOX_WIDTH);
    const ascii = [
      top,
      `|${header}|`,
      `|${line1}|`,
      `|${line2}|`,
      `|${line3}|`,
      `|${time}|`,
      top
    ].join('\n');
    box.textContent = ascii;
    return box;
  }

  function renderCategory(category, items) {
    ensureCategorySection(category);
    const container = document.getElementById(`${category}-articles`);
    if (!container) return;
    container.innerHTML = '';
    if (!Array.isArray(items) || items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'no-games';
      empty.textContent = 'No articles available.';
      container.appendChild(empty);
      return;
    }
    items.slice(0, 30).forEach(a => {
      const wrapper = document.createElement('div');
      wrapper.className = 'game-item';
      const link = document.createElement('a');
      link.href = a.link || '#';
      link.target = '_blank';
      link.rel = 'noopener';
      if (a.title) link.title = a.title;
      const box = createArticleBox(a);
      link.appendChild(box);
      wrapper.appendChild(link);
      const meta = document.createElement('div');
      meta.className = 'game-meta';
      const lbl = [];
      if (a.time) lbl.push(a.time);
      const dshort = conciseDate(a.date);
      if (dshort) lbl.push(dshort);
      meta.textContent = lbl.join(' • ');
      wrapper.appendChild(meta);
      if (a.summary) {
        const summary = document.createElement('div');
        summary.className = 'article-summary';
        summary.textContent = truncateSummary(a.summary, 160);
        wrapper.appendChild(summary);
      }

       // Check if article is trending (high engagement)
       const articleId = getArticleId(a);
       const voteCounts = getVoteCounts(articleId);
       const hasVoted = hasUserVoted(articleId);
       const totalVotes = voteCounts.likes + voteCounts.dislikes;
       const isTrending = totalVotes >= 5 && (voteCounts.likes / Math.max(totalVotes, 1)) >= 0.6; // 60%+ positive

       // Add trending indicator
       if (isTrending) {
         wrapper.classList.add('trending-article');
       }

       // Add voting UI
       const votingContainer = document.createElement('div');
       votingContainer.className = 'article-voting';

       // Create vote buttons
       const likeBtn = document.createElement('button');
       likeBtn.className = `vote-btn like-btn ${hasVoted && getUserVotes()[articleId] === 'like' ? 'voted' : ''}`;
       likeBtn.innerHTML = `👍 ${voteCounts.likes}`;
       likeBtn.title = hasVoted ? 'You have already voted' : 'Like this article';

       const dislikeBtn = document.createElement('button');
       dislikeBtn.className = `vote-btn dislike-btn ${hasVoted && getUserVotes()[articleId] === 'dislike' ? 'voted' : ''}`;
       dislikeBtn.innerHTML = `👎 ${voteCounts.dislikes}`;
       dislikeBtn.title = hasVoted ? 'You have already voted' : 'Dislike this article';

      // Disable buttons if user has already voted
      if (hasVoted) {
        likeBtn.disabled = true;
        dislikeBtn.disabled = true;
      }

      votingContainer.appendChild(likeBtn);
      votingContainer.appendChild(dislikeBtn);

      // Add vote event handlers
      likeBtn.addEventListener('click', () => handleVote(articleId, 'like', votingContainer));
      dislikeBtn.addEventListener('click', () => handleVote(articleId, 'dislike', votingContainer));

      wrapper.appendChild(votingContainer);
      container.appendChild(wrapper);
    });
  }

  function truncateSummary(text, max = 160) {
    const s = (text || '').replace(/\s+/g, ' ').trim();
    if (s.length <= max) return s;
    return s.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
  }

  // Store previous news data for comparison
  let previousNewsData = {};

  // Vote storage and management
  function getArticleId(article) {
    return `${article.title || ''}_${article.date || ''}_${article.time || ''}`.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  function getVotes() {
    try {
      const votes = localStorage.getItem('article_votes');
      return votes ? JSON.parse(votes) : {};
    } catch {
      return {};
    }
  }

  function saveVotes(votes) {
    try {
      localStorage.setItem('article_votes', JSON.stringify(votes));
    } catch (e) {
      console.warn('Failed to save votes:', e);
    }
  }

  function getUserVotes() {
    try {
      const userVotes = localStorage.getItem('user_votes');
      return userVotes ? JSON.parse(userVotes) : {};
    } catch {
      return {};
    }
  }

  function saveUserVotes(userVotes) {
    try {
      localStorage.setItem('user_votes', JSON.stringify(userVotes));
    } catch (e) {
      console.warn('Failed to save user votes:', e);
    }
  }

  function hasUserVoted(articleId) {
    const userVotes = getUserVotes();
    return !!userVotes[articleId];
  }

  function getVoteCounts(articleId) {
    const votes = getVotes();
    const articleVotes = votes[articleId] || { likes: 0, dislikes: 0 };
    return articleVotes;
  }

  function handleVote(articleId, voteType, container) {
    if (hasUserVoted(articleId)) return; // Prevent multiple votes

    // Get current votes
    const votes = getVotes();
    const userVotes = getUserVotes();

    // Update vote counts
    if (!votes[articleId]) {
      votes[articleId] = { likes: 0, dislikes: 0 };
    }

    votes[articleId][voteType === 'like' ? 'likes' : 'dislikes']++;

    // Record user vote
    userVotes[articleId] = voteType;

    // Save to localStorage
    saveVotes(votes);
    saveUserVotes(userVotes);

    // Update UI immediately
    updateVotingUI(articleId, container);
  }

  function updateVotingUI(articleId, container) {
    const voteCounts = getVoteCounts(articleId);
    const userVotes = getUserVotes();
    const userVote = userVotes[articleId];
    const hasVoted = !!userVote;

    const likeBtn = container.querySelector('.like-btn');
    const dislikeBtn = container.querySelector('.dislike-btn');

    if (likeBtn && dislikeBtn) {
      // Update counts
      likeBtn.innerHTML = `👍 ${voteCounts.likes}`;
      dislikeBtn.innerHTML = `👎 ${voteCounts.dislikes}`;

      // Update classes
      likeBtn.className = `vote-btn like-btn ${hasVoted && userVote === 'like' ? 'voted' : ''}`;
      dislikeBtn.className = `vote-btn dislike-btn ${hasVoted && userVote === 'dislike' ? 'voted' : ''}`;

      // Disable buttons
      likeBtn.disabled = hasVoted;
      dislikeBtn.disabled = hasVoted;

      // Update tooltips
      likeBtn.title = hasVoted ? 'You have already voted' : 'Like this article';
      dislikeBtn.title = hasVoted ? 'You have already voted' : 'Dislike this article';
    }

    // Update global voting stats
    updateVotingStats();
  }

  function updateVotingStats() {
    const votes = getVotes();
    const userVotes = getUserVotes();

    let totalVotes = 0;
    let trendingCount = 0;

    // Calculate stats from all articles
    Object.keys(votes).forEach(articleId => {
      const voteCounts = votes[articleId];
      const articleTotal = voteCounts.likes + voteCounts.dislikes;
      totalVotes += articleTotal;

      // Check if trending (5+ votes, 60%+ positive)
      if (articleTotal >= 5 && (voteCounts.likes / articleTotal) >= 0.6) {
        trendingCount++;
      }
    });

    // Update display
    const totalVotesEl = document.getElementById('total-votes');
    const trendingCountEl = document.getElementById('trending-count');

    if (totalVotesEl) {
      totalVotesEl.textContent = `${totalVotes} vote${totalVotes !== 1 ? 's' : ''}`;
    }

    if (trendingCountEl) {
      trendingCountEl.textContent = `${trendingCount} trending`;
    }
  }

  function resetAllVotes() {
    try {
      localStorage.removeItem('article_votes');
      localStorage.removeItem('user_votes');

      // Re-render all articles to update UI
      CATEGORIES.forEach(cat => {
        const container = document.getElementById(`${cat}-articles`);
        if (container) {
          // Find the articles for this category from previous data
          const articles = previousNewsData[cat] || [];
          renderCategory(cat, articles);
        }
      });

      updateVotingStats();
      console.log('All votes have been reset');
    } catch (e) {
      console.warn('Failed to reset votes:', e);
    }
  }

  async function fetchAllNews() {
    try {
      const resp = await fetch(API('/api/news'), { signal: getTimeoutSignal(10000) });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();

      // Check for new content and send notifications
      checkForNewContent(data);

      CATEGORIES.forEach(cat => {
        renderCategory(cat, data[cat] || []);
      });
      updateDataLoadTime();
      updateVotingStats(); // Update voting stats after rendering

      // Update previous data
      previousNewsData = JSON.parse(JSON.stringify(data));
    } catch (e) {
      console.error('Failed to load news:', e);
      CATEGORIES.forEach(cat => {
        const container = document.getElementById(`${cat}-articles`);
        if (container) container.innerHTML = '<div class="error-state">Could not load news.</div>';
      });
    }
  }

  async function checkForNewContent(newData) {
    // Get subscriptions
    try {
      const resp = await fetch(API('/api/subscriptions'));
      if (!resp.ok) return;
      const subscriptions = await resp.json();

      // Check each category for new content
      const newContentByCategory = {};

      CATEGORIES.forEach(category => {
        const newArticles = newData[category] || [];
        const oldArticles = previousNewsData[category] || [];

        // Find new articles (compare by title since we don't have IDs)
        const oldTitles = new Set(oldArticles.map(a => a.title));
        const trulyNewArticles = newArticles.filter(a => !oldTitles.has(a.title));

        if (trulyNewArticles.length > 0) {
          newContentByCategory[category] = trulyNewArticles;
        }
      });

      // Send notifications to subscribers
      Object.values(subscriptions).forEach(sub => {
        const relevantCategories = sub.categories.filter(cat =>
          newContentByCategory[cat] && newContentByCategory[cat].length > 0
        );

        if (relevantCategories.length > 0) {
          sendNotification(sub, relevantCategories, newContentByCategory);
        }
      });

    } catch (error) {
      console.warn('Failed to check subscriptions for notifications:', error);
    }
  }

  function sendNotification(subscription, categories, newContentByCategory) {
    const totalNewArticles = categories.reduce((sum, cat) =>
      sum + (newContentByCategory[cat]?.length || 0), 0
    );

    // For demo purposes, log to console and show browser notification
    console.log(`🔔 NOTIFICATION: New content available for subscriber ${subscription.phoneNumber}`);
    console.log(`Categories: ${categories.join(', ')}`);
    console.log(`New articles: ${totalNewArticles}`);
    console.log('---');

    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('QuickScores Update', {
        body: `New articles in: ${categories.join(', ')} (${totalNewArticles} new)`,
        icon: '/favicon.ico'
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }

    // In a real app, you would send SMS here using a service like Twilio
    // Example: sendSMS(subscription.phoneNumber, message);
  }

  async function fetchCategories() {
    try {
      const resp = await fetch(API('/api/news/categories'), { signal: getTimeoutSignal(8000) });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const body = await resp.json();
      if (Array.isArray(body.categories) && body.categories.length) {
        CATEGORIES = body.categories;
        CATEGORIES.forEach(ensureCategorySection);
        updateNav(CATEGORIES);
      }
    } catch (e) {
      console.warn('Using default categories (failed to load from API):', e);
      CATEGORIES = DEFAULT_CATEGORIES.slice();
      CATEGORIES.forEach(ensureCategorySection);
      updateNav(CATEGORIES);
    }
  }

  function updateNav(categories) {
    try {
      const navRow = document.querySelector('.leagues-nav-compact .nav-row');
      if (!navRow) return;
      const start = '<strong>Sections:</strong>';
      const links = categories.map(c => `<a href="#${c}">${cap(c)}</a>`).join('');
      navRow.innerHTML = `${start} ${links}`;
    } catch {}
  }

  function ensureCategorySection(category) {
    try {
      const containerId = `${category}-articles`;
      if (document.getElementById(containerId)) return;
      const main = document.querySelector('main.container');
      if (!main) return;
      const section = document.createElement('section');
      section.id = category;
      section.className = 'league-section';
      const h2 = document.createElement('h2');
      h2.textContent = cap(category);
      const div = document.createElement('div');
      div.className = 'games-container';
      div.id = containerId;
      section.appendChild(h2);
      section.appendChild(div);
      main.appendChild(section);
    } catch {}
  }

  function initSmoothScroll() {
    document.addEventListener('click', function(e) {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      try {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch {
        target.scrollIntoView();
      }
    });
  }

  function initDateNav() {
    const currentDateEl = document.getElementById('current-date');
    const dateStatusEl = document.querySelector('.date-status');

    if (!currentDateEl) return;

    function formatDate(date) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayName = days[date.getDay()];
      const month = months[date.getMonth()];
      const day = date.getDate();
      return `${dayName}, ${month} ${day}`;
    }

    function updateDateDisplay() {
      const today = new Date();
      currentDateEl.textContent = formatDate(today);
      
      if (dateStatusEl) {
        dateStatusEl.textContent = 'Showing latest news';
        dateStatusEl.className = 'date-status';
      }
    }

    updateDateDisplay();
  }

  function initSubscriptionModal() {
    const modal = document.getElementById('subscription-modal');
    const btn = document.getElementById('subscription-toggle');
    const closeBtn = document.querySelector('.modal-close');
    const form = document.getElementById('subscription-form');
    const statusEl = document.getElementById('subscription-status');

    if (!modal || !btn) return;

    // Open modal
    btn.addEventListener('click', () => {
      modal.classList.add('show');
      statusEl.textContent = '';
      statusEl.className = 'status-message';
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const phoneNumber = document.getElementById('phone-number').value.trim();
      const selectedCategories = Array.from(document.querySelectorAll('input[name="categories"]:checked'))
        .map(checkbox => checkbox.value);

      if (!phoneNumber) {
        showStatus('Please enter your phone number', 'error');
        return;
      }

      if (selectedCategories.length === 0) {
        showStatus('Please select at least one category', 'error');
        return;
      }

      try {
        const response = await fetch(API('/api/subscribe'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber,
            categories: selectedCategories
          })
        });

        const result = await response.json();

        if (response.ok) {
          showStatus(result.message, 'success');
          form.reset();
          // Close modal after 2 seconds
          setTimeout(() => {
            modal.classList.remove('show');
          }, 2000);
        } else {
          showStatus(result.message || 'Subscription failed', 'error');
        }
      } catch (error) {
        console.error('Subscription error:', error);
        showStatus('Network error. Please try again.', 'error');
      }
    });

    function showStatus(message, type) {
      statusEl.textContent = message;
      statusEl.className = `status-message ${type}`;
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    initThemeToggle();
    initSubscriptionModal();
    initSmoothScroll();
    initDateNav();

    // Request notification permission for demo notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    await fetchCategories();
    await fetchAllNews();
    updateVotingStats(); // Update voting stats after initial load
    setInterval(fetchAllNews, 5 * 60 * 1000);

    // Add reset votes functionality
    const resetBtn = document.getElementById('reset-votes');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all votes? This cannot be undone.')) {
          resetAllVotes();
        }
      });
    }
    // Set page load time
    try {
      const el = document.getElementById('page-load-time');
      if (el) el.textContent = formatETNow();
    } catch {}
  });
})();
