# FortiFi Client Usage Guide

Complete integration guide for all types of web pages and platforms.

## Integration Options

### **Option 1: Client-Side Only (No Backend Access)**
Perfect for: WordPress, Squarespace, Wix, Shopify, static sites, third-party platforms

### **Option 2: Full Stack (Backend + Frontend)**
Perfect for: Custom websites, Next.js, React apps, Node.js backends

### **Option 3: Managed Service (FortiFi Cloud)**
Perfect for: Any website, any platform, zero setup

---

## Client-Side Only Integration

### **WordPress Integration**

#### **Method 1: Plugin (Recommended)**
1. Install FortiFi WordPress plugin
2. Add API key in settings
3. Use shortcode: `[fortifi article_id="123" user_id="456"]`

#### **Method 2: Custom Code**
Add to your theme's `functions.php`:

```php
// Add FortiFi script to head
function add_fortifi_script() {
    ?>
    <script src="https://unpkg.com/@fortifi/client@latest/dist/fortifi-client.js"></script>
    <script>
        // Initialize FortiFi
        FortiFi.init({
            apiKey: 'your-fortifi-api-key',
            articleId: get_the_ID(),
            userId: get_current_user_id(),
            contentSelector: '#premium-content'
        });
    </script>
    <?php
}
add_action('wp_head', 'add_fortifi_script');
```

#### **Method 3: Gutenberg Block**
```html
<!-- In your post content -->
<div class="fortifi-paywall">
    <div id="article-teaser">
        This is a teaser. Subscribe to read the full article.
    </div>
    <div id="premium-content" style="display: none;">
        <!-- Full content here -->
    </div>
    <button id="unlock-btn">Subscribe to Read</button>
</div>
```

### **Squarespace Integration**

#### **Code Injection (Header)**
```html
<script src="https://unpkg.com/@fortifi/client@latest/dist/fortifi-client.js"></script>
<script>
    // Initialize FortiFi
    FortiFi.init({
        apiKey: 'your-fortifi-api-key',
        articleId: window.location.pathname,
        userId: 'user-' + Math.random().toString(36).substr(2, 9),
        contentSelector: '#premium-content'
    });
</script>
```

#### **Code Injection (Footer)**
```html
<script>
    // Wait for page load
    document.addEventListener('DOMContentLoaded', function() {
        // Find premium content blocks
        const premiumBlocks = document.querySelectorAll('.premium-content');
        
        premiumBlocks.forEach(block => {
            const articleId = block.dataset.articleId;
            const userId = block.dataset.userId || 'user-' + Math.random().toString(36).substr(2, 9);
            
            // Initialize FortiFi for this block
            FortiFi.init({
                apiKey: 'your-fortifi-api-key',
                articleId: articleId,
                userId: userId,
                contentSelector: '#' + block.id
            });
        });
    });
</script>
```

### **Wix Integration**

#### **Custom Code Element**
1. Add "Custom Code" element to your page
2. Add this code:

```html
<script src="https://unpkg.com/@fortifi/client@latest/dist/fortifi-client.js"></script>
<script>
    // Initialize FortiFi
    FortiFi.init({
        apiKey: 'your-fortifi-api-key',
        articleId: 'wix-article-' + $w('#text1').text,
        userId: 'user-' + Math.random().toString(36).substr(2, 9),
        contentSelector: '#premium-content'
    });
</script>
```

### **Shopify Integration**

#### **Theme Liquid Template**
Add to your `product.liquid` or `article.liquid`:

```liquid
<!-- In your product/article template -->
<div class="fortifi-paywall">
    <div id="content-teaser">
        {{ product.description | truncate: 100 }}
    </div>
    <div id="premium-content" style="display: none;">
        {{ product.description }}
    </div>
    <button id="unlock-btn">Upgrade to Pro</button>
</div>

<script src="https://unpkg.com/@fortifi/client@latest/dist/fortifi-client.js"></script>
<script>
    FortiFi.init({
        apiKey: 'your-fortifi-api-key',
        articleId: '{{ product.id }}',
        userId: '{{ customer.id }}',
        contentSelector: '#premium-content'
    });
</script>
```

### **Static Site Integration**

#### **HTML File**
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Static Site</title>
    <script src="https://unpkg.com/@fortifi/client@latest/dist/fortifi-client.js"></script>
