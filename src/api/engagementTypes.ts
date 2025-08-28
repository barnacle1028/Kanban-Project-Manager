import { supabase } from '../lib/supabase'

export interface EngagementType {
  id: string
  name: string
  description?: string
  default_duration_hours?: number
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export const engagementTypesApi = {
  async getAll(): Promise<EngagementType[]> {
    const { data, error } = await supabase
      .from('engagement_types')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (error) {
      throw new Error(`Failed to fetch engagement types: ${error.message}`)
    }

    return data || []
  },

  async getById(id: string): Promise<EngagementType | null> {
    const { data, error } = await supabase
      .from('engagement_types')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Failed to fetch engagement type: ${error.message}`)
    }

    return data
  },

  async create(engagementType: Omit<EngagementType, 'id' | 'created_at' | 'updated_at'>): Promise<EngagementType> {
    const { data, error } = await supabase
      .from('engagement_types')
      .insert([engagementType])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create engagement type: ${error.message}`)
    }

    return data
  },

  async update(id: string, updates: Partial<Omit<EngagementType, 'id' | 'created_at'>>): Promise<EngagementType> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('engagement_types')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update engagement type: ${error.message}`)
    }

    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('engagement_types')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete engagement type: ${error.message}`)
    }
  },

  async initializeTypes(): Promise<void> {
    const predefinedTypes = [
      { name: 'Quick Start 4-Hour', description: 'Quick Start engagement with 4 hour scope', default_duration_hours: 4, sort_order: 1 },
      { name: 'Quick Start 10-Hour', description: 'Quick Start engagement with 10 hour scope', default_duration_hours: 10, sort_order: 2 },
      { name: 'Quick Start 15-Hour', description: 'Quick Start engagement with 15 hour scope', default_duration_hours: 15, sort_order: 3 },
      { name: 'Engage (1-19)', description: 'Standard Engage package for 1-19 users', default_duration_hours: 40, sort_order: 4 },
      { name: 'Engage (1-19)+One (1) Add-on', description: 'Engage 1-19 with one add-on', default_duration_hours: 50, sort_order: 5 },
      { name: 'Engage (1-19)+Two (2) Add-ons', description: 'Engage 1-19 with two add-ons', default_duration_hours: 60, sort_order: 6 },
      { name: 'Engage (1-19)+three (3) Add-ons', description: 'Engage 1-19 with three add-ons', default_duration_hours: 70, sort_order: 7 },
      { name: 'Engage (20-49)', description: 'Standard Engage package for 20-49 users', default_duration_hours: 80, sort_order: 8 },
      { name: 'Engage (20-49)+One (1) Add-on Lite', description: 'Engage 20-49 with one lite add-on', default_duration_hours: 90, sort_order: 9 },
      { name: 'Engage (20-49)+One (1) Add-on Starter', description: 'Engage 20-49 with one starter add-on', default_duration_hours: 95, sort_order: 10 },
      { name: 'Engage (20-49)+Two (2) Add-ons Starter', description: 'Engage 20-49 with two starter add-ons', default_duration_hours: 105, sort_order: 11 },
      { name: 'Engage (20-49)+Two (2) Add-ons Premium', description: 'Engage 20-49 with two premium add-ons', default_duration_hours: 110, sort_order: 12 },
      { name: 'Engage (20-49)+Three (3) Add-ons Premium', description: 'Engage 20-49 with three premium add-ons', default_duration_hours: 120, sort_order: 13 },
      { name: 'Engage (20-49)+Three (3) Add-ons Advanced', description: 'Engage 20-49 with three advanced add-ons', default_duration_hours: 130, sort_order: 14 },
      { name: 'EngagePlus (20-49)', description: 'Enhanced Engage package for 20-49 users', default_duration_hours: 100, sort_order: 15 },
      { name: 'Engage (50-99)', description: 'Standard Engage package for 50-99 users', default_duration_hours: 160, sort_order: 16 },
      { name: 'Engage (50-99)+One (1) Add-on', description: 'Engage 50-99 with one add-on', default_duration_hours: 180, sort_order: 17 },
      { name: 'Engage (50-99)+Two (2) Add-ons', description: 'Engage 50-99 with two add-ons', default_duration_hours: 200, sort_order: 18 },
      { name: 'Engage (50-99)+Three (3) Add-ons', description: 'Engage 50-99 with three add-ons', default_duration_hours: 220, sort_order: 19 },
      { name: 'EngagePlus (50-99)', description: 'Enhanced Engage package for 50-99 users', default_duration_hours: 200, sort_order: 20 },
      { name: 'Lite Platform Add-on (1-49)', description: 'Lite platform add-on for 1-49 users', default_duration_hours: 20, sort_order: 21 },
      { name: 'Starter Platform Add-on (49-100)', description: 'Starter platform add-on for 49-100 users', default_duration_hours: 30, sort_order: 22 },
      { name: 'Premium Platform Add-on', description: 'Premium platform add-on', default_duration_hours: 40, sort_order: 23 },
      { name: 'Advanced Platform Add-on', description: 'Advanced platform add-on', default_duration_hours: 50, sort_order: 24 },
      { name: 'Basic Virtual Training (1-25)', description: 'Basic virtual training for 1-25 users', default_duration_hours: 16, sort_order: 25 },
      { name: 'Preferred Virtual Training (1-100)', description: 'Preferred virtual training for 1-100 users', default_duration_hours: 32, sort_order: 26 },
      { name: 'Basic Optimization (1-25)', description: 'Basic optimization for 1-25 users', default_duration_hours: 20, sort_order: 27 },
      { name: 'Preferred Optimization (1-100)', description: 'Preferred optimization for 1-100 users', default_duration_hours: 40, sort_order: 28 },
      { name: 'Managed Services (3 months)', description: '3-month managed services package', default_duration_hours: 120, sort_order: 29 },
      { name: 'Managed Services (6 months)', description: '6-month managed services package', default_duration_hours: 240, sort_order: 30 },
      { name: 'Managed Services (12 months)', description: '12-month managed services package', default_duration_hours: 480, sort_order: 31 },
      { name: 'Expansion (1-19)', description: 'Expansion services for 1-19 users', default_duration_hours: 30, sort_order: 32 },
      { name: 'Expansion (20-49)', description: 'Expansion services for 20-49 users', default_duration_hours: 60, sort_order: 33 },
      { name: 'Expansion (50-99)', description: 'Expansion services for 50-99 users', default_duration_hours: 120, sort_order: 34 },
      { name: '4 hours of technical support', description: 'Technical support package - 4 hours', default_duration_hours: 4, sort_order: 35 },
      { name: '10 hours of technical support', description: 'Technical support package - 10 hours', default_duration_hours: 10, sort_order: 36 },
      { name: '15 hours of technical support', description: 'Technical support package - 15 hours', default_duration_hours: 15, sort_order: 37 },
      { name: 'Basic Optimization', description: 'Basic optimization services', default_duration_hours: 20, sort_order: 38 },
      { name: 'Basic Virtual Training', description: 'Basic virtual training services', default_duration_hours: 16, sort_order: 39 },
      { name: 'Training for one user group/team', description: 'Focused training for specific team', default_duration_hours: 8, sort_order: 40 },
      { name: 'Custom Scope', description: 'Custom scoped engagement', default_duration_hours: null, sort_order: 41 }
    ]

    const formattedTypes = predefinedTypes.map(type => ({
      ...type,
      is_active: true
    }))

    const { error } = await supabase
      .from('engagement_types')
      .upsert(formattedTypes, { 
        onConflict: 'name',
        ignoreDuplicates: true 
      })

    if (error) {
      throw new Error(`Failed to initialize engagement types: ${error.message}`)
    }
  }
}