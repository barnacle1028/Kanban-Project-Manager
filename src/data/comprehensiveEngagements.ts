import type { EngagementWithMilestones, Account, EngagementMilestone, MilestoneTemplate } from '../api/types'
import { userData, getUserByEmail } from './userData'

// Sample accounts for our engagements
export const accountData: Account[] = [
  { id: 'acc-001', name: 'TechCorp Industries', segment: 'Enterprise', region: 'North America', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-002', name: 'Global Manufacturing Ltd', segment: 'Enterprise', region: 'Europe', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-003', name: 'HealthSystem Partners', segment: 'Mid-Market', region: 'North America', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-004', name: 'EduTech Solutions', segment: 'SMB', region: 'North America', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-005', name: 'RetailChain Co', segment: 'Enterprise', region: 'North America', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-006', name: 'FinanceFirst Bank', segment: 'Enterprise', region: 'North America', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-007', name: 'StartupInnovate Inc', segment: 'SMB', region: 'North America', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-008', name: 'MedDevice Systems', segment: 'Mid-Market', region: 'Europe', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-009', name: 'LogisticsPro LLC', segment: 'Mid-Market', region: 'North America', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-010', name: 'CloudServices Network', segment: 'Enterprise', region: 'Asia Pacific', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-011', name: 'SportsTech Company', segment: 'SMB', region: 'North America', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-012', name: 'DataAnalytics Pro', segment: 'Mid-Market', region: 'Europe', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-013', name: 'GreenEnergy Solutions', segment: 'Enterprise', region: 'North America', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-014', name: 'FoodService Partners', segment: 'Mid-Market', region: 'North America', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-015', name: 'AutoParts Direct', segment: 'SMB', region: 'North America', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-016', name: 'ConsultingPlus Group', segment: 'Mid-Market', region: 'Europe', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-017', name: 'TravelTech Solutions', segment: 'SMB', region: 'North America', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-018', name: 'InsurancePro Corp', segment: 'Enterprise', region: 'North America', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-019', name: 'RealEstate Analytics', segment: 'Mid-Market', region: 'North America', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-020', name: 'SecurityFirst Systems', segment: 'Enterprise', region: 'North America', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-021', name: 'PharmaTech Labs', segment: 'Enterprise', region: 'Europe', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-022', name: 'AgriTech Innovations', segment: 'Mid-Market', region: 'North America', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-023', name: 'MarketingPro Agency', segment: 'SMB', region: 'North America', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-024', name: 'EventPlanning Plus', segment: 'SMB', region: 'North America', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc-025', name: 'BioTech Research Co', segment: 'Enterprise', region: 'North America', created_at: '2024-01-01T00:00:00Z' }
]

// Standard milestone templates
export const milestoneTemplates: MilestoneTemplate[] = [
  { id: 'tmpl-001', name: 'Project Kickoff', weight: 10, order_index: 1, is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'tmpl-002', name: 'Requirements Gathering', weight: 15, order_index: 2, is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'tmpl-003', name: 'System Configuration', weight: 20, order_index: 3, is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'tmpl-004', name: 'Data Migration', weight: 25, order_index: 4, is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'tmpl-005', name: 'Testing & QA', weight: 15, order_index: 5, is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'tmpl-006', name: 'User Training', weight: 10, order_index: 6, is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'tmpl-007', name: 'Go Live Support', weight: 5, order_index: 7, is_active: true, created_at: '2024-01-01T00:00:00Z' }
]

