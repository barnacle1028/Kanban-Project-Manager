import type { Engagement, ProjectStatus, Speed, CRM, SalesType, AddOn } from '../types'
import { api } from '../api/client'

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
  async getAllEngagements(
    filter?: EngagementFilter,
    sort?: EngagementListSort,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedEngagementResponse> {
    try {
      // Build query parameters
      const params = new URLSearchParams()
      params.append('limit', limit.toString())
      params.append('offset', ((page - 1) * limit).toString())

      if (filter) {
        if (filter.status) params.append('status', filter.status)
        if (filter.search) params.append('search', filter.search)
      }

      const response = await api.get<{
        engagements: Engagement[]
        pagination: { total: number, limit: number, offset: number }
      }>(`/engagements?${params}`)

      // Transform backend response to match frontend expectations
      const transformedEngagements = response.engagements.map(this.transformEngagementFromAPI)

      // Apply client-side filtering for fields not handled by backend
      let filteredEngagements = transformedEngagements
      if (filter) {
        if (filter.health) {
          filteredEngagements = filteredEngagements.filter(e => e.health === filter.health)
        }
        if (filter.assignedRep) {
          filteredEngagements = filteredEngagements.filter(e => e.assignedRep === filter.assignedRep)
        }
        if (filter.accountName) {
          filteredEngagements = filteredEngagements.filter(e => e.accountName === filter.accountName)
        }
        if (filter.search) {
          const searchLower = filter.search.toLowerCase()
          filteredEngagements = filteredEngagements.filter(e => 
            e.name.toLowerCase().includes(searchLower) ||
            e.accountName.toLowerCase().includes(searchLower) ||
            (e.assignedRep && e.assignedRep.toLowerCase().includes(searchLower))
          )
        }
      }

      // Apply client-side sorting
      if (sort) {
        filteredEngagements.sort((a, b) => {
          const aVal = a[sort.field]
          const bVal = b[sort.field]
          
          if (aVal === null || aVal === undefined) return sort.direction === 'asc' ? 1 : -1
          if (bVal === null || bVal === undefined) return sort.direction === 'asc' ? -1 : 1
          
          const comparison = aVal.toString().localeCompare(bVal.toString())
          return sort.direction === 'asc' ? comparison : -comparison
        })
      }

      return {
        engagements: filteredEngagements,
        total: response.pagination?.total || filteredEngagements.length,
        page,
        limit,
        total_pages: Math.ceil((response.pagination?.total || filteredEngagements.length) / limit)
      }
    } catch (error) {
      console.error('Error fetching engagements:', error)
      throw new Error('Failed to fetch engagements')
    }
  }

  async getEngagementById(id: string): Promise<Engagement | null> {
    try {
      const response = await api.get<any>(`/engagements/${id}`)
      return this.transformEngagementFromAPI(response)
    } catch (error) {
      console.error('Error fetching engagement:', error)
      if (error instanceof Error && 'status' in error && (error as any).status === 404) {
        return null
      }
      throw new Error('Failed to fetch engagement')
    }
  }

  async createEngagement(data: CreateEngagementRequest): Promise<Engagement> {
    try {
      const response = await api.post<{ engagement: any }>('/engagements', data)
      return this.transformEngagementFromAPI(response.engagement)
    } catch (error) {
      console.error('Error creating engagement:', error)
      throw new Error('Failed to create engagement')
    }
  }

  async updateEngagement(id: string, data: UpdateEngagementRequest): Promise<Engagement> {
    try {
      const response = await api.patch<{ engagement: any }>(`/engagements/${id}`, data)
      return this.transformEngagementFromAPI(response.engagement)
    } catch (error) {
      console.error('Error updating engagement:', error)
      throw new Error('Failed to update engagement')
    }
  }

  async deleteEngagement(id: string): Promise<boolean> {
    try {
      await api.delete(`/engagements/${id}`)
      return true
    } catch (error) {
      console.error('Error deleting engagement:', error)
      throw new Error('Failed to delete engagement')
    }
  }

  async getAvailableReps(): Promise<string[]> {
    try {
      const response = await api.get<string[]>('/engagements/reps')
      return response
    } catch (error) {
      console.error('Error fetching available reps:', error)
      // Fallback to default reps if API call fails
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
  }

  // Transform API response to match frontend Engagement interface
  private transformEngagementFromAPI(apiEngagement: any): Engagement {
    return {
      id: apiEngagement.id,
      accountName: apiEngagement.account_name || apiEngagement.accountName,
      name: apiEngagement.name,
      status: apiEngagement.status,
      health: apiEngagement.health,
      assignedRep: apiEngagement.assigned_rep || apiEngagement.assignedRep,
      startDate: apiEngagement.start_date || apiEngagement.startDate,
      closeDate: apiEngagement.close_date || apiEngagement.closeDate,
      salesType: apiEngagement.sales_type || apiEngagement.salesType,
      speed: apiEngagement.speed,
      crm: apiEngagement.crm,
      avazaLink: apiEngagement.avaza_link || apiEngagement.avazaLink,
      projectFolderLink: apiEngagement.project_folder_link || apiEngagement.projectFolderLink,
      clientWebsiteLink: apiEngagement.client_website_link || apiEngagement.clientWebsiteLink,
      soldBy: apiEngagement.sold_by || apiEngagement.soldBy,
      seatCount: apiEngagement.seat_count || apiEngagement.seatCount,
      hoursAlloted: apiEngagement.hours_allocated || apiEngagement.hoursAlloted,
      primaryContactName: apiEngagement.primary_contact_name || apiEngagement.primaryContactName,
      primaryContactEmail: apiEngagement.primary_contact_email || apiEngagement.primaryContactEmail,
      linkedinLink: apiEngagement.linkedin_link || apiEngagement.linkedinLink,
      addOnsPurchased: apiEngagement.add_ons_purchased || apiEngagement.addOnsPurchased || [],
      milestones: apiEngagement.milestones || []
    }
  }
}

export const engagementManagementService = new EngagementManagementService()