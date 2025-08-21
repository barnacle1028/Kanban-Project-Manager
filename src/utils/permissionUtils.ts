import type { UserRolePermissions, UserWithRole } from '../types/userRoles'

/**
 * Permission utilities for checking user access rights
 */

// Check if user has a specific permission
export function hasPermission(
  user: UserWithRole | null, 
  permission: keyof UserRolePermissions
): boolean {
  if (!user || !user.user_role || !user.user_role.is_active) {
    return false
  }

  return user.user_role.permissions[permission] || false
}

// Check if user can access a specific dashboard
export function canAccessDashboard(
  user: UserWithRole | null, 
  dashboard: 'Admin' | 'Manager' | 'Rep'
): boolean {
  if (!user || !user.user_role || !user.user_role.is_active) {
    return false
  }

  const permissions = user.user_role.permissions

  switch (dashboard) {
    case 'Admin':
      return permissions.can_access_admin_dashboard
    case 'Manager':
      return permissions.can_access_manager_dashboard
    case 'Rep':
      return permissions.can_access_rep_dashboard
    default:
      return false
  }
}

// Get the highest level dashboard the user can access
export function getHighestDashboardAccess(user: UserWithRole | null): 'Admin' | 'Manager' | 'Rep' | null {
  if (!user || !user.user_role || !user.user_role.is_active) {
    return null
  }

  if (canAccessDashboard(user, 'Admin')) return 'Admin'
  if (canAccessDashboard(user, 'Manager')) return 'Manager'
  if (canAccessDashboard(user, 'Rep')) return 'Rep'
  
  return null
}

// Check if user can perform user management actions
export function canManageUsers(user: UserWithRole | null): boolean {
  return hasPermission(user, 'can_create_users') || 
         hasPermission(user, 'can_edit_users') || 
         hasPermission(user, 'can_delete_users')
}

// Check if user can manage user roles
export function canManageUserRoles(user: UserWithRole | null): boolean {
  return hasPermission(user, 'can_manage_user_roles')
}

// Check if user can view all engagements vs just their own/team
export function getEngagementViewScope(user: UserWithRole | null): 'all' | 'team' | 'own' | 'none' {
  if (!user || !user.user_role || !user.user_role.is_active) {
    return 'none'
  }

  const permissions = user.user_role.permissions

  if (permissions.can_view_all_engagements) return 'all'
  if (permissions.can_view_team_engagements) return 'team'
  if (permissions.can_view_own_engagements) return 'own'
  
  return 'none'
}

// Check if user can create/edit engagements
export function canModifyEngagements(user: UserWithRole | null, scope: 'all' | 'own' = 'own'): boolean {
  if (!user || !user.user_role || !user.user_role.is_active) {
    return false
  }

  const permissions = user.user_role.permissions

  if (scope === 'all') {
    return permissions.can_edit_all_engagements
  }

  return permissions.can_edit_own_engagements
}

// Get available actions for a user based on their permissions
export function getAvailableActions(user: UserWithRole | null): {
  canCreateUsers: boolean
  canEditUsers: boolean
  canDeleteUsers: boolean
  canAssignRoles: boolean
  canCreateEngagements: boolean
  canEditAllEngagements: boolean
  canEditOwnEngagements: boolean
  canDeleteEngagements: boolean
  canManageUserRoles: boolean
  canViewSystemLogs: boolean
  canManageSystemSettings: boolean
  canExportData: boolean
  engagementViewScope: 'all' | 'team' | 'own' | 'none'
  highestDashboardAccess: 'Admin' | 'Manager' | 'Rep' | null
} {
  if (!user || !user.user_role || !user.user_role.is_active) {
    return {
      canCreateUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canAssignRoles: false,
      canCreateEngagements: false,
      canEditAllEngagements: false,
      canEditOwnEngagements: false,
      canDeleteEngagements: false,
      canManageUserRoles: false,
      canViewSystemLogs: false,
      canManageSystemSettings: false,
      canExportData: false,
      engagementViewScope: 'none',
      highestDashboardAccess: null
    }
  }

  const permissions = user.user_role.permissions

  return {
    canCreateUsers: permissions.can_create_users,
    canEditUsers: permissions.can_edit_users,
    canDeleteUsers: permissions.can_delete_users,
    canAssignRoles: permissions.can_assign_roles,
    canCreateEngagements: permissions.can_create_engagements,
    canEditAllEngagements: permissions.can_edit_all_engagements,
    canEditOwnEngagements: permissions.can_edit_own_engagements,
    canDeleteEngagements: permissions.can_delete_engagements,
    canManageUserRoles: permissions.can_manage_user_roles,
    canViewSystemLogs: permissions.can_view_system_logs,
    canManageSystemSettings: permissions.can_manage_system_settings,
    canExportData: permissions.can_export_data,
    engagementViewScope: getEngagementViewScope(user),
    highestDashboardAccess: getHighestDashboardAccess(user)
  }
}

// Filter user actions based on permissions
export function filterActionsByPermissions<T extends Record<string, any>>(
  actions: T[], 
  user: UserWithRole | null, 
  requiredPermission: keyof UserRolePermissions
): T[] {
  if (!hasPermission(user, requiredPermission)) {
    return []
  }
  return actions
}

// Validation helper for role assignments
export function validateRoleAssignment(
  assigningUser: UserWithRole | null,
  targetUser: UserWithRole | null,
  newRole: { dashboard_access: 'Admin' | 'Manager' | 'Rep' }
): { isValid: boolean; reason?: string } {
  // Check if assigning user has permission to assign roles
  if (!hasPermission(assigningUser, 'can_assign_roles')) {
    return { isValid: false, reason: 'You do not have permission to assign roles' }
  }

  // Admin users can assign any role
  if (canAccessDashboard(assigningUser, 'Admin')) {
    return { isValid: true }
  }

  // Manager users can only assign Rep and Manager roles (not Admin)
  if (canAccessDashboard(assigningUser, 'Manager') && newRole.dashboard_access !== 'Admin') {
    return { isValid: true }
  }

  return { 
    isValid: false, 
    reason: 'You can only assign roles at or below your access level' 
  }
}

// Role hierarchy helper
export const ROLE_HIERARCHY = {
  'Admin': 3,
  'Manager': 2,
  'Rep': 1
} as const

export function isHigherRole(role1: 'Admin' | 'Manager' | 'Rep', role2: 'Admin' | 'Manager' | 'Rep'): boolean {
  return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2]
}

export function getRoleLevel(role: 'Admin' | 'Manager' | 'Rep'): number {
  return ROLE_HIERARCHY[role]
}