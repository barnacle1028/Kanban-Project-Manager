import { supabase } from '../lib/supabase'
import type { EngagementWithMilestones, Engagement } from './types'

export const supabaseEngagementsApi = {
  // Get all engagements
  async getAll(): Promise<EngagementWithMilestones[]> {
    const { data, error } = await supabase
      .from('engagement')
      .select(`
        *,
        account!inner(id, name),
        owner:account!engagement_owner_id_fkey(id, first_name, last_name),
        milestones:milestones(
          id,
          name,
          due_date,
          stage,
          template:milestone_template(id, name)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching engagements:', error)
      throw new Error(`Failed to fetch engagements: ${error.message}`)
    }

    // Transform the data to match your existing types
    return data?.map(engagement => ({
      id: engagement.id,
      name: engagement.name || 'Unnamed Engagement',
      status: engagement.status,
      health: engagement.health || 'GREEN',
      priority: engagement.priority || 1,
      percent_complete: engagement.percent_complete || 0,
      start_date: engagement.start_date,
      target_launch_date: engagement.target_launch_date,
      account: {
        id: engagement.account.id,
        name: engagement.account.name
      },
      owner: {
        id: engagement.owner?.id || '',
        name: engagement.owner ? 
          `${engagement.owner.first_name} ${engagement.owner.last_name}` : 
          'Unknown'
      },
      milestones: engagement.milestones || []
    })) || []
  },

  // Get engagements by user (rep)
  async getByUser(userId: string): Promise<EngagementWithMilestones[]> {
    const { data, error } = await supabase
      .from('engagement')
      .select(`
        *,
        account!inner(id, name),
        owner:account!engagement_owner_id_fkey(id, first_name, last_name),
        milestones:milestones(
          id,
          name,
          due_date,
          stage,
          template:milestone_template(id, name)
        )
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user engagements:', error)
      throw new Error(`Failed to fetch user engagements: ${error.message}`)
    }

    return data?.map(engagement => ({
      id: engagement.id,
      name: engagement.name || 'Unnamed Engagement',
      status: engagement.status,
      health: engagement.health || 'GREEN',
      priority: engagement.priority || 1,
      percent_complete: engagement.percent_complete || 0,
      start_date: engagement.start_date,
      target_launch_date: engagement.target_launch_date,
      account: {
        id: engagement.account.id,
        name: engagement.account.name
      },
      owner: {
        id: engagement.owner?.id || '',
        name: engagement.owner ? 
          `${engagement.owner.first_name} ${engagement.owner.last_name}` : 
          'Unknown'
      },
      milestones: engagement.milestones || []
    })) || []
  },

  // Get engagements by manager
  async getByManager(managerId: string): Promise<EngagementWithMilestones[]> {
    // For now, get all engagements - you can modify this based on your team structure
    return this.getAll()
  },

  // Get single engagement by ID
  async getById(id: string): Promise<EngagementWithMilestones | null> {
    const { data, error } = await supabase
      .from('engagement')
      .select(`
        *,
        account!inner(id, name),
        owner:account!engagement_owner_id_fkey(id, first_name, last_name),
        milestones:milestones(
          id,
          name,
          due_date,
          stage,
          template:milestone_template(id, name)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching engagement:', error)
      throw new Error(`Failed to fetch engagement: ${error.message}`)
    }

    if (!data) return null

    return {
      id: data.id,
      name: data.name || 'Unnamed Engagement',
      status: data.status,
      health: data.health || 'GREEN',
      priority: data.priority || 1,
      percent_complete: data.percent_complete || 0,
      start_date: data.start_date,
      target_launch_date: data.target_launch_date,
      account: {
        id: data.account.id,
        name: data.account.name
      },
      owner: {
        id: data.owner?.id || '',
        name: data.owner ? 
          `${data.owner.first_name} ${data.owner.last_name}` : 
          'Unknown'
      },
      milestones: data.milestones || []
    }
  },

  // Create engagement
  async create(engagementData: Partial<Engagement>): Promise<EngagementWithMilestones> {
    const { data, error } = await supabase
      .from('engagement')
      .insert([engagementData])
      .select(`
        *,
        account!inner(id, name),
        owner:account!engagement_owner_id_fkey(id, first_name, last_name)
      `)
      .single()

    if (error) {
      console.error('Error creating engagement:', error)
      throw new Error(`Failed to create engagement: ${error.message}`)
    }

    return {
      id: data.id,
      name: data.name || 'Unnamed Engagement',
      status: data.status,
      health: data.health || 'GREEN',
      priority: data.priority || 1,
      percent_complete: data.percent_complete || 0,
      start_date: data.start_date,
      target_launch_date: data.target_launch_date,
      account: {
        id: data.account.id,
        name: data.account.name
      },
      owner: {
        id: data.owner?.id || '',
        name: data.owner ? 
          `${data.owner.first_name} ${data.owner.last_name}` : 
          'Unknown'
      },
      milestones: []
    }
  },

  // Update engagement
  async update(id: string, updates: Partial<Engagement>): Promise<EngagementWithMilestones> {
    const { data, error } = await supabase
      .from('engagement')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        account!inner(id, name),
        owner:account!engagement_owner_id_fkey(id, first_name, last_name)
      `)
      .single()

    if (error) {
      console.error('Error updating engagement:', error)
      throw new Error(`Failed to update engagement: ${error.message}`)
    }

    return {
      id: data.id,
      name: data.name || 'Unnamed Engagement',
      status: data.status,
      health: data.health || 'GREEN',
      priority: data.priority || 1,
      percent_complete: data.percent_complete || 0,
      start_date: data.start_date,
      target_launch_date: data.target_launch_date,
      account: {
        id: data.account.id,
        name: data.account.name
      },
      owner: {
        id: data.owner?.id || '',
        name: data.owner ? 
          `${data.owner.first_name} ${data.owner.last_name}` : 
          'Unknown'
      },
      milestones: []
    }
  },

  // Milestone management
  milestones: {
    async updateStage(engagementId: string, milestoneId: string, stage: string) {
      const { data, error } = await supabase
        .from('milestones')
        .update({ stage })
        .eq('id', milestoneId)
        .eq('engagement_id', engagementId)
        .select()
        .single()

      if (error) {
        console.error('Error updating milestone stage:', error)
        throw new Error(`Failed to update milestone: ${error.message}`)
      }

      return data
    }
  }
}