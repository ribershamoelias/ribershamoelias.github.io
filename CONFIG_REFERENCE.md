# Configuration Reference

Quick reference for all configuration options.

## Backend Configuration (.env)

### Required Settings

| Setting | Example | Description |
|---------|---------|-------------|
| `PORT` | `3000` | Server port (keep 3000 for Nginx proxy) |
| `NODE_ENV` | `production` | Environment (development/production) |
| `FRONTEND_DOMAIN` | `https://links.example.com` | Your GitHub Pages domain (for CORS) |
| `DASHBOARD_PASSWORD` | `SecurePassword123!` | Password to access dashboard |

### Example .env File

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# CORS - Your GitHub Pages Domain
FRONTEND_DOMAIN=https://links.example.com

# Dashboard Authentication
DASHBOARD_PASSWORD=ChangeMeToSomethingStrong123!

# Optional: Logging
LOG_LEVEL=info
```

## Frontend Configuration (script.js)

### Analytics URL

Update this line in `script.js`:

```javascript
const ANALYTICS_URL = 'https://analytics.example.com';
```

**For development:**
```javascript
const ANALYTICS_URL = 'http://localhost:3000';
```

**For production:**
```javascript
const ANALYTICS_URL = 'https://analytics.your-domain.com';
```

## Nginx Configuration

### Key Settings to Update

```nginx
# 1. Your domain
server_name analytics.YOUR-DOMAIN.com;

# 2. SSL certificate paths (auto-set by certbot)
ssl_certificate /etc/letsencrypt/live/analytics.YOUR-DOMAIN.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/analytics.YOUR-DOMAIN.com/privkey.pem;

# 3. Your frontend domain (for CORS)
add_header 'Access-Control-Allow-Origin' 'https://links.YOUR-DOMAIN.com' always;

# 4. Node.js server location
proxy_pass http://localhost:3000;
```

See [NGINX_SETUP.md](./my-links/analytics/NGINX_SETUP.md) for full config.

## Frontend Links (links.json)

```json
[
  {
    "title": "Instagram",
    "url": "https://instagram.com/yourprofile"
  },
  {
    "title": "Portfolio",
    "url": "https://yourportfolio.com"
  },
  {
    "title": "Email",
    "url": "mailto:your@email.com"
  }
]
```

## Database Configuration

SQLite database is stored at:
```
/var/www/analytics/analytics.db
```

Default settings:
- **Location**: Relative to server.js
- **Size limit**: None (SQLite adapts)
- **Backup**: Automatic suggested backup = daily

## Environment Variables

### Recommended Values by Environment

#### Development
```env
PORT=3000
NODE_ENV=development
FRONTEND_DOMAIN=http://localhost:8000
DASHBOARD_PASSWORD=admin123
```

#### Production
```env
PORT=3000
NODE_ENV=production
FRONTEND_DOMAIN=https://links.example.com
DASHBOARD_PASSWORD=YourSecurePassword123!
```

## Security Settings

### SSL/TLS Configuration

```
✅ Protocol Versions: TLSv1.2, TLSv1.3
✅ Cipher Suites: HIGH:!aNULL:!MD5
✅ Certificate: Let's Encrypt (auto-renewing)
✅ HSTS: Recommended (add if needed)
```

Add to Nginx for HSTS:
```nginx
add_header 'Strict-Transport-Security' 'max-age=31536000; includeSubDomains' always;
```

### CORS Settings

```
✅ Allowed Origin: Your frontend domain only
✅ Allowed Methods: GET, POST, DELETE, OPTIONS
✅ Allowed Headers: Content-Type, Authorization
❌ Credentials: Not used (no cookies)
```

### Authentication

- **Dashboard**: HTTP Basic Auth (username: any, password: `.env`)
- **API Reset**: HTTP Basic Auth protected
- **Public API**: Open access (POST /api/click, GET /api/stats)

## Scaling Configuration

### For Small Traffic (< 100 clicks/day)

```env
# 5MB VPS is sufficient
PORT=3000
NODE_ENV=production
```

### For Medium Traffic (100-10,000 clicks/day)

```env
# 20MB VPS recommended
PORT=3000
NODE_ENV=production
# Add caching headers in Nginx if needed
```

### For High Traffic (10,000+ clicks/day)

Consider:
- Larger VPS (1GB+)
- Add Redis caching layer
- Or migrate to PostgreSQL

## Monitoring Configuration

### PM2 Settings

```bash
# Start server
pm2 start server.js --name analytics

