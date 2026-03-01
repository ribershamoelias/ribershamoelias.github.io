# 🚀 Self-Hosted Linktree System - Deployment Guide

A privacy-first, self-hosted "Linktree-like" page with custom analytics backend.

## System Overview

```
┌─────────────────────────────┐
│  GitHub Pages               │
│  https://links.example.com  │  ← Static frontend
│  (index.html, links.json)   │
└──────────────┬──────────────┘
               │ POST /api/click
               │ (CORS allowed)
               ↓
┌─────────────────────────────────┐
│  Your VPS (Node.js + SQLite)    │
│  https://analytics.example.com  │  ← Analytics backend
│  (Express server on port 3000)  │
│  Behind Nginx reverse proxy     │
└─────────────────────────────────┘
```

## Part 1: Frontend Setup (GitHub Pages)

### 1.1 Create GitHub Repository

```bash
# Create a new public repository named: <your-username>.github.io
# or create a repo and enable GitHub Pages
```

### 1.2 Upload Files to GitHub

```bash
git init
git add index.html style.css script.js links.json
git branch -M main
git remote add origin https://github.com/<your-username>/links.github.io.git
git commit -m "Initial commit: Linktree frontend"
git push -u origin main
```

### 1.3 Configure GitHub Pages

1. Go to repository **Settings** → **Pages**
2. Select **Deploy from branch**
3. Choose **main** branch and **root** folder
4. Click **Save**
5. Your site is now live at `https://<your-username>.github.io`

### 1.4 Custom Domain (Optional)

1. In **Settings** → **Pages**
2. Enter your custom domain: `links.example.com`
3. Add DNS **CNAME** record pointing to GitHub Pages:
   ```
   links.example.com  CNAME  <your-username>.github.io
   ```
4. Enable HTTPS (GitHub provides free SSL)

### 1.5 Update Frontend Code

Edit `script.js` and set your analytics backend domain:

```javascript
const ANALYTICS_URL = 'https://analytics.example.com';
```

## Part 2: Backend Setup (VPS)

### 2.1 VPS Requirements

- Ubuntu 20.04+ or similar Linux
- Node.js 18+
- OpenSSH (for access)
- 512MB+ RAM minimum

### 2.2 Initial VPS Setup

```bash
# Update system
ssh root@your-vps-ip
apt update && apt upgrade -y

# Install Node.js (v18 LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install Nginx
apt install -y nginx

# Install certbot for SSL
apt install -y certbot python3-certbot-nginx

# Create app directory
mkdir -p /var/www/analytics
cd /var/www/analytics
```

### 2.3 Deploy Analytics Backend

```bash
# Copy your code to the server
scp -r analytics/* root@your-vps-ip:/var/www/analytics/

# SSH into VPS
ssh root@your-vps-ip
cd /var/www/analytics

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=3000
NODE_ENV=production
FRONTEND_DOMAIN=https://links.example.com
DASHBOARD_PASSWORD=YourSecurePasswordHere123!
EOF

# Test the server
npm start
```

Press `Ctrl+C` to stop.

### 2.4 Setup Process Manager (PM2)

PM2 keeps your Node.js server running and auto-restarts it.

```bash
# Install PM2 globally
npm install -g pm2

# Start server with PM2
pm2 start server.js --name analytics

# Make it auto-start on reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs analytics
```

### 2.5 Setup Nginx Reverse Proxy

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/analytics.example.com
```

**Copy the configuration from [NGINX_SETUP.md](NGINX_SETUP.md)**

Then enable it:

```bash
sudo ln -s /etc/nginx/sites-available/analytics.example.com \
  /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 2.6 Setup SSL with Let's Encrypt

```bash
# Get SSL certificate
sudo certbot certonly --nginx -d analytics.example.com

# Test renewal
sudo certbot renew --dry-run

# Auto-renewal is automatic via certbot.timer
sudo systemctl status certbot.timer
```

### 2.7 Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Part 3: Configuration

### 3.1 Environment Variables

Create `.env` file in analytics directory:

