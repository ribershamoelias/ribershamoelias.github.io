# 📋 Deployment Checklist

Use this checklist to track your progress through deployment.

## Phase 1: Preparation (15 min)

- [ ] Read [README.md](./README.md)
- [ ] Review [ARCHITECTURE.md](./ARCHITECTURE.md)
- [ ] Understand the system design
- [ ] Choose domain name (e.g., example.com)
- [ ] Acquire VPS ($5-20/month) from:
  - DigitalOcean
  - Linode
  - Hetzner
  - AWS Lightsail
  - Or your preferred provider
- [ ] Have SSH access to VPS

## Phase 2: Local Testing (20 min)

- [ ] Clone/download repository
- [ ] Navigate to `my-links/analytics/`
- [ ] Run `npm install`
- [ ] Run `npm start`
- [ ] Server runs on `http://localhost:3000`
- [ ] Test API: `curl http://localhost:3000/api/stats`
- [ ] Open `my-links/index.html` in browser
- [ ] Click on links
- [ ] Check stats: `curl http://localhost:3000/api/stats`
- [ ] All working ✅

## Phase 3: GitHub Pages Setup (20 min)

- [ ] Create GitHub account (if needed)
- [ ] Create public repository for your links page
- [ ] Upload files to repository:
  - [ ] `index.html`
  - [ ] `style.css`
  - [ ] `script.js`
  - [ ] `links.json`
- [ ] Enable GitHub Pages:
  - [ ] Go to Settings → Pages
  - [ ] Select "Deploy from branch"
  - [ ] Choose "main" branch, "root" folder
  - [ ] Click Save
- [ ] Site is live at: `https://username.github.io`
- [ ] Test frontend loads
- [ ] (Optional) Setup custom domain:
  - [ ] Add CNAME to DNS: `links.example.com → username.github.io`
  - [ ] In Settings → Pages → Custom domain: `links.example.com`
  - [ ] Enable HTTPS
- [ ] Frontend is accessible ✅

## Phase 4: VPS Setup (30 min)

- [ ] SSH into VPS: `ssh root@your-vps-ip`
- [ ] Update system:
  - [ ] `apt update && apt upgrade -y`
- [ ] Install Node.js 18:
  - [ ] `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`
  - [ ] `apt install -y nodejs`
  - [ ] Verify: `node --version` (should be v18+)
- [ ] Install Nginx: `apt install -y nginx`
- [ ] Install Certbot: `apt install -y certbot python3-certbot-nginx`
- [ ] Create app directory: `mkdir -p /var/www/analytics`
- [ ] Upload analytics code:
  - [ ] `scp -r my-links/analytics/* root@your-vps-ip:/var/www/analytics/`
- [ ] SSH back into VPS: `ssh root@your-vps-ip`
- [ ] Navigate to app: `cd /var/www/analytics`
- [ ] Install dependencies: `npm install`
- [ ] Create configuration file: `cp .env.example .env`
- [ ] Edit `.env` with your settings:
  - [ ] `PORT=3000`
  - [ ] `NODE_ENV=production`
  - [ ] `FRONTEND_DOMAIN=https://links.example.com` (update domain)
  - [ ] `DASHBOARD_PASSWORD=YourSecurePassword123!` (make it strong!)
- [ ] Test server: `npm start`
- [ ] Verify output:
  - [ ] `✅ Connected to SQLite database`
  - [ ] `🚀 Analytics Server running on http://localhost:3000`
- [ ] Stop server: `Ctrl+C`
- [ ] VPS is ready ✅

## Phase 5: Process Manager (10 min)

- [ ] Install PM2: `npm install -g pm2`
- [ ] Start server with PM2: `pm2 start server.js --name analytics`
- [ ] Configure auto-start: `pm2 startup`
  - [ ] Copy and run the command it outputs
- [ ] Save PM2 config: `pm2 save`
- [ ] Verify running: `pm2 status`
  - [ ] Should show analytics as "online"
- [ ] Check logs: `pm2 logs analytics`
  - [ ] Should show successful startup messages
