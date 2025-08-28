import { api } from './client'
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
    return api.get<Account[]>('/accounts')
  },

  // Get account by ID
  getById: async (id: string): Promise<Account> => {
    return api.get<Account>(`/accounts/${id}`)
  },

  // Create new account
  create: async (data: CreateAccountData): Promise<Account> => {
    return api.post<Account>('/accounts', data)
  },

  // Update existing account
  update: async (id: string, data: UpdateAccountData): Promise<Account> => {
    return api.patch<Account>(`/accounts/${id}`, data)
  },

  // Delete account
  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/accounts/${id}`)
  },

  // Search accounts by name
  search: async (query: string): Promise<Account[]> => {
    return api.get<Account[]>(`/accounts/search?q=${encodeURIComponent(query)}`)
  }
}