import { supabase } from '../lib/supabase'
import type { Account } from './types'

export interface CreateAccountData {
  name: string
  segment?: string
  region?: string
}

export interface UpdateAccountData {
  name?: string
  segment?: string
  region?: string
}

export const accountsApi = {
  // Get all accounts
  getAll: async (): Promise<Account[]> => {
    const { data, error } = await supabase
      .from('client_accounts')
      .select('id, name, segment, region, created_at')
      .order('name', { ascending: true })
    
    if (error) {
      throw new Error(`Failed to fetch accounts: ${error.message}`)
    }
    
    return data || []
  },

  // Get account by ID
  getById: async (id: string): Promise<Account> => {
    const { data, error } = await supabase
      .from('client_accounts')
      .select('id, name, segment, region, created_at')
      .eq('id', id)
      .single()
    
    if (error || !data) {
      throw new Error(`Account not found`)
    }
    
    return data
  },

  // Create new account
  create: async (accountData: CreateAccountData): Promise<Account> => {
    if (!accountData.name || accountData.name.trim() === '') {
      throw new Error('Account name is required')
    }

    const { data, error } = await supabase
      .from('client_accounts')
      .insert([{
        name: accountData.name.trim(),
        segment: accountData.segment || null,
        region: accountData.region || null
      }])
      .select('id, name, segment, region, created_at')
      .single()
    
    if (error) {
      throw new Error(`Failed to create account: ${error.message}`)
    }
    
    return data
  },

  // Update existing account
  update: async (id: string, updateData: UpdateAccountData): Promise<Account> => {
    const updates: any = {}
    
    if (updateData.name !== undefined) {
      if (updateData.name.trim() === '') {
        throw new Error('Account name cannot be empty')
      }
      updates.name = updateData.name.trim()
    }
    
    if (updateData.segment !== undefined) {
      updates.segment = updateData.segment || null
    }
    
    if (updateData.region !== undefined) {
      updates.region = updateData.region || null
    }
    
    if (Object.keys(updates).length === 0) {
      throw new Error('No fields to update')
    }

    const { data, error } = await supabase
      .from('client_accounts')
      .update(updates)
      .eq('id', id)
      .select('id, name, segment, region, created_at')
      .single()
    
    if (error || !data) {
      throw new Error(`Failed to update account: ${error?.message || 'Account not found'}`)
    }
    
    return data
  },

  // Delete account
  delete: async (id: string): Promise<void> => {
    // Check if account has related engagements
    const { count } = await supabase
      .from('engagement')
      .select('id', { count: 'exact' })
      .eq('account_id', id)
    
    if (count && count > 0) {
      throw new Error('Cannot delete account with existing engagements. Please delete or reassign engagements first.')
    }

    const { error } = await supabase
      .from('client_accounts')
      .delete()
      .eq('id', id)
    
    if (error) {
      throw new Error(`Failed to delete account: ${error.message}`)
    }
  },

  // Search accounts by name
  search: async (query: string): Promise<Account[]> => {
    if (!query || query.trim() === '') {
      throw new Error('Search query is required')
    }

    const { data, error } = await supabase
      .from('client_accounts')
      .select('id, name, segment, region, created_at')
      .or(`name.ilike.%${query}%,segment.ilike.%${query}%,region.ilike.%${query}%`)
      .order('name', { ascending: true })
    
    if (error) {
      throw new Error(`Failed to search accounts: ${error.message}`)
    }
    
    return data || []
  }
}