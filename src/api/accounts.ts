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
    const { data, error } = await supabase.functions.invoke('accounts', {
      method: 'GET'
    })
    
    if (error) {
      throw new Error(`Failed to fetch accounts: ${error.message}`)
    }
    
    return data
  },

  // Get account by ID
  getById: async (id: string): Promise<Account> => {
    const { data, error } = await supabase.functions.invoke('accounts', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    
    if (error) {
      throw new Error(`Failed to fetch account: ${error.message}`)
    }
    
    return data
  },

  // Create new account
  create: async (data: CreateAccountData): Promise<Account> => {
    const { data: result, error } = await supabase.functions.invoke('accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (error) {
      throw new Error(`Failed to create account: ${error.message}`)
    }
    
    return result
  },

  // Update existing account
  update: async (id: string, data: UpdateAccountData): Promise<Account> => {
    const { data: result, error } = await supabase.functions.invoke('accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data })
    })
    
    if (error) {
      throw new Error(`Failed to update account: ${error.message}`)
    }
    
    return result
  },

  // Delete account
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.functions.invoke('accounts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    
    if (error) {
      throw new Error(`Failed to delete account: ${error.message}`)
    }
  },

  // Search accounts by name
  search: async (query: string): Promise<Account[]> => {
    const { data, error } = await supabase.functions.invoke('accounts', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query })
    })
    
    if (error) {
      throw new Error(`Failed to search accounts: ${error.message}`)
    }
    
    return data
  }
}