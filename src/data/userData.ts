import type { User } from '../api/types'

// Define our users according to the requirements
export const userData: User[] = [
  // Admin
  {
    id: 'user-admin-001',
    name: 'Chris',
    email: 'chris@company.com',
    role: 'MANAGER', // Using MANAGER as admin since API types don't have ADMIN
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  
  // Manager  
  {
    id: 'user-manager-001',
    name: 'Derek',
    email: 'derek@company.com',
    role: 'MANAGER',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // Reps
  {
    id: 'user-rep-001',
    name: 'Rolando',
    email: 'rolando@company.com',
    role: 'REP',
    manager_id: 'user-manager-001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-rep-002',
    name: 'Amanda',
    email: 'amanda@company.com',
    role: 'REP',
    manager_id: 'user-manager-001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-rep-003',
    name: 'Lisa',
    email: 'lisa@company.com',
    role: 'REP',
    manager_id: 'user-manager-001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-rep-004',
    name: 'Josh',
    email: 'josh@company.com',
    role: 'REP',
    manager_id: 'user-manager-001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-rep-005',
    name: 'Steph',
    email: 'steph@company.com',
    role: 'REP',
    manager_id: 'user-manager-001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

// Helper function to get user by ID
export const getUserById = (id: string): User | undefined => {
  return userData.find(user => user.id === id)
}

// Helper function to get user by email
export const getUserByEmail = (email: string): User | undefined => {
  return userData.find(user => user.email === email)
}

// Helper function to get reps under a manager
export const getRepsByManager = (managerId: string): User[] => {
  return userData.filter(user => user.role === 'REP' && user.manager_id === managerId)
}

// Helper function for authentication - check role based on email
export const determineRoleFromEmail = (email: string): 'MANAGER' | 'REP' => {
  const user = getUserByEmail(email)
  if (user) return user.role
  
  // Fallback logic for demo authentication
  if (email.includes('chris') || email.includes('derek') || email.includes('admin') || email.includes('manager')) {
    return 'MANAGER'
  }
  return 'REP'
}