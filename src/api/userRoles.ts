import type { 
  UserRole, 
  UserRoleAssignment, 
  UserRoleChangeLog,
  CreateUserRoleRequest,
  UpdateUserRoleRequest,
  AssignUserRoleRequest,
  UserWithRole
} from '../types/userRoles'

// Mock API service for User Roles
// In a real application, this would make HTTP calls to your backend

class UserRoleService {
  private baseUrl = '/api/user-roles'

  // User Role CRUD operations
  async getAllUserRoles(): Promise<UserRole[]> {
    try {
      // Mock data - replace with actual API call
      return mockUserRoles
    } catch (error) {
      console.error('Error fetching user roles:', error)
      throw new Error('Failed to fetch user roles')
    }
  }

  async getUserRoleById(id: string): Promise<UserRole | null> {
    try {
      // Mock implementation
      return mockUserRoles.find(role => role.id === id) || null
    } catch (error) {
      console.error('Error fetching user role:', error)
      throw new Error('Failed to fetch user role')
    }
  }

  async createUserRole(data: CreateUserRoleRequest): Promise<UserRole> {
    try {
      // Mock implementation - replace with actual API call
      const newRole: UserRole = {
        id: `role-${Date.now()}`,
        name: data.name,
        role_type: data.role_type,
        description: data.description,
        is_active: true,
        dashboard_access: data.dashboard_access,
        permissions: data.permissions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'current-user-id' // This would come from auth context
      }
      
      mockUserRoles.push(newRole)
      return newRole
    } catch (error) {
      console.error('Error creating user role:', error)
      throw new Error('Failed to create user role')
    }
  }

  async updateUserRole(id: string, data: UpdateUserRoleRequest): Promise<UserRole> {
    try {
      // Mock implementation
      const roleIndex = mockUserRoles.findIndex(role => role.id === id)
      if (roleIndex === -1) {
        throw new Error('User role not found')
      }

      const updatedRole = {
        ...mockUserRoles[roleIndex],
        ...data,
        updated_at: new Date().toISOString()
      }

      mockUserRoles[roleIndex] = updatedRole
      return updatedRole
    } catch (error) {
      console.error('Error updating user role:', error)
      throw new Error('Failed to update user role')
    }
  }

  async deleteUserRole(id: string): Promise<boolean> {
    try {
      // Mock implementation
      const roleIndex = mockUserRoles.findIndex(role => role.id === id)
      if (roleIndex === -1) {
        throw new Error('User role not found')
      }

      // Check if role is assigned to any users
      const hasAssignments = mockUserRoleAssignments.some(
        assignment => assignment.user_role_id === id && assignment.is_active
      )

      if (hasAssignments) {
        throw new Error('Cannot delete user role that is currently assigned to users')
      }

      mockUserRoles.splice(roleIndex, 1)
      return true
    } catch (error) {
      console.error('Error deleting user role:', error)
      throw new Error('Failed to delete user role')
    }
  }

  // User Role Assignment operations
  async getUserRoleAssignments(userId?: string): Promise<UserRoleAssignment[]> {
    try {
      // Mock implementation
      if (userId) {
        return mockUserRoleAssignments.filter(assignment => assignment.user_id === userId)
      }
      return mockUserRoleAssignments
    } catch (error) {
      console.error('Error fetching role assignments:', error)
      throw new Error('Failed to fetch role assignments')
    }
  }

  async assignUserRole(data: AssignUserRoleRequest): Promise<UserRoleAssignment> {
    try {
      // Mock implementation
      // First, deactivate any existing active assignments for this user
      mockUserRoleAssignments.forEach(assignment => {
        if (assignment.user_id === data.user_id && assignment.is_active) {
          assignment.is_active = false
          assignment.effective_until = new Date().toISOString()
        }
      })

      const newAssignment: UserRoleAssignment = {
        id: `assignment-${Date.now()}`,
        user_id: data.user_id,
        user_role_id: data.user_role_id,
        assigned_at: new Date().toISOString(),
        assigned_by: 'current-user-id', // This would come from auth context
        is_active: true,
        effective_from: data.effective_from,
        effective_until: data.effective_until
      }

      mockUserRoleAssignments.push(newAssignment)

      // Log the change
      await this.logRoleChange({
        user_id: data.user_id,
        new_role_id: data.user_role_id,
        reason: data.reason || 'Role assignment'
      })

      return newAssignment
    } catch (error) {
      console.error('Error assigning user role:', error)
      throw new Error('Failed to assign user role')
    }
  }

