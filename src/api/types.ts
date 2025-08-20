export interface User {
  id: string
  name: string
  email: string
  role: 'MANAGER' | 'REP' | 'EXECUTIVE'
  manager_id?: string
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  name: string
  segment?: string
  region?: string
  created_at: string
}

export interface Engagement {
  id: string
  account_id: string
  owner_user_id: string
  name: string
  status: 'NEW' | 'KICK_OFF' | 'IN_PROGRESS' | 'LAUNCHED' | 'STALLED' | 'ON_HOLD' | 'CLAWED_BACK' | 'COMPLETED'
  health: 'GREEN' | 'YELLOW' | 'RED'
  priority: number
  start_date?: string
  target_launch_date?: string
  status_entered_at: string
  created_at: string
  updated_at: string
}

export interface MilestoneTemplate {
  id: string
  name: string
  weight: number
  order_index: number
  is_active: boolean
  created_at: string
}

export interface EngagementMilestone {
  id: string
  engagement_id: string
  template_id: string
  stage: 'NOT_STARTED' | 'INITIAL_CALL' | 'WORKSHOP' | 'COMPLETED'
  owner_user_id?: string
  due_date?: string
  stage_entered_at: string
  checklist_json: any[]
  template?: MilestoneTemplate
}

export interface EngagementWithMilestones extends Engagement {
  milestones: EngagementMilestone[]
  account: Account
  owner: User
  percent_complete?: number
}

export interface ActivityLog {
  id: string
  entity_type: string
  entity_id: string
  action: string
  payload_json: Record<string, any>
  user_id?: string
  created_at: string
}