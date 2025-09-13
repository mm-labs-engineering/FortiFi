# FortiFi Demo Setup Guide

## Quick Start (5 minutes)

Your FortiFi demo is ready to show! Here's how to get it running:

### 1. Start the Demo
```bash
cd /Users/ebube/Documents/Dev/FortiFi/examples/demo
pnpm run dev
```

### 2. Access the Demo
- **Demo Site**: http://localhost:3001
- **API Health**: http://localhost:3001/api/articles

### 3. What You Can Show

#### **Main Features:**
1. **Article List Page** - Shows premium and free articles
2. **Paywall Protection** - Click "Unlock Article" on premium content
3. **Token System** - 60-second tokens for access
4. **Server-side Enforcement** - Content only served after token validation

#### **Demo Scenarios:**
1. **Free Article** - Click "Read Article" on "Understanding TypeScript Generics"
2. **Premium Article** - Click "Unlock Article" on "The Future of Web Security"
3. **Token Expiration** - Wait 60 seconds and try to access premium content again

### 4. Key Points to Highlight

#### **What Makes FortiFi Unique:**
- ✅ **Server-side enforcement** - Content never sent to client without valid token
- ✅ **Short-lived tokens** - 60-second TTL prevents replay attacks
- ✅ **CSS/DOM bypass protection** - Can't manipulate client-side to get content
- ✅ **Open source** - Full transparency and customization

#### **Technical Architecture:**
- **Frontend**: Clean, modern UI with JavaScript client
- **Backend**: Express.js with FortiFi middleware
- **Security**: JWT tokens, rate limiting, CORS protection
- **Database**: In-memory for demo (PostgreSQL in production)

### 5. Demo Script

#### **Opening (30 seconds):**
"FortiFi is an open-source paywall hardening toolkit that prevents CSS/DOM bypasses through server-side enforcement. Let me show you how it works."

#### **Feature Demo (2 minutes):**
1. **Show article list** - "Here we have both free and premium content"
2. **Try free article** - "Free content loads immediately"
3. **Try premium article** - "Premium content shows a paywall"
4. **Unlock premium** - "Click unlock to get a 60-second token"
5. **Show full content** - "Content is served server-side after token validation"
6. **Wait for expiration** - "Tokens expire in 60 seconds for security"

#### **Technical Deep Dive (2 minutes):**
1. **Show network tab** - "Notice the token request and validation"
2. **Show source code** - "Content is never in the DOM until unlocked"
3. **Explain bypass protection** - "Even if someone manipulates CSS, they can't get the content"

#### **Closing (30 seconds):**
"FortiFi provides enterprise-grade paywall protection that's open source and easy to integrate. The free version is available now, with advanced features coming in our cloud offering."

### 6. Troubleshooting

#### **If Demo Won't Start:**
```bash
# Check if port 3001 is available
lsof -i :3001

# Kill any process using the port
kill -9 <PID>

# Restart demo
pnpm run dev
```

#### **If Articles Don't Load:**
- Check browser console for errors
- Verify API is responding: `curl http://localhost:3001/api/articles`
- Check that Redis is running (for rate limiting)

### 7. Production Deployment

#### **For Production Demo:**
1. **Use Docker Compose:**
   ```bash
   docker-compose up -d
   ```

2. **Deploy to Cloud:**
   - Deploy to Heroku, Railway, or similar
   - Set environment variables
   - Use production database

3. **Custom Domain:**
   - Point domain to your deployment
   - Add SSL certificate
   - Update CORS settings

### 8. Next Steps

#### **After Demo:**
1. **Get feedback** - Ask what features they'd like to see
2. **Gauge interest** - See if they want to try the free version
3. **Collect emails** - For updates and beta access
4. **Follow up** - Send them the GitHub repo and documentation

#### **For Enterprise Prospects:**
1. **Schedule technical demo** - Show advanced features
2. **Discuss requirements** - Understand their specific needs
3. **Provide pricing** - Share the cost analysis we created
4. **Offer pilot** - Let them try it with their content

---

## Demo Checklist

- [ ] Demo site loads at http://localhost:3001
- [ ] Article list shows both free and premium content
- [ ] Free article loads without paywall
- [ ] Premium article shows paywall
- [ ] "Unlock Article" button works
- [ ] Full content loads after token generation
- [ ] Token expires after 60 seconds
- [ ] Network tab shows API calls
- [ ] Console shows no errors

**Your demo is ready to impress! 🚀**
