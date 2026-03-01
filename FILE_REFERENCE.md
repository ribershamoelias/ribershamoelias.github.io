# 📂 Project File Reference

Complete guide to all files in the self-hosted Linktree system.

## 📚 Documentation Files (READ THESE FIRST)

### Root Level Documentation

| File | Purpose | Read Time |
|------|---------|-----------|
| [README.md](./README.md) | **START HERE** - Project overview, features, quick links | 5 min |
| [QUICKSTART.md](./QUICKSTART.md) | Local setup (5 min) + Production deployment (45 min) | 45 min |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Complete production deployment guide with VPS setup | Reference |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, database schema, security details | 20 min |
| [CONFIG_REFERENCE.md](./CONFIG_REFERENCE.md) | Configuration options, environment variables, examples | Reference |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | What was built, features, next steps | 10 min |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | Point-by-point deployment checklist | Reference |

### Backend Documentation

| File | Purpose | Location |
|------|---------|----------|
| [Backend README](./my-links/analytics/README.md) | Analytics API documentation, features, endpoints | `my-links/analytics/` |
| [Nginx Setup Guide](./my-links/analytics/NGINX_SETUP.md) | Nginx reverse proxy configuration | `my-links/analytics/` |

---

## 🎨 Frontend Files

### Core Frontend Files

| File | Purpose | Edit For |
|------|---------|----------|
| [index.html](./my-links/index.html) | Main page HTML structure | Layout, structure, headings |
| [style.css](./my-links/style.css) | Styling and visual design | Colors, fonts, responsive design |
| [script.js](./my-links/script.js) | Frontend logic and tracking | Custom tracking logic, analytics URL |
| [links.json](./my-links/links.json) | **⭐ Your links data** | **ADD YOUR LINKS HERE** |

### Frontend Assets

| Directory | Purpose |
|-----------|---------|
| `my-links/assets/` | Images, icons, media files |

---

## 🔧 Backend Files

### Core Backend Files

| File | Purpose | Production Ready |
|------|---------|------------------|
| [server.js](./my-links/analytics/server.js) | Express API server | ✅ Yes (243 lines) |
| [dashboard.html](./my-links/analytics/dashboard.html) | Analytics dashboard UI | ✅ Yes |
| [package.json](./my-links/analytics/package.json) | Dependencies and scripts | ✅ Yes |
| [.env.example](./my-links/analytics/.env.example) | Configuration template | ✅ Copy to .env |

### Backend Database

| File | Purpose | Created On |
|------|---------|-----------|
| `analytics.db` | SQLite database (auto-created) | First server run |
| `analytics.db-*` | Backups (auto-created) | Automated backups |

### Backend Node Modules

| Directory | Purpose |
|-----------|---------|
| `node_modules/` | NPM dependencies (auto-generated) |

---

## 🔐 Configuration Files

### Environment Configuration

| File | Purpose | Action |
|------|---------|--------|
| [.env.example](./my-links/analytics/.env.example) | Configuration template | Copy to `.env` and edit |
| `.env` | Your actual configuration | **CREATE THIS** from template |
| [.gitignore](./.gitignore) | Files to exclude from Git | Already configured |

### Nginx Configuration

| File | Purpose | Server Location |
|------|---------|-----------------|
| [NGINX_SETUP.md](./my-links/analytics/NGINX_SETUP.md) | Nginx config template | `/etc/nginx/sites-available/` |

---

## 📋 File Organization Summary

```
📦 ribershamoelias/                              # Root directory
│
├── 📚 DOCUMENTATION                            # Read first!
│   ├── README.md                               # ⭐ START HERE
│   ├── QUICKSTART.md                           # ⭐ Then here
│   ├── DEPLOYMENT.md                           # Reference
│   ├── ARCHITECTURE.md                         # Understand design
│   ├── CONFIG_REFERENCE.md                     # Change settings
│   ├── IMPLEMENTATION_SUMMARY.md               # What you got
│   └── DEPLOYMENT_CHECKLIST.md                 # Track progress
│
├── 📂 my-links/                                # Frontend + Backend
│   │
│   ├── 🎨 FRONTEND (GitHub Pages)
│   │   ├── index.html                          # Page structure
│   │   ├── style.css                           # Styling ✏️ CUSTOMIZE
│   │   ├── script.js                           # Tracking logic
│   │   ├── links.json                          # ⭐ YOUR LINKS ✏️ EDIT
│   │   └── assets/                             # Images, icons
│   │
│   └── 🔧 ANALYTICS/                           # Backend (VPS)
│       ├── server.js                           # API server
│       ├── dashboard.html                      # Dashboard UI
│       ├── package.json                        # Dependencies
│       ├── .env.example                        # Config template ✏️ COPY
│       ├── README.md                           # Backend docs
│       ├── NGINX_SETUP.md                      # Nginx config guide
│       ├── analytics.db                        # SQLite (auto-created)
│       └── node_modules/                       # Dependencies (auto)
│
├── 🔐 CONFIG & GIT
│   └── .gitignore                              # Git ignored files
│
└── 📄 This file: FILE_REFERENCE.md
```

