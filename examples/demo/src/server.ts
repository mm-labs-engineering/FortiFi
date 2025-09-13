import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { createFortiFi } from '@fortifi/core';
import { config } from './config';

const app = express();
const port = process.env['PORT'] || 3001;

// Initialize FortiFi middleware
const fortifi = createFortiFi({
  jwtSecret: config.jwtSecret,
  redis: {
    host: config.redis.host,
    port: config.redis.port,
  },
  rateLimit: {
    maxRequests: 100,
    windowMs: 60,
    blockDurationMs: 300,
  },
  token: {
    ttl: 300, // 5 minutes for demo
    algorithm: 'HS256',
  },
  security: {
    enableCors: true,
    corsOrigins: ['*'],
    enableHelmet: true,
  },
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-hashes'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Security middleware
app.use(fortifi.security);

// Sample articles data
const articles = [
  {
    id: 'article-1',
    title: 'The Future of Web Security',
    teaser: 'In this comprehensive guide, we explore the latest trends in web security and how they impact modern applications...',
    content: `
      <h2>Introduction</h2>
      <p>Web security has evolved dramatically over the past decade. From simple password protection to sophisticated multi-factor authentication systems, the landscape continues to change rapidly.</p>
      
      <h2>Current Threats</h2>
      <p>Today's web applications face numerous threats including:</p>
      <ul>
        <li>Cross-Site Scripting (XSS) attacks</li>
        <li>SQL injection vulnerabilities</li>
        <li>Cross-Site Request Forgery (CSRF)</li>
        <li>Man-in-the-middle attacks</li>
        <li>Distributed Denial of Service (DDoS)</li>
      </ul>
      
      <h2>Modern Security Practices</h2>
      <p>Implementing robust security measures requires a multi-layered approach:</p>
      
      <h3>1. Input Validation</h3>
      <p>Always validate and sanitize user input on both client and server sides. Use whitelist validation whenever possible.</p>
      
      <h3>2. Authentication & Authorization</h3>
      <p>Implement strong authentication mechanisms and follow the principle of least privilege for authorization.</p>
      
      <h3>3. Encryption</h3>
      <p>Use HTTPS everywhere and encrypt sensitive data both in transit and at rest.</p>
      
      <h3>4. Security Headers</h3>
      <p>Implement proper security headers like CSP, HSTS, and X-Frame-Options.</p>
      
      <h2>Conclusion</h2>
      <p>Web security is an ongoing process that requires constant vigilance and adaptation. By implementing these practices and staying informed about emerging threats, you can significantly improve your application's security posture.</p>
    `,
    author: 'Jane Smith',
    publishedAt: '2024-01-15T10:00:00Z',
    category: 'Security',
    tags: ['security', 'web', 'authentication', 'encryption'],
    isPremium: true,
  },
  {
    id: 'article-2',
    title: 'Understanding TypeScript Generics',
    teaser: 'TypeScript generics provide a powerful way to create reusable components. Learn how to leverage them effectively...',
    content: `
      <h2>What are Generics?</h2>
      <p>Generics allow you to create reusable components that work with multiple types while maintaining type safety.</p>
      
      <h2>Basic Generic Function</h2>
      <pre><code>function identity&lt;T&gt;(arg: T): T {
  return arg;
}</code></pre>
      
      <h2>Generic Interfaces</h2>
      <pre><code>interface GenericInterface&lt;T&gt; {
  value: T;
  getValue(): T;
}</code></pre>
      
      <h2>Constraints</h2>
      <p>You can constrain generic types to ensure they have certain properties:</p>
      <pre><code>function getProperty&lt;T, K extends keyof T&gt;(obj: T, key: K): T[K] {
  return obj[key];
}</code></pre>
      
      <h2>Real-world Example</h2>
      <p>Here's how you might use generics in a data fetching utility:</p>
      <pre><code>async function fetchData&lt;T&gt;(url: string): Promise&lt;T&gt; {
  const response = await fetch(url);
  return response.json();
}</code></pre>
    `,
    author: 'John Doe',
    publishedAt: '2024-01-10T14:30:00Z',
    category: 'Programming',
    tags: ['typescript', 'generics', 'programming', 'types'],
    isPremium: false,
  },
];

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/article/:id', (req, res) => {
  const articleId = req.params['id'];
  const article = articles.find(a => a.id === articleId);
  
  if (!article) {
    return res.status(404).send('Article not found');
  }
  
  return res.sendFile(path.join(__dirname, 'views', 'article.html'));
});

// API Routes
app.get('/api/articles', (req, res) => {
  return res.json(articles.map(article => ({
    id: article.id,
    title: article.title,
    teaser: article.teaser,
    author: article.author,
    publishedAt: article.publishedAt,
    category: article.category,
    tags: article.tags,
    isPremium: article.isPremium,
  })));
});

app.get('/api/article/:id', (req, res) => {
  const articleId = req.params['id'];
  const article = articles.find(a => a.id === articleId);
  
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  
  return res.json(article);
});

// Token endpoint (simplified for demo)
app.post('/api/token', (req, res) => {
  const { articleId, userId } = req.body;
  
  if (!articleId || !userId) {
    return res.status(400).json({ error: 'Article ID and User ID are required' });
  }
  
  // Generate token using FortiFi
  const token = fortifi.generateToken(userId, articleId);
  const expiresAt = Math.floor(Date.now() / 1000) + 60; // 60 seconds from now
  
  return res.json({
    token,
    expiresAt,
    userId,
    articleId,
  });
});

// Protected article content endpoint
app.get('/api/article/:id/content', (req, res) => {
  const articleId = req.params['id'];
  const article = articles.find(a => a.id === articleId);
  
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  
  // Check for token in Authorization header or query parameter
  const authHeader = req.headers.authorization;
  const tokenFromQuery = req.query.token as string;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      // Validate token using FortiFi
      const isValid = fortifi.verifyToken(token);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } else if (tokenFromQuery) {
    try {
      // Validate token from query parameter
      const isValid = fortifi.verifyToken(tokenFromQuery);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } else {
    return res.status(401).json({ error: 'Token required' });
  }
  
  return res.json({
    id: article.id,
    title: article.title,
    content: article.content,
    metadata: {
      author: article.author,
      publishedAt: article.publishedAt,
      tags: article.tags,
      category: article.category,
    },
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Demo server running on http://localhost:${port}`);
  console.log(`📚 Articles available at http://localhost:${port}/api/articles`);
});
