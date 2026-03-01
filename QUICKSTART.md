# 🚀 Quick Start Guide

## 5-Minute Setup (Local Testing)

### Step 1: Install Dependencies
```bash
cd my-links/analytics
npm install
```

### Step 2: Configure
```bash
cp .env.example .env
# Edit .env if needed (optional for testing)
nano .env
```

### Step 3: Start Server
```bash
npm start
```

You should see:
```
✅ Connected to SQLite database
✅ Clicks table initialized
✅ Stats table initialized
🚀 Analytics Server running on http://localhost:3000
```

### Step 4: Test the API
```bash
# In another terminal:
curl http://localhost:3000/api/stats
# Should return: []
```

### Step 5: Open Frontend
1. Open a browser
2. Go to `file:///path/to/my-links/index.html`
3. Click on a link
4. Check stats: `curl http://localhost:3000/api/stats`

---

## Production Deployment (45 minutes)

### Prerequisites
- VPS with Ubuntu 20.04+ (€5/month from Hetzner, DigitalOcean, or Linode)
- Domain name (example.com)
- SSH access to VPS

### Step 1: Get Your VPS IP
```bash
# You should have: 192.168.1.100 (example)
ping your-domain.com
# or check email from VPS provider
```

### Step 2: Initial VPS Setup
```bash
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install Nginx & Certbot
apt install -y nginx certbot python3-certbot-nginx

# Create app directory
mkdir -p /var/www/analytics
cd /var/www/analytics
npm init -y
npm install express sqlite3 cors dotenv
```

### Step 3: Copy Your Code
```bash
# From your local machine:
scp -r my-links/analytics/* root@your-vps-ip:/var/www/analytics/
```

Or use Git:
```bash
# On VPS:
cd /var/www/analytics
git clone <your-repo> .
npm install
```

### Step 4: Configure Production
```bash
# On VPS:
cd /var/www/analytics
nano .env
```

Set these values:
```env
PORT=3000
NODE_ENV=production
FRONTEND_DOMAIN=https://links.your-domain.com
DASHBOARD_PASSWORD=ChangeMeToSomethingStrong123!
```

### Step 5: Setup Process Manager
```bash
npm install -g pm2

# Start server
pm2 start server.js --name analytics

# Make it auto-start on reboot
pm2 startup
pm2 save

# Verify
pm2 status
```

### Step 6: Setup Nginx
```bash
# Create config file
sudo nano /etc/nginx/sites-available/analytics.your-domain.com
```

Paste this (update domain names):
```nginx
server {
    listen 80;
    server_name analytics.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name analytics.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/analytics.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/analytics.your-domain.com/privkey.pem;

    add_header 'Access-Control-Allow-Origin' 'https://links.your-domain.com' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, DELETE, OPTIONS' always;
    add_header 'X-Content-Type-Options' 'nosniff' always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and test:
```bash
sudo ln -s /etc/nginx/sites-available/analytics.your-domain.com \
  /etc/nginx/sites-enabled/

sudo nginx -t
sudo systemctl reload nginx
```

### Step 7: Get SSL Certificate
```bash
sudo certbot certonly --nginx -d analytics.your-domain.com
```

Answer the prompts. Your certificate is now at:
```
/etc/letsencrypt/live/analytics.your-domain.com/
```

### Step 8: Verify Nginx Config
Update the SSL paths in your Nginx config that certbot created. Then:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 9: Setup Frontend
Push your code to GitHub and configure GitHub Pages:
1. Create repository
2. Push `index.html`, `style.css`, `script.js`, `links.json`
3. Go to Settings → Pages
4. Enable GitHub Pages from main branch

Update `script.js`:
```javascript
const ANALYTICS_URL = 'https://analytics.your-domain.com';
```

### Step 10: Test Everything
```bash
# Test API
curl https://analytics.your-domain.com/api/stats

# Test dashboard
# Open: https://analytics.your-domain.com/dashboard
# Login with password from .env
```

---

## Daily Operations

### Check Server Status
```bash
# SSH into VPS
ssh root@your-vps-ip

# View server logs
pm2 logs analytics

# Monitor resources
htop
```

### View Dashboard
```
https://analytics.your-domain.com/dashboard
Username: (any)
Password: (from .env)
```

### Backup Database
```bash
# On VPS
cd /var/www/analytics
cp analytics.db analytics.db.backup.$(date +%Y%m%d)
```

### Update Code
```bash
# On VPS
cd /var/www/analytics
git pull origin main
npm install
pm2 restart analytics
```

---

## Troubleshooting

### Server won't start
```bash
pm2 logs analytics
# Check console error messages
```

### CORS error in browser console
Edit `.env`:
```
FRONTEND_DOMAIN=https://links.your-domain.com
```

Make sure `links.your-domain.com` is correct.

### SSL certificate error
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

### Can't access dashboard
Check password is correct:
```bash
# Check .env file
grep DASHBOARD_PASSWORD /var/www/analytics/.env
```

### Database getting too large
Check size:
```bash
du -h /var/www/analytics/analytics.db
```

Archive old data if necessary:
```bash
sqlite3 analytics.db "SELECT COUNT(*) FROM clicks;"
```

---

## Next Steps

1. ✅ Set up local testing environment
2. ✅ Deploy to VPS
3. ✅ Configure domains & SSL
4. ✅ Test the full system
5. 🔜 Monitor analytics dashboard daily
6. 🔜 Backup database weekly
7. 🔜 Keep system updated:
   ```bash
   ssh root@your-vps-ip
   apt update && apt upgrade -y
   ```

---

## Support Resources

- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- See [NGINX_SETUP.md](./my-links/analytics/NGINX_SETUP.md) for Nginx details

Good luck! 🚀