  async deactivateUserRoleAssignment(assignmentId: string): Promise<boolean> {
    try {
      // Mock implementation
      const assignment = mockUserRoleAssignments.find(a => a.id === assignmentId)
      if (!assignment) {
        throw new Error('Role assignment not found')
      }

      assignment.is_active = false
      assignment.effective_until = new Date().toISOString()
      return true
    } catch (error) {
      console.error('Error deactivating role assignment:', error)
      throw new Error('Failed to deactivate role assignment')
    }
  }

  // Change Log operations
  async getUserRoleChangeLogs(userId?: string): Promise<UserRoleChangeLog[]> {
    try {
      // Mock implementation
      if (userId) {
        return mockUserRoleChangeLogs.filter(log => log.user_id === userId)
      }
      return mockUserRoleChangeLogs
    } catch (error) {
      console.error('Error fetching role change logs:', error)
      throw new Error('Failed to fetch role change logs')
    }
  }

  async logRoleChange(data: {
    user_id: string
    previous_role_id?: string
    new_role_id: string
    reason?: string
  }): Promise<UserRoleChangeLog> {
    try {
      // Mock implementation
      const newLog: UserRoleChangeLog = {
        id: `log-${Date.now()}`,
        user_id: data.user_id,
        previous_role_id: data.previous_role_id,
        new_role_id: data.new_role_id,
        changed_by: 'current-user-id', // This would come from auth context
        changed_at: new Date().toISOString(),
        reason: data.reason,
        is_deprecated: false
      }

      mockUserRoleChangeLogs.push(newLog)
      return newLog
    } catch (error) {
      console.error('Error logging role change:', error)
      throw new Error('Failed to log role change')
    }
  }

  async deprecateRoleChangeLog(logId: string): Promise<boolean> {
    try {
      // Mock implementation
      const log = mockUserRoleChangeLogs.find(l => l.id === logId)
      if (!log) {
        throw new Error('Role change log not found')
      }

      log.is_deprecated = true
      return true
    } catch (error) {
      console.error('Error deprecating role change log:', error)
      throw new Error('Failed to deprecate role change log')
    }
  }

