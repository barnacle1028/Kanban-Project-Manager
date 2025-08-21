import React, { useState, useEffect } from 'react'
import { userRoleService } from '../../api/userRoles'
import type { 
  UserRole, 
  UserRoleAssignment, 
  UserRoleChangeLog, 
  CreateUserRoleRequest,
  UpdateUserRoleRequest,
  UserRoleType,
  DashboardAccess,
  UserRolePermissions,
  UserWithRole
} from '../../types/userRoles'
import { DEFAULT_ROLE_PERMISSIONS } from '../../types/userRoles'
import { RoleAssignmentsTab, ChangeLogsTab, CreateRoleModal } from './UserRoleComponents'
import { EditRoleModal, AssignRoleModal } from './UserRoleModals'

interface UserRoleManagementProps {
  onClose?: () => void
}

export default function UserRoleManagement({ onClose }: UserRoleManagementProps) {
  const [activeTab, setActiveTab] = useState<'roles' | 'assignments' | 'logs'>('roles')
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [userAssignments, setUserAssignments] = useState<UserRoleAssignment[]>([])
  const [changeLogs, setChangeLogs] = useState<UserRoleChangeLog[]>([])
  const [usersWithRoles, setUsersWithRoles] = useState<UserWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false)
  const [showEditRoleModal, setShowEditRoleModal] = useState(false)
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [roles, assignments, logs, users] = await Promise.all([
        userRoleService.getAllUserRoles(),
        userRoleService.getUserRoleAssignments(),
        userRoleService.getUserRoleChangeLogs(),
        userRoleService.getUsersWithRoles()
      ])
      
      setUserRoles(roles)
      setUserAssignments(assignments)
      setChangeLogs(logs)
      setUsersWithRoles(users)
      setError(null)
    } catch (err) {
      setError('Failed to load user role data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRole = async (roleData: CreateUserRoleRequest) => {
    try {
      await userRoleService.createUserRole(roleData)
      await loadData()
      setShowCreateRoleModal(false)
    } catch (err) {
      setError('Failed to create user role')
      console.error('Error creating role:', err)
    }
  }

  const handleUpdateRole = async (id: string, updates: UpdateUserRoleRequest) => {
    try {
      await userRoleService.updateUserRole(id, updates)
      await loadData()
      setShowEditRoleModal(false)
      setSelectedRole(null)
    } catch (err) {
      setError('Failed to update user role')
      console.error('Error updating role:', err)
    }
  }

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user role? This action cannot be undone.')) {
      return
    }

    try {
      await userRoleService.deleteUserRole(id)
      await loadData()
    } catch (err) {
      setError('Failed to delete user role')
      console.error('Error deleting role:', err)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        background: 'white',
        borderRadius: '12px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f4f6', 
            borderTop: '4px solid #2E6F40',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 10px'
          }} />
          <p style={{ color: '#6b7280' }}>Loading user roles...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '12px', 
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #68BA7F'
      }}>
        <h1 style={{ 
          margin: 0, 
          color: '#253D2C',
          fontFamily: 'Trebuchet MS, Arial, sans-serif',
          fontSize: '28px'
        }}>
          User Role Management
        </h1>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Trebuchet MS, Arial, sans-serif'
            }}
          >
            Close
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '4px', 
        marginBottom: '24px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {[
          { id: 'roles', label: 'User Roles', icon: '👤' },
          { id: 'assignments', label: 'Role Assignments', icon: '📋' },
          { id: 'logs', label: 'Change Logs', icon: '📊' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '12px 20px',
              background: activeTab === tab.id ? '#68BA7F' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontFamily: 'Trebuchet MS, Arial, sans-serif',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'roles' && (
        <UserRolesTab
          userRoles={userRoles}
          usersWithRoles={usersWithRoles}
          onCreateRole={() => setShowCreateRoleModal(true)}
          onEditRole={(role) => {
            setSelectedRole(role)
            setShowEditRoleModal(true)
          }}
          onDeleteRole={handleDeleteRole}
        />
      )}

      {activeTab === 'assignments' && (
        <RoleAssignmentsTab
          userAssignments={userAssignments}
          userRoles={userRoles}
          usersWithRoles={usersWithRoles}
          onAssignRole={() => setShowAssignRoleModal(true)}
          onReload={loadData}
        />
      )}

      {activeTab === 'logs' && (
        <ChangeLogsTab
          changeLogs={changeLogs}
          userRoles={userRoles}
          usersWithRoles={usersWithRoles}
        />
      )}

      {/* Modals */}
      {showCreateRoleModal && (
        <CreateRoleModal
          onClose={() => setShowCreateRoleModal(false)}
          onSubmit={handleCreateRole}
        />
      )}

      {showEditRoleModal && selectedRole && (
        <EditRoleModal
          role={selectedRole}
          onClose={() => {
            setShowEditRoleModal(false)
            setSelectedRole(null)
          }}
          onSubmit={(updates) => handleUpdateRole(selectedRole.id, updates)}
        />
      )}

      {showAssignRoleModal && (
        <AssignRoleModal
          userRoles={userRoles.filter(r => r.is_active)}
          users={usersWithRoles}
          onClose={() => setShowAssignRoleModal(false)}
          onSubmit={async (assignmentData) => {
            try {
              await userRoleService.assignUserRole(assignmentData)
              await loadData()
              setShowAssignRoleModal(false)
            } catch (err) {
              setError('Failed to assign role')
              console.error('Error assigning role:', err)
            }
          }}
        />
      )}
    </div>
  )
}

