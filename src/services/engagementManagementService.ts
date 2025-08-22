import type { Engagement, ProjectStatus, Speed, CRM, SalesType, AddOn } from '../types'
import { auditService } from './auditService'

// Re-export Engagement type for other components
export type { Engagement }

export interface CreateEngagementRequest {
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
}

export interface UpdateEngagementRequest {
  accountName?: string
  name?: string
  status?: ProjectStatus
  health?: 'GREEN' | 'YELLOW' | 'RED'
  assignedRep?: string
  startDate?: string
  closeDate?: string
  salesType?: SalesType
  speed?: Speed
  crm?: CRM
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
}

export interface EngagementFilter {
  status?: ProjectStatus
  health?: 'GREEN' | 'YELLOW' | 'RED'
  assignedRep?: string
  accountName?: string
  search?: string
}

export interface EngagementListSort {
  field: keyof Engagement
  direction: 'asc' | 'desc'
}

export interface PaginatedEngagementResponse {
  engagements: Engagement[]
  total: number
  page: number
  limit: number
  total_pages: number
}

class EngagementManagementService {
  private storageKey = 'kanban_engagements_data'

  private getStoredEngagements(): Engagement[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : this.getDefaultEngagements()
    } catch (error) {
      console.error('Error loading stored engagements:', error)
      return this.getDefaultEngagements()
    }
  }

  private saveEngagementsToStorage(engagements: Engagement[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(engagements))
    } catch (error) {
      console.error('Error saving engagements to storage:', error)
    }
  }

  async getAllEngagements(
    filter?: EngagementFilter,
    sort?: EngagementListSort,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedEngagementResponse> {
    try {
      let engagements = this.getStoredEngagements()

      // Apply filters
      if (filter) {
        if (filter.status) {
          engagements = engagements.filter(e => e.status === filter.status)
        }
        if (filter.health) {
          engagements = engagements.filter(e => e.health === filter.health)
        }
        if (filter.assignedRep) {
          engagements = engagements.filter(e => e.assignedRep === filter.assignedRep)
        }
        if (filter.accountName) {
          engagements = engagements.filter(e => e.accountName === filter.accountName)
        }
        if (filter.search) {
          const searchLower = filter.search.toLowerCase()
          engagements = engagements.filter(e => 
            e.name.toLowerCase().includes(searchLower) ||
            e.accountName.toLowerCase().includes(searchLower) ||
            (e.assignedRep && e.assignedRep.toLowerCase().includes(searchLower))
          )
        }
      }

      // Apply sorting
      if (sort) {
        engagements.sort((a, b) => {
          const aVal = a[sort.field]
          const bVal = b[sort.field]
          
          if (aVal === null || aVal === undefined) return sort.direction === 'asc' ? 1 : -1
          if (bVal === null || bVal === undefined) return sort.direction === 'asc' ? -1 : 1
          
          const comparison = aVal.toString().localeCompare(bVal.toString())
          return sort.direction === 'asc' ? comparison : -comparison
        })
      }

      // Apply pagination
      const total = engagements.length
      const start = (page - 1) * limit
      const paginatedEngagements = engagements.slice(start, start + limit)

      return {
        engagements: paginatedEngagements,
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit)
      }
    } catch (error) {
      console.error('Error fetching engagements:', error)
      throw new Error('Failed to fetch engagements')
    }
  }

  async getEngagementById(id: string): Promise<Engagement | null> {
    try {
      const engagements = this.getStoredEngagements()
      return engagements.find(engagement => engagement.id === id) || null
    } catch (error) {
      console.error('Error fetching engagement:', error)
      throw new Error('Failed to fetch engagement')
    }
  }

  async createEngagement(data: CreateEngagementRequest): Promise<Engagement> {
    try {
      const engagements = this.getStoredEngagements()

      const newEngagement: Engagement = {
        id: `engagement-${Date.now()}`,
        accountName: data.accountName,
        name: data.name,
        status: data.status,
        health: data.health,
        assignedRep: data.assignedRep,
        startDate: data.startDate,
        closeDate: data.closeDate,
        salesType: data.salesType,
        speed: data.speed,
        crm: data.crm,
        avazaLink: data.avazaLink,
        projectFolderLink: data.projectFolderLink,
        clientWebsiteLink: data.clientWebsiteLink,
        soldBy: data.soldBy,
        seatCount: data.seatCount,
        hoursAlloted: data.hoursAlloted,
        primaryContactName: data.primaryContactName,
        primaryContactEmail: data.primaryContactEmail,
        linkedinLink: data.linkedinLink,
        addOnsPurchased: data.addOnsPurchased || [],
        milestones: [] // Milestones would be created separately
      }

      engagements.push(newEngagement)
      this.saveEngagementsToStorage(engagements)

      // Log audit trail
      await auditService.logAction(
        'current-user-id', // In real app, get from auth context
        'Chris Administrator', // In real app, get from auth context
        'create_engagement',
        'system',
        `Created new engagement: ${newEngagement.name} for account ${data.accountName}`,
        newEngagement.id
      )

      return newEngagement
    } catch (error) {
      console.error('Error creating engagement:', error)
      throw new Error('Failed to create engagement')
    }
  }

  async updateEngagement(id: string, data: UpdateEngagementRequest): Promise<Engagement> {
    try {
      const engagements = this.getStoredEngagements()

      const engagementIndex = engagements.findIndex(engagement => engagement.id === id)
      if (engagementIndex === -1) {
        throw new Error('Engagement not found')
      }

      const originalEngagement = { ...engagements[engagementIndex] }
      const updatedEngagement = {
        ...engagements[engagementIndex],
        ...data
      }

      engagements[engagementIndex] = updatedEngagement
      this.saveEngagementsToStorage(engagements)

      // Log audit trail with changes
      const changes = auditService.generateChanges(originalEngagement, updatedEngagement, ['milestones'])
      await auditService.logAction(
        'current-user-id', // In real app, get from auth context
        'Chris Administrator', // In real app, get from auth context
        'update_engagement',
        'system',
        `Updated engagement: ${updatedEngagement.name}`,
        id,
        changes
      )

      return updatedEngagement
    } catch (error) {
      console.error('Error updating engagement:', error)
      throw new Error('Failed to update engagement')
    }
  }

  async deleteEngagement(id: string): Promise<boolean> {
    try {
      const engagements = this.getStoredEngagements()
      const engagementIndex = engagements.findIndex(engagement => engagement.id === id)
      
      if (engagementIndex === -1) {
        throw new Error('Engagement not found')
      }

      const engagement = engagements[engagementIndex]
      engagements.splice(engagementIndex, 1)
      this.saveEngagementsToStorage(engagements)

      // Log audit trail
      await auditService.logAction(
        'current-user-id', // In real app, get from auth context
        'Chris Administrator', // In real app, get from auth context
        'delete_engagement',
        'system',
        `Deleted engagement: ${engagement.name} for account ${engagement.accountName}`,
        id
      )

      return true
    } catch (error) {
      console.error('Error deleting engagement:', error)
      throw new Error('Failed to delete engagement')
    }
  }

  async getAvailableReps(): Promise<string[]> {
    // In a real app, this would come from a database
    return [
      'Dakota',
      'Chris',
      'Amanda',
      'Rolando',
      'Lisa',
      'Steph',
      'Josh'
    ]
  }

  // Default data for development/testing
  private getDefaultEngagements(): Engagement[] {
    return [
      {
        id: 'engagement-001',
        accountName: 'TechCorp Solutions',
        name: 'Digital Transformation Initiative',
        status: 'IN_PROGRESS',
        health: 'GREEN',
        assignedRep: 'Rolando',
        startDate: '2024-01-15',
        closeDate: '2024-06-30',
        salesType: 'Direct Sell',
        speed: 'Fast',
        crm: 'Salesforce',
        soldBy: 'Chris',
        seatCount: 50,
        hoursAlloted: 120,
        primaryContactName: 'John Smith',
        primaryContactEmail: 'john@techcorp.com',
        linkedinLink: 'https://linkedin.com/in/johnsmith',
        avazaLink: 'https://avaza.com/project/001',
        projectFolderLink: 'https://drive.google.com/folder1',
        clientWebsiteLink: 'https://techcorp.com',
        addOnsPurchased: ['Meet', 'Deal'],
        milestones: []
      },
      {
        id: 'engagement-002',
        accountName: 'Global Manufacturing Inc',
        name: 'Cloud Migration Project',
        status: 'KICK_OFF',
        health: 'YELLOW',
        assignedRep: 'Amanda',
        startDate: '2024-02-01',
        closeDate: '2024-08-15',
        salesType: 'Channel',
        speed: 'Medium',
        crm: 'Dynamics',
        soldBy: 'Dakota',
        seatCount: 25,
        hoursAlloted: 80,
        primaryContactName: 'Sarah Johnson',
        primaryContactEmail: 'sarah@globalmanuf.com',
        addOnsPurchased: ['Forecasting', 'Migration'],
        milestones: []
      },
      {
        id: 'engagement-003',
        accountName: 'StartupFlow',
        name: 'Customer Portal Redesign',
        status: 'NEW',
        health: 'GREEN',
        assignedRep: 'Lisa',
        startDate: '2024-03-01',
        closeDate: '2024-07-01',
        salesType: 'Greaser Sale',
        speed: 'Slow',
        crm: 'Hubspot',
        soldBy: 'Steph',
        seatCount: 10,
        hoursAlloted: 40,
        primaryContactName: 'Mike Chen',
        primaryContactEmail: 'mike@startupflow.com',
        addOnsPurchased: ['Content'],
        milestones: []
      }
    ]
  }
}

export const engagementManagementService = new EngagementManagementService()