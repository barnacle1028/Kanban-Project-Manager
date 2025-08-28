const express = require('express')
const { pool } = require('../config/database.cjs')
const auth = require('../middleware/auth.cjs')

const router = express.Router()

// Apply authentication middleware to all routes
router.use(auth.requireAuth)

// Get all accounts
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/accounts - User:', req.user?.id)
    
    const result = await pool.query(`
      SELECT 
        id,
        name,
        segment,
        region,
        created_at
      FROM client_accounts 
      ORDER BY name ASC
    `)
    
    console.log(`Found ${result.rows.length} accounts`)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    res.status(500).json({ error: 'Failed to fetch accounts' })
  }
})

// Get account by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    console.log('GET /api/accounts/:id - Account ID:', id)
    
    const result = await pool.query(`
      SELECT 
        id,
        name,
        segment,
        region,
        created_at
      FROM client_accounts 
      WHERE id = $1
    `, [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching account:', error)
    res.status(500).json({ error: 'Failed to fetch account' })
  }
})

// Create new account
router.post('/', async (req, res) => {
  try {
    const { name, segment, region } = req.body
    console.log('POST /api/accounts - Creating account:', { name, segment, region })
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Account name is required' })
    }
    
    const result = await pool.query(`
      INSERT INTO client_accounts (name, segment, region, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, name, segment, region, created_at
    `, [name.trim(), segment || null, region || null])
    
    console.log('Account created:', result.rows[0])
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating account:', error)
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'An account with this name already exists' })
    }
    
    res.status(500).json({ error: 'Failed to create account' })
  }
})

// Update account
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, segment, region } = req.body
    console.log('PATCH /api/accounts/:id - Updating account:', { id, name, segment, region })
    
    if (name !== undefined && name.trim() === '') {
      return res.status(400).json({ error: 'Account name cannot be empty' })
    }
    
    // Build dynamic query
    const updates = []
    const values = []
    let paramCount = 1
    
    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`)
      values.push(name.trim())
    }
    
    if (segment !== undefined) {
      updates.push(`segment = $${paramCount++}`)
      values.push(segment || null)
    }
    
    if (region !== undefined) {
      updates.push(`region = $${paramCount++}`)
      values.push(region || null)
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }
    
    updates.push(`updated_at = NOW()`)
    values.push(id)
    
    const query = `
      UPDATE client_accounts 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, segment, region, created_at
    `
    
    const result = await pool.query(query, values)
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' })
    }
    
    console.log('Account updated:', result.rows[0])
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating account:', error)
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'An account with this name already exists' })
    }
    
    res.status(500).json({ error: 'Failed to update account' })
  }
})

// Delete account
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    console.log('DELETE /api/accounts/:id - Deleting account:', id)
    
    // Check if account has related engagements
    const engagementCheck = await pool.query(`
      SELECT COUNT(*) as engagement_count 
      FROM engagement 
      WHERE account_id = $1
    `, [id])
    
    if (parseInt(engagementCheck.rows[0].engagement_count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete account with existing engagements. Please delete or reassign engagements first.' 
      })
    }
    
    const result = await pool.query(`
      DELETE FROM client_accounts 
      WHERE id = $1
      RETURNING id
    `, [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' })
    }
    
    console.log('Account deleted:', id)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting account:', error)
    res.status(500).json({ error: 'Failed to delete account' })
  }
})

// Search accounts by name
router.get('/search', async (req, res) => {
  try {
    const { q: query } = req.query
    console.log('GET /api/accounts/search - Query:', query)
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' })
    }
    
    const result = await pool.query(`
      SELECT 
        id,
        name,
        segment,
        region,
        created_at
      FROM client_accounts 
      WHERE 
        LOWER(name) LIKE LOWER($1) OR 
        LOWER(segment) LIKE LOWER($1) OR 
        LOWER(region) LIKE LOWER($1)
      ORDER BY name ASC
    `, [`%${query.trim()}%`])
    
    console.log(`Found ${result.rows.length} matching accounts`)
    res.json(result.rows)
  } catch (error) {
    console.error('Error searching accounts:', error)
    res.status(500).json({ error: 'Failed to search accounts' })
  }
})

module.exports = router