# Auto-restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
pm2 logs
```

### Backup Schedule

Suggested automated backup (crontab):
```bash
# Daily backup at 2 AM
0 2 * * * cp /var/www/analytics/analytics.db /backup/analytics.db.$(date +\%Y\%m\%d)
```

## Database Schema Configuration

### Clicks Table

```sql
CREATE TABLE clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_hash TEXT,
  ip_anon TEXT,
  user_agent TEXT
);
```

### Create Index (for better performance with large datasets)

```sql
CREATE INDEX idx_link ON clicks(link);
CREATE INDEX idx_timestamp ON clicks(timestamp);
```

## API Configuration

### Public Endpoints (No Auth Required)

```
POST   /api/click
GET    /api/stats
GET    /api/stats/:link
GET    /api/clicks
```

### Protected Endpoints (HTTP Basic Auth)

```
GET    /dashboard
DELETE /api/reset
```

### Authentication Format

```bash
curl -u "username:password" https://analytics.example.com/dashboard
```

*Note: Username doesn't matter, only password.*

## Firewall Configuration

### Recommended Port Settings

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP (redirects to HTTPS)
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Block everything else
sudo ufw default deny incoming

# Enable firewall
sudo ufw enable
```

## Domain Configuration

### DNS Records Required

```
Type    Name                      Value
A       analytics.example.com     YOUR-VPS-IP
A       links.example.com         GitHub Pages IP
CNAME   www                       example.com
```

### GitHub Pages Custom Domain

1. Register domain (e.g., example.com)
2. Add CNAME record: `links.example.com` → `username.github.io`
3. In GitHub Settings → Pages → Custom domain: `links.example.com`
4. Enable HTTPS (GitHub provides SSL)

### Analytics Backend Domain

1. If using same registrar:
   - Add A record: `analytics.example.com` → `YOUR-VPS-IP`

2. If using different registrar:
   - Update nameservers appropriately

## Certificate Renewal

### Automatic (Recommended)

```bash
# Certbot handles automatically
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Manual Check

```bash
# Test renewal
sudo certbot renew --dry-run

# List certificates
sudo certbot certificates

# Renew now
sudo certbot renew --force-renewal
```

## Performance Tuning

### Nginx Buffer Settings

Add to Nginx config if needed:
```nginx
client_body_buffer_size 1M;
client_max_body_size 1M;
```

### Node.js Memory Limit

If server runs out of memory:
```bash
node --max-old-space-size=512 server.js
```

### Database Query Optimization

For large datasets (1M+ clicks):
1. Add indexes (see Database Schema section)
2. Consider archiving old data
3. Or migrate to PostgreSQL

## Common Configuration Tasks

### Change Dashboard Password

1. SSH into VPS
2. Edit `.env`:
   ```bash
   nano /var/www/analytics/.env
   # Change DASHBOARD_PASSWORD
   ```
3. Restart server:
   ```bash
   pm2 restart analytics
   ```

### Change Frontend Domain

1. Update .env:
   ```
   FRONTEND_DOMAIN=https://mynewdomain.com
   ```
2. Update Nginx:
   ```
   Access-Control-Allow-Origin: https://mynewdomain.com
   ```
3. Restart both:
   ```bash
   pm2 restart analytics
   sudo systemctl reload nginx
   ```

### Move to Different VPS

1. Backup database:
   ```bash
   scp root@old-vps:/var/www/analytics/analytics.db ~/analytics.db
   ```
2. Setup new VPS (follow [QUICKSTART.md](./QUICKSTART.md))
3. Upload database:
   ```bash
   scp ~/analytics.db root@new-vps:/var/www/analytics/
   ```
4. Restart:
   ```bash
   ssh root@new-vps
   pm2 restart analytics
   ```

---

*Last updated: March 2026*
