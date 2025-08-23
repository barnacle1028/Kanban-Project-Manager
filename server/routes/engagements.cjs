const express = require('express')
const { body, param, query: expressQuery, validationResult } = require('express-validator')
const { query } = require('../config/database.cjs')
const {
  authenticateToken,
  requireRole,
  requireMinRole,
  canAccessEngagement
} = require('../middleware/auth.cjs')

const router = express.Router()

// All routes require authentication (temporarily disabled for testing)
// router.use(authenticateToken)

// Simple test endpoint to verify routing is working
router.get('/test', (req, res) => {
  res.json({
    message: 'Engagement routes are working!',
    timestamp: new Date().toISOString(),
    user: req.user ? { id: req.user.id, email: req.user.email } : null
  })
})

// Database connectivity test endpoint
router.get('/db-test', async (req, res) => {
  try {
    console.log('Testing database connectivity...')
    
    // Test basic connection
    const result = await query('SELECT NOW() as current_time, version() as db_version')
    console.log('Database connection successful')
    
    // Test if required tables exist
    const tableCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'account', 'engagement')
      ORDER BY table_name
    `)
    
    // Test if we can query users table
    let userCount = 0
    try {
      const userResult = await query('SELECT COUNT(*) as count FROM users')
      userCount = parseInt(userResult.rows[0].count)
    } catch (userError) {
      console.error('Users table query error:', userError.message)
    }
    
    res.json({
      message: 'Database connectivity test',
      database_time: result.rows[0].current_time,
      database_version: result.rows[0].db_version,
      existing_tables: tableCheck.rows.map(row => row.table_name),
      users_count: userCount,
      database_url_configured: !!process.env.DATABASE_URL,
      environment: process.env.NODE_ENV || 'undefined'
    })
  } catch (error) {
    console.error('Database test error:', error)
    res.status(500).json({
      error: 'Database connectivity failed',
      message: error.message,
      database_url_configured: !!process.env.DATABASE_URL
    })
  }
})

// Debug endpoint to check database structure
router.get('/debug-schema', async (req, res) => {
  try {
    // Check engagement table structure
    const engagementSchema = await query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'engagement' 
      ORDER BY ordinal_position
    `)
    
    // Check if users table exists
    const usersCheck = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `)
    
    // Check if account table exists
    const accountCheck = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'account' 
      ORDER BY ordinal_position
    `)
    
    res.json({
      engagement_columns: engagementSchema.rows,
      users_columns: usersCheck.rows,
      account_columns: accountCheck.rows
    })
  } catch (error) {
    console.error('Schema debug error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Test endpoint to simulate engagement creation step by step
router.post('/test-create', async (req, res) => {
  try {
    console.log('=== TEST ENGAGEMENT CREATION ===')
    console.log('Request body:', req.body)
    
    const { accountName = 'Test Account', name = 'Test Engagement' } = req.body
    
    // Step 1: Test account creation
    console.log('Step 1: Testing account creation...')
    let account_id
    try {
      const accountResult = await query('SELECT id FROM account WHERE name = $1', [accountName])
      if (accountResult.rows.length > 0) {
        account_id = accountResult.rows[0].id
        console.log('Found existing account:', account_id)
      } else {
        const newAccount = await query('INSERT INTO account (name) VALUES ($1) RETURNING id', [accountName])
        account_id = newAccount.rows[0].id
        console.log('Created new account:', account_id)
      }
    } catch (accountError) {
      console.error('Account error:', accountError)
      return res.status(500).json({ step: 'account', error: accountError.message })
    }
    
    // Step 2: Test user lookup
    console.log('Step 2: Testing user lookup...')
    let user_count = 0
    try {
      const userResult = await query('SELECT COUNT(*) as count FROM users WHERE is_active = true')
      user_count = userResult.rows[0].count
      console.log('Active users count:', user_count)
    } catch (userError) {
      console.error('User lookup error:', userError)
      return res.status(500).json({ step: 'user_lookup', error: userError.message })
    }
    
    // Step 3: Test minimal engagement creation
    console.log('Step 3: Testing minimal engagement creation...')
    try {
      const result = await query(`
        INSERT INTO engagement (account_id, owner_user_id, name, account_name, status, health)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [account_id, req.user.id, name, accountName, 'NEW', 'GREEN'])
      
      console.log('Created engagement:', result.rows[0].id)
      
      res.json({
        success: true,
        engagement_id: result.rows[0].id,
        account_id: account_id,
        user_count: user_count,
        message: 'Test engagement created successfully'
      })
    } catch (engagementError) {
      console.error('Engagement creation error:', engagementError)
      return res.status(500).json({ 
        step: 'engagement_creation', 
        error: engagementError.message,
        code: engagementError.code,
        detail: engagementError.detail
      })
    }
    
  } catch (error) {
    console.error('Test create error:', error)
    res.status(500).json({ step: 'general', error: error.message })
  }
})

// Get available reps from user management system
router.get('/reps', async (req, res) => {
  try {
    console.log('Fetching available reps from user management system...')
    const result = await query(`
      SELECT DISTINCT 
        u.id,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) as full_name,
        u.email,
        ur.role_type,
        ur.dashboard_access
      FROM users u
      JOIN user_role_assignments ura ON u.id = ura.user_id 
      JOIN user_roles ur ON ura.user_role_id = ur.id
      WHERE ura.is_active = true 
        AND u.is_active = true 
        AND u.status = 'active'
        AND ur.dashboard_access IN ('Rep', 'Manager', 'Admin')
      ORDER BY u.first_name, u.last_name
    `)
    
    console.log(`Found ${result.rows.length} active reps in database:`, result.rows)
    
    // Return both the display name and user details for assignment
    const reps = result.rows.map(row => ({
      id: row.id,
      name: row.full_name,
      email: row.email,
      role_type: row.role_type,
      dashboard_access: row.dashboard_access
    }))
    
    res.json(reps)
  } catch (error) {
    console.error('Get available reps error:', error)
    res.status(500).json({ error: 'Failed to fetch available reps' })
  }
})

// Get all engagements (with role-based filtering)
router.get('/', async (req, res) => {
  try {
    // Mock user for testing (remove after auth is fixed)
    if (!req.user) {
      req.user = { id: 1, role: 'ADMIN' }
    }
    
    const { status, owner_user_id, manager_id, limit = 50, offset = 0 } = req.query
    
    let whereClause = '1=1'
    const params = []
    let paramCount = 0

    // Role-based access control
    if (req.user.role === 'REP') {
      // Reps can only see their own engagements
      whereClause += ` AND e.owner_user_id = $${++paramCount}`
      params.push(req.user.id)
    } else if (req.user.role === 'MANAGER') {
      // Managers can see their own and their team's engagements
      whereClause += ` AND (e.owner_user_id = $${++paramCount} OR owner.manager_id = $${++paramCount})`
      params.push(req.user.id, req.user.id)
    }
    // Admins can see all engagements (no additional filter)

    // Additional filters
    if (status) {
      whereClause += ` AND e.status = $${++paramCount}`
      params.push(status)
    }

    if (owner_user_id && req.user.role !== 'REP') {
      whereClause += ` AND e.owner_user_id = $${++paramCount}`
      params.push(owner_user_id)
    }

    if (manager_id && req.user.role === 'ADMIN') {
      whereClause += ` AND owner.manager_id = $${++paramCount}`
      params.push(manager_id)
    }

    const engagementsQuery = `
      SELECT 
        e.*,
        a.name as account_name,
        a.segment as account_segment,
        a.region as account_region,
        owner.name as owner_name,
        owner.email as owner_email,
        manager.name as manager_name,
        COUNT(em.id) as milestone_count,
        COUNT(em.id) FILTER (WHERE em.stage = 'COMPLETED') as completed_milestones,
        CASE 
          WHEN COUNT(em.id) > 0 
          THEN ROUND(100.0 * COUNT(em.id) FILTER (WHERE em.stage = 'COMPLETED') / COUNT(em.id), 1)
          ELSE 0
        END as percent_complete
      FROM engagement e
      LEFT JOIN account a ON a.id = e.account_id
      JOIN app_user owner ON owner.id = e.owner_user_id
      LEFT JOIN app_user manager ON manager.id = owner.manager_id
      LEFT JOIN engagement_milestone em ON em.engagement_id = e.id
      WHERE ${whereClause}
      GROUP BY e.id, a.id, owner.id, manager.id
      ORDER BY e.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `

    params.push(parseInt(limit), parseInt(offset))

    const result = await query(engagementsQuery, params)

    res.json({
      engagements: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: result.rowCount
      }
    })
  } catch (error) {
    console.error('Get engagements error:', error)
    res.status(500).json({ error: 'Failed to fetch engagements' })
  }
})

// Get engagement by ID
router.get('/:engagementId', 
  param('engagementId').isUUID().withMessage('Invalid engagement ID'),
  canAccessEngagement,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array()
        })
      }

      const { engagementId } = req.params

      // Get engagement with all related data
      const engagementQuery = `
        SELECT 
          e.*,
          a.name as account_name,
          a.segment as account_segment,
          a.region as account_region,
          owner.name as owner_name,
          owner.email as owner_email,
          owner.role as owner_role,
          manager.name as manager_name,
          manager.email as manager_email
        FROM engagement e
        JOIN account a ON a.id = e.account_id
        JOIN app_user owner ON owner.id = e.owner_user_id
        LEFT JOIN app_user manager ON manager.id = owner.manager_id
        WHERE e.id = $1
      `

      const engagementResult = await query(engagementQuery, [engagementId])

      if (engagementResult.rows.length === 0) {
        return res.status(404).json({ error: 'Engagement not found' })
      }

      // Get milestones
      const milestonesQuery = `
        SELECT 
          em.*,
          mt.name as template_name,
          mt.weight as template_weight,
          mt.order_index as template_order,
          milestone_owner.name as milestone_owner_name
        FROM engagement_milestone em
        JOIN milestone_template mt ON mt.id = em.template_id
        LEFT JOIN app_user milestone_owner ON milestone_owner.id = em.owner_user_id
        WHERE em.engagement_id = $1
        ORDER BY mt.order_index
      `

      const milestonesResult = await query(milestonesQuery, [engagementId])

      const engagement = {
        ...engagementResult.rows[0],
        milestones: milestonesResult.rows
      }

      res.json(engagement)
    } catch (error) {
      console.error('Get engagement error:', error)
      res.status(500).json({ error: 'Failed to fetch engagement' })
    }
  }
)

// Create new engagement (Manager and Admin only)
router.post('/',
  // requireMinRole('MANAGER'), // temporarily disabled for testing
  [
    body('accountName').trim().isLength({ min: 1, max: 255 }).withMessage('Account name is required'),
    body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required and must be less than 255 characters'),
    body('status').optional().isIn(['NEW', 'KICK_OFF', 'IN_PROGRESS', 'LAUNCHED', 'STALLED', 'ON_HOLD', 'CLAWED_BACK', 'COMPLETED']),
    body('health').optional().isIn(['GREEN', 'YELLOW', 'RED']),
    body('assignedRep').optional().trim(),
    body('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
    body('closeDate').optional().isISO8601().withMessage('Close date must be valid ISO date'),
    body('salesType').optional().isIn(['Channel', 'Direct Sell', 'Greaser Sale']),
    body('speed').optional().isIn(['Slow', 'Medium', 'Fast']),
    body('crm').optional().isIn(['Salesforce', 'Dynamics', 'Hubspot', 'Other', 'None']),
    body('soldBy').optional().trim(),
    body('seatCount').optional().isInt({ min: 1 }).withMessage('Seat count must be positive'),
    body('hoursAlloted').optional().isInt({ min: 1 }).withMessage('Hours allocated must be positive'),
    body('primaryContactName').optional().trim(),
    body('primaryContactEmail').optional().isEmail().withMessage('Valid email required'),
    body('linkedinLink').optional().isURL().withMessage('Valid LinkedIn URL required'),
    body('avazaLink').optional().isURL().withMessage('Valid Avaza URL required'),
    body('projectFolderLink').optional().isURL().withMessage('Valid project folder URL required'),
    body('clientWebsiteLink').optional().isURL().withMessage('Valid client website URL required'),
    body('addOnsPurchased').optional().isArray()
  ],
  async (req, res) => {
    try {
      // Mock user for testing (remove after auth is fixed)
      if (!req.user) {
        req.user = { id: 1, role: 'ADMIN' }
      }
      
      console.log('=== ENGAGEMENT CREATION REQUEST ===')
      console.log('Request body:', JSON.stringify(req.body, null, 2))
      console.log('User:', req.user)
      
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array())
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        })
      }

      const {
        accountName,
        name,
        status = 'NEW',
        health = 'GREEN',
        assignedRep,
        startDate,
        closeDate,
        salesType,
        speed,
        crm,
        avazaLink,
        projectFolderLink,
        clientWebsiteLink,
        soldBy,
        seatCount,
        hoursAlloted,
        primaryContactName,
        primaryContactEmail,
        linkedinLink,
        addOnsPurchased
      } = req.body

      // Set owner_user_id to the currently logged-in user
      let owner_user_id = req.user.id
      let assigned_rep_user_id = null
      let account_id = null
      
      // Create or find account
      try {
        console.log('Creating/finding account for:', accountName)
        let accountResult = await query(
          'SELECT id FROM account WHERE LOWER(name) = LOWER($1)',
          [accountName]
        )
        
        if (accountResult.rows.length > 0) {
          account_id = accountResult.rows[0].id
          console.log('Found existing account:', account_id)
        } else {
          // Create new account
          console.log('Creating new account...')
          const newAccountResult = await query(
            'INSERT INTO account (name) VALUES ($1) RETURNING id',
            [accountName]
          )
          account_id = newAccountResult.rows[0].id
          console.log('Created new account:', account_id)
        }
      } catch (accountError) {
        console.error('Account creation/lookup error:', accountError)
        return res.status(500).json({ 
          error: 'Failed to create or find account', 
          details: accountError.message 
        })
      }
      
      // If assignedRep is provided, find the user ID
      if (assignedRep) {
        try {
          console.log('Looking for assigned rep:', assignedRep)
          const repCheck = await query(
            'SELECT id FROM users WHERE CONCAT(first_name, \' \', last_name) = $1 AND is_active = true AND status = $2',
            [assignedRep, 'active']
          )
          console.log('Rep check result:', repCheck.rows)
          if (repCheck.rows.length > 0) {
            assigned_rep_user_id = repCheck.rows[0].id
            console.log('Found assigned rep user ID:', assigned_rep_user_id)
          } else {
            console.log('No matching user found for assigned rep:', assignedRep)
          }
        } catch (repError) {
          console.error('Assigned rep lookup error:', repError)
          return res.status(500).json({ 
            error: 'Failed to lookup assigned rep', 
            details: repError.message 
          })
        }
      }

      // Create engagement
      let engagement
      try {
        console.log('Creating engagement with parameters:')
        console.log('- account_id:', account_id)
        console.log('- owner_user_id:', owner_user_id)
        console.log('- name:', name)
        console.log('- accountName:', accountName)
        console.log('- assigned_rep_user_id:', assigned_rep_user_id)
        
        const createQuery = `
          INSERT INTO engagement (
            name, account_name, status, health, assigned_rep,
            start_date, close_date, sales_type, speed, crm,
            avaza_link, project_folder_link, client_website_link,
            sold_by, seat_count, hours_alloted,
            primary_contact_name, primary_contact_email, linkedin_link,
            add_ons_purchased
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
          RETURNING *
        `

        console.log('Executing engagement creation query...')
        const result = await query(createQuery, [
          name, accountName, status, health, assignedRep,
          startDate, closeDate, salesType, speed, crm,
          avazaLink, projectFolderLink, clientWebsiteLink,
          soldBy, seatCount, hoursAlloted,
          primaryContactName, primaryContactEmail, linkedinLink,
          addOnsPurchased
        ])
        console.log('Engagement created successfully:', result.rows[0].id)
        
        engagement = result.rows[0]

        // Create default milestones from templates
        try {
          console.log('Creating default milestones...')
          const templatesResult = await query(
            'SELECT * FROM milestone_template WHERE is_active = true ORDER BY order_index'
          )

          if (templatesResult.rows.length > 0) {
            const milestoneInserts = templatesResult.rows.map(template => 
              `($1, '${template.id}', 'NOT_STARTED')`
            ).join(',')

            await query(
              `INSERT INTO engagement_milestone (engagement_id, template_id, stage)
               VALUES ${milestoneInserts}`,
              [engagement.id]
            )
            console.log('Created', templatesResult.rows.length, 'default milestones')
          } else {
            console.log('No milestone templates found')
          }
        } catch (milestoneError) {
          console.error('Milestone creation error:', milestoneError)
          // Don't fail the engagement creation if milestones fail
        }
      } catch (engagementError) {
        console.error('Engagement creation error:', engagementError)
        console.error('Error details:', {
          message: engagementError.message,
          stack: engagementError.stack,
          code: engagementError.code,
          detail: engagementError.detail
        })
        return res.status(500).json({ 
          error: 'Failed to create engagement', 
          details: engagementError.message,
          sqlError: engagementError.detail || engagementError.code
        })
      }

      // Log audit trail for creation
      try {
        await query(
          `INSERT INTO activity_log (entity_type, entity_id, action, payload_json, user_id, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [
            'engagement', 
            engagement.id, 
            'CREATE_ENGAGEMENT',
            JSON.stringify({ 
              engagement_name: engagement.name,
              account_name: engagement.account_name,
              assigned_rep: engagement.assigned_rep
            }),
            req.user?.id || null
          ]
        )
      } catch (auditError) {
        console.error('Audit logging error:', auditError)
        // Don't fail the creation if audit logging fails
      }

      res.status(201).json({
        message: 'Engagement created successfully',
        engagement
      })
    } catch (error) {
      console.error('Create engagement error:', error)
      res.status(500).json({ error: 'Failed to create engagement' })
    }
  }
)

// Update engagement
router.patch('/:engagementId',
  param('engagementId').isUUID().withMessage('Invalid engagement ID'),
  canAccessEngagement,
  [
    body('name').optional().trim().isLength({ min: 1, max: 255 }),
    body('status').optional().isIn(['NEW', 'KICK_OFF', 'IN_PROGRESS', 'LAUNCHED', 'STALLED', 'ON_HOLD', 'CLAWED_BACK', 'COMPLETED']),
    body('health').optional().isIn(['GREEN', 'YELLOW', 'RED']),
    body('priority').optional().isInt({ min: 1, max: 5 }),
    body('start_date').optional().isISO8601(),
    body('target_launch_date').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        })
      }

      const { engagementId } = req.params
      const updates = req.body

      // Build dynamic update query
      const allowedFields = [
        'name', 'accountName', 'status', 'health', 'assignedRep', 
        'startDate', 'closeDate', 'salesType', 'speed', 'crm',
        'avazaLink', 'projectFolderLink', 'clientWebsiteLink',
        'soldBy', 'seatCount', 'hoursAlloted',
        'primaryContactName', 'primaryContactEmail', 'linkedinLink',
        'addOnsPurchased'
      ]
      
      // Handle assignedRep -> user ID lookup
      if (updates.assignedRep) {
        const repCheck = await query(
          'SELECT id FROM users WHERE CONCAT(first_name, \' \', last_name) = $1 AND is_active = true',
          [updates.assignedRep]
        )
        if (repCheck.rows.length > 0) {
          updates.assignedRepUserId = repCheck.rows[0].id
        }
      }

      // Map field names to database columns
      const fieldMap = {
        'accountName': 'account_name',
        'assignedRep': 'assigned_rep',
        'assignedRepUserId': 'assigned_rep_user_id',
        'startDate': 'start_date',
        'closeDate': 'close_date',
        'salesType': 'sales_type',
        'avazaLink': 'avaza_link',
        'projectFolderLink': 'project_folder_link',
        'clientWebsiteLink': 'client_website_link',
        'soldBy': 'sold_by',
        'seatCount': 'seat_count',
        'hoursAlloted': 'hours_allocated',
        'primaryContactName': 'primary_contact_name',
        'primaryContactEmail': 'primary_contact_email',
        'linkedinLink': 'linkedin_link',
        'addOnsPurchased': 'add_ons_purchased'
      }
      
      const setClause = []
      const params = [engagementId]
      let paramCount = 1

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key) && value !== undefined) {
          const dbField = fieldMap[key] || key
          setClause.push(`${dbField} = $${++paramCount}`)
          params.push(value)
        }
      }

      if (setClause.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' })
      }

      // Get the original engagement for audit comparison
      const originalQuery = `SELECT * FROM engagement WHERE id = $1`
      const originalResult = await query(originalQuery, [engagementId])
      const originalEngagement = originalResult.rows[0]

      const updateQuery = `
        UPDATE engagement 
        SET ${setClause.join(', ')}, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `

      const result = await query(updateQuery, params)
      const updatedEngagement = result.rows[0]

      // Log audit trail
      try {
        const changes = []
        for (const [key, value] of Object.entries(updates)) {
          if (allowedFields.includes(key)) {
            const dbField = fieldMap[key] || key
            const oldValue = originalEngagement[dbField]
            const newValue = value
            if (oldValue !== newValue) {
              changes.push({
                field: key,
                old_value: oldValue,
                new_value: newValue
              })
            }
          }
        }

        if (changes.length > 0) {
          await query(
            `INSERT INTO activity_log (entity_type, entity_id, action, payload_json, user_id, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [
              'engagement', 
              engagementId, 
              'UPDATE_ENGAGEMENT',
              JSON.stringify({ changes }),
              req.user?.id || null
            ]
          )
        }
      } catch (auditError) {
        console.error('Audit logging error:', auditError)
        // Don't fail the update if audit logging fails
      }

      res.json({
        message: 'Engagement updated successfully',
        engagement: result.rows[0]
      })
    } catch (error) {
      console.error('Update engagement error:', error)
      res.status(500).json({ error: 'Failed to update engagement' })
    }
  }
)

// Update milestone stage
router.patch('/:engagementId/milestones/:milestoneId',
  param('engagementId').isUUID().withMessage('Invalid engagement ID'),
  param('milestoneId').isUUID().withMessage('Invalid milestone ID'),
  canAccessEngagement,
  [
    body('stage').isIn(['NOT_STARTED', 'INITIAL_CALL', 'WORKSHOP', 'COMPLETED']).withMessage('Invalid milestone stage'),
    body('owner_user_id').optional().isUUID().withMessage('Invalid owner user ID'),
    body('due_date').optional().isISO8601().withMessage('Invalid due date'),
    body('checklist_json').optional().isArray().withMessage('Checklist must be an array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        })
      }

      const { engagementId, milestoneId } = req.params
      const { stage, owner_user_id, due_date, checklist_json } = req.body

      // Verify milestone belongs to engagement
      const milestoneCheck = await query(
        'SELECT id FROM engagement_milestone WHERE id = $1 AND engagement_id = $2',
        [milestoneId, engagementId]
      )

      if (milestoneCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Milestone not found' })
      }

      // Build update query
      const setClause = []
      const params = [milestoneId]
      let paramCount = 1

      if (stage !== undefined) {
        setClause.push(`stage = $${++paramCount}`)
        params.push(stage)
      }

      if (owner_user_id !== undefined) {
        setClause.push(`owner_user_id = $${++paramCount}`)
        params.push(owner_user_id)
      }

      if (due_date !== undefined) {
        setClause.push(`due_date = $${++paramCount}`)
        params.push(due_date)
      }

      if (checklist_json !== undefined) {
        setClause.push(`checklist_json = $${++paramCount}`)
        params.push(JSON.stringify(checklist_json))
      }

      if (setClause.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' })
      }

      const updateQuery = `
        UPDATE engagement_milestone 
        SET ${setClause.join(', ')}
        WHERE id = $1
        RETURNING *
      `

      const result = await query(updateQuery, params)

      res.json({
        message: 'Milestone updated successfully',
        milestone: result.rows[0]
      })
    } catch (error) {
      console.error('Update milestone error:', error)
      res.status(500).json({ error: 'Failed to update milestone' })
    }
  }
)

// Delete engagement (Admin and Manager only, with restrictions)
router.delete('/:engagementId',
  param('engagementId').isUUID().withMessage('Invalid engagement ID'),
  requireMinRole('MANAGER'),
  canAccessEngagement,
  async (req, res) => {
    try {
      const { engagementId } = req.params

      // Get engagement details for audit logging before deletion
      const engagementCheck = await query(
        'SELECT * FROM engagement WHERE id = $1',
        [engagementId]
      )

      if (engagementCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Engagement not found' })
      }

      const engagement = engagementCheck.rows[0]
      
      // Only allow deletion of NEW engagements unless Admin
      if (req.user.role !== 'ADMIN' && engagement.status !== 'NEW') {
        return res.status(403).json({ 
          error: 'Cannot delete engagement that is not in NEW status' 
        })
      }

      // Log audit trail before deletion
      try {
        await query(
          `INSERT INTO activity_log (entity_type, entity_id, action, payload_json, user_id, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [
            'engagement', 
            engagementId, 
            'DELETE_ENGAGEMENT',
            JSON.stringify({ 
              engagement_name: engagement.name,
              account_name: engagement.account_name,
              assigned_rep: engagement.assigned_rep,
              status: engagement.status
            }),
            req.user?.id || null
          ]
        )
      } catch (auditError) {
        console.error('Audit logging error:', auditError)
        // Don't fail the deletion if audit logging fails
      }

      // Delete engagement (cascades to milestones)
      await query('DELETE FROM engagement WHERE id = $1', [engagementId])

      res.json({ message: 'Engagement deleted successfully' })
    } catch (error) {
      console.error('Delete engagement error:', error)
      res.status(500).json({ error: 'Failed to delete engagement' })
    }
  }
)

module.exports = router