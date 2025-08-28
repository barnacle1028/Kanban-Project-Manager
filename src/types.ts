export type ProjectStatus =
  | 'NEW'
  | 'KICK_OFF'
  | 'IN_PROGRESS'
  | 'LAUNCHED'
  | 'STALLED'
  | 'ON_HOLD'
  | 'CLAWED_BACK'
  | 'COMPLETED'

export type MilestoneStage =
  | 'NOT_STARTED'
  | 'INITIAL_CALL'
  | 'WORKSHOP'
  | 'COMPLETED'

export interface Milestone {
  id: string
  name: string
  stage: MilestoneStage
  owner?: string
  dueDate?: string
  notPurchased?: boolean
  isStandard?: boolean // True for initial milestones that cannot be deleted
  stageHistory?: {
    stage: MilestoneStage
    date: string
    movedBy?: string
  }[]
}

export type Speed = 'Slow' | 'Medium' | 'Fast'
export type CRM = 'Salesforce' | 'Dynamics' | 'Hubspot' | 'Other' | 'None'
export type SalesType = 'Channel' | 'Direct Sell' | 'Greaser Sale'
export type AddOn =
  | 'Meet'
  | 'Deal'
  | 'Forecasting'
  | 'AI Agents'
  | 'Content'
  | 'Migration'
  | 'Managed Services'

export interface Engagement {
  id: string
  accountName: string
  name: string
  status: ProjectStatus
  health: 'GREEN' | 'YELLOW' | 'RED'
  assignedRep?: string
  startDate?: string
  closeDate?: string
  salesType?: SalesType
  speed?: Speed
  crm?: CRM
  engagementType?: string
  avazaLink?: string
  projectFolderLink?: string
  clientWebsiteLink?: string
  soldBy?: string
  seatCount?: number
  hoursAlloted?: number
  primaryContactName?: string
  primaryContactEmail?: string
  linkedinLink?: string
  addOnsPurchased?: AddOn[]
  milestones: Milestone[]
}

export interface Rep {
  id: string
  name: string
  email: string
  title: string
  avazaTimekeepingLink: string
  avazaDashboardLink?: string
  isActive: boolean
  createdDate: string
}

export const AVAILABLE_REPS = [
  'Dakota',
  'Chris', 
  'Amanda',
  'Rolando',
  'Lisa',
  'Steph',
  'Josh',
] as const
