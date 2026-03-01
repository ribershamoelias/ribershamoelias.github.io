const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration from environment
const FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN || 'http://localhost:5000';
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'admin123';
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// Helper: Anonymize IP address (keep first 2 octets)
function anonymizeIP(ip) {
  if (!ip) return 'unknown';
  const octets = ip.split('.');
  if (octets.length === 4) {
    return `${octets[0]}.${octets[1]}.*.* `;
  }
  return 'unknown';
}

// Helper: Hash IP for analytics (without exposing it)
function hashIP(ip) {
  if (!ip) return 'unknown';
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

// CORS configuration - only allow frontend domain
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from the configured frontend domain
    if (!origin || origin === FRONTEND_DOMAIN) {
      callback(null, true);
    } else if (ENVIRONMENT === 'development') {
      // In development, allow localhost variations
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// SQL Datenbank initialisieren
const db = new sqlite3.Database(path.join(__dirname, 'analytics.db'), (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

// Database initialization
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_hash TEXT,
      ip_anon TEXT,
      user_agent TEXT
    )
  `, (err) => {
    if (err) console.error('Error creating clicks table:', err);
    else console.log('✅ Clicks table initialized');
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link TEXT NOT NULL,
      click_date DATE NOT NULL,
      click_count INTEGER DEFAULT 0,
      UNIQUE(link, click_date)
    )
  `, (err) => {
    if (err) console.error('Error creating stats table:', err);
    else console.log('✅ Stats table initialized');
  });
}

// API ENDPOINTS

// 1. POST /api/click - Track a click event
app.post('/api/click', (req, res) => {
  const { link } = req.body;
  
  if (!link) {
    return res.status(400).json({ error: 'Link name is required' });
  }

  // Get client IP (handle proxy headers)
  const clientIP = 
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.connection.remoteAddress ||
    'unknown';

  const userAgent = req.get('User-Agent') || 'unknown';
  const ipHash = hashIP(clientIP);
  const ipAnon = anonymizeIP(clientIP);

  db.run(
    'INSERT INTO clicks (link, ip_hash, ip_anon, user_agent) VALUES (?, ?, ?, ?)',
    [link, ipHash, ipAnon, userAgent],
    function(err) {
      if (err) {
        console.error('Error saving click:', err);
        return res.status(500).json({ error: 'Failed to save click' });
      }
      res.status(200).json({ success: true, id: this.lastID });
    }
  );
});

// 2. GET /api/stats - Get aggregated statistics
app.get('/api/stats', (req, res) => {
  db.all(
    `SELECT link, COUNT(*) as count 
     FROM clicks 
     GROUP BY link 
     ORDER BY count DESC`,
    (err, rows) => {
      if (err) {
        console.error('Error fetching stats:', err);
        return res.status(500).json({ error: 'Failed to fetch stats' });
      }
      res.json(rows || []);
    }
  );
});

// 3. GET /api/clicks - Get detailed click history (last 100)
app.get('/api/clicks', (req, res) => {
  db.all(
    `SELECT link, timestamp, ip_anon, user_agent 
     FROM clicks 
     ORDER BY timestamp DESC 
     LIMIT 100`,
    (err, rows) => {
      if (err) {
        console.error('Error fetching clicks:', err);
        return res.status(500).json({ error: 'Failed to fetch clicks' });
      }
      res.json(rows || []);
    }
  );
});

// 4. GET /api/stats/:link - Get stats for a specific link
app.get('/api/stats/:link', (req, res) => {
  const { link } = req.params;
  
  db.get(
    `SELECT link, COUNT(*) as count 
     FROM clicks 
     WHERE link = ? 
     GROUP BY link`,
    [link],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch stats' });
      }
      res.json(row || { link, count: 0 });
    }
  );
});

// DASHBOARD AUTHENTICATION
const basicAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  
  if (!auth) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Analytics Dashboard"');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const [scheme, credentials] = auth.split(' ');
  if (scheme !== 'Basic') {
    return res.status(401).json({ error: 'Invalid authentication scheme' });
  }

  const [username, password] = Buffer.from(credentials, 'base64').toString().split(':');
  
  // Simple auth: username doesn't matter, just password
  if (password !== DASHBOARD_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  next();
};

// Protected dashboard endpoint
app.get('/dashboard', basicAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Protected reset endpoint
app.delete('/api/reset', basicAuth, (req, res) => {
  db.run('DELETE FROM clicks', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to reset data' });
    }
    console.log('⚠️ All analytics data has been cleared');
    res.json({ success: true, message: 'All data cleared' });
  });
});

// Server startup
app.listen(PORT, () => {
  console.log(`🚀 Analytics Server running on http://localhost:${PORT}`);
  console.log(`📡 Frontend domain: ${FRONTEND_DOMAIN}`);
  console.log(`🔒 Environment: ${ENVIRONMENT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️ Shutting down gracefully...');
  db.close((err) => {
    if (err) console.error('Error closing database:', err);
    else console.log('✅ Database closed');
    process.exit(0);
  });
});
