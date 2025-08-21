// User Role Types and Interfaces

export type UserRoleType = 'Admin' | 'Manager' | 'Consultant' | 'Custom'

export type DashboardAccess = 'Admin' | 'Manager' | 'Rep'

export interface UserRole {
  id: string
  name: string
  role_type: UserRoleType
  description?: string
  is_active: boolean
  dashboard_access: DashboardAccess
  permissions: UserRolePermissions
  created_at: string
  updated_at: string
  created_by: string // User ID who created this role
}

export interface UserRolePermissions {
  // Dashboard Access
  can_access_admin_dashboard: boolean
  can_access_manager_dashboard: boolean
  can_access_rep_dashboard: boolean
  
  // User Management
  can_create_users: boolean
  can_edit_users: boolean
  can_delete_users: boolean
  can_assign_roles: boolean
  
  // Engagement Management
  can_create_engagements: boolean
  can_edit_all_engagements: boolean
  can_edit_own_engagements: boolean
  can_delete_engagements: boolean
  can_view_all_engagements: boolean
  can_view_team_engagements: boolean
  can_view_own_engagements: boolean
  
  // System Administration
  can_manage_user_roles: boolean
  can_view_system_logs: boolean
  can_manage_system_settings: boolean
  
  // Reporting
  can_view_all_reports: boolean
  can_view_team_reports: boolean
  can_export_data: boolean
}

export interface UserRoleAssignment {
  id: string
  user_id: string
  user_role_id: string
  assigned_at: string
  assigned_by: string // User ID who made the assignment
  is_active: boolean
  effective_from: string
  effective_until?: string
}

export interface UserRoleChangeLog {
  id: string
  user_id: string
  previous_role_id?: string
  new_role_id: string
  changed_by: string // User ID who made the change
  changed_at: string
  reason?: string
  is_deprecated: boolean
}

// Predefined role templates
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRoleType, UserRolePermissions> = {
  Admin: {
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
  Manager: {
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
  Consultant: {
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
  Custom: {
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
  }
}

// Extended User interface to include role assignment
export interface UserWithRole {
  id: string
  name: string
  email: string
  created_at: string
  updated_at: string
  role_assignment?: UserRoleAssignment
  user_role?: UserRole
}

// API Response types
export interface CreateUserRoleRequest {
  name: string
  role_type: UserRoleType
  description?: string
  dashboard_access: DashboardAccess
  permissions: UserRolePermissions
}

export interface UpdateUserRoleRequest {
  name?: string
  description?: string
  is_active?: boolean
  dashboard_access?: DashboardAccess
  permissions?: UserRolePermissions
}

export interface AssignUserRoleRequest {
  user_id: string
  user_role_id: string
  effective_from: string
  effective_until?: string
  reason?: string
}