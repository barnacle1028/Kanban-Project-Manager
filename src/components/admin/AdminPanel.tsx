import React, { useState, useEffect } from 'react'
import { useUsers } from '../../hooks/useUsers'
import UserRoleManagement from './UserRoleManagement'
import ComprehensiveUserManagement from './UserManagement'
import { userManagementService } from '../../api/userManagement'
import { userRoleService } from '../../api/userRoles'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('settings')

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ borderBottom: '2px solid #e5e7eb', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#111827' }}>Administration Panel</h2>
        <nav style={{ display: 'flex', gap: '20px' }}>
          {[
            { id: 'settings', label: 'Settings' },
            { id: 'audit', label: 'Audit Logs' },
            { id: 'reports', label: 'Reports' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 16px',
                background: activeTab === tab.id ? '#4f46e5' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'settings' && <SettingsPanel />}
        {activeTab === 'audit' && <AuditLogs />}
        {activeTab === 'reports' && <Reports />}
      </div>
    </div>
  )
}

function SettingsPanel() {
  const [activeSettingsTab, setActiveSettingsTab] = useState('userRoles')

  return (
    <div>
      <h3>Settings</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
        {[
          { id: 'userRoles', label: 'User Roles' },
          { id: 'userManagement', label: 'User Management' },
          { id: 'engagementManagement', label: 'Engagement Management' },
          { id: 'engagementTypes', label: 'Engagement Types' },
          { id: 'orgSettings', label: 'Organization Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSettingsTab(tab.id)}
            style={{
              padding: '8px 12px',
              background: activeSettingsTab === tab.id ? '#4f46e5' : 'transparent',
              color: activeSettingsTab === tab.id ? 'white' : '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeSettingsTab === 'userRoles' && <UserRolesSettings />}
        {activeSettingsTab === 'userManagement' && <UserManagementWrapper />}
        {activeSettingsTab === 'engagementManagement' && <EngagementManagementSettings />}
        {activeSettingsTab === 'engagementTypes' && <EngagementTypesSettings />}
        {activeSettingsTab === 'orgSettings' && <OrganizationSettings />}
      </div>
    </div>
  )
}

function UserRolesSettings() {
  return <UserRoleManagement />
}

function UserManagementWrapper() {
  // Create a non-modal version for the Settings panel
  return (
    <div style={{ padding: '0' }}>
      <NonModalUserManagement />
    </div>
  )
}

function SimpleUserManagement() {
  const { data: users, isLoading, error } = useUsers()

  if (isLoading) {
    return <div>Loading users...</div>
  }

  if (error) {
    return <div style={{ color: '#dc2626' }}>Error loading users: {error.message}</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h4 style={{ margin: 0 }}>User Management</h4>
        <button style={{
          background: '#4f46e5',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer'
        }}>
          Add New User
        </button>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px' }}>{user.name}</td>
                <td style={{ padding: '12px' }}>{user.email}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background: user.role === 'EXECUTIVE' ? '#fef2f2' : user.role === 'MANAGER' ? '#f0f9ff' : '#f0fdf4',
                    color: user.role === 'EXECUTIVE' ? '#dc2626' : user.role === 'MANAGER' ? '#0369a1' : '#16a34a'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background: '#f0fdf4',
                    color: '#16a34a'
                  }}>
                    Active
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <button style={{
                    background: 'none',
                    border: '1px solid #d1d5db',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '8px',
                    fontSize: '12px'
                  }}>
                    Edit
                  </button>
                  <button style={{
                    background: 'none',
                    border: '1px solid #dc2626',
                    color: '#dc2626',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}>
                    Disable
                  </button>
                </td>
              </tr>
            )) || (
              <tr>
                <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EngagementManagementSettings() {
  return (
    <div>
      <h4>Engagement Management</h4>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Configure engagement workflows, statuses, and business rules.
      </p>
      <div style={{ 
        background: '#f9fafb', 
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        Engagement management configuration would be implemented here.
      </div>
    </div>
  )
}

function EngagementTypesSettings() {
  return (
    <div>
      <h4>Engagement Types</h4>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Define and manage different types of engagements and their properties.
      </p>
      <div style={{ 
        background: '#f9fafb', 
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        Engagement types configuration would be implemented here.
      </div>
    </div>
  )
}

function OrganizationSettings() {
  return (
    <div>
      <h4>Organization Settings</h4>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Configure organization-wide settings and preferences.
      </p>
      <div style={{ 
        background: '#f9fafb', 
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        Organization settings configuration would be implemented here.
      </div>
    </div>
  )
}

function NonModalUserManagement() {
  const [users, setUsers] = useState([])
  const [userRoles, setUserRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    loadData()
  }, [searchTerm, filter])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersResponse, rolesResponse] = await Promise.all([
        userManagementService.getAllUsers({ 
          ...filter, 
          search: searchTerm 
        }, { 
          field: 'created_at', 
          direction: 'desc' 
        }, 1, 50),
        userRoleService.getAllUserRoles()
      ])
      setUsers(usersResponse.users || [])
      setUserRoles(rolesResponse || [])
    } catch (error) {
      console.error('Failed to load data:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleUpdateUser = async (userId, userData) => {
    try {
      console.log('Updating user:', userId, userData) // Debug log
      const result = await userManagementService.updateUser(userId, userData)
      console.log('Update result:', result) // Debug log
      alert('User updated successfully!') // Success confirmation
      setShowEditModal(false)
      setSelectedUser(null)
      loadData()
    } catch (error) {
      console.error('Failed to update user:', error)
      alert('Failed to update user: ' + error.message)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userManagementService.deleteUser(userId)
        loadData()
      } catch (error) {
        console.error('Failed to delete user:', error)
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return { background: '#d1fae5', color: '#065f46' }
      case 'inactive': return { background: '#f3f4f6', color: '#374151' }
      case 'pending': return { background: '#fef3c7', color: '#92400e' }
      case 'suspended': return { background: '#fee2e2', color: '#991b1b' }
      default: return { background: '#f3f4f6', color: '#374151' }
    }
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading users...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>User Management</h4>
        <button 
          onClick={() => setShowCreateModal(true)}
          style={{
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          + Add New User
        </button>
      </div>

      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
        <select
          value={filter.status || ''}
          onChange={(e) => setFilter({ ...filter, status: e.target.value || undefined })}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Users Table */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Created</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px', fontSize: '14px' }}>
                  {user.first_name} {user.last_name}
                </td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{user.email}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>
                  {user.user_role?.name || 'No Role'}
                </td>
                <td style={{ padding: '12px', fontSize: '14px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    ...getStatusColor(user.status)
                  }}>
                    {user.status}
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: '14px' }}>
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleEditUser(user)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        background: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        border: '1px solid #dc2626',
                        borderRadius: '4px',
                        background: 'white',
                        color: '#dc2626',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                  {searchTerm || filter.status ? 'No users match your search criteria' : 'No users found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
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
            padding: '20px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3>Create New User</h3>
            <p>User creation form would go here...</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button style={{
                padding: '8px 16px',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedUser && (
        <EditUserModal 
          user={selectedUser}
          userRoles={userRoles}
          onSave={handleUpdateUser}
          onClose={() => {
            setShowEditModal(false)
            setSelectedUser(null)
          }}
        />
      )}
    </div>
  )
}

function AuditLogs() {
  return (
    <div>
      <h3>Audit Logs</h3>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Track user actions and system events for security and compliance.
      </p>
      <div style={{ 
        background: '#f9fafb', 
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        Audit log viewer would be implemented here with filtering, search, and export capabilities.
      </div>
    </div>
  )
}

function Reports() {
  return (
    <div>
      <h3>Reports & Analytics</h3>
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {[
          'Engagement Progress Report',
          'Team Performance Report',
          'User Activity Report',
          'System Usage Report'
        ].map(report => (
          <div key={report} style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>{report}</h4>
            <button style={{
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Generate
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function EditUserModal({ user, userRoles, onSave, onClose }) {
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    job_title: user.job_title || '',
    department: user.department || '',
    employee_id: user.employee_id || '',
    phone: user.phone || '',
    status: user.status || 'active',
    employee_type: user.employee_type || 'full_time',
    user_role_id: user.user_role?.id || ''
  })

  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors = {}
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required'
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    console.log('Form submission data:', formData) // Debug log
    
    // Clean up the data before sending
    const updateData = { ...formData }
    if (!updateData.user_role_id) {
      delete updateData.user_role_id // Remove empty role
    }
    
    console.log('Cleaned data for API:', updateData) // Debug log
    onSave(user.id, updateData)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

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
        borderRadius: '8px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            Edit User: {user.first_name} {user.last_name}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                First Name *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${errors.first_name ? '#dc2626' : '#d1d5db'}`,
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              {errors.first_name && (
                <span style={{ fontSize: '12px', color: '#dc2626' }}>{errors.first_name}</span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Last Name *
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${errors.last_name ? '#dc2626' : '#d1d5db'}`,
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              {errors.last_name && (
                <span style={{ fontSize: '12px', color: '#dc2626' }}>{errors.last_name}</span>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${errors.email ? '#dc2626' : '#d1d5db'}`,
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            {errors.email && (
              <span style={{ fontSize: '12px', color: '#dc2626' }}>{errors.email}</span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Job Title
              </label>
              <input
                type="text"
                value={formData.job_title}
                onChange={(e) => handleChange('job_title', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Employee ID
              </label>
              <input
                type="text"
                value={formData.employee_id}
                onChange={(e) => handleChange('employee_id', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Employee Type
              </label>
              <select
                value={formData.employee_type}
                onChange={(e) => handleChange('employee_type', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contractor">Contractor</option>
                <option value="intern">Intern</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                User Role
              </label>
              <select
                value={formData.user_role_id}
                onChange={(e) => handleChange('user_role_id', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">No Role</option>
                {userRoles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SettingsCard({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
  return (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h4 style={{ margin: '0 0 8px 0' }}>{title}</h4>
      <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '14px' }}>{description}</p>
      {children}
    </div>
  )
}