---

## 🔄 File Dependencies & Relationships

### Frontend Dependencies
```
index.html
    ↓ Links to
    ├── style.css          (styling)
    ├── script.js          (tracking logic)
    └── links.json         (link data)

script.js
    ↓ Sends requests to
    └── https://analytics.example.com/api/click
                            (backend server)
```

### Backend Dependencies
```
server.js
    ↓ Requires
    ├── express            (web framework)
    ├── sqlite3            (database)
    ├── cors               (CORS middleware)
    ├── dotenv             (config loading)
    └── crypto             (IP hashing)

server.js
    ↓ Serves
    ├── dashboard.html     (analytics UI)
    ├── /api/click         (tracking endpoint)
    ├── /api/stats         (stats endpoint)
    └── /api/clicks        (history endpoint)

.env
    ↓ Configures
    └── server.js          (port, CORS, auth)
```

---

## ✏️ Files You Need to Edit

### Must Edit

| File | What to Change | When |
|------|----------------|------|
| `my-links/links.json` | Add your actual links | **Before going live** |
| `my-links/analytics/.env` | Configuration (database password, frontend domain) | **Before deployment** |
| `my-links/script.js` | Set `ANALYTICS_URL` to your backend domain | **Before deployment** |

### Should Edit

| File | What to Change | When |
|------|----------------|------|
| `my-links/style.css` | Colors, fonts, styling | Anytime (customize design) |
| `my-links/index.html` | Content, headings, meta tags | Anytime (personalize) |

### Don't Edit (Unless you know what you're doing)

| File | Why |
|------|-----|
| `my-links/analytics/server.js` | Core API logic - changes break things |
| `my-links/analytics/package.json` | Dependency management |
| `my-links/analytics/dashboard.html` | Works as-is |

---

## 📥 Files to Create Before Deployment

### Essential

```bash
# 1. Copy .env.example to .env
cp my-links/analytics/.env.example my-links/analytics/.env

# 2. Edit .env with your values
nano my-links/analytics/.env
# Change:
# - FRONTEND_DOMAIN=https://links.example.com
# - DASHBOARD_PASSWORD=YourSecurePassword123!
```

### Optional

```bash
# For VPS backups
mkdir -p /var/www/analytics/backups
```

---

## 📤 Files to Upload to GitHub Pages

For your frontend repository:

```
├── index.html          # ⭐ Required
├── style.css           # ⭐ Required
├── script.js           # ⭐ Required
├── links.json          # ⭐ Required
├── assets/             # Optional (images, icons)
└── README.md           # Optional (documentation)
```

---

## 📤 Files to Upload to VPS

For your backend server:

```
my-links/analytics/
├── server.js           # ⭐ Core server
├── dashboard.html      # ⭐ Dashboard
├── package.json        # ⭐ Dependencies
├── .env                # ⭐ Configuration (CREATE FROM .env.example)
├── README.md           # Documentation
└── NGINX_SETUP.md      # Reference
```

---

## 🗄️ Database Files

### SQLite Database

| File | Auto-Created | Location |
|------|-------------|----------|
| `analytics.db` | Yes (on first run) | `my-links/analytics/` |

### What It Stores

```sql
-- Clicks table
id, link, timestamp, ip_anon, ip_hash, user_agent

-- Example: 1,Instagram,2026-03-01 10:23:45,192.168.*.*,a1b2c3d4...
```

### Size Reference

- Empty: 32 KB
- 1,000 clicks: ~1 MB
- 100,000 clicks: ~100 MB
- 1,000,000 clicks: ~1 GB

---

## 🔧 Configuration File (.env)

### Template Location
[my-links/analytics/.env.example](./my-links/analytics/.env.example)

### Required Settings

```env
PORT=3000
NODE_ENV=production
FRONTEND_DOMAIN=https://links.example.com
DASHBOARD_PASSWORD=YourSecurePassword123!
```

