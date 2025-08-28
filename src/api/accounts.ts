import { supabase } from '../lib/supabase'
import type { Account } from './types'

export interface CreateAccountData {
  name: string
  segment?: string
  region?: string
  account_type?: string
  address_street?: string
  address_city?: string
  address_state?: string
  address_zip?: string
  primary_contact_name?: string
  primary_contact_title?: string
  primary_contact_email?: string
  account_note?: string
  industry?: string
}

export interface UpdateAccountData {
  name?: string
  segment?: string
  region?: string
  account_type?: string
  address_street?: string
  address_city?: string
  address_state?: string
  address_zip?: string
  primary_contact_name?: string
  primary_contact_title?: string
  primary_contact_email?: string
  account_note?: string
  industry?: string
}

export const accountsApi = {
  // Get all accounts
  getAll: async (): Promise<Account[]> => {
    const { data, error } = await supabase
      .from('client_accounts')
      .select('id, name, segment, region, account_type, address_street, address_city, address_state, address_zip, primary_contact_name, primary_contact_title, primary_contact_email, account_note, industry, created_at')
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
      .select('id, name, segment, region, account_type, address_street, address_city, address_state, address_zip, primary_contact_name, primary_contact_title, primary_contact_email, account_note, industry, created_at')
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
        region: accountData.region || null,
        account_type: accountData.account_type || null,
        address_street: accountData.address_street || null,
        address_city: accountData.address_city || null,
        address_state: accountData.address_state || null,
        address_zip: accountData.address_zip || null,
        primary_contact_name: accountData.primary_contact_name || null,
        primary_contact_title: accountData.primary_contact_title || null,
        primary_contact_email: accountData.primary_contact_email || null,
        account_note: accountData.account_note || null,
        industry: accountData.industry || null
      }])
      .select('id, name, segment, region, account_type, address_street, address_city, address_state, address_zip, primary_contact_name, primary_contact_title, primary_contact_email, account_note, industry, created_at')
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
    
    if (updateData.account_type !== undefined) {
      updates.account_type = updateData.account_type || null
    }
    
    if (updateData.address_street !== undefined) {
      updates.address_street = updateData.address_street || null
    }
    
    if (updateData.address_city !== undefined) {
      updates.address_city = updateData.address_city || null
    }
    
    if (updateData.address_state !== undefined) {
      updates.address_state = updateData.address_state || null
    }
    
    if (updateData.address_zip !== undefined) {
      updates.address_zip = updateData.address_zip || null
    }
    
    if (updateData.primary_contact_name !== undefined) {
      updates.primary_contact_name = updateData.primary_contact_name || null
    }
    
    if (updateData.primary_contact_title !== undefined) {
      updates.primary_contact_title = updateData.primary_contact_title || null
    }
    
    if (updateData.primary_contact_email !== undefined) {
      updates.primary_contact_email = updateData.primary_contact_email || null
    }
    
    if (updateData.account_note !== undefined) {
      updates.account_note = updateData.account_note || null
    }
    
    if (updateData.industry !== undefined) {
      updates.industry = updateData.industry || null
    }
    
    if (Object.keys(updates).length === 0) {
      throw new Error('No fields to update')
    }

    const { data, error } = await supabase
      .from('client_accounts')
      .update(updates)
      .eq('id', id)
      .select('id, name, segment, region, account_type, address_street, address_city, address_state, address_zip, primary_contact_name, primary_contact_title, primary_contact_email, account_note, industry, created_at')
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
      .select('id, name, segment, region, account_type, address_street, address_city, address_state, address_zip, primary_contact_name, primary_contact_title, primary_contact_email, account_note, industry, created_at')
      .or(`name.ilike.%${query}%,segment.ilike.%${query}%,region.ilike.%${query}%,account_type.ilike.%${query}%,industry.ilike.%${query}%,primary_contact_name.ilike.%${query}%,address_city.ilike.%${query}%,address_state.ilike.%${query}%`)
      .order('name', { ascending: true })
    
    if (error) {
      throw new Error(`Failed to search accounts: ${error.message}`)
    }
    
    return data || []
  }
}