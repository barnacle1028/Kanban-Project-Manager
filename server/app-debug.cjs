// Minimal server for Railway debugging
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3001

console.log('🚀 Starting debug server...')
console.log('Port:', PORT)
console.log('Node ENV:', process.env.NODE_ENV)
console.log('Database URL set:', !!process.env.DATABASE_URL)

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
      'POST /api/auth/login'
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