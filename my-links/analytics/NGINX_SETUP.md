# Nginx Configuration for Analytics Backend

This file should be placed in `/etc/nginx/sites-available/analytics.example.com` on your VPS.

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name analytics.example.com;

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name analytics.example.com;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/analytics.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/analytics.example.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # CORS + Security Headers
    add_header 'Access-Control-Allow-Origin' 'https://links.example.com' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    add_header 'X-Content-Type-Options' 'nosniff' always;
    add_header 'X-Frame-Options' 'DENY' always;
    add_header 'Referrer-Policy' 'strict-origin-when-cross-origin' always;

    # Reverse Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security: Block direct access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

## Installation Steps

1. **Create the config file:**
```bash
sudo nano /etc/nginx/sites-available/analytics.example.com
```

2. **Copy the configuration above and edit:**
   - Replace `analytics.example.com` with your actual domain
   - Replace `links.example.com` with your GitHub Pages domain

3. **Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/analytics.example.com \
  /etc/nginx/sites-enabled/
```

4. **Test Nginx configuration:**
```bash
sudo nginx -t
```

5. **Reload Nginx:**
```bash
sudo systemctl reload nginx
```

6. **Setup SSL Certificate (Let's Encrypt):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d analytics.example.com
```

7. **Auto-renewal:**
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## CORS Origin Configuration

The `Access-Control-Allow-Origin` header restricts API calls to your frontend domain:

```nginx
add_header 'Access-Control-Allow-Origin' 'https://links.example.com' always;
```

Change `https://links.example.com` to your actual GitHub Pages URL.

## Security Considerations

- ✅ HTTPS enforced (HTTP redirects to HTTPS)
- ✅ TLS 1.2+ only
- ✅ CORS restricted to frontend domain
- ✅ X-Frame-Options prevents clickjacking
- ✅ X-Content-Type-Options prevents MIME sniffing
- ✅ All sensitive files (`.git`, `.env`) are blocked

## Troubleshooting

**502 Bad Gateway:** Node.js server is not running
```bash
pm2 status
pm2 start server.js
```

**SSL certificate not found:** Run Let's Encrypt again
```bash
sudo certbot certonly --nginx -d analytics.example.com
```

**CORS errors in browser console:** Update the allowed origin in the Nginx config
