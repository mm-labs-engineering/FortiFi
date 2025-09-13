# FortiFi Integration Example

## Quick Start (5 minutes)

### **Step 1: Install Packages**
```bash
# Backend
npm install @fortifi/core

# Frontend (or use CDN)
npm install @fortifi/client
# OR
<script src="https://unpkg.com/@fortifi/client@latest/dist/fortifi-client.js"></script>
```

### **Step 2: Backend Setup**

```javascript
// server.js
import express from 'express';
import { createFortiFi } from '@fortifi/core';

const app = express();

// Initialize FortiFi
const fortifi = createFortiFi({
  jwtSecret: 'your-secret-key-change-in-production',
  redis: { host: 'localhost', port: 6379 },
  rateLimit: { maxRequests: 100, windowMs: 60 },
  token: { ttl: 60, algorithm: 'HS256' },
  security: { enableCors: true, enableHelmet: true }
});

// Apply middleware
app.use(fortifi.security);
app.use('/api', fortifi.rateLimit);
app.use(express.json());

// Your content (this is what gets protected)
const articles = {
  'premium-article': {
    title: 'Premium Content',
    teaser: 'This is a teaser. You need a token to read the full content.',
    content: '<h2>Full Premium Content</h2><p>This is the actual premium content that requires authentication.</p>'
  }
};

// Public endpoint - returns teaser
app.get('/api/article/:id', (req, res) => {
  const article = articles[req.params.id];
  if (!article) return res.status(404).json({ error: 'Not found' });
  
  res.json({
    title: article.title,
    teaser: article.teaser,
    isPremium: true
  });
});

// Protected endpoint - requires token
app.get('/api/article/:id/content', fortifi.validateToken, (req, res) => {
  const article = articles[req.params.id];
  if (!article) return res.status(404).json({ error: 'Not found' });
  
  res.json({
    title: article.title,
    content: article.content
  });
});

// Token generation
app.post('/api/token', (req, res) => {
  const { userId, articleId } = req.body;
  const token = fortifi.generateToken(userId, articleId);
  res.json({ token, expiresAt: Date.now() + 60000 });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### **Step 3: Frontend Setup**

```html
<!DOCTYPE html>
<html>
<head>
  <title>FortiFi Demo</title>
  <script src="https://unpkg.com/@fortifi/client@latest/dist/fortifi-client.js"></script>
</head>
<body>
  <div id="article">
    <h1 id="article-title">Loading...</h1>
    <div id="article-teaser"></div>
    <div id="article-content" style="display: none;"></div>
    <button id="unlock-btn" style="display: none;">Unlock Article</button>
  </div>

  <script>
    // Initialize FortiFi
    FortiFi.init({
      apiUrl: 'http://localhost:3000/api',
      articleId: 'premium-article',
      userId: 'demo-user-123',
      contentSelector: '#article-content',
      teaserSelector: '#article-teaser'
    });

    // Load article
    async function loadArticle() {
      try {
        const response = await fetch('/api/article/premium-article');
        const article = await response.json();
        
        document.getElementById('article-title').textContent = article.title;
        document.getElementById('article-teaser').textContent = article.teaser;
        
        if (article.isPremium) {
          document.getElementById('unlock-btn').style.display = 'block';
        }
      } catch (error) {
        console.error('Error loading article:', error);
      }
    }

    // Unlock article
    document.getElementById('unlock-btn').onclick = async () => {
      try {
        await FortiFi.requestAccess();
        document.getElementById('unlock-btn').style.display = 'none';
        document.getElementById('article-content').style.display = 'block';
      } catch (error) {
        alert('Failed to unlock article: ' + error.message);
      }
    };

    // Start
    loadArticle();
  </script>
</body>
</html>
```

### **Step 4: Test It**

1. **Start your server**: `node server.js`
2. **Open your HTML file** in a browser
3. **Click "Unlock Article"** - should work!
4. **Check the network tab** - you'll see the token request

---

## What This Does

### **Backend Protection:**
- ✅ **Server-side validation** - Content never sent without valid token
- ✅ **Rate limiting** - Prevents abuse
- ✅ **Security headers** - CORS, Helmet protection
- ✅ **JWT tokens** - 60-second expiration

### **Frontend Experience:**
- ✅ **Seamless integration** - Just add script tag
- ✅ **Automatic token handling** - No manual token management
- ✅ **Error handling** - Graceful failure
- ✅ **Progressive enhancement** - Works without JavaScript

---

## Customization Options

### **Token Lifetime:**
```javascript
const fortifi = createFortiFi({
  // ... other config
  token: { ttl: 300 }, // 5 minutes instead of 60 seconds
});
```

### **Rate Limiting:**
```javascript
const fortifi = createFortiFi({
  // ... other config
  rateLimit: { 
    maxRequests: 50,    // 50 requests per window
    windowMs: 60,       // per minute
    blockDurationMs: 300 // block for 5 minutes
  },
});
```

### **Content Selectors:**
```javascript
FortiFi.init({
  // ... other config
  contentSelector: '#premium-content',
  teaserSelector: '#teaser-text',
  unlockButtonSelector: '#subscribe-btn'
});
```

---

## Production Checklist

### **Security:**
- [ ] Change JWT secret to strong random string
- [ ] Use HTTPS in production
- [ ] Configure CORS origins properly
- [ ] Set up Redis for rate limiting
- [ ] Monitor rate limit violations

### **Performance:**
- [ ] Use CDN for client library
- [ ] Cache article metadata
- [ ] Optimize token generation
- [ ] Monitor server performance

### **Monitoring:**
- [ ] Log token generation/validation
- [ ] Track rate limit hits
- [ ] Monitor error rates
- [ ] Set up alerts

---

## Next Steps

1. **Try the demo**: Visit http://localhost:3001
2. **Read the docs**: Check out the full documentation
3. **Join the community**: GitHub discussions
4. **Get support**: Contact us for help

**Your paywall protection is ready in minutes!** 🚀
