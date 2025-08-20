const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

console.log('🚀 Starting Railway server...')
console.log('Port:', PORT)
console.log('Node ENV:', process.env.NODE_ENV)

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Basic middleware
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api', generalLimiter)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  })
})

// Test database connection
app.get('/api/test', async (req, res) => {
  try {
    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
    
    const result = await pool.query('SELECT NOW() as timestamp, current_database() as database')
    await pool.end()
    
    res.json({ 
      status: 'Database connected successfully', 
      timestamp: result.rows[0].timestamp,
      database: result.rows[0].database,
      connection: 'Supabase PostgreSQL'
    })
  } catch (error) {
    console.error('Database connection error:', error)
    res.status(500).json({ 
      error: 'Database connection failed', 
      details: error.message,
      hint: 'Check DATABASE_URL environment variable'
    })
  }
})

// Basic auth routes without complex path-to-regexp patterns
app.get('/api/auth/captcha', async (req, res) => {
  try {
    const svgCaptcha = require('svg-captcha')
    const crypto = require('crypto')
    
    const captcha = svgCaptcha.create({
      size: 5,
      noise: 2,
      color: true,
      background: '#f0f0f0',
      width: 200,
      height: 80,
      fontSize: 50
    })
    
    const captchaId = crypto.randomBytes(32).toString('hex')
    
    // In production, you'd store this in Redis or database
    // For now, we'll just return it for testing
    res.json({
      captchaId,
      captchaSvg: captcha.data,
      // Don't send solution in production!
      solution: process.env.NODE_ENV === 'development' ? captcha.text : undefined
    })
  } catch (error) {
    console.error('CAPTCHA generation error:', error)
    res.status(500).json({ error: 'Failed to generate CAPTCHA' })
  }
})

// Simple login endpoint for testing
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }
    
    // Simple test response
    res.json({
      message: 'Authentication endpoint working',
      email,
      note: 'Full authentication will be implemented after basic deployment works'
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    availableEndpoints: [
      'GET /health',
      'GET /api/test', 
      'GET /api/auth/captcha',
      'POST /api/auth/login'
    ]
  })
})

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error)
  
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...')
  process.exit(0)
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`)
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🗄️ Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`)
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
})

module.exports = app