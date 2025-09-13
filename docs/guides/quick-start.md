# Quick Start Guide

Get FortiFi running in 5 minutes.

## Option 1: Try the Demo

```bash
git clone https://github.com/fortifi/fortifi.git
cd fortifi
pnpm install
cd examples/demo
pnpm run dev
```

Visit http://localhost:3001 and click "Unlock Article" to see FortiFi in action.

## Option 2: Integrate in Your Project

### Install Packages
```bash
npm install @fortifi/core @fortifi/client
```

### Backend Setup
```javascript
import express from 'express';
import { createFortiFi } from '@fortifi/core';

const app = express();
const fortifi = createFortiFi({
  jwtSecret: 'your-secret-key',
  redis: { host: 'localhost', port: 6379 },
  rateLimit: { maxRequests: 100, windowMs: 60 },
  token: { ttl: 60, algorithm: 'HS256' },
  security: { enableCors: true, enableHelmet: true }
});

app.use(fortifi.security);
app.use('/api', fortifi.rateLimit);
app.use(express.json());

app.get('/api/article/:id', fortifi.validateToken, (req, res) => {
  res.json({ content: 'Premium article content' });
});

app.post('/api/token', (req, res) => {
  const { userId, articleId } = req.body;
  const token = fortifi.generateToken(userId, articleId);
  res.json({ token });
});

app.listen(3000);
```

### Frontend Setup
```html
<script src="https://unpkg.com/@fortifi/client@latest/dist/fortifi-client.js"></script>
<script>
  FortiFi.init({
    apiUrl: 'http://localhost:3000/api',
    articleId: 'premium-article',
    userId: 'user-123',
    contentSelector: '#article-content'
  });

  document.getElementById('unlock-btn').onclick = async () => {
    try {
      await FortiFi.requestAccess();
      document.getElementById('unlock-btn').style.display = 'none';
    } catch (error) {
      alert('Failed to unlock: ' + error.message);
    }
  };
</script>
```

### Test It
1. Start server: `node server.js`
2. Open HTML file
3. Click "Unlock Article"
4. Content appears

## What This Does

**Backend Protection:**
- Server-side validation - Content only sent with valid token
- Rate limiting - Prevents abuse
- Security headers - CORS, Helmet protection
- JWT tokens - 60-second expiration

**Frontend Experience:**
- Seamless integration - Just add script tag
- Automatic token handling - No manual management
- Error handling - Graceful failure

## Next Steps

**Development:**
- Customize settings (token lifetime, rate limits)
- Add your content
- Style the UI
- Test thoroughly

**Production:**
- Change JWT secret to strong random string
- Set up Redis for rate limiting
- Use HTTPS
- Monitor performance

**Advanced Features:**
- Watermarking
- Analytics
- Bot detection
- Custom integrations

## Learn More

- [Client Usage Guide](client-usage.md) - Full integration guide
- [Integration Example](../examples/integration-example.md) - Complete example
- [Core API](../api/core-api.md) - API reference
- [Architecture Overview](../architecture.md) - Technical details

## Support

- [GitHub Issues](https://github.com/fortifi/fortifi/issues) - Bug reports
- [GitHub Discussions](https://github.com/fortifi/fortifi/discussions) - Questions
- Email: support@fortifi.dev
