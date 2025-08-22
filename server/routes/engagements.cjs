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

// All routes require authentication
router.use(authenticateToken)

// Get available reps
router.get('/reps', async (req, res) => {
  try {
    const result = await query(
      'SELECT DISTINCT name FROM app_user WHERE role IN (\'REP\', \'MANAGER\') ORDER BY name'
    )
    
    const reps = result.rows.map(row => row.name)
    res.json(reps)
  } catch (error) {
    console.error('Get available reps error:', error)
    res.status(500).json({ error: 'Failed to fetch available reps' })
  }
})

// Get all engagements (with role-based filtering)
router.get('/', async (req, res) => {
  try {
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
  requireMinRole('MANAGER'),
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
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
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

      // For now, set a default owner_user_id (can be enhanced to select based on assignedRep)
      let owner_user_id = req.user.id
      if (assignedRep) {
        const ownerCheck = await query(
          'SELECT id FROM app_user WHERE name = $1',
          [assignedRep]
        )
        if (ownerCheck.rows.length > 0) {
          owner_user_id = ownerCheck.rows[0].id
        }
      }

      // Create engagement
      const createQuery = `
        INSERT INTO engagement (
          owner_user_id, name, account_name, status, health, assigned_rep,
          start_date, close_date, sales_type, speed, crm,
          avaza_link, project_folder_link, client_website_link,
          sold_by, seat_count, hours_allocated,
          primary_contact_name, primary_contact_email, linkedin_link,
          add_ons_purchased
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING *
      `

      const result = await query(createQuery, [
        owner_user_id, name, accountName, status, health, assignedRep,
        startDate, closeDate, salesType, speed, crm,
        avazaLink, projectFolderLink, clientWebsiteLink,
        soldBy, seatCount, hoursAlloted,
        primaryContactName, primaryContactEmail, linkedinLink,
        addOnsPurchased
      ])

      const engagement = result.rows[0]

      // Create default milestones from templates
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
      
      // Map field names to database columns
      const fieldMap = {
        'accountName': 'account_name',
        'assignedRep': 'assigned_rep',
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

      const updateQuery = `
        UPDATE engagement 
        SET ${setClause.join(', ')}, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `

      const result = await query(updateQuery, params)

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

      // Check if engagement can be deleted (only NEW or early stage)
      const engagementCheck = await query(
        'SELECT status FROM engagement WHERE id = $1',
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