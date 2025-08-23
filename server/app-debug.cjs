// Minimal server for Railway debugging
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3001

console.log('🚀 Starting debug server v2...')
console.log('Port:', PORT)
console.log('Node ENV:', process.env.NODE_ENV)
console.log('Database URL set:', !!process.env.DATABASE_URL)
console.log('🔥 API endpoints loaded!')

// CORS configuration for kanbanpm.com
app.use(cors({
  origin: ['https://kanbanpm.com', 'https://www.kanbanpm.com', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}))
app.use(express.json())

// Test routes
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Railway deployment successful!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  })
})

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  })
})

app.get('/env-check', (req, res) => {
  res.json({
    port: PORT,
    nodeEnv: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasJwtSecret: !!process.env.JWT_SECRET
  })
})

// Load the engagement routes
try {
  const engagementRoutes = require('./routes/engagements.cjs')
  app.use('/api/engagements', engagementRoutes)
  console.log('✅ Engagement routes loaded successfully')
} catch (error) {
  console.error('❌ Failed to load engagement routes:', error.message)
}

// Basic API endpoints for frontend
app.get('/api/auth/captcha', (req, res) => {
  res.json({
    captchaId: 'debug-123',
    captchaSvg: '<svg>Debug CAPTCHA</svg>',
    solution: 'DEBUG'
  })
})

app.post('/api/auth/login', (req, res) => {
  res.json({
    message: 'Debug login endpoint working',
    received: req.body
  })
})

// Database setup endpoint
app.post('/api/setup-database', async (req, res) => {
  try {
    const { Pool } = require('pg')
    const fs = require('fs')
    const path = require('path')
    
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'DATABASE_URL not configured' })
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    // Read and execute migration
    const migrationPath = path.join(__dirname, '../migrations/001_add_authentication.sql')
    let migrationSQL = ''
    
    try {
      migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    } catch (err) {
      // If file doesn't exist, create basic schema
      migrationSQL = `
        -- Basic authentication tables
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          role VARCHAR(50) DEFAULT 'REP',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS refresh_tokens (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(255) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create admin user if not exists
        INSERT INTO users (email, password_hash, name, role) 
        VALUES ('admin@kanbanpm.com', '$2b$12$dummy.hash.for.demo', 'System Admin', 'ADMIN')
        ON CONFLICT (email) DO NOTHING;
      `
    }

    await pool.query(migrationSQL)
    await pool.end()

    res.json({
      success: true,
      message: 'Database schema created successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database setup error:', error)
    res.status(500).json({
      error: 'Database setup failed',
      details: error.message
    })
  }
})

// List all available endpoints
app.get('/api', (req, res) => {
  res.json({
    message: 'Kanban API - Debug Mode',
    endpoints: [
      'GET /',
      'GET /health', 
      'GET /env-check',
      'GET /api',
      'GET /api/auth/captcha',
      'POST /api/auth/login',
      'POST /api/setup-database',
      'GET /api/engagements',
      'POST /api/engagements',
      'GET /api/engagements/:id',
      'PATCH /api/engagements/:id',
      'DELETE /api/engagements/:id',
      'GET /api/engagements/reps'
    ],
    timestamp: new Date().toISOString()
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Debug server running on port ${PORT}`)
  console.log(`🌐 Access at: http://localhost:${PORT}`)
})

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})