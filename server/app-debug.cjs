// Minimal server for Railway debugging
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3001

console.log('🚀 Starting debug server...')
console.log('Port:', PORT)
console.log('Node ENV:', process.env.NODE_ENV)
console.log('Database URL set:', !!process.env.DATABASE_URL)

// Basic middleware
app.use(cors())
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