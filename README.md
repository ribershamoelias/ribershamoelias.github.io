# Riber Shamo Elias - Personal Website & Links

> Persönliche Website mit Portfolio, Projekte & Link-Management

**Live:** https://ribershamoelias.com

## 🎯 Was ist das?

Deine persönliche Website gehostet auf GitHub Pages:

- **Frontend**: Portfolio-Website mit dunklem Design
- **Links**: Linktree-Alternative für alle sozialen Links
- **Analytics**: Optional - Privacy-fokussiertes Tracking Backend
- **Domain**: ribershamoelias.com via GitHub Pages + Custom Domain

## ✨ Features

- ✅ **Public Link Page**: Beautiful, responsive link page hosted on GitHub Pages
- ✅ **Private Analytics**: Track clicks without Google Analytics or third-party services
- ✅ **Hortfolio Website**: Hero Section, About, Projekte, Skills, Kontakt
- ✅ **Responsive Design**: Perfekt auf Mobile, Tablet & Desktop
- ✅ **Linktree Alternative**: Alle wichtigen Links an einem Ort (my-links/)
- ✅ **Dark Theme**: Modernes Design mit Purple-Gradients
- ✅ **Analytics**: Optional - Track Link-Clicks ohne Google Analytics
- ✅ **Custom Domain**: ribershamoelias.com via GitHub Pages
- ✅ **HTTPS**: Automatisch via GitHub Pages
- ✅ **Keine Abhängigkeiten**: Nur HTML, CSS, Vanilla JavaScript

```
GitHub Pages                      Your VPS
links.example.com          →      analytics.example.com
   │                              │
   ├─ index.html                  ├─ Node.js Server (PM2)
   ├─ style.css                   ├─ SQLite Database
   ├─ script.js                   ├─ Nginx Reverse Proxy
   ├─ links.json                  └─ Let's Encrypt SSL
   │
   └─ Clicks tracked via HTTPS API
```

## 🚀 Quick Start

### Option 1: Local Development (5 mins)

```bash
cd my-links/analytics
npm install
npm start
# Server runs on http://localhost:3000
```

Visit dashboard: Open [index.html](./my-links/index.html) and click "Stats anzeigen"

### Option 2: Production Deployment (45 mins)

See [QUICKSTART.md](./QUICKSTART.md) for step-by-step instructions

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](./QUICKSTART.md) | 5-min local setup + 45-min production deployment |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Complete production guide with VPS setup |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, database schema, security details |
| [my-links/analytics/README.md](./my-links/analytics/README.md) | Backend API documentation |
| [my-links/analytics/NGINX_SETUP.md](./my-links/analytics/NGINX_SETUP.md) | Nginx reverse proxy configuration |

## 🔌 API Overview

### Public Endpoints

```bash
# Track a click (called by frontend automatically)
POST /api/click
{ "link": "Instagram" }

# Get statistics
GET /api/stats
# → [{"link": "Instagram", "count": 42}, ...]

# Get click history
GET /api/clicks

# Single link stats
GET /api/stats/Instagram
```

### Protected Endpoints

```bash
# View dashboard (needs password)
GET /dashboard
# Credentials: HTTP Basic Auth

# Clear all data (needs password)
DELETE /api/reset
# Credentials: HTTP Basic Auth
```

## 🗂️ Project Structure

```
.
├── README.md                           # This file
├── QUICKSTART.md                       # ⭐ Start here
├── DEPLOYMENT.md                       # Production deployment guide
├── ARCHITECTURE.md                     # System design details
├── .gitignore                          # Git ignore rules
│
├── my-links/                           # Frontend
│   ├── index.html                      # Main page
│   ├── style.css                       # Styling
│   ├── script.js                       # Frontend tracking logic
│   ├── links.json                      # Your links (edit this!)
│   ├── assets/                         # Images, icons, etc.
│   │
│   └── analytics/                      # Backend (production)
│       ├── server.js                   # Express API server
│       ├── dashboard.html              # Analytics dashboard
│       ├── package.json                # Dependencies
│       ├── .env.example                # Environment template
│       ├── analytics.db                # SQLite database (created on first run)
│       ├── README.md                   # Backend README
│       └── NGINX_SETUP.md              # Nginx configuration guide
```

## 🔒 Security & Privacy

### What We Collect ✅
- Link name
- Click timestamp
- Anonymized IP (first 2 octets: 192.168.*.*)
- IP hash (SHA256, one-way only)
- User agent (browser/device info)

### What We Don't Collect ❌
- Personal information (name, email, etc.)
- Full IP addresses
- Cookies
- Cross-site tracking
- External analytics

### Security Features
- HTTPS-only (TLS 1.2+)
- CORS restricted to your domain
- Password-protected dashboard
- Anonymized IP tracking
- No external dependencies for analytics

## 💰 Cost Comparison

| Service | Cost | Notes |
|---------|------|-------|
| **This System** | $5-20/mo | VPS + domain |
| Linktree | $100+/year | Monthly subscription |
| Linktree + Google Analytics | $120/year | Plus privacy concerns |
| GitHub Pages + Custom Backend | **$5-20/mo** | ← Full control |

**Total Cost**: ~$5-20/month (vs. $100+/year for Linktree)

## 🚀 Deployment Steps

### 1. Frontend (GitHub Pages)
```bash
# Create public repository
# Push index.html, style.css, script.js, links.json
# Enable GitHub Pages in Settings
# Your site is live at: https://links.example.com
```

### 2. Backend (VPS)
```bash
# SSH into VPS
# Clone repository
# npm install
# Setup .env configuration
# pm2 start server.js
# Configure Nginx reverse proxy
# Get SSL certificate (Let's Encrypt)
# Your API is live at: https://analytics.example.com/api/stats
```

See [QUICKSTART.md](./QUICKSTART.md) for detailed steps.

## 📊 Dashboard Features

The analytics dashboard (`/dashboard`) shows:

- 📈 **Total Clicks** - Sum of all clicks
- 📊 **Clicks per Link** - Breakdown by link with progress bars
- 🕐 **Click History** - Last 50 clicks with timestamps and anonymized IPs
- 🔄 **Auto-Refresh** - Updates every 5 seconds
- 🗑️ **Clear Data** - Admin function to reset all data

Access at: `https://analytics.example.com/dashboard`

## 🛠️ Customization

### Change Your Links

Edit [my-links/links.json](./my-links/links.json):

```json
[
  { "title": "Instagram", "url": "https://instagram.com/yourprofile" },
  { "title": "Portfolio", "url": "https://yourwebsite.com" },
  { "title": "Contact", "url": "mailto:you@example.com" }
]
```

### Change Styling

Edit [my-links/style.css](./my-links/style.css) to customize appearance.

### Change Backend Configuration

Edit `my-links/analytics/.env`:

```env
PORT=3000
NODE_ENV=production
FRONTEND_DOMAIN=https://links.example.com
DASHBOARD_PASSWORD=YourSecurePassword123!
```

## 📈 Future Enhancements

- [ ] GeoIP tracking (show country of clicks)
- [ ] Device/browser detection
- [ ] Unique visitor counting
- [ ] CSV export
- [ ] Email reports
- [ ] Chart visualizations
- [ ] A/B testing links
- [ ] UTM parameters

## 🐛 Troubleshooting

### "CORS error in browser console"
Update `FRONTEND_DOMAIN` in `.env` to match your GitHub Pages domain.

### "Cannot connect to analytics.example.com"
1. Check VPS is running: `pm2 status`
2. Check Nginx: `sudo systemctl status nginx`
3. Check firewall: `sudo ufw status`

### "Dashboard shows 401 Unauthorized"
Check password in `.env:DASHBOARD_PASSWORD`

For more help, see [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting)

## 📞 Support

- 📖 **Documentation**: Start with [QUICKSTART.md](./QUICKSTART.md)
- 🔍 **API Docs**: See [my-links/analytics/README.md](./my-links/analytics/README.md)
- 🏗️ **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- 🖥️ **Nginx**: See [my-links/analytics/NGINX_SETUP.md](./my-links/analytics/NGINX_SETUP.md)

## 📄 License

MIT License - feel free to use, modify, and distribute.

## 🤝 Contributing

Contributions welcome! Please feel free to submit pull requests.

## ❤️ Privacy First

This project is built with privacy as the core principle:

```
✅ You own your data
✅ No external trackers
✅ No cookies
✅ No third-party analytics
✅ Full transparency
✅ Open source
```

**Your data stays on YOUR server.**

---

## 🎯 Next Steps

1. **Learn the System**: Read [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Try Locally**: Follow [QUICKSTART.md](./QUICKSTART.md) section 1
3. **Deploy**: Follow [QUICKSTART.md](./QUICKSTART.md) section 2 or [DEPLOYMENT.md](./DEPLOYMENT.md)
4. **Monitor**: Check your dashboard at `https://analytics.example.com/dashboard`
5. **Extend**: Add new features using the API

Happy tracking! 🚀
