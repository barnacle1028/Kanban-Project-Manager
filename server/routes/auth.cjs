const express = require('express')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const crypto = require('crypto')
const { query } = require('../config/database.cjs')
const {
  authLimiter,
  loginLimiter,
  authenticateToken,
  generateTokens,
  hashPassword,
  verifyPassword,
  logLoginAttempt,
  JWT_SECRET
} = require('../middleware/auth.cjs')
const { 
  generateCaptcha, 
  verifyCaptcha, 
  requireCaptcha 
} = require('../middleware/captcha.cjs')

const router = express.Router()

// Validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('captchaId')
    .notEmpty()
    .withMessage('CAPTCHA ID is required'),
  body('captchaSolution')
    .notEmpty()
    .withMessage('CAPTCHA solution is required')
]

const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('role')
    .optional()
    .isIn(['REP', 'MANAGER'])
    .withMessage('Role must be REP or MANAGER')
]

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
]

// Generate CAPTCHA
router.get('/captcha', authLimiter, generateCaptcha)

// Login endpoint
router.post('/login', 
  loginLimiter,
  loginValidation,
  verifyCaptcha,
  requireCaptcha,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        await logLoginAttempt(
          req.body.email,
          false,
          req.ip,
          req.get('User-Agent'),
          'Validation failed'
        )
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array()
        })
      }

      const { email, password } = req.body

      // Get user with auth info
      const userResult = await query(
        `SELECT id, email, name, role, password_hash, is_active, email_verified, 
                failed_login_attempts, locked_until
         FROM app_user 
         WHERE email = $1`,
        [email]
      )

      if (userResult.rows.length === 0) {
        await logLoginAttempt(email, false, req.ip, req.get('User-Agent'), 'User not found')
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const user = userResult.rows[0]

      // Check if account is active
      if (!user.is_active) {
        await logLoginAttempt(email, false, req.ip, req.get('User-Agent'), 'Account inactive')
        return res.status(401).json({ error: 'Account is deactivated' })
      }

      // Check if email is verified
      if (!user.email_verified) {
        return res.status(401).json({ 
          error: 'Email not verified',
          needsVerification: true
        })
      }

      // Check if account is locked
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        await logLoginAttempt(email, false, req.ip, req.get('User-Agent'), 'Account locked')
        return res.status(401).json({ 
          error: 'Account is locked due to too many failed attempts',
          lockedUntil: user.locked_until
        })
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password_hash)
      
      if (!isValidPassword) {
        // Increment failed attempts
        const newFailedAttempts = user.failed_login_attempts + 1
        let lockUntil = null
        
        // Lock account after 5 failed attempts for 30 minutes
        if (newFailedAttempts >= 5) {
          lockUntil = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
        }

        await query(
          `UPDATE app_user 
           SET failed_login_attempts = $1, locked_until = $2
           WHERE id = $3`,
          [newFailedAttempts, lockUntil, user.id]
        )

        await logLoginAttempt(email, false, req.ip, req.get('User-Agent'), 'Invalid password')
        
        return res.status(401).json({ 
          error: 'Invalid credentials',
          attemptsRemaining: Math.max(0, 5 - newFailedAttempts)
        })
      }

      // Successful login - reset failed attempts and update last login
      await query(
        `UPDATE app_user 
         SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW()
         WHERE id = $1`,
        [user.id]
      )

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user)

      // Store refresh token
      const refreshTokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex')

      await query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
         VALUES ($1, $2, NOW() + INTERVAL '7 days', $3, $4)`,
        [user.id, refreshTokenHash, req.get('User-Agent'), req.ip]
      )

      await logLoginAttempt(email, true, req.ip, req.get('User-Agent'))

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        accessToken,
        refreshToken
      })
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// Refresh token endpoint
router.post('/refresh', authLimiter, async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' })
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET)
    
    // Hash the token to find in database
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex')

    // Check if token exists and is valid
    const tokenResult = await query(
      `SELECT rt.user_id, rt.expires_at, rt.is_revoked,
              u.email, u.name, u.role, u.is_active
       FROM refresh_tokens rt
       JOIN app_user u ON u.id = rt.user_id
       WHERE rt.token_hash = $1`,
      [tokenHash]
    )

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }

    const tokenData = tokenResult.rows[0]

    if (tokenData.is_revoked) {
      return res.status(401).json({ error: 'Refresh token has been revoked' })
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Refresh token expired' })
    }

    if (!tokenData.is_active) {
      return res.status(401).json({ error: 'User account is deactivated' })
    }

    // Generate new tokens
    const user = {
      id: tokenData.user_id,
      email: tokenData.email,
      name: tokenData.name,
      role: tokenData.role
    }

    const newTokens = generateTokens(user)

    // Update last used time for the refresh token
    await query(
      'UPDATE refresh_tokens SET last_used_at = NOW() WHERE token_hash = $1',
      [tokenHash]
    )

    res.json({
      message: 'Token refreshed successfully',
      user,
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken
    })
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }
    console.error('Token refresh error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      const tokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex')

      // Revoke the refresh token
      await query(
        'UPDATE refresh_tokens SET is_revoked = true WHERE token_hash = $1 AND user_id = $2',
        [tokenHash, req.user.id]
      )
    }

    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Change password endpoint
router.post('/change-password',
  authenticateToken,
  changePasswordValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        })
      }

      const { currentPassword, newPassword } = req.body

      // Get current password hash
      const userResult = await query(
        'SELECT password_hash FROM app_user WHERE id = $1',
        [req.user.id]
      )

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Verify current password
      const isValidPassword = await verifyPassword(currentPassword, userResult.rows[0].password_hash)
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' })
      }

      // Check password history (prevent reuse of last 5 passwords)
      const historyResult = await query(
        `SELECT password_hash FROM password_history 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 5`,
        [req.user.id]
      )

      for (const historyRow of historyResult.rows) {
        const isReused = await verifyPassword(newPassword, historyRow.password_hash)
        if (isReused) {
          return res.status(400).json({ 
            error: 'Cannot reuse any of the last 5 passwords' 
          })
        }
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword)

      // Update password
      await query(
        'UPDATE app_user SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [newPasswordHash, req.user.id]
      )

      // Revoke all existing refresh tokens to force re-login
      await query(
        'UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1',
        [req.user.id]
      )

      res.json({ 
        message: 'Password changed successfully. Please log in again.',
        requiresReauth: true
      })
    } catch (error) {
      console.error('Change password error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userResult = await query(
      `SELECT id, name, email, role, is_active, email_verified, 
              last_login_at, created_at, updated_at,
              manager.name as manager_name
       FROM app_user u
       LEFT JOIN app_user manager ON manager.id = u.manager_id
       WHERE u.id = $1`,
      [req.user.id]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(userResult.rows[0])
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router