// Helper function to create milestones for an engagement
function createMilestonesForEngagement(engagementId: string, ownerId: string, startDate: string, progressLevel: number = 0): EngagementMilestone[] {
  const baseDate = new Date(startDate)
  
  return milestoneTemplates.map((template, index) => {
    const milestone: EngagementMilestone = {
      id: `milestone-${engagementId}-${template.id}`,
      engagement_id: engagementId,
      template_id: template.id,
      stage: 'NOT_STARTED',
      owner_user_id: ownerId,
      due_date: new Date(baseDate.getTime() + (index + 1) * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks apart
      stage_entered_at: startDate,
      checklist_json: [],
      template
    }

    // Set milestone progress based on progressLevel
    if (index < progressLevel) {
      if (index < progressLevel - 2) {
        milestone.stage = 'COMPLETED'
      } else if (index < progressLevel - 1) {
        milestone.stage = 'WORKSHOP'  
      } else {
        milestone.stage = 'INITIAL_CALL'
      }
    }

    return milestone
  })
}

// Function to get random status with bias toward active engagements
function getRandomStatus(): EngagementWithMilestones['status'] {
  const statuses: EngagementWithMilestones['status'][] = [
    'IN_PROGRESS', 'IN_PROGRESS', 'IN_PROGRESS', // 3x weight for active
    'NEW', 'KICK_OFF', 
    'LAUNCHED', 'COMPLETED',
    'STALLED', 'ON_HOLD'
  ]
  return statuses[Math.floor(Math.random() * statuses.length)]
}

// Function to get random health
function getRandomHealth(): EngagementWithMilestones['health'] {
  const healths: EngagementWithMilestones['health'][] = ['GREEN', 'GREEN', 'YELLOW', 'RED'] // Bias toward green
  return healths[Math.floor(Math.random() * healths.length)]
}

// Generate comprehensive engagement data - 5 engagements per rep
export const comprehensiveEngagements: EngagementWithMilestones[] = []

// Get all reps
const reps = userData.filter(user => user.role === 'REP')

reps.forEach((rep, repIndex) => {
  for (let i = 0; i < 5; i++) {
    const engagementIndex = repIndex * 5 + i
    const account = accountData[engagementIndex]
    const status = getRandomStatus()
    const health = getRandomHealth()
    const startDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
    const targetLaunchDate = new Date(new Date(startDate).getTime() + (90 + Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3-6 months later
    
    // Determine progress level based on status
    let progressLevel = 0
    switch (status) {
      case 'NEW': progressLevel = 0; break
      case 'KICK_OFF': progressLevel = 1; break
      case 'IN_PROGRESS': progressLevel = Math.floor(Math.random() * 4) + 2; break // 2-5
      case 'LAUNCHED': progressLevel = 6; break
      case 'COMPLETED': progressLevel = 7; break
      case 'STALLED': progressLevel = Math.floor(Math.random() * 3) + 1; break // 1-3
      case 'ON_HOLD': progressLevel = Math.floor(Math.random() * 3) + 1; break // 1-3
      default: progressLevel = 2
    }

    const engagement: EngagementWithMilestones = {
      id: `eng-${String(engagementIndex + 1).padStart(3, '0')}`,
      account_id: account.id,
      owner_user_id: rep.id,
      name: `${account.name} Implementation`,
      status,
      health,
      priority: Math.floor(Math.random() * 5) + 1, // 1-5
      start_date: startDate,
      target_launch_date: targetLaunchDate,
      status_entered_at: startDate,
      created_at: startDate + 'T00:00:00Z',
      updated_at: startDate + 'T00:00:00Z',
      account,
      owner: rep,
      milestones: createMilestonesForEngagement(`eng-${String(engagementIndex + 1).padStart(3, '0')}`, rep.id, startDate, progressLevel),
      percent_complete: Math.round((progressLevel / milestoneTemplates.length) * 100)
    }

    comprehensiveEngagements.push(engagement)
  }
})

// Helper functions for filtering and searching
export const getEngagementsByRep = (repId: string): EngagementWithMilestones[] => {
  return comprehensiveEngagements.filter(eng => eng.owner_user_id === repId)
}

export const getEngagementsByManager = (managerId: string): EngagementWithMilestones[] => {
  const repsUnderManager = userData.filter(user => user.manager_id === managerId)
  const repIds = repsUnderManager.map(rep => rep.id)
  return comprehensiveEngagements.filter(eng => repIds.includes(eng.owner_user_id))
}

export const getEngagementById = (id: string): EngagementWithMilestones | undefined => {
  return comprehensiveEngagements.find(eng => eng.id === id)
}

export const getEngagementStats = () => {
  const total = comprehensiveEngagements.length
  const byStatus = comprehensiveEngagements.reduce((acc, eng) => {
    acc[eng.status] = (acc[eng.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const byHealth = comprehensiveEngagements.reduce((acc, eng) => {
    acc[eng.health] = (acc[eng.health] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return { total, byStatus, byHealth }
}