const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const rateLimit = require('express-rate-limit')
const { query } = require('../config/database.cjs')

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many login attempts, please try again later'
  }
})

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // Check if user still exists and is active
    const result = await query(
      'SELECT id, email, name, role, is_active FROM app_user WHERE id = $1',
      [decoded.userId]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' })
    }

    const user = result.rows[0]
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' })
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' })
    }
    console.error('Token verification error:', error)
    return res.status(500).json({ error: 'Token verification failed' })
  }
}

// Middleware to check user roles
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      })
    }

    next()
  }
}

// Role hierarchy check - Admin > Manager > Rep
const requireMinRole = (minRole) => {
  const roleHierarchy = {
    'REP': 1,
    'MANAGER': 2,
    'ADMIN': 3
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const userLevel = roleHierarchy[req.user.role] || 0
    const requiredLevel = roleHierarchy[minRole] || 0

    if (userLevel < requiredLevel) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: minRole,
        current: req.user.role
      })
    }

    next()
  }
}

// Check if user can access specific resource
const canAccessEngagement = async (req, res, next) => {
  const engagementId = req.params.engagementId || req.body.engagementId
  
  if (!engagementId) {
    return res.status(400).json({ error: 'Engagement ID required' })
  }

  try {
    // Admin can access everything
    if (req.user.role === 'ADMIN') {
      return next()
    }

    // Get engagement with owner and manager info
    const result = await query(`
      SELECT 
        e.id, 
        e.owner_user_id,
        owner.manager_id as owner_manager_id
      FROM engagement e
      JOIN app_user owner ON owner.id = e.owner_user_id
      WHERE e.id = $1
    `, [engagementId])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Engagement not found' })
    }

    const engagement = result.rows[0]

    // Rep can only access their own engagements
    if (req.user.role === 'REP') {
      if (engagement.owner_user_id !== req.user.id) {
        return res.status(403).json({ error: 'Cannot access this engagement' })
      }
    }

    // Manager can access their team's engagements
    if (req.user.role === 'MANAGER') {
      if (engagement.owner_user_id !== req.user.id && 
          engagement.owner_manager_id !== req.user.id) {
        return res.status(403).json({ error: 'Cannot access this engagement' })
      }
    }

    next()
  } catch (error) {
    console.error('Error checking engagement access:', error)
    res.status(500).json({ error: 'Failed to verify access permissions' })
  }
}

// Generate JWT tokens
const generateTokens = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  }

  const accessToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN 
  })

  const refreshToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: REFRESH_TOKEN_EXPIRES_IN 
  })

  return { accessToken, refreshToken }
}

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Verify password
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

// Log login attempt
const logLoginAttempt = async (email, success, ip, userAgent, failureReason = null) => {
  try {
    await query(
      `INSERT INTO login_attempts (email, ip_address, user_agent, success, failure_reason)
       VALUES ($1, $2, $3, $4, $5)`,
      [email, ip, userAgent, success, failureReason]
    )
  } catch (error) {
    console.error('Failed to log login attempt:', error)
  }
}

module.exports = {
  authLimiter,
  loginLimiter,
  authenticateToken,
  requireRole,
  requireMinRole,
  canAccessEngagement,
  generateTokens,
  hashPassword,
  verifyPassword,
  logLoginAttempt,
  JWT_SECRET
}