</head>
<body>
    <article>
        <h1>Premium Article</h1>
        <div id="article-teaser">
            This is a teaser. Subscribe to read the full article.
        </div>
        <div id="premium-content" style="display: none;">
            <!-- Full content here -->
        </div>
        <button id="unlock-btn">Subscribe to Read</button>
    </article>

    <script>
        FortiFi.init({
            apiKey: 'your-fortifi-api-key',
            articleId: 'static-article-123',
            userId: 'user-' + Math.random().toString(36).substr(2, 9),
            contentSelector: '#premium-content'
        });

        document.getElementById('unlock-btn').onclick = async () => {
            try {
                await FortiFi.requestAccess();
                document.getElementById('unlock-btn').style.display = 'none';
            } catch (error) {
                alert('Please subscribe to read this article');
            }
        };
    </script>
</body>
</html>
```

### **Third-Party Platform Integration**

#### **Universal Integration (Any Platform)**
```html
<!-- Add this to any website -->
<script src="https://unpkg.com/@fortifi/client@latest/dist/fortifi-client.js"></script>
<script>
    // Auto-detect premium content
    document.addEventListener('DOMContentLoaded', function() {
        const premiumElements = document.querySelectorAll('[data-fortifi="true"]');
        
        premiumElements.forEach(element => {
            const articleId = element.dataset.articleId || window.location.pathname;
            const userId = element.dataset.userId || 'user-' + Math.random().toString(36).substr(2, 9);
            
            // Create paywall wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'fortifi-paywall';
            
            const teaser = document.createElement('div');
            teaser.className = 'fortifi-teaser';
            teaser.textContent = element.textContent.substring(0, 100) + '...';
            
            const content = document.createElement('div');
            content.className = 'fortifi-content';
            content.style.display = 'none';
            content.innerHTML = element.innerHTML;
            
            const button = document.createElement('button');
            button.textContent = 'Subscribe to Read';
            button.className = 'fortifi-unlock-btn';
            
            wrapper.appendChild(teaser);
            wrapper.appendChild(content);
            wrapper.appendChild(button);
            
            element.parentNode.replaceChild(wrapper, element);
            
            // Initialize FortiFi
            FortiFi.init({
                apiKey: 'your-fortifi-api-key',
                articleId: articleId,
                userId: userId,
                contentSelector: '.' + content.className
            });
            
            button.onclick = async () => {
                try {
                    await FortiFi.requestAccess();
                    button.style.display = 'none';
                } catch (error) {
                    alert('Please subscribe to read this content');
                }
            };
        });
    });
</script>
```

---

## Full Stack Integration

### **Next.js Integration**

#### **API Route**
```javascript
// pages/api/article/[id].js
import { createFortiFi } from '@fortifi/core';

const fortifi = createFortiFi({
  jwtSecret: process.env.JWT_SECRET,
  redis: { host: process.env.REDIS_URL },
  rateLimit: { maxRequests: 100, windowMs: 60 }
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query;
    
    // Check for token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }
    
    // Validate token
    const isValid = fortifi.verifyToken(token);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Return content
    res.json({ content: await getArticleContent(id) });
  }
}
```

#### **React Component**
```jsx
// components/ProtectedArticle.jsx
import { useEffect, useState } from 'react';
import FortiFi from '@fortifi/client';