- [ ] Process manager configured ✅

## Phase 6: Nginx Configuration (15 min)

- [ ] Create Nginx config:
  - [ ] `sudo nano /etc/nginx/sites-available/analytics.example.com`
- [ ] Copy config from [NGINX_SETUP.md](./my-links/analytics/NGINX_SETUP.md)
- [ ] Update these values in the config:
  - [ ] Replace `analytics.example.com` with your domain
  - [ ] Replace `links.example.com` with your frontend domain
  - [ ] SSL certificate paths will be set by certbot
- [ ] Enable the site:
  - [ ] `sudo ln -s /etc/nginx/sites-available/analytics.example.com /etc/nginx/sites-enabled/`
- [ ] Test Nginx config: `sudo nginx -t`
  - [ ] Should show "syntax is ok"
- [ ] Reload Nginx: `sudo systemctl reload nginx`
- [ ] Nginx is configured ✅

## Phase 7: SSL Certificate (10 min)

- [ ] Get SSL certificate from Let's Encrypt:
  - [ ] `sudo certbot certonly --nginx -d analytics.example.com`
- [ ] Answer the prompts:
  - [ ] Email address (for renewal notifications)
  - [ ] Agree to terms
- [ ] Certificate should be saved at:
  - [ ] `/etc/letsencrypt/live/analytics.example.com/`
- [ ] Verify certificate was created:
  - [ ] `sudo certbot certificates`
- [ ] Test auto-renewal (dry run):
  - [ ] `sudo certbot renew --dry-run`
  - [ ] Should succeed without errors
- [ ] Enable certbot timer:
  - [ ] `sudo systemctl enable certbot.timer`
  - [ ] `sudo systemctl start certbot.timer`
- [ ] SSL is configured and auto-renewing ✅

## Phase 8: Firewall Setup (5 min)

- [ ] Configure UFW firewall:
- [ ] `sudo ufw allow 22/tcp` (SSH)
- [ ] `sudo ufw allow 80/tcp` (HTTP)
- [ ] `sudo ufw allow 443/tcp` (HTTPS)
- [ ] `sudo ufw default deny incoming`
- [ ] `sudo ufw enable`
- [ ] Verify: `sudo ufw status`
- [ ] Firewall is configured ✅

## Phase 9: DNS Configuration (5 min)

- [ ] Update DNS records at your registrar:
  - [ ] Create A record: `analytics.example.com → YOUR-VPS-IP`
  - [ ] Or create CNAME if using subdomain under existing domain
- [ ] Wait for DNS propagation (5-30 min):
  - [ ] Test with: `nslookup analytics.example.com`
  - [ ] Should resolve to your VPS IP
- [ ] DNS is configured ✅

## Phase 10: Full System Test (15 min)

