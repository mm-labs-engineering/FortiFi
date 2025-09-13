#!/usr/bin/env node

/**
 * Simple test script for FortiFi without Docker
 * This tests the core functionality without external dependencies
 */

const express = require('express');
const path = require('path');

// Mock Redis for testing
class MockRedis {
  constructor() {
    this.data = new Map();
  }
  
  async get(key) {
    return this.data.get(key) || null;
  }
  
  async set(key, value, ttlSeconds) {
    this.data.set(key, value);
    if (ttlSeconds) {
      setTimeout(() => this.data.delete(key), ttlSeconds * 1000);
    }
  }
  
  async del(key) {
    this.data.delete(key);
  }
  
  async exists(key) {
    return this.data.has(key) ? 1 : 0;
  }
  
  async incr(key) {
    const current = parseInt(this.data.get(key) || '0', 10);
    const newValue = current + 1;
    this.data.set(key, newValue.toString());
    return newValue;
  }
  
  async expire(key, ttlSeconds) {
    setTimeout(() => this.data.delete(key), ttlSeconds * 1000);
  }
  
  async ttl(key) {
    return this.data.has(key) ? 3600 : -1;
  }
}

// Mock JWT for testing
function generateToken(userId, articleId) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    userId,
    articleId,
    exp: Math.floor(Date.now() / 1000) + 60, // 60 seconds
    iat: Math.floor(Date.now() / 1000)
  };
  
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = Buffer.from('mock-signature').toString('base64url');
  
  return `${headerB64}.${payloadB64}.${signature}`;
}

function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp > now) {
      return payload;
    }
    return null;
  } catch {
    return null;
  }
}

// Simple rate limiter
class SimpleRateLimiter {
  constructor() {
    this.requests = new Map();
  }
  
  checkRateLimit(ip) {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 10;
    
    if (!this.requests.has(ip)) {
      this.requests.set(ip, []);
    }
    
    const ipRequests = this.requests.get(ip);
    const recentRequests = ipRequests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return {
        exceeded: true,
        limit: maxRequests,
        count: recentRequests.length,
        resetTime: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
      };
    }
    
    recentRequests.push(now);
    this.requests.set(ip, recentRequests);
    
    return {
      exceeded: false,
      limit: maxRequests,
      count: recentRequests.length,
      resetTime: Math.ceil(windowMs / 1000)
    };
  }
}

// Create Express app
const app = express();
const port = 3000;

// Mock data
const articles = new Map([
  ['1', {
    id: '1',
    title: 'Sample Article',
    teaser: 'This is a teaser for the article. You need a token to read the full content.',
    content: 'This is the full article content that requires a valid token to access. It contains valuable information that should be protected by the paywall system.',
    createdAt: new Date().toISOString()
  }]
]);

const rateLimiter = new SimpleRateLimiter();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'packages/client/dist')));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Rate limiting middleware
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             '127.0.0.1';
  
  const rateLimitInfo = rateLimiter.checkRateLimit(ip);
  
  res.set({
    'X-RateLimit-Limit': rateLimitInfo.limit.toString(),
    'X-RateLimit-Remaining': Math.max(0, rateLimitInfo.limit - rateLimitInfo.count).toString(),
    'X-RateLimit-Reset': new Date(Date.now() + rateLimitInfo.resetTime * 1000).toISOString(),
  });
  
  if (rateLimitInfo.exceeded) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: rateLimitInfo.resetTime,
    });
    return;
  }
  
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>FortiFi Demo</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .article { border: 1px solid #ddd; padding: 20px; margin: 20px 0; }
            .teaser { color: #666; }
            .content { display: none; }
            .cta { background: #007bff; color: white; padding: 10px 20px; border: none; cursor: pointer; }
            .cta:hover { background: #0056b3; }
            .error { color: red; }
            .success { color: green; }
        </style>
    </head>
    <body>
        <h1>FortiFi Demo</h1>
        <p>This is a demonstration of FortiFi's paywall hardening system.</p>
        
        <div class="article">
            <h2>Sample Article</h2>
            <div class="teaser">
                This is a teaser for the article. You need a token to read the full content.
            </div>
            <div class="content" id="article-content">
                This is the full article content that requires a valid token to access. 
                It contains valuable information that should be protected by the paywall system.
            </div>
            <button class="cta" onclick="requestToken()">Get Access Token</button>
            <div id="status"></div>
        </div>
        
        <script src="/fortifi-client.js"></script>
        <script>
            // Initialize FortiFi client
            if (typeof FortiFi !== 'undefined') {
                FortiFi.init({
                    apiUrl: 'http://localhost:3000',
                    articleId: '1',
                    userId: 'demo-user',
                    debug: true
                });
            }
            
            async function requestToken() {
                const statusDiv = document.getElementById('status');
                statusDiv.innerHTML = 'Requesting token...';
                
                try {
                    const response = await fetch('/api/token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            articleId: '1',
                            userId: 'demo-user'
                        })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        statusDiv.innerHTML = '<div class="success">Token received! Loading content...</div>';
                        
                        // Simulate loading content with token
                        setTimeout(() => {
                            document.querySelector('.teaser').style.display = 'none';
                            document.querySelector('.content').style.display = 'block';
                            document.querySelector('.cta').style.display = 'none';
                            statusDiv.innerHTML = '<div class="success">Content loaded successfully!</div>';
                        }, 1000);
                    } else {
                        const error = await response.json();
                        statusDiv.innerHTML = '<div class="error">Error: ' + error.error + '</div>';
                    }
                } catch (error) {
                    statusDiv.innerHTML = '<div class="error">Network error: ' + error.message + '</div>';
                }
            }
        </script>
    </body>
    </html>
  `);
});

// API Routes
app.post('/api/token', (req, res) => {
  const { articleId, userId } = req.body;
  
  if (!articleId) {
    res.status(400).json({ error: 'Article ID is required' });
    return;
  }
  
  if (!articles.has(articleId)) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }
  
  const token = generateToken(userId || 'anonymous', articleId);
  
  res.json({
    token,
    expiresIn: 60,
    articleId,
    userId: userId || 'anonymous'
  });
});

app.get('/api/article/:id', (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
  
  if (payload.articleId !== id) {
    res.status(403).json({ error: 'Token not valid for this article' });
    return;
  }
  
  const article = articles.get(id);
  if (!article) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }
  
  res.json({
    id: article.id,
    title: article.title,
    content: article.content,
    createdAt: article.createdAt
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 FortiFi Demo Server running at http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔑 Test token generation: POST http://localhost:${port}/api/token`);
  console.log(`📰 Test article access: GET http://localhost:${port}/api/article/1`);
  console.log('\nTo test the paywall:');
  console.log('1. Open http://localhost:3000 in your browser');
  console.log('2. Click "Get Access Token" to request a token');
  console.log('3. The content should load after token validation');
  console.log('\nPress Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down FortiFi Demo Server...');
  process.exit(0);
});
