import React, { useState } from 'react'
import type { 
  UserRole,
  UpdateUserRoleRequest,
  AssignUserRoleRequest,
  UserWithRole,
  UserRolePermissions,
  DashboardAccess
} from '../../types/userRoles'

// Edit Role Modal Component
export function EditRoleModal({ 
  role,
  onClose, 
  onSubmit 
}: {
  role: UserRole
  onClose: () => void
  onSubmit: (data: UpdateUserRoleRequest) => void
}) {
  const [formData, setFormData] = useState<UpdateUserRoleRequest>({
    name: role.name,
    description: role.description,
    is_active: role.is_active,
    dashboard_access: role.dashboard_access,
    permissions: role.permissions
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handlePermissionChange = (permission: keyof UserRolePermissions, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions!,
        [permission]: value
      }
    }))
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
        maxWidth: '800px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#253D2C' }}>
          Edit User Role: {role.name}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#374151' }}>
                Role Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
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

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#374151' }}>
                Dashboard Access
              </label>
              <select
                value={formData.dashboard_access || role.dashboard_access}
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
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.is_active ?? role.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                style={{ accentColor: '#2E6F40' }}
              />
              <span style={{ fontWeight: 'bold', color: '#374151' }}>Role is Active</span>
            </label>
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
                          checked={(formData.permissions || role.permissions)[perm.key as keyof UserRolePermissions]}
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
              Update Role
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Assign Role Modal Component
export function AssignRoleModal({ 
  userRoles,
  users,
  onClose, 
  onSubmit 
}: {
  userRoles: UserRole[]
  users: UserWithRole[]
  onClose: () => void
  onSubmit: (data: AssignUserRoleRequest) => void
}) {
  const [formData, setFormData] = useState<AssignUserRoleRequest>({
    user_id: '',
    user_role_id: '',
    effective_from: new Date().toISOString().split('T')[0],
    effective_until: '',
    reason: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.user_id && formData.user_role_id) {
      onSubmit({
        ...formData,
        effective_from: new Date(formData.effective_from).toISOString(),
        effective_until: formData.effective_until ? new Date(formData.effective_until).toISOString() : undefined
      })
    }
  }

  const selectedUser = users.find(u => u.id === formData.user_id)
  const selectedRole = userRoles.find(r => r.id === formData.user_role_id)

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
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#253D2C' }}>
          Assign Role to User
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#374151' }}>
              Select User *
            </label>
            <select
              value={formData.user_id}
              onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              required
            >
              <option value="">Select a user...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                  {user.user_role && ` - Current: ${user.user_role.name}`}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#374151' }}>
              Select Role *
            </label>
            <select
              value={formData.user_role_id}
              onChange={(e) => setFormData(prev => ({ ...prev, user_role_id: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              required
            >
              <option value="">Select a role...</option>
              {userRoles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name} ({role.role_type}) - {role.dashboard_access} Dashboard
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#374151' }}>
                Effective From *
              </label>
              <input
                type="date"
                value={formData.effective_from}
                onChange={(e) => setFormData(prev => ({ ...prev, effective_from: e.target.value }))}
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

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#374151' }}>
                Effective Until (Optional)
              </label>
              <input
                type="date"
                value={formData.effective_until}
                onChange={(e) => setFormData(prev => ({ ...prev, effective_until: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#374151' }}>
              Reason for Assignment
            </label>
            <textarea
              value={formData.reason || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                minHeight: '60px'
              }}
              placeholder="Optional: Explain why this role is being assigned..."
            />
          </div>

          {/* Assignment Preview */}
          {selectedUser && selectedRole && (
            <div style={{ 
              background: '#f0fdf4', 
              border: '1px solid #bbf7d0', 
              borderRadius: '8px', 
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#253D2C' }}>Assignment Preview</h4>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#374151' }}>
                <strong>User:</strong> {selectedUser.name} ({selectedUser.email})
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#374151' }}>
                <strong>Current Role:</strong> {selectedUser.user_role?.name || 'No role assigned'}
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#374151' }}>
                <strong>New Role:</strong> {selectedRole.name} ({selectedRole.role_type})
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#374151' }}>
                <strong>Dashboard Access:</strong> {selectedRole.dashboard_access}
              </p>
              {selectedUser.user_role && (
                <div style={{ marginTop: '8px', padding: '8px', background: '#fef3c7', borderRadius: '4px' }}>
                  <small style={{ color: '#92400e' }}>
                    ⚠️ This will replace the user's current role assignment
                  </small>
                </div>
              )}
            </div>
          )}

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
              Assign Role
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}