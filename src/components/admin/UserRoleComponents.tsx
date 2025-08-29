import React, { useState } from 'react'
import type { 
  UserRole, 
  UserRoleAssignment, 
  UserRoleChangeLog, 
  CreateUserRoleRequest,
  UpdateUserRoleRequest,
  AssignUserRoleRequest,
  UserRoleType,
  DashboardAccess,
  UserRolePermissions,
  UserWithRole
} from '../../types/userRoles'
import { DEFAULT_ROLE_PERMISSIONS } from '../../types/userRoles'
import { userRoleService } from '../../api/userRoles'

// Role Assignments Tab Component
export function RoleAssignmentsTab({ 
  userAssignments, 
  userRoles, 
  usersWithRoles,
  onAssignRole,
  onReload
}: {
  userAssignments: UserRoleAssignment[]
  userRoles: UserRole[]
  usersWithRoles: UserWithRole[]
  onAssignRole: () => void
  onReload: () => void
}) {
  const handleDeactivateAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to deactivate this role assignment?')) {
      return
    }

    try {
      await userRoleService.deactivateUserRoleAssignment(assignmentId)
      await onReload()
    } catch (error) {
      console.error('Error deactivating assignment:', error)
    }
  }

  const activeAssignments = userAssignments.filter(a => a.is_active)
  const inactiveAssignments = userAssignments.filter(a => !a.is_active)

  return (
    <div>
      {/* Action Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0, color: '#253D2C' }}>
          Role Assignments ({activeAssignments.length} active, {inactiveAssignments.length} inactive)
        </h2>
        <button
          onClick={onAssignRole}
          style={{
            background: '#2E6F40',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Trebuchet MS, Arial, sans-serif'
          }}
        >
          ➕ Assign Role
        </button>
      </div>

      {/* Active Assignments */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#253D2C', marginBottom: '16px' }}>Active Assignments</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '16px' 
        }}>
          {activeAssignments.map(assignment => {
            const user = usersWithRoles.find(u => u.id === assignment.user_id)
            const role = userRoles.find(r => r.id === assignment.user_role_id)
            
            return (
              <div
                key={assignment.id}
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '16px'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'start',
                  marginBottom: '12px'
                }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#253D2C' }}>
                      {user?.name || 'Unknown User'}
                    </h4>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeactivateAssignment(assignment.id)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Deactivate
                  </button>
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <span style={{
                    background: '#dbeafe',
                    color: '#1e40af',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {role?.name || 'Unknown Role'}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  <p style={{ margin: '2px 0' }}>
                    <strong>Assigned:</strong> {new Date(assignment.assigned_at).toLocaleDateString()}
                  </p>
                  <p style={{ margin: '2px 0' }}>
                    <strong>Effective From:</strong> {new Date(assignment.effective_from).toLocaleDateString()}
                  </p>
                  {assignment.effective_until && (
                    <p style={{ margin: '2px 0' }}>
                      <strong>Effective Until:</strong> {new Date(assignment.effective_until).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {activeAssignments.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#6b7280',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px dashed #d1d5db'
          }}>
            No active role assignments found
          </div>
        )}
      </div>

      {/* Inactive Assignments */}
      {inactiveAssignments.length > 0 && (
        <div>
          <h3 style={{ color: '#253D2C', marginBottom: '16px' }}>Inactive Assignments</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '16px' 
          }}>
            {inactiveAssignments.slice(0, 10).map(assignment => {
              const user = usersWithRoles.find(u => u.id === assignment.user_id)
              const role = userRoles.find(r => r.id === assignment.user_role_id)
              
              return (
                <div
                  key={assignment.id}
                  style={{
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '16px',
                    opacity: 0.7
                  }}
                >
                  <h4 style={{ margin: '0 0 4px 0', color: '#6b7280' }}>
                    {user?.name || 'Unknown User'}
                  </h4>
                  <span style={{
                    background: '#e5e7eb',
                    color: '#6b7280',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {role?.name || 'Unknown Role'}
                  </span>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0' }}>
                    Deactivated: {assignment.effective_until ? new Date(assignment.effective_until).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// Change Logs Tab Component
export function ChangeLogsTab({ 
  changeLogs, 
  userRoles, 
  usersWithRoles 
}: {
  changeLogs: UserRoleChangeLog[]
  userRoles: UserRole[]
  usersWithRoles: UserWithRole[]
}) {
  const [showDeprecated, setShowDeprecated] = useState(false)
  
  const filteredLogs = showDeprecated 
    ? changeLogs 
    : changeLogs.filter(log => !log.is_deprecated)

  const handleDeprecateLog = async (logId: string) => {
    try {
      await userRoleService.deprecateRoleChangeLog(logId)
      // Reload would be handled by parent component
    } catch (error) {
      console.error('Error deprecating log:', error)
    }
  }

  return (
    <div>
      {/* Action Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0, color: '#253D2C' }}>
          Change Logs ({filteredLogs.length})
        </h2>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          color: '#6b7280',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={showDeprecated}
            onChange={(e) => setShowDeprecated(e.target.checked)}
            style={{ accentColor: '#2E6F40' }}
          />
          Show Deprecated Logs
        </label>
      </div>

      {/* Logs List */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px' 
      }}>
        {filteredLogs
          .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime())
          .map(log => {
            const user = usersWithRoles.find(u => u.id === log.user_id)
            const previousRole = log.previous_role_id ? userRoles.find(r => r.id === log.previous_role_id) : null
            const newRole = userRoles.find(r => r.id === log.new_role_id)
            
            return (
              <div
                key={log.id}
                style={{
                  background: log.is_deprecated ? '#f3f4f6' : 'white',
                  border: `1px solid ${log.is_deprecated ? '#d1d5db' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  padding: '16px',
                  opacity: log.is_deprecated ? 0.6 : 1
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'start',
                  marginBottom: '8px'
                }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#253D2C' }}>
                      Role Change: {user?.name || 'Unknown User'}
                    </h4>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                      {new Date(log.changed_at).toLocaleString()}
                    </p>
                  </div>
                  {!log.is_deprecated && (
                    <button
                      onClick={() => handleDeprecateLog(log.id)}
                      style={{
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Deprecate
                    </button>
                  )}
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  {previousRole ? (
                    <span style={{
                      background: '#fee2e2',
                      color: '#dc2626',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      From: {previousRole.name}
                    </span>
                  ) : (
                    <span style={{
                      background: '#f3f4f6',
                      color: '#6b7280',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      From: No Role
                    </span>
                  )}
                  
                  <span style={{ color: '#6b7280' }}>→</span>
                  
                  <span style={{
                    background: '#dcfce7',
                    color: '#16a34a',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    To: {newRole?.name || 'Unknown Role'}
                  </span>
                </div>

                {log.reason && (
                  <p style={{ 
                    margin: '8px 0 0 0', 
                    color: '#6b7280', 
                    fontSize: '14px',
                    fontStyle: 'italic'
                  }}>
                    Reason: {log.reason}
                  </p>
                )}

                {log.is_deprecated && (
                  <span style={{
                    background: '#f59e0b',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    DEPRECATED
                  </span>
                )}
              </div>
            )
          })}
      </div>

      {filteredLogs.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#6b7280',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px dashed #d1d5db'
        }}>
          No change logs found
        </div>
      )}
    </div>
  )
}

// Create Role Modal Component
export function CreateRoleModal({ 
  onClose, 
  onSubmit 
}: {
  onClose: () => void
  onSubmit: (data: CreateUserRoleRequest) => void
}) {
  const [formData, setFormData] = useState<CreateUserRoleRequest>({
    name: '',
    role_type: 'Custom',
    description: '',
    dashboard_access: 'Rep',
    permissions: DEFAULT_ROLE_PERMISSIONS.Custom
  })

  const handleRoleTypeChange = (roleType: UserRoleType) => {
    setFormData(prev => ({
      ...prev,
      role_type: roleType,
      permissions: DEFAULT_ROLE_PERMISSIONS[roleType],
      dashboard_access: roleType === 'Admin' ? 'Admin' : roleType === 'Manager' ? 'Manager' : 'Rep'
    }))
  }

  const handlePermissionChange = (permission: keyof UserRolePermissions, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim()) {
      onSubmit(formData)
    }
  }

  const permissionGroups = [
    {
      title: 'Dashboard Access',
      permissions: [
        { key: 'can_access_admin_dashboard', label: 'Access Admin Dashboard' },
        { key: 'can_access_manager_dashboard', label: 'Access Manager Dashboard' },
        { key: 'can_access_rep_dashboard', label: 'Access Rep Dashboard' }
      ]
    },
    {
      title: 'User Management',
      permissions: [
        { key: 'can_create_users', label: 'Create Users' },
        { key: 'can_edit_users', label: 'Edit Users' },
        { key: 'can_delete_users', label: 'Delete Users' },
        { key: 'can_assign_roles', label: 'Assign User Roles' }
      ]
    },
    {
      title: 'Engagement Management',
      permissions: [
        { key: 'can_create_engagements', label: 'Create Engagements' },
        { key: 'can_edit_all_engagements', label: 'Edit All Engagements' },
        { key: 'can_edit_own_engagements', label: 'Edit Own Engagements' },
        { key: 'can_delete_engagements', label: 'Delete Engagements' },
        { key: 'can_view_all_engagements', label: 'View All Engagements' },
        { key: 'can_view_team_engagements', label: 'View Team Engagements' },
        { key: 'can_view_own_engagements', label: 'View Own Engagements' }
      ]
    },
    {
      title: 'System Administration',
      permissions: [
        { key: 'can_manage_user_roles', label: 'Manage User Roles' },
        { key: 'can_view_system_logs', label: 'View System Logs' },
        { key: 'can_manage_system_settings', label: 'Manage System Settings' }
      ]
    },
    {
      title: 'Reporting & Data',
      permissions: [
        { key: 'can_view_all_reports', label: 'View All Reports' },
        { key: 'can_view_team_reports', label: 'View Team Reports' },
        { key: 'can_export_data', label: 'Export Data' }
      ]
    }
  ]

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '900px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#253D2C' }}>
          Create New User Role
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#374151' }}>
              Role Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#374151' }}>
              Role Type *
            </label>
            <select
              value={formData.role_type}
              onChange={(e) => handleRoleTypeChange(e.target.value as UserRoleType)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Consultant">Consultant</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#374151' }}>
              Dashboard Access *
            </label>
            <select
              value={formData.dashboard_access}
              onChange={(e) => setFormData(prev => ({ ...prev, dashboard_access: e.target.value as DashboardAccess }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="Admin">Admin Dashboard</option>
              <option value="Manager">Manager Dashboard</option>
              <option value="Rep">Rep Dashboard</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#374151' }}>
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                minHeight: '60px'
              }}
              placeholder="Describe what this role is for..."
            />
          </div>

          {/* Permissions Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#253D2C' }}>Permissions</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {permissionGroups.map(group => (
                <div key={group.title} style={{ 
                  background: '#f9fafb', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '16px' 
                }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px' }}>
                    {group.title}
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {group.permissions.map(perm => (
                      <label key={perm.key} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.permissions[perm.key as keyof UserRolePermissions] || false}
                          onChange={(e) => handlePermissionChange(perm.key as keyof UserRolePermissions, e.target.checked)}
                          style={{ accentColor: '#2E6F40' }}
                        />
                        <span>{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: '#2E6F40',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Create Role
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}