  // Helper methods
  async getUsersWithRoles(): Promise<UserWithRole[]> {
    try {
      // Mock implementation - this would typically be a database view or join query
      const usersWithRoles: UserWithRole[] = []
      
      // This is a simplified mock - in reality you'd get this from your user service
      const mockUsers = [
        { id: 'user-1', name: 'Chris', email: 'chris@company.com', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
        { id: 'user-2', name: 'Derek', email: 'derek@company.com', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
        { id: 'user-3', name: 'Rolando', email: 'rolando@company.com', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
      ]

      for (const user of mockUsers) {
        const activeAssignment = mockUserRoleAssignments.find(
          a => a.user_id === user.id && a.is_active
        )
        const userRole = activeAssignment ? 
          mockUserRoles.find(r => r.id === activeAssignment.user_role_id) : 
          undefined

        usersWithRoles.push({
          ...user,
          role_assignment: activeAssignment,
          user_role: userRole
        })
      }

      return usersWithRoles
    } catch (error) {
      console.error('Error fetching users with roles:', error)
      throw new Error('Failed to fetch users with roles')
    }
  }

  async getRoleStatistics() {
    try {
      const roles = await this.getAllUserRoles()
      const assignments = await this.getUserRoleAssignments()
      
      return roles.map(role => ({
        role,
        total_assignments: assignments.filter(a => a.user_role_id === role.id).length,
        active_assignments: assignments.filter(a => a.user_role_id === role.id && a.is_active).length
      }))
    } catch (error) {
      console.error('Error fetching role statistics:', error)
      throw new Error('Failed to fetch role statistics')
    }
  }
}

// Mock data for development/testing
const mockUserRoles: UserRole[] = [
  {
    id: 'role-admin-1',
    name: 'System Administrator',
    role_type: 'Admin',
    description: 'Full system access with all administrative privileges',
    is_active: true,
    dashboard_access: 'Admin',
    permissions: {
      can_access_admin_dashboard: true,
      can_access_manager_dashboard: true,
      can_access_rep_dashboard: true,
      can_create_users: true,
      can_edit_users: true,
      can_delete_users: true,
      can_assign_roles: true,
      can_create_engagements: true,
      can_edit_all_engagements: true,
      can_edit_own_engagements: true,
      can_delete_engagements: true,
      can_view_all_engagements: true,
      can_view_team_engagements: true,
      can_view_own_engagements: true,
      can_manage_user_roles: true,
      can_view_system_logs: true,
      can_manage_system_settings: true,
      can_view_all_reports: true,
      can_view_team_reports: true,
      can_export_data: true
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user-1'
  },
  {
    id: 'role-manager-1',
    name: 'Team Manager',
    role_type: 'Manager',
    description: 'Manage team members and view team engagements',
    is_active: true,
    dashboard_access: 'Manager',
    permissions: {
      can_access_admin_dashboard: false,
      can_access_manager_dashboard: true,
      can_access_rep_dashboard: true,
      can_create_users: false,
      can_edit_users: false,
      can_delete_users: false,
      can_assign_roles: false,
      can_create_engagements: true,
      can_edit_all_engagements: false,
      can_edit_own_engagements: true,
      can_delete_engagements: false,
      can_view_all_engagements: false,
      can_view_team_engagements: true,
      can_view_own_engagements: true,
      can_manage_user_roles: false,
      can_view_system_logs: false,
      can_manage_system_settings: false,
      can_view_all_reports: false,
      can_view_team_reports: true,
      can_export_data: true
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user-1'
  },
  {
    id: 'role-consultant-1',
    name: 'Sales Consultant',
    role_type: 'Consultant',
    description: 'Manage own engagements and client interactions',
    is_active: true,
    dashboard_access: 'Rep',
    permissions: {
      can_access_admin_dashboard: false,
      can_access_manager_dashboard: false,
      can_access_rep_dashboard: true,
      can_create_users: false,
      can_edit_users: false,
      can_delete_users: false,
      can_assign_roles: false,
      can_create_engagements: false,
      can_edit_all_engagements: false,
      can_edit_own_engagements: true,
      can_delete_engagements: false,
      can_view_all_engagements: false,
      can_view_team_engagements: false,
      can_view_own_engagements: true,
      can_manage_user_roles: false,
      can_view_system_logs: false,
      can_manage_system_settings: false,
      can_view_all_reports: false,
      can_view_team_reports: false,
      can_export_data: false
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user-1'
  }
]

const mockUserRoleAssignments: UserRoleAssignment[] = [
  {
    id: 'assignment-1',
    user_id: 'user-1',
    user_role_id: 'role-admin-1',
    assigned_at: '2024-01-01T00:00:00Z',
    assigned_by: 'user-1',
    is_active: true,
    effective_from: '2024-01-01T00:00:00Z'
  },
  {
    id: 'assignment-2',
    user_id: 'user-2',
    user_role_id: 'role-manager-1',
    assigned_at: '2024-01-01T00:00:00Z',
    assigned_by: 'user-1',
    is_active: true,
    effective_from: '2024-01-01T00:00:00Z'
  }
]

const mockUserRoleChangeLogs: UserRoleChangeLog[] = [
  {
    id: 'log-1',
    user_id: 'user-1',
    new_role_id: 'role-admin-1',
    changed_by: 'user-1',
    changed_at: '2024-01-01T00:00:00Z',
    reason: 'Initial system setup',
    is_deprecated: false
  }
]

export const userRoleService = new UserRoleService()
export { mockUserRoles, mockUserRoleAssignments, mockUserRoleChangeLogs }