- [ ] Test frontend:
  - [ ] Open `https://links.example.com` in browser
  - [ ] Page loads correctly
  - [ ] Links are visible
  - [ ] Click on a link (it may take you somewhere, that's OK)
- [ ] Test API endpoint:
  - [ ] `curl https://analytics.example.com/api/stats`
  - [ ] Should return valid JSON (likely empty array `[]`)
- [ ] Test dashboard access:
  - [ ] Go to `https://analytics.example.com/dashboard`
  - [ ] Browser prompts for password
  - [ ] Enter your `DASHBOARD_PASSWORD` from .env
  - [ ] Dashboard loads (may show "No click data yet")
- [ ] Generate test clicks:
  - [ ] Open frontend in browser
  - [ ] Click on a link
  - [ ] Wait 2-3 seconds
  - [ ] Refresh dashboard
  - [ ] Should see "1 click" recorded
- [ ] Everything works! ✅

## Phase 11: Backup & Monitoring (5 min)

- [ ] Create backup script:
  - [ ] SSH into VPS
  - [ ] `mkdir -p /var/www/analytics/backups`
  - [ ] `cp analytics.db backups/analytics.db.$(date +%Y%m%d_%H%M%S)`
- [ ] Schedule automated backups (crontab):
  - [ ] `crontab -e`
  - [ ] Add: `0 2 * * * cp /var/www/analytics/analytics.db /var/www/analytics/backups/analytics.db.$(date +\%Y\%m\%d)`
  - [ ] Save and exit
- [ ] Test backup runs:
  - [ ] Wait for 2 AM or run manually:
    - [ ] `0 * * * * ...` (every hour for testing)
- [ ] Verify backups exist:
  - [ ] `ls -la /var/www/analytics/backups/`
- [ ] Backup system is ready ✅

## Phase 12: Documentation & Handoff

- [ ] Save important information:
  - [ ] [ ] VPS IP address: _______________
  - [ ] [ ] Frontend domain: _______________
  - [ ] [ ] Backend domain: _______________
  - [ ] [ ] Dashboard password: _______________
  - [ ] [ ] SSH key/password: _______________
- [ ] Create admin notes about:
  - [ ] How to restart server: `pm2 restart analytics`
  - [ ] How to view logs: `pm2 logs analytics`
  - [ ] How to access dashboard: `https://analytics.example.com/dashboard`
  - [ ] How to backup: `cp analytics.db backup.db`
- [ ] Review all documentation:
  - [ ] [README.md](./README.md) - Understand system
  - [ ] [DEPLOYMENT.md](./DEPLOYMENT.md) - For reference
  - [ ] [ARCHITECTURE.md](./ARCHITECTURE.md) - For future enhancements
  - [ ] [CONFIG_REFERENCE.md](./CONFIG_REFERENCE.md) - For changes
- [ ] System is documented ✅

## Daily Operations

### Every Day
- [ ] Check analytics dashboard
- [ ] Verify server is running: `pm2 status`
- [ ] No error messages in logs: `pm2 logs analytics`

### Every Week
- [ ] Backup database manually
- [ ] Review click statistics
- [ ] Check for updates: `apt update`

### Every Month
- [ ] Run system update: `apt upgrade`
- [ ] Verify SSL certificate renews automatically
- [ ] Check disk space: `df -h`
- [ ] Verify database size: `du -h analytics.db`

## Maintenance Tasks

### Restart Server
```bash
pm2 restart analytics
```

### View Logs
```bash
pm2 logs analytics
```

### Backup Database
```bash
cp /var/www/analytics/analytics.db /var/www/analytics/backups/analytics.db.backup
```

### Change Dashboard Password
```bash
# 1. SSH into VPS
# 2. Edit .env
nano /var/www/analytics/.env
# 3. Change DASHBOARD_PASSWORD
# 4. Restart
pm2 restart analytics
```

### Update Code
```bash
cd /var/www/analytics
git pull origin main
npm install
pm2 restart analytics
```

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Server won't start | `pm2 logs analytics` (check errors) |
| CORS error | Update `.env` `FRONTEND_DOMAIN` and restart |
| Dashboard login fails | Check `.env` `DASHBOARD_PASSWORD` is correct |
| Cannot connect to VPS | Check firewall, SSH key permissions |
| SSL certificate error | Run `sudo certbot renew --force-renewal` |
| Database locked | Restart server: `pm2 restart analytics` |
| Out of disk space | Check with `df -h`, archive old data |

## Success Criteria ✅

Your system is successful when:

- ✅ Frontend loads at `https://links.example.com`
- ✅ Links are clickable and work
- ✅ Dashboard loads at `https://analytics.example.com/dashboard`
- ✅ Dashboard shows click counts
- ✅ New clicks appear in real-time
- ✅ HTTPS is working (no SSL errors)
- ✅ Password protection works
- ✅ Backups are happening automatically

---

**Congratulations!** You now have a self-hosted Linktree system with privacy-focused analytics. 🎉

Next steps:
1. Monitor your analytics daily
2. Update links as needed
3. Customize styling/design if desired
4. Consider enhancements (GeoIP, charts, etc.)

---

*Estimated Total Time: 2-3 hours for complete deployment*