export default function ProtectedArticle({ articleId, userId }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    FortiFi.init({
      apiUrl: '/api',
      articleId: articleId,
      userId: userId,
      contentSelector: '#article-content'
    });
  }, [articleId, userId]);

  const handleUnlock = async () => {
    setLoading(true);
    try {
      await FortiFi.requestAccess();
      setContent('Full article content loaded!');
    } catch (error) {
      alert('Failed to unlock: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div id="article-teaser">
        This is a teaser. Subscribe to read the full article.
      </div>
      <div id="article-content" style={{ display: content ? 'block' : 'none' }}>
        {content}
      </div>
      <button onClick={handleUnlock} disabled={loading}>
        {loading ? 'Loading...' : 'Subscribe to Read'}
      </button>
    </div>
  );
}
```

### **Express.js Integration**

#### **Server Setup**
```javascript
// server.js
import express from 'express';
import { createFortiFi } from '@fortifi/core';

const app = express();
const fortifi = createFortiFi({
  jwtSecret: process.env.JWT_SECRET,
  redis: { host: 'localhost', port: 6379 },
  rateLimit: { maxRequests: 100, windowMs: 60 },
  token: { ttl: 60 },
  security: { enableCors: true, enableHelmet: true }
});

app.use(fortifi.security);
app.use('/api', fortifi.rateLimit);
app.use(express.json());

// Protected content endpoint
app.get('/api/article/:id', fortifi.validateToken, (req, res) => {
  res.json({ content: getArticleContent(req.params.id) });
});

// Token generation endpoint
app.post('/api/token', (req, res) => {
  const { userId, articleId } = req.body;
  const token = fortifi.generateToken(userId, articleId);
  res.json({ token });
});

app.listen(3000);
```

#### **Client Integration**
```html
<script src="https://unpkg.com/@fortifi/client@latest/dist/fortifi-client.js"></script>
<script>
  FortiFi.init({
    apiUrl: 'http://localhost:3000/api',
    articleId: 'article-123',
    userId: 'user-456',
    contentSelector: '#article-content'
  });
</script>
```

---

## Managed Service Integration

### **FortiFi Cloud (Zero Setup)**

#### **Any Website Integration**
```html
<!-- Just add this script tag -->
<script src="https://cdn.fortifi.dev/client@latest/fortifi-client.js"></script>
<script>
  FortiFi.init({
    apiKey: 'your-api-key',
    articleId: 'article-123',
    userId: 'user-456',
    contentSelector: '#premium-content'
  });
</script>
```

#### **WordPress Plugin**
1. Install "FortiFi Paywall" plugin
2. Enter your API key
3. Use shortcode: `[fortifi article_id="123"]`

#### **Shopify App**
1. Install "FortiFi Paywall" app
2. Configure your content rules
3. Content is automatically protected

---

## Integration Patterns

### **Pattern 1: Paywall Wall**
```html
<div class="article">
  <h1>Article Title</h1>
  <div id="teaser">Teaser content...</div>
  <div id="content" style="display: none;">Full content...</div>
  <button id="unlock">Subscribe to Read</button>
</div>
```

### **Pattern 2: Progressive Disclosure**
```html
<div class="article">
  <h1>Article Title</h1>
  <div id="free-content">Free content...</div>
  <div id="premium-content" style="display: none;">Premium content...</div>
  <button id="upgrade">Upgrade to Pro</button>
</div>
```

### **Pattern 3: Time-based Access**
```html
<div class="article">
  <h1>Article Title</h1>
  <div id="content">Content available for 24 hours...</div>
  <div id="expired" style="display: none;">Content expired. Subscribe to continue.</div>
  <button id="subscribe">Subscribe Now</button>
</div>
```

### **Pattern 4: Feature Gating**
```html
<div class="product">
  <h1>Product Name</h1>
  <div id="basic-features">Basic features...</div>
  <div id="premium-features" style="display: none;">Premium features...</div>
  <button id="unlock-premium">Unlock Premium</button>
</div>
```

---

## Platform-Specific Examples

### **WordPress**
- Plugin installation
- Shortcode usage
- Theme integration
- Gutenberg blocks

### **Squarespace**
- Code injection
- Custom CSS
- Dynamic content

### **Wix**
- Custom code elements
- Dynamic pages
- E-commerce integration

### **Shopify**
- Theme modifications
- App installation
- Liquid templates

### **Webflow**
- Custom code
- CMS integration
- Dynamic content

### **Ghost**
- Theme modifications
- Member integration
- API usage

### **Medium**
- Custom domain
- Member integration
- API usage

---

## What Makes FortiFi Different

### **vs. Traditional Paywalls:**
- Traditional: Client-side CSS hiding (easily bypassed)
- FortiFi: Server-side enforcement (cannot be bypassed)

### **vs. Other Solutions:**
- Others: Complex setup, proprietary
- FortiFi: Simple integration, open source

### **vs. Custom Solutions:**
- Custom: Time-consuming, security risks
- FortiFi: Battle-tested, maintained

---

## Getting Started

### **For Any Website:**
1. Get API key from FortiFi Cloud
2. Add script tag to your site
3. Configure content selectors
4. Test and launch

### **For Developers:**
1. Install packages: `npm install @fortifi/core @fortifi/client`
2. Setup backend middleware
3. Add client script to frontend
4. Test integration

### **For Enterprises:**
1. Contact: enterprise@fortifi.dev
2. Schedule demo
3. Pilot implementation
4. Full deployment

---

## Support

- Documentation: https://fortifi.dev/docs
- GitHub: https://github.com/mm-labs-engineering/FortiFi
- Demo: https://demo.fortifi.dev
- Support: support@fortifi.dev
- Enterprise: enterprise@fortifi.dev