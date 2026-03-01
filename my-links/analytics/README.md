# 📊 Analytics Backend - Self-Hosted Link Analytics

A privacy-first, lightweight analytics backend for the self-hosted Linktree system.

## 🎯 Features

- ✅ Private analytics (no external trackers)
- ✅ Lightweight (SQLite, minimal dependencies)
- ✅ CORS-protected (only your frontend can track)
- ✅ Anonymized IP tracking
- ✅ Password-protected dashboard
- ✅ Simple REST API
- ✅ HTTPS-ready (Nginx + Let's Encrypt)
- ✅ PM2 process manager support

## 🚀 Quick Start (Development)

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your settings

# Start server
npm start

# Server runs on http://localhost:3000
```

Test with:
```bash
curl http://localhost:3000/api/stats
```

## 📋 Installation

For production deployment, see [DEPLOYMENT.md](../DEPLOYMENT.md)

### Prerequisites
- Node.js 18+ LTS
- Nginx (for reverse proxy)
- Linux VPS (Ubuntu 20.04+)
- Domain name (optional, but recommended)

### Production Setup

1. **Clone repository**
```bash
git clone <repo> /var/www/analytics
cd /var/www/analytics
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your production settings
nano .env
```

3. **Setup with PM2**
```bash
npm install -g pm2
pm2 start server.js --name analytics
pm2 startup
pm2 save
```

4. **Setup Nginx reverse proxy**
See [NGINX_SETUP.md](./NGINX_SETUP.md)

5. **Enable HTTPS**
```bash
sudo certbot certonly --nginx -d analytics.example.com
```

## 🔌 API Endpoints

### Public Endpoints

#### `POST /api/click` - Track a click
```bash
curl -X POST http://localhost:3000/api/click \
  -H "Content-Type: application/json" \
  -d '{"link": "Instagram"}'
```

#### `GET /api/stats` - Get all statistics
```bash
curl http://localhost:3000/api/stats
# Response: [{"link": "Instagram", "count": 42}, ...]
```

#### `GET /api/clicks` - Get click history (last 100)
```bash
curl http://localhost:3000/api/clicks
```

#### `GET /api/stats/:link` - Single link stats
```bash
curl http://localhost:3000/api/stats/Instagram
```

### Protected Endpoints

#### `GET /dashboard` - Protected dashboard
```
URL: https://analytics.example.com/dashboard
Password: (from .env DASHBOARD_PASSWORD)
```

#### `DELETE /api/reset` - Clear all data
```bash
curl -u "admin:password" -X DELETE http://localhost:3000/api/reset
```

## 🔒 Configuration (.env)

```env
# Server port
PORT=3000

# Environment (production/development)
NODE_ENV=production

# Frontend domain (for CORS)
FRONTEND_DOMAIN=https://links.example.com

# Dashboard password
DASHBOARD_PASSWORD=YourSecurePassword123!
```

## 📊 Dashboard

Access the dashboard at: `https://analytics.example.com/dashboard`

Features:
- 📈 Total clicks overview
- 📊 Clicks per link (with progress bars)
- 🕐 Click history (last 50 with timestamps)
- 🔄 Auto-refresh every 5 seconds
- 🗑️ Clear data (admin only)

## 🗄️ Database

SQLite database: `analytics.db`

### Schema

```sql
-- Clicks table
CREATE TABLE clicks (
  id INTEGER PRIMARY KEY,
  link TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_hash TEXT,       -- SHA256 hash (can't reverse)
  ip_anon TEXT,       -- Anonymized (192.168.*.*)
  user_agent TEXT
);

-- Future daily stats (optional)
CREATE TABLE stats (
  id INTEGER PRIMARY KEY,
  link TEXT,
  click_date DATE,
  click_count INTEGER,
  UNIQUE(link, click_date)
);
```

## 🛠️ Maintenance

### View logs
```bash
pm2 logs analytics
```

### Restart server
```bash
pm2 restart analytics
```

### Backup database
```bash
cp analytics.db analytics.db.backup.$(date +%Y%m%d)
```

### Check server status
```bash
pm2 status
pm2 monit
```

## 🔐 Security

- CORS restricted to frontend domain only
- IP anonymization (first 2 octets only)
- Dashboard protected with HTTP Basic Auth
- HTTPS enforced (via Nginx)
- No cookies, no session tracking
- No PII collection

## 📚 Documentation

- [DEPLOYMENT.md](../DEPLOYMENT.md) - Full deployment guide
- [NGINX_SETUP.md](./NGINX_SETUP.md) - Nginx configuration
- [ARCHITECTURE.md](../ARCHITECTURE.md) - System design & API details

## 🐛 Troubleshooting

### Server not starting
```bash
npm start
# Check console for errors
```

### CORS errors in browser
Check that `FRONTEND_DOMAIN` in `.env` matches your GitHub Pages domain

### Database locked error
Restart the server: `pm2 restart analytics`

### Dashboard returns 401
Password is incorrect. Check `.env` `DASHBOARD_PASSWORD`

## 📦 Dependencies

- **express** - Web framework
- **sqlite3** - Database
- **cors** - CORS middleware
- **dotenv** - Environment configuration

## 📝 License

MIT

## 🙏 Privacy First

This system is built with privacy in mind:
- No Google Analytics
- No third-party trackers
- No cookies
- No personal data (beyond anonymized IPs)
- You own 100% of your data

**Your data stays on YOUR server.**