```env
# Server
PORT=3000
NODE_ENV=production

# Frontend CORS
FRONTEND_DOMAIN=https://links.example.com

# Dashboard authentication
DASHBOARD_PASSWORD=YourSecurePasswordHere123!
```

### 3.2 Update Frontend

In your GitHub Pages repository, update `script.js`:

```javascript
// Change this line:
const ANALYTICS_URL = 'https://analytics.example.com';
```

Update `links.json` with your actual links:

```json
[
  { "title": "Instagram", "url": "https://instagram.com/yourprofile" },
  { "title": "Portfolio", "url": "https://yourwebsite.com" },
  { "title": "Email", "url": "mailto:you@example.com" }
]
```

## Part 4: Using the System

### 4.1 Accessing the Dashboard

Navigate to: `https://analytics.example.com/dashboard`

Enter your password (from `.env` file).

### 4.2 Viewing Analytics

The dashboard shows:
- **Total clicks** across all links
- **Clicks per link** with progress bars
- **Recent clicks** with timestamps and anonymized IPs
- **Auto-refresh** (updates every 5 seconds)

### 4.3 API Access

**Track a click** (called automatically from frontend):
```bash
curl -X POST https://analytics.example.com/api/click \
  -H "Content-Type: application/json" \
  -d '{"link": "Instagram"}'
```

**Get statistics:**
```bash
curl https://analytics.example.com/api/stats
```

**Get click history:**
```bash
curl https://analytics.example.com/api/clicks
```

## Part 5: Maintenance

### 5.1 View Server Logs

```bash
pm2 logs analytics
```

### 5.2 Restart Server

```bash
pm2 restart analytics
```

### 5.3 Update Backend Code

```bash
cd /var/www/analytics
git pull origin main  # if using Git
npm install
pm2 restart analytics
```

### 5.4 Database Backup

```bash
# Backup SQLite database
cp analytics.db analytics.db.backup.$(date +%Y%m%d_%H%M%S)

# Upload to safe location
scp root@your-vps-ip:/var/www/analytics/analytics.db ~/backups/
```

### 5.5 Monitor Disk Space

```bash
df -h
du -sh /var/www/analytics/
```

## Part 6: Security Best Practices

### 6.1 Strong Dashboard Password

Use a strong, unique password in `.env`:
```bash
# Generate a secure password
openssl rand -base64 32
```

### 6.2 Restrict Admin Access

Consider adding IP whitelisting to Nginx:
```nginx
location /dashboard {
    allow 192.168.1.0/24;  # Your home network
    deny all;
}
```

### 6.3 Regular Backups

```bash
# Backup database daily
0 2 * * * cp /var/www/analytics/analytics.db /var/www/analytics/backups/analytics.db.$(date +\%Y\%m\%d)
```

Add this to crontab: `crontab -e`

### 6.4 Monitor Server

```bash
# Install monitoring tools
apt install -y htop

# Check memory and CPU usage
htop
```

## Part 7: Troubleshooting

### Backend not responding
```bash
# Check if server is running
pm2 status

# Restart
pm2 restart analytics

# Check logs
pm2 logs analytics
```

### CORS errors in browser
1. Check Nginx config has correct `Access-Control-Allow-Origin`
2. Verify frontend domain matches `.env` `FRONTEND_DOMAIN`

### SSL certificate issues
```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal
```

### Database locked
```bash
# Restart server (closes DB connections)
pm2 restart analytics
```

## Part 8: Future Enhancements

The system is designed to be extensible:

- ✅ Add GeoIP tracking
- ✅ Export analytics to CSV
- ✅ Advanced charts and graphs
- ✅ Click-through rate calculations
- ✅ Mobile app analytics integration
- ✅ Email reports
- ✅ Multi-user accounts

## Support

For issues:
1. Check `pm2 logs analytics`
2. Review Nginx error log: `sudo tail -f /var/log/nginx/error.log`
3. Test API directly: `curl https://analytics.example.com/api/stats`

---

**Privacy First** 🔒  
No cookies. No external trackers. No third-party analytics.  
Your data stays on **your** server.