### Where to Store
```
my-links/analytics/.env    # Keep this secret! Add to .gitignore
```

---

## 🔄 Git Management

### What to Commit

```bash
git add .
git add -f package.json package-lock.json
git add my-links/
git add *.md
git commit -m "Initial commit"
```

### What NOT to Commit

```bash
# These are in .gitignore
node_modules/           # Dependencies (npm install)
analytics.db            # Actual data (never upload)
analytics.db-*          # Backups (never upload)
.env                    # Secrets (never upload)
.DS_Store               # OS files
*.log                   # Log files
```

---

## 📊 File Statistics

### Documentation
```
Total docs:    ~300 pages
Main guide:    ~50 pages
API docs:      ~20 pages
Architecture:  ~50 pages
Config ref:    ~30 pages
Deployment:    ~80 pages
```

### Code
```
Frontend:      ~150 lines (HTML, CSS, JS)
Backend:       ~243 lines (Node.js)
Total code:    ~400 lines
Dependencies:  4 NPM packages
```

### Database
```
Schema:        2 tables (clicks, stats)
Index:         6 columns
Growth:        ~1KB per click
```

---

## 🗺️ Navigation Map

### For Setup
1. Start → [README.md](./README.md)
2. Learn → [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Deploy → [QUICKSTART.md](./QUICKSTART.md)
4. Reference → [DEPLOYMENT.md](./DEPLOYMENT.md)
5. Configure → [CONFIG_REFERENCE.md](./CONFIG_REFERENCE.md)
6. Track → [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

### For Customization
1. Edit links → [links.json](./my-links/links.json)
2. Change look → [style.css](./my-links/style.css)
3. Change content → [index.html](./my-links/index.html)
4. Configure → [.env example](./my-links/analytics/.env.example)

### For API Integration
1. Learn endpoints → [Backend README](./my-links/analytics/README.md)
2. Understand design → [ARCHITECTURE.md](./ARCHITECTURE.md) - API section
3. Reference config → [CONFIG_REFERENCE.md](./CONFIG_REFERENCE.md) - API section

### For Troubleshooting
1. Quick issues → [QUICKSTART.md](./QUICKSTART.md) - Troubleshooting section
2. Production issues → [DEPLOYMENT.md](./DEPLOYMENT.md) - Troubleshooting section
3. Configuration → [CONFIG_REFERENCE.md](./CONFIG_REFERENCE.md) - Common tasks section

---

## 💾 Backup Strategy

### What to Backup

```
CRITICAL (back up weekly):
├── analytics.db                # Your actual data
├── my-links/links.json         # Link configuration
└── my-links/analytics/.env     # Settings (encrypted?)

OPTIONAL (back up monthly):
├── my-links/                   # Code (on GitHub)
└── *.md                        # Documentation
```

### Where to Backup

```
Option 1: Local machine
$ scp root@vps-ip:/var/www/analytics/analytics.db ~/backups/

Option 2: Cloud storage
$ aws s3 cp analytics.db s3://my-backups/

Option 3: Automated (cron)
0 2 * * * cp /var/www/analytics/analytics.db /backups/analytics.db.$(date +%Y%m%d)
```

---

## 🔒 Security Checklist

### Before Going Live

- [ ] `.env` file is NOT in .gitignore (should be!)
- [ ] `DASHBOARD_PASSWORD` is strong (18+ chars, mixed case/numbers/symbols)
- [ ] `FRONTEND_DOMAIN` matches your actual GitHub Pages domain
- [ ] `NGINX_SETUP.md` config updated with your domains
- [ ] SSL certificate is valid (Let's Encrypt)
- [ ] Firewall is enabled on VPS
- [ ] SSH key is used (not password)
- [ ] Database backups are scheduled
- [ ] Nginx CORS headers are restricted

---

## 📞 File Help Quick Links

| If you need help with... | See this file |
|--------------------------|---------------|
| Getting started | [README.md](./README.md) |
| Local testing | [QUICKSTART.md](./QUICKSTART.md) |
| Deployment | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| System design | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Changing settings | [CONFIG_REFERENCE.md](./CONFIG_REFERENCE.md) |
| API endpoints | [Backend README](./my-links/analytics/README.md) |
| Nginx setup | [NGINX_SETUP.md](./my-links/analytics/NGINX_SETUP.md) |
| Tracking progress | [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) |

---

**Everything you need is documented. Good luck! 🚀**