// User Roles Tab Component
function UserRolesTab({ 
  userRoles, 
  usersWithRoles,
  onCreateRole, 
  onEditRole, 
  onDeleteRole 
}: {
  userRoles: UserRole[]
  usersWithRoles: UserWithRole[]
  onCreateRole: () => void
  onEditRole: (role: UserRole) => void
  onDeleteRole: (id: string) => void
}) {
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
          User Roles ({userRoles.length})
        </h2>
        <button
          onClick={onCreateRole}
          style={{
            background: '#2E6F40',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Trebuchet MS, Arial, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ➕ Create New Role
        </button>
      </div>

      {/* Roles Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
        gap: '20px' 
      }}>
        {userRoles.map(role => {
          const assignedCount = usersWithRoles.filter(u => u.user_role?.id === role.id).length
          
          return (
            <div
              key={role.id}
              style={{
                background: '#f9fafb',
                border: `2px solid ${role.is_active ? '#68BA7F' : '#d1d5db'}`,
                borderRadius: '12px',
                padding: '20px'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'start',
                marginBottom: '12px'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: '#253D2C' }}>
                    {role.name}
                  </h3>
                  <span style={{
                    background: role.is_active ? '#d1fae5' : '#f3f4f6',
                    color: role.is_active ? '#065f46' : '#6b7280',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {role.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => onEditRole(role)}
                    style={{
                      background: '#68BA7F',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteRole(role.id)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p style={{ 
                color: '#6b7280', 
                fontSize: '14px', 
                margin: '0 0 12px 0',
                minHeight: '20px'
              }}>
                {role.description || 'No description provided'}
              </p>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>
                    Type
                  </label>
                  <div style={{ fontSize: '14px', color: '#374151' }}>{role.role_type}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>
                    Dashboard Access
                  </label>
                  <div style={{ fontSize: '14px', color: '#374151' }}>{role.dashboard_access}</div>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>
                  Assigned Users ({assignedCount})
                </label>
                <div style={{ marginTop: '4px' }}>
                  {assignedCount === 0 ? (
                    <span style={{ fontSize: '14px', color: '#9ca3af' }}>No users assigned</span>
                  ) : (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {usersWithRoles
                        .filter(u => u.user_role?.id === role.id)
                        .slice(0, 3)
                        .map(user => (
                          <span
                            key={user.id}
                            style={{
                              background: '#dbeafe',
                              color: '#1e40af',
                              padding: '2px 6px',
                              borderRadius: '12px',
                              fontSize: '12px'
                            }}
                          >
                            {user.name}
                          </span>
                        ))}
                      {assignedCount > 3 && (
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          +{assignedCount - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}