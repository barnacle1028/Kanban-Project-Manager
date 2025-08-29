import { supabase } from '../lib/supabase'
import type { 
  UserRole, 
  UserRoleAssignment, 
  UserRoleChangeLog,
  CreateUserRoleRequest,
  UpdateUserRoleRequest,
  AssignUserRoleRequest,
  UserWithRole
} from '../types/userRoles'
import { auditService } from '../services/auditService'

// Supabase API service for User Roles
// Connected to actual Supabase database tables

class SupabaseUserRoleService {
  
  // User Role CRUD operations
  async getAllUserRoles(): Promise<UserRole[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) {
        console.error('Supabase error fetching user roles:', error)
        throw new Error(`Failed to fetch user roles: ${error.message}`)
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching user roles:', error)
      throw error
    }
  }

  async getUserRoleById(id: string): Promise<UserRole | null> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Supabase error fetching user role:', error)
        throw new Error(`Failed to fetch user role: ${error.message}`)
      }
      
      return data || null
    } catch (error) {
      console.error('Error fetching user role:', error)
      throw error
    }
  }

  async createUserRole(data: CreateUserRoleRequest): Promise<UserRole> {
    try {
      // Get current user from auth context (for now, use a placeholder)
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      const currentUserId = currentUser?.id
      
      if (!currentUserId) {
        throw new Error('Must be authenticated to create user roles')
      }

      const newRole = {
        name: data.name,
        role_type: data.role_type,
        description: data.description,
        is_active: true,
        dashboard_access: data.dashboard_access,
        permissions: data.permissions,
        created_by: currentUserId
      }
      
      const { data: insertedRole, error } = await supabase
        .from('user_roles')
        .insert([newRole])
        .select()
        .single()
      
      if (error) {
        console.error('Supabase error creating user role:', error)
        throw new Error(`Failed to create user role: ${error.message}`)
      }
      
      // Log audit trail
      await auditService.logAction(
        currentUserId,
        currentUser?.email || 'Unknown User',
        'CREATE',
        'user_role',
        `Created new user role: ${insertedRole.name} (${insertedRole.role_type})`,
        insertedRole.id
      )
      
      return insertedRole
    } catch (error) {
      console.error('Error creating user role:', error)
      throw error
    }
  }

  async updateUserRole(id: string, data: UpdateUserRoleRequest): Promise<UserRole> {
    try {
      // Get current user from auth context
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      const currentUserId = currentUser?.id
      
      if (!currentUserId) {
        throw new Error('Must be authenticated to update user roles')
      }

      // Get original role for audit logging
      const originalRole = await this.getUserRoleById(id)
      if (!originalRole) {
        throw new Error('User role not found')
      }

      const { data: updatedRole, error } = await supabase
        .from('user_roles')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Supabase error updating user role:', error)
        throw new Error(`Failed to update user role: ${error.message}`)
      }
      
      // Log audit trail with changes
      const changes = auditService.generateChanges(originalRole, updatedRole)
      await auditService.logAction(
        currentUserId,
        currentUser?.email || 'Unknown User',
        'UPDATE',
        'user_role',
        `Updated user role: ${updatedRole.name} (${updatedRole.role_type})`,
        id,
        changes
      )
      
      return updatedRole
    } catch (error) {
      console.error('Error updating user role:', error)
      throw error
    }
  }

  async deleteUserRole(id: string): Promise<boolean> {
    try {
      // Get current user from auth context
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      const currentUserId = currentUser?.id
      
      if (!currentUserId) {
        throw new Error('Must be authenticated to delete user roles')
      }

      // Get role for audit logging before deletion
      const role = await this.getUserRoleById(id)
      if (!role) {
        throw new Error('User role not found')
      }

      // Check if role is assigned to any users
      const { data: assignments, error: assignmentError } = await supabase
        .from('user_role_assignments')
        .select('id')
        .eq('user_role_id', id)
        .eq('is_active', true)

      if (assignmentError) {
        console.error('Error checking role assignments:', assignmentError)
        throw new Error(`Failed to check role assignments: ${assignmentError.message}`)
      }

      if (assignments && assignments.length > 0) {
        throw new Error('Cannot delete user role that is currently assigned to users')
      }

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Supabase error deleting user role:', error)
        throw new Error(`Failed to delete user role: ${error.message}`)
      }
      
      // Log audit trail
      await auditService.logAction(
        currentUserId,
        currentUser?.email || 'Unknown User',
        'DELETE',
        'user_role',
        `Deleted user role: ${role.name} (${role.role_type})`,
        id
      )
      
      return true
    } catch (error) {
      console.error('Error deleting user role:', error)
      throw error
    }
  }

  // User Role Assignment operations
  async getUserRoleAssignments(userId?: string): Promise<UserRoleAssignment[]> {
    try {
      let query = supabase
        .from('user_role_assignments')
        .select(`
          *,
          user_roles!inner(name, role_type),
          assigned_by_user:users!user_role_assignments_assigned_by_fkey(id, email, first_name, last_name)
        `)
        .order('assigned_at', { ascending: false })
      
      if (userId) {
        query = query.eq('user_id', userId)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('Supabase error fetching role assignments:', error)
        throw new Error(`Failed to fetch role assignments: ${error.message}`)
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching role assignments:', error)
      throw error
    }
  }

  async assignUserRole(data: AssignUserRoleRequest): Promise<UserRoleAssignment> {
    try {
      // Get current user from auth context
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      const currentUserId = currentUser?.id
      
      if (!currentUserId) {
        throw new Error('Must be authenticated to assign user roles')
      }

      const newAssignment = {
        user_id: data.user_id,
        user_role_id: data.user_role_id,
        assigned_by: currentUserId,
        is_active: true,
        effective_from: data.effective_from || new Date().toISOString(),
        effective_until: data.effective_until
      }

      const { data: assignment, error } = await supabase
        .from('user_role_assignments')
        .insert([newAssignment])
        .select(`
          *,
          user_roles!inner(name, role_type)
        `)
        .single()

      if (error) {
        console.error('Supabase error assigning user role:', error)
        throw new Error(`Failed to assign user role: ${error.message}`)
      }

      // Log audit trail
      const roleName = assignment.user_roles?.name || 'Unknown'
      await auditService.logAction(
        currentUserId,
        currentUser?.email || 'Unknown User',
        'CREATE',
        'user_role_assignment',
        `Assigned role "${roleName}" to user`,
        assignment.id
      )

      return assignment
    } catch (error) {
      console.error('Error assigning user role:', error)
      throw error
    }
  }

  async deactivateUserRoleAssignment(assignmentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_role_assignments')
        .update({ 
          is_active: false, 
          effective_until: new Date().toISOString() 
        })
        .eq('id', assignmentId)

      if (error) {
        console.error('Supabase error deactivating role assignment:', error)
        throw new Error(`Failed to deactivate role assignment: ${error.message}`)
      }

      return true
    } catch (error) {
      console.error('Error deactivating role assignment:', error)
      throw error
    }
  }

  // Change Log operations
  async getUserRoleChangeLogs(userId?: string): Promise<UserRoleChangeLog[]> {
    try {
      let query = supabase
        .from('user_role_change_logs')
        .select(`
          *,
          previous_role:user_roles!user_role_change_logs_previous_role_id_fkey(name, role_type),
          new_role:user_roles!user_role_change_logs_new_role_id_fkey(name, role_type),
          changed_by_user:users!user_role_change_logs_changed_by_fkey(id, email, first_name, last_name)
        `)
        .order('changed_at', { ascending: false })
      
      if (userId) {
        query = query.eq('user_id', userId)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('Supabase error fetching role change logs:', error)
        throw new Error(`Failed to fetch role change logs: ${error.message}`)
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching role change logs:', error)
      throw error
    }
  }

  async deprecateRoleChangeLog(logId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_role_change_logs')
        .update({ is_deprecated: true })
        .eq('id', logId)

      if (error) {
        console.error('Supabase error deprecating role change log:', error)
        throw new Error(`Failed to deprecate role change log: ${error.message}`)
      }

      return true
    } catch (error) {
      console.error('Error deprecating role change log:', error)
      throw error
    }
  }

  // Helper methods
  async getUsersWithRoles(): Promise<UserWithRole[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          is_active,
          created_at,
          updated_at,
          active_assignment:user_role_assignments!inner(
            id,
            assigned_at,
            effective_from,
            effective_until,
            is_active,
            user_role:user_roles!inner(
              id,
              name,
              role_type,
              dashboard_access,
              permissions
            )
          )
        `)
        .eq('user_role_assignments.is_active', true)
        .eq('is_active', true)

      if (error) {
        console.error('Supabase error fetching users with roles:', error)
        throw new Error(`Failed to fetch users with roles: ${error.message}`)
      }

      // Transform the data to match the UserWithRole interface
      const usersWithRoles = (data || []).map(user => ({
        ...user,
        role_assignment: user.active_assignment?.[0] || null,
        user_role: user.active_assignment?.[0]?.user_role || null
      }))

      return usersWithRoles
    } catch (error) {
      console.error('Error fetching users with roles:', error)
      throw error
    }
  }

  async getRoleStatistics() {
    try {
      const roles = await this.getAllUserRoles()
      
      // Get assignment statistics for each role
      const roleStats = await Promise.all(
        roles.map(async (role) => {
          const { data: totalAssignments, error: totalError } = await supabase
            .from('user_role_assignments')
            .select('id')
            .eq('user_role_id', role.id)

          const { data: activeAssignments, error: activeError } = await supabase
            .from('user_role_assignments')
            .select('id')
            .eq('user_role_id', role.id)
            .eq('is_active', true)

          if (totalError || activeError) {
            console.warn(`Error fetching statistics for role ${role.name}:`, totalError || activeError)
            return {
              role,
              total_assignments: 0,
              active_assignments: 0
            }
          }

          return {
            role,
            total_assignments: totalAssignments?.length || 0,
            active_assignments: activeAssignments?.length || 0
          }
        })
      )
      
      return roleStats
    } catch (error) {
      console.error('Error fetching role statistics:', error)
      throw error
    }
  }
}

export const supabaseUserRoleService = new SupabaseUserRoleService()