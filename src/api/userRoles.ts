import type { 
  UserRole, 
  UserRoleAssignment, 
  UserRoleChangeLog,
  CreateUserRoleRequest,
  UpdateUserRoleRequest,
  AssignUserRoleRequest,
  UserWithRole
} from '../types/userRoles'
import { supabaseUserRoleService } from './supabaseUserRoles'

// User Roles API service - now connected to Supabase
// This service wraps the Supabase service and provides the same interface

class UserRoleService {
  // User Role CRUD operations
  async getAllUserRoles(): Promise<UserRole[]> {
    try {
      console.log('🚀 UserRoleService.getAllUserRoles called')
      const result = await supabaseUserRoleService.getAllUserRoles()
      console.log('✨ UserRoleService received result:', result?.length, 'roles')
      return result
    } catch (error) {
      console.error('💥 UserRoleService error:', error)
      console.error('   Error message:', error instanceof Error ? error.message : 'Unknown error')
      console.error('   Error stack:', error instanceof Error ? error.stack : 'No stack')
      throw new Error('Failed to fetch user roles')
    }
  }

  async getUserRoleById(id: string): Promise<UserRole | null> {
    try {
      return await supabaseUserRoleService.getUserRoleById(id)
    } catch (error) {
      console.error('Error fetching user role:', error)
      throw new Error('Failed to fetch user role')
    }
  }

  async createUserRole(data: CreateUserRoleRequest): Promise<UserRole> {
    try {
      return await supabaseUserRoleService.createUserRole(data)
    } catch (error) {
      console.error('Error creating user role:', error)
      throw new Error('Failed to create user role')
    }
  }

  async updateUserRole(id: string, data: UpdateUserRoleRequest): Promise<UserRole> {
    try {
      return await supabaseUserRoleService.updateUserRole(id, data)
    } catch (error) {
      console.error('Error updating user role:', error)
      throw new Error('Failed to update user role')
    }
  }

  async deleteUserRole(id: string): Promise<boolean> {
    try {
      return await supabaseUserRoleService.deleteUserRole(id)
    } catch (error) {
      console.error('Error deleting user role:', error)
      throw new Error('Failed to delete user role')
    }
  }

  // User Role Assignment operations
  async getUserRoleAssignments(userId?: string): Promise<UserRoleAssignment[]> {
    try {
      return await supabaseUserRoleService.getUserRoleAssignments(userId)
    } catch (error) {
      console.error('Error fetching role assignments:', error)
      throw new Error('Failed to fetch role assignments')
    }
  }

  async assignUserRole(data: AssignUserRoleRequest): Promise<UserRoleAssignment> {
    try {
      return await supabaseUserRoleService.assignUserRole(data)
    } catch (error) {
      console.error('Error assigning user role:', error)
      throw new Error('Failed to assign user role')
    }
  }

  async deactivateUserRoleAssignment(assignmentId: string): Promise<boolean> {
    try {
      return await supabaseUserRoleService.deactivateUserRoleAssignment(assignmentId)
    } catch (error) {
      console.error('Error deactivating role assignment:', error)
      throw new Error('Failed to deactivate role assignment')
    }
  }

  // Change Log operations
  async getUserRoleChangeLogs(userId?: string): Promise<UserRoleChangeLog[]> {
    try {
      return await supabaseUserRoleService.getUserRoleChangeLogs(userId)
    } catch (error) {
      console.error('Error fetching role change logs:', error)
      throw new Error('Failed to fetch role change logs')
    }
  }

  // Note: Role change logging is now handled automatically by the database triggers

  async deprecateRoleChangeLog(logId: string): Promise<boolean> {
    try {
      return await supabaseUserRoleService.deprecateRoleChangeLog(logId)
    } catch (error) {
      console.error('Error deprecating role change log:', error)
      throw new Error('Failed to deprecate role change log')
    }
  }

  // Helper methods
  async getUsersWithRoles(): Promise<UserWithRole[]> {
    try {
      return await supabaseUserRoleService.getUsersWithRoles()
    } catch (error) {
      console.error('Error fetching users with roles:', error)
      throw new Error('Failed to fetch users with roles')
    }
  }

  async getRoleStatistics() {
    try {
      return await supabaseUserRoleService.getRoleStatistics()
    } catch (error) {
      console.error('Error fetching role statistics:', error)
      throw new Error('Failed to fetch role statistics')
    }
  }

  // Alias method for compatibility with existing components
  async getAllRoles() {
    try {
      const roles = await this.getAllUserRoles()
      return { roles }
    } catch (error) {
      console.error('Error fetching roles:', error)
      throw new Error('Failed to fetch roles')
    }
  }
}

export const userRoleService = new UserRoleService()