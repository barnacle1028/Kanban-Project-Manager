import type { Engagement } from '../types'
import { createStandardMilestones } from '../utils/standardMilestones'

// Generate dummy engagements for a rep dashboard
export const dummyEngagements: Engagement[] = [
  {
    id: 'eng-001',
    name: 'Acme Corporation',
    status: 'ACTIVE',
    health: 'GREEN',
    assignedRep: 'Dakota',
    startDate: '2024-01-15',
    closeDate: '2024-06-15',
    crm: 'Salesforce',
    soldBy: 'Mike Thompson',
    seatCount: 150,
    hoursAlloted: 120,
    primaryContactName: 'John Smith',
    primaryContactEmail: 'john.smith@acme.com',
    avazaLink: 'https://avaza.com/projects/acme-corp',
    projectFolderLink: 'https://drive.google.com/drive/folders/acme-corp-project',
    addOnsPurchased: ['Advanced Analytics', 'Custom Integrations'],
    notes: 'Large enterprise client with complex requirements',
    milestones: (() => {
      const milestones = createStandardMilestones('Dakota', '2024-01-15')
      // Progress some milestones for this engagement
      milestones[0].stage = 'COMPLETED' // Kick-Off
      milestones[0].stageHistory = [
        { stage: 'NOT_STARTED', date: '2024-01-15' },
        { stage: 'COMPLETED', date: '2024-01-20' }
      ]
      milestones[1].stage = 'COMPLETED' // Workflow Design
      milestones[1].stageHistory = [
        { stage: 'NOT_STARTED', date: '2024-01-15' },
        { stage: 'INITIAL_CALL', date: '2024-01-25' },
        { stage: 'WORKSHOP', date: '2024-02-01' },
        { stage: 'COMPLETED', date: '2024-02-10' }
      ]
      milestones[4].stage = 'WORKSHOP' // Data Migration
      milestones[4].stageHistory = [
        { stage: 'NOT_STARTED', date: '2024-01-15' },
        { stage: 'INITIAL_CALL', date: '2024-02-15' },
        { stage: 'WORKSHOP', date: '2024-02-20' }
      ]
      return milestones
    })()
  },
  {
    id: 'eng-002',
    name: 'TechStart Inc',
    status: 'ACTIVE',
    health: 'YELLOW',
    assignedRep: 'Dakota',
    startDate: '2024-02-01',
    closeDate: '2024-07-01',
    crm: 'HubSpot',
    soldBy: 'Lisa Chen',
    seatCount: 25,
    hoursAlloted: 40,
    primaryContactName: 'Emily Davis',
    primaryContactEmail: 'emily@techstart.com',
    avazaLink: 'https://avaza.com/projects/techstart',
    projectFolderLink: 'https://drive.google.com/drive/folders/techstart-project',
    addOnsPurchased: ['Training Package'],
    notes: 'Fast-growing startup, needs quick implementation',
    milestones: (() => {
      const milestones = createStandardMilestones('Dakota', '2024-02-01')
      // Progress some milestones for this engagement
      milestones[0].stage = 'COMPLETED' // Kick-Off
      milestones[0].stageHistory = [
        { stage: 'NOT_STARTED', date: '2024-02-01' },
        { stage: 'COMPLETED', date: '2024-02-05' }
      ]
      milestones[1].stage = 'INITIAL_CALL' // Workflow Design
      milestones[1].stageHistory = [
        { stage: 'NOT_STARTED', date: '2024-02-01' },
        { stage: 'INITIAL_CALL', date: '2024-02-12' }
      ]
      return milestones
    })()
  },
  {
    id: 'eng-003',
    name: 'Global Manufacturing Co',
    status: 'STALLED',
    health: 'YELLOW',
    assignedRep: 'Dakota',
    startDate: '2023-11-01',
    closeDate: '2024-05-01',
    crm: 'Salesforce',
    soldBy: 'Robert Wilson',
    seatCount: 500,
    hoursAlloted: 200,
    primaryContactName: 'Michael Brown',
    primaryContactEmail: 'mbrown@globalmfg.com',
    avazaLink: 'https://avaza.com/projects/global-mfg',
    projectFolderLink: 'https://dropbox.com/folders/global-manufacturing',
    addOnsPurchased: ['Advanced Analytics', 'Custom Integrations', 'Training Package'],
    notes: 'Large enterprise, waiting on internal approvals',
    milestones: (() => {
      const milestones = createStandardMilestones('Dakota', '2023-11-01')
      // Progress some milestones for this engagement
      milestones[0].stage = 'COMPLETED' // Kick-Off
      milestones[0].stageHistory = [
        { stage: 'NOT_STARTED', date: '2023-11-01' },
        { stage: 'COMPLETED', date: '2023-11-15' }
      ]
      milestones[2].stage = 'COMPLETED' // Content Strategy
      milestones[2].stageHistory = [
        { stage: 'NOT_STARTED', date: '2023-11-01' },
        { stage: 'INITIAL_CALL', date: '2023-12-01' },
        { stage: 'WORKSHOP', date: '2023-12-10' },
        { stage: 'COMPLETED', date: '2023-12-20' }
      ]
      return milestones
    })()
  },
  {
    id: 'eng-004',
    name: 'HealthPlus Systems',
    status: 'ACTIVE',
    health: 'GREEN',
    assignedRep: 'Dakota',
    startDate: '2024-03-01',
    closeDate: '2024-08-01',
    crm: 'Pipedrive',
    soldBy: 'Rolando',
    seatCount: 75,
    hoursAlloted: 60,
    primaryContactName: 'Dr. Jennifer Lee',
    primaryContactEmail: 'jlee@healthplus.com',
    avazaLink: 'https://avaza.com/projects/healthplus',
    projectFolderLink: 'https://onedrive.live.com/folders/healthplus-project',
    addOnsPurchased: ['HIPAA Compliance', 'Advanced Analytics'],
    notes: 'Healthcare client with strict compliance requirements',
    milestones: (() => {
      const milestones = createStandardMilestones('Dakota', '2024-03-01')
      // Progress some milestones for this engagement
      milestones[0].stage = 'COMPLETED' // Kick-Off
      milestones[0].stageHistory = [
        { stage: 'NOT_STARTED', date: '2024-03-01' },
        { stage: 'COMPLETED', date: '2024-03-05' }
      ]
      milestones[1].stage = 'COMPLETED' // Workflow Design
      milestones[1].stageHistory = [
        { stage: 'NOT_STARTED', date: '2024-03-01' },
        { stage: 'INITIAL_CALL', date: '2024-03-10' },
        { stage: 'COMPLETED', date: '2024-03-20' }
      ]
      milestones[3].stage = 'WORKSHOP' // CRM Integration
      milestones[3].stageHistory = [
        { stage: 'NOT_STARTED', date: '2024-03-01' },
        { stage: 'INITIAL_CALL', date: '2024-03-25' },
        { stage: 'WORKSHOP', date: '2024-04-01' }
      ]
      return milestones
    })()
  },
  {
    id: 'eng-005',
    name: 'RetailChain Enterprises',
    status: 'ON_HOLD',
    health: 'RED',
    assignedRep: 'Dakota',
    startDate: '2023-12-01',
    closeDate: '2024-06-01',
    crm: 'Salesforce',
    soldBy: 'Mike Thompson',
    seatCount: 200,
    hoursAlloted: 80,
    primaryContactName: 'David Wilson',
    primaryContactEmail: 'dwilson@retailchain.com',
    avazaLink: 'https://avaza.com/projects/retailchain',
    projectFolderLink: 'https://drive.google.com/drive/folders/retailchain-docs',
    addOnsPurchased: ['Custom Integrations'],
    notes: 'Project on hold due to budget constraints',
    milestones: (() => {
      const milestones = createStandardMilestones('Dakota', '2023-12-01')
      // Progress some milestones for this engagement
      milestones[0].stage = 'COMPLETED' // Kick-Off
      milestones[0].stageHistory = [
        { stage: 'NOT_STARTED', date: '2023-12-01' },
        { stage: 'COMPLETED', date: '2023-12-10' }
      ]
      return milestones
    })()
  },
  {
    id: 'eng-006',
    name: 'EduTech Solutions',
    status: 'ACTIVE',
    health: 'GREEN',
    assignedRep: 'Dakota',
    startDate: '2024-01-20',
    closeDate: '2024-06-20',
    crm: 'HubSpot',
    soldBy: 'Lisa Chen',
    seatCount: 100,
    hoursAlloted: 90,
    primaryContactName: 'Prof. Mark Taylor',
    primaryContactEmail: 'mtaylor@edutech.edu',
    avazaLink: 'https://avaza.com/projects/edutech',
    projectFolderLink: 'https://sharepoint.com/sites/edutech-project',
    addOnsPurchased: ['Training Package', 'Student Analytics'],
    notes: 'Educational institution with summer deployment timeline',
    milestones: (() => {
      const milestones = createStandardMilestones('Dakota', '2024-01-20')
      // Progress some milestones for this engagement
      milestones[0].stage = 'COMPLETED' // Kick-Off
      milestones[0].stageHistory = [
        { stage: 'NOT_STARTED', date: '2024-01-20' },
        { stage: 'COMPLETED', date: '2024-01-25' }
      ]
      milestones[1].stage = 'COMPLETED' // Workflow Design
      milestones[1].stageHistory = [
        { stage: 'NOT_STARTED', date: '2024-01-20' },
        { stage: 'INITIAL_CALL', date: '2024-02-01' },
        { stage: 'WORKSHOP', date: '2024-02-08' },
        { stage: 'COMPLETED', date: '2024-02-15' }
      ]
      milestones[2].stage = 'COMPLETED' // Content Strategy
      milestones[2].stageHistory = [
        { stage: 'NOT_STARTED', date: '2024-01-20' },
        { stage: 'INITIAL_CALL', date: '2024-02-20' },
        { stage: 'WORKSHOP', date: '2024-02-25' },
        { stage: 'COMPLETED', date: '2024-03-05' }
      ]
      milestones[6].stage = 'INITIAL_CALL' // User Training
      milestones[6].stageHistory = [
        { stage: 'NOT_STARTED', date: '2024-01-20' },
        { stage: 'INITIAL_CALL', date: '2024-03-10' }
      ]
      return milestones
    })()
  }
]