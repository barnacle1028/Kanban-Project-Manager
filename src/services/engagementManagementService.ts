import type { Engagement, EngagementWithMilestones, Account, User } from '../api/types'
import { auditService } from './auditService'

export interface CreateEngagementRequest {
  account_id: string
  owner_user_id: string
  name: string
  status: Engagement['status']
  health: Engagement['health']
  priority: number
  start_date?: string
  target_launch_date?: string
}

export interface UpdateEngagementRequest {
  account_id?: string
  owner_user_id?: string
  name?: string
  status?: Engagement['status']
  health?: Engagement['health']
  priority?: number
  start_date?: string
  target_launch_date?: string
}

export interface EngagementFilter {
  status?: Engagement['status']
  health?: Engagement['health']
  owner_user_id?: string
  account_id?: string
  priority_min?: number
  priority_max?: number
  search?: string
}

export interface EngagementListSort {
  field: keyof Engagement
  direction: 'asc' | 'desc'
}

export interface PaginatedEngagementResponse {
  engagements: EngagementWithMilestones[]
  total: number
  page: number
  limit: number
  total_pages: number
}

class EngagementManagementService {
  private storageKey = 'kanban_engagements_data'
  private accountsStorageKey = 'kanban_accounts_data'
  private usersStorageKey = 'kanban_users_data'

  private getStoredEngagements(): EngagementWithMilestones[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : this.getDefaultEngagements()
    } catch (error) {
      console.error('Error loading stored engagements:', error)
      return this.getDefaultEngagements()
    }
  }

  private saveEngagementsToStorage(engagements: EngagementWithMilestones[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(engagements))
    } catch (error) {
      console.error('Error saving engagements to storage:', error)
    }
  }

  private getStoredAccounts(): Account[] {
    try {
      const stored = localStorage.getItem(this.accountsStorageKey)
      return stored ? JSON.parse(stored) : this.getDefaultAccounts()
    } catch (error) {
      console.error('Error loading stored accounts:', error)
      return this.getDefaultAccounts()
    }
  }

  private getStoredUsers(): User[] {
    try {
      const stored = localStorage.getItem(this.usersStorageKey)
      return stored ? JSON.parse(stored) : this.getDefaultUsers()
    } catch (error) {
      console.error('Error loading stored users:', error)
      return this.getDefaultUsers()
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
        if (filter.owner_user_id) {
          engagements = engagements.filter(e => e.owner_user_id === filter.owner_user_id)
        }
        if (filter.account_id) {
          engagements = engagements.filter(e => e.account_id === filter.account_id)
        }
        if (filter.priority_min !== undefined) {
          engagements = engagements.filter(e => e.priority >= filter.priority_min!)
        }
        if (filter.priority_max !== undefined) {
          engagements = engagements.filter(e => e.priority <= filter.priority_max!)
        }
        if (filter.search) {
          const searchLower = filter.search.toLowerCase()
          engagements = engagements.filter(e => 
            e.name.toLowerCase().includes(searchLower) ||
            e.account.name.toLowerCase().includes(searchLower) ||
            e.owner.name.toLowerCase().includes(searchLower)
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

  async getEngagementById(id: string): Promise<EngagementWithMilestones | null> {
    try {
      const engagements = this.getStoredEngagements()
      return engagements.find(engagement => engagement.id === id) || null
    } catch (error) {
      console.error('Error fetching engagement:', error)
      throw new Error('Failed to fetch engagement')
    }
  }

  async createEngagement(data: CreateEngagementRequest): Promise<EngagementWithMilestones> {
    try {
      const engagements = this.getStoredEngagements()
      const accounts = this.getStoredAccounts()
      const users = this.getStoredUsers()

      // Find related account and user
      const account = accounts.find(a => a.id === data.account_id)
      const owner = users.find(u => u.id === data.owner_user_id)

      if (!account) throw new Error('Account not found')
      if (!owner) throw new Error('Owner user not found')

      const newEngagement: EngagementWithMilestones = {
        id: `engagement-${Date.now()}`,
        account_id: data.account_id,
        owner_user_id: data.owner_user_id,
        name: data.name,
        status: data.status,
        health: data.health,
        priority: data.priority,
        start_date: data.start_date,
        target_launch_date: data.target_launch_date,
        status_entered_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        milestones: [], // Milestones would be created separately
        account,
        owner,
        percent_complete: 0
      }

      engagements.push(newEngagement)
      this.saveEngagementsToStorage(engagements)

      // Log audit trail
      await auditService.logAction(
        'current-user-id', // In real app, get from auth context
        'Chris Administrator', // In real app, get from auth context
        'create_engagement',
        'system',
        `Created new engagement: ${newEngagement.name} for account ${account.name}`,
        newEngagement.id
      )

      return newEngagement
    } catch (error) {
      console.error('Error creating engagement:', error)
      throw new Error('Failed to create engagement')
    }
  }

  async updateEngagement(id: string, data: UpdateEngagementRequest): Promise<EngagementWithMilestones> {
    try {
      const engagements = this.getStoredEngagements()
      const accounts = this.getStoredAccounts()
      const users = this.getStoredUsers()

      const engagementIndex = engagements.findIndex(engagement => engagement.id === id)
      if (engagementIndex === -1) {
        throw new Error('Engagement not found')
      }

      const originalEngagement = { ...engagements[engagementIndex] }
      const updatedEngagement = {
        ...engagements[engagementIndex],
        ...data,
        updated_at: new Date().toISOString()
      }

      // Update status_entered_at if status changed
      if (data.status && data.status !== originalEngagement.status) {
        updatedEngagement.status_entered_at = new Date().toISOString()
      }

      // Update related data if account or owner changed
      if (data.account_id && data.account_id !== originalEngagement.account_id) {
        const newAccount = accounts.find(a => a.id === data.account_id)
        if (newAccount) updatedEngagement.account = newAccount
      }

      if (data.owner_user_id && data.owner_user_id !== originalEngagement.owner_user_id) {
        const newOwner = users.find(u => u.id === data.owner_user_id)
        if (newOwner) updatedEngagement.owner = newOwner
      }

      engagements[engagementIndex] = updatedEngagement
      this.saveEngagementsToStorage(engagements)

      // Log audit trail with changes
      const changes = auditService.generateChanges(originalEngagement, updatedEngagement, ['updated_at', 'milestones', 'account', 'owner', 'percent_complete'])
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
        `Deleted engagement: ${engagement.name} for account ${engagement.account.name}`,
        id
      )

      return true
    } catch (error) {
      console.error('Error deleting engagement:', error)
      throw new Error('Failed to delete engagement')
    }
  }

  async getAccounts(): Promise<Account[]> {
    return this.getStoredAccounts()
  }

  async getUsers(): Promise<User[]> {
    return this.getStoredUsers()
  }

  // Default data for development/testing
  private getDefaultEngagements(): EngagementWithMilestones[] {
    const accounts = this.getDefaultAccounts()
    const users = this.getDefaultUsers()

    return [
      {
        id: 'engagement-001',
        account_id: 'account-001',
        owner_user_id: 'user-rep-001',
        name: 'Digital Transformation Initiative',
        status: 'IN_PROGRESS',
        health: 'GREEN',
        priority: 1,
        start_date: '2024-01-15',
        target_launch_date: '2024-06-30',
        status_entered_at: '2024-01-15T10:00:00Z',
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-03-01T14:30:00Z',
        milestones: [],
        account: accounts[0],
        owner: users.find(u => u.id === 'user-rep-001')!,
        percent_complete: 45
      },
      {
        id: 'engagement-002',
        account_id: 'account-002',
        owner_user_id: 'user-rep-002',
        name: 'Cloud Migration Project',
        status: 'KICK_OFF',
        health: 'YELLOW',
        priority: 2,
        start_date: '2024-02-01',
        target_launch_date: '2024-08-15',
        status_entered_at: '2024-02-01T08:00:00Z',
        created_at: '2024-01-20T10:00:00Z',
        updated_at: '2024-02-15T16:20:00Z',
        milestones: [],
        account: accounts[1],
        owner: users.find(u => u.id === 'user-rep-002')!,
        percent_complete: 15
      },
      {
        id: 'engagement-003',
        account_id: 'account-003',
        owner_user_id: 'user-rep-003',
        name: 'Customer Portal Redesign',
        status: 'NEW',
        health: 'GREEN',
        priority: 3,
        start_date: '2024-03-01',
        target_launch_date: '2024-07-01',
        status_entered_at: '2024-02-25T12:00:00Z',
        created_at: '2024-02-25T11:00:00Z',
        updated_at: '2024-02-25T12:00:00Z',
        milestones: [],
        account: accounts[2],
        owner: users.find(u => u.id === 'user-rep-003')!,
        percent_complete: 0
      }
    ]
  }

  private getDefaultAccounts(): Account[] {
    return [
      {
        id: 'account-001',
        name: 'TechCorp Solutions',
        segment: 'Enterprise',
        region: 'North America',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'account-002',
        name: 'Global Manufacturing Inc',
        segment: 'Mid-Market',
        region: 'Europe',
        created_at: '2024-01-05T00:00:00Z'
      },
      {
        id: 'account-003',
        name: 'StartupFlow',
        segment: 'SMB',
        region: 'Asia Pacific',
        created_at: '2024-01-10T00:00:00Z'
      },
      {
        id: 'account-004',
        name: 'RetailChain Co',
        segment: 'Enterprise',
        region: 'North America',
        created_at: '2024-01-15T00:00:00Z'
      }
    ]
  }

  private getDefaultUsers(): User[] {
    return [
      {
        id: 'user-admin-001',
        name: 'Chris Administrator',
        email: 'chris@company.com',
        role: 'EXECUTIVE',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'user-manager-001',
        name: 'Derek Manager',
        email: 'derek@company.com',
        role: 'MANAGER',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'user-rep-001',
        name: 'Rolando Representative',
        email: 'rolando@company.com',
        role: 'REP',
        manager_id: 'user-manager-001',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'user-rep-002',
        name: 'Amanda Smith',
        email: 'amanda@company.com',
        role: 'REP',
        manager_id: 'user-manager-001',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'user-rep-003',
        name: 'Lisa Johnson',
        email: 'lisa@company.com',
        role: 'REP',
        manager_id: 'user-manager-001',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]
  }
}

export const engagementManagementService = new EngagementManagementService()