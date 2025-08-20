const svgCaptcha = require('svg-captcha')
const crypto = require('crypto')

// Store captcha solutions in memory with expiration
// In production, use Redis or database
const captchaStore = new Map()

// Clean up expired captchas every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of captchaStore.entries()) {
    if (value.expires < now) {
      captchaStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

// Generate CAPTCHA
const generateCaptcha = (req, res) => {
  try {
    // Create captcha
    const captcha = svgCaptcha.create({
      size: 5, // 5 characters
      noise: 2, // noise level
      color: true, // use colors
      background: '#f0f0f0',
      width: 200,
      height: 80,
      fontSize: 50
    })

    // Generate unique ID for this captcha
    const captchaId = crypto.randomBytes(32).toString('hex')
    
    // Store solution with expiration (5 minutes)
    captchaStore.set(captchaId, {
      solution: captcha.text.toLowerCase(),
      expires: Date.now() + (5 * 60 * 1000),
      attempts: 0
    })

    // Return captcha image and ID
    res.json({
      captchaId,
      captchaSvg: captcha.data
    })
  } catch (error) {
    console.error('Error generating captcha:', error)
    res.status(500).json({ error: 'Failed to generate captcha' })
  }
}

// Verify CAPTCHA
const verifyCaptcha = (req, res, next) => {
  const { captchaId, captchaSolution } = req.body

  if (!captchaId || !captchaSolution) {
    return res.status(400).json({ 
      error: 'CAPTCHA ID and solution are required' 
    })
  }

  const stored = captchaStore.get(captchaId)
  
  if (!stored) {
    return res.status(400).json({ 
      error: 'CAPTCHA expired or invalid' 
    })
  }

  // Check if expired
  if (stored.expires < Date.now()) {
    captchaStore.delete(captchaId)
    return res.status(400).json({ 
      error: 'CAPTCHA expired' 
    })
  }

  // Increment attempts
  stored.attempts++

  // Limit attempts per captcha
  if (stored.attempts > 3) {
    captchaStore.delete(captchaId)
    return res.status(400).json({ 
      error: 'Too many CAPTCHA attempts' 
    })
  }

  // Verify solution (case insensitive)
  if (captchaSolution.toLowerCase() !== stored.solution) {
    // Don't delete immediately, allow retries
    return res.status(400).json({ 
      error: 'Invalid CAPTCHA solution',
      attemptsLeft: 3 - stored.attempts
    })
  }

  // Success - remove captcha (single use)
  captchaStore.delete(captchaId)
  
  // Add verified flag to request
  req.captchaVerified = true
  next()
}

// Middleware to require CAPTCHA verification
const requireCaptcha = (req, res, next) => {
  if (!req.captchaVerified) {
    return res.status(400).json({ 
      error: 'CAPTCHA verification required' 
    })
  }
  next()
}

// Get captcha store stats (for monitoring)
const getCaptchaStats = () => {
  const now = Date.now()
  let active = 0
  let expired = 0
  
  for (const [key, value] of captchaStore.entries()) {
    if (value.expires > now) {
      active++
    } else {
      expired++
    }
  }
  
  return { active, expired, total: captchaStore.size }
}

module.exports = {
  generateCaptcha,
  verifyCaptcha,
  requireCaptcha,
  getCaptchaStats
}