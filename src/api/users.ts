import { api } from './client'
import { User } from './types'

export const usersApi = {
  // Get all users
  getAll: () => api.get<User[]>('/users'),

  // Get user by ID
  getById: (id: string) => api.get<User>(`/users/${id}`),

  // Get users by role
  getByRole: (role: User['role']) => api.get<User[]>(`/users?role=${role}`),

  // Get team members for a manager
  getTeamMembers: (managerId: string) => api.get<User[]>(`/users?manager_id=${managerId}`),

  // Create new user
  create: (data: Partial<User>) => api.post<User>('/users', data),

  // Update user
  update: (id: string, data: Partial<User>) => api.patch<User>(`/users/${id}`, data),

  // Delete user
  delete: (id: string) => api.delete(`/users/${id}`),
}