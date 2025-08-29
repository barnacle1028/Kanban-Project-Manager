import React, { useState, useEffect } from 'react'
import UserRoleManagement from './UserRoleManagement'
import ComprehensiveUserManagement from './UserManagement'
import { userManagementService } from '../../api/userManagement'
import { userRoleService } from '../../api/userRoles'
import { auditService } from '../../services/auditService'
import type { AuditLog, AuditLogFilter } from '../../services/auditService'

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
        {activeSettingsTab === 'orgSettings' && <OrganizationSettings />}
      </div>
    </div>
  )
}

function UserRolesSettings() {
  return <UserRoleManagement onClose={() => {}} />
}

function UserManagementWrapper() {
  return <ComprehensiveUserManagement />
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
        Organization settings configuration will be implemented here.
      </div>
    </div>
  )
}

function NonModalUserManagement() {
  const [users, setUsers] = useState([])
  const [userRoles, setUserRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingUser, setEditingUser] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    user_role_id: '',
    job_title: '',
    department: '',
    manager_id: '',
    employment_type: 'full_time',
    start_date: '',
    is_active: true,
    must_change_password: false
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersResponse, rolesResponse] = await Promise.all([
        userManagementService.getAllUsers(),
        userRoleService.getAllRoles()
      ])
      
      setUsers(usersResponse.users || [])
      setUserRoles(rolesResponse.roles || [])
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingUser) {
        await userManagementService.updateUser(editingUser.id, formData)
      } else {
        await userManagementService.createUser(formData)
      }
      
      // Reset form and reload data
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        user_role_id: '',
        job_title: '',
        department: '',
        manager_id: '',
        employment_type: 'full_time',
        start_date: '',
        is_active: true,
        must_change_password: false
      })
      setEditingUser(null)
      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to save user')
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      password: '', // Don't pre-fill password
      user_role_id: user.user_role_id || '',
      job_title: user.job_title || '',
      department: user.department || '',
      manager_id: user.manager_id || '',
      employment_type: user.employment_type || 'full_time',
      start_date: user.start_date || '',
      is_active: user.is_active !== false,
      must_change_password: user.must_change_password || false
    })
  }

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      try {
        await userManagementService.deleteUser(userId)
        await loadData()
      } catch (err) {
        setError(err.message || 'Failed to delete user')
      }
    }
  }

  const handleCancel = () => {
    setEditingUser(null)
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      user_role_id: '',
      job_title: '',
      department: '',
      manager_id: '',
      employment_type: 'full_time',
      start_date: '',
      is_active: true,
      must_change_password: false
    })
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading users...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>
          {editingUser ? `Edit User: ${editingUser.first_name} ${editingUser.last_name}` : 'Create New User'}
        </h3>

        {error && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#dc2626', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '20px' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ 
          background: '#f9fafb', 
          padding: '20px', 
          borderRadius: '8px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              First Name *
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Last Name *
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required={!editingUser}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Role
            </label>
            <select
              value={formData.user_role_id}
              onChange={(e) => setFormData(prev => ({ ...prev, user_role_id: e.target.value }))}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="">Select Role</option>
              {userRoles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Job Title
            </label>
            <input
              type="text"
              value={formData.job_title}
              onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Department
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Employment Type
            </label>
            <select
              value={formData.employment_type}
              onChange={(e) => setFormData(prev => ({ ...prev, employment_type: e.target.value }))}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="intern">Intern</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              />
              Active User
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={formData.must_change_password}
                onChange={(e) => setFormData(prev => ({ ...prev, must_change_password: e.target.checked }))}
              />
              Must Change Password on Next Login
            </label>
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            {editingUser && (
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '10px 20px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {editingUser ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>

      {/* Users List */}
      <div>
        <h3>Existing Users ({users.length})</h3>
        <div style={{ 
          background: 'white', 
          borderRadius: '8px', 
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} style={{ borderBottom: index < users.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '12px' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{user.first_name} {user.last_name}</div>
                      {user.job_title && <div style={{ fontSize: '12px', color: '#6b7280' }}>{user.job_title}</div>}
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: '#374151' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {user.user_role?.name || 'No Role'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: user.is_active ? '#d1fae5' : '#fee2e2',
                      color: user.is_active ? '#065f46' : '#dc2626',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(user)}
                        style={{
                          padding: '4px 8px',
                          background: '#4f46e5',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, `${user.first_name} ${user.last_name}`)}
                        style={{
                          padding: '4px 8px',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<AuditLogFilter>({})
  
  useEffect(() => {
    loadLogs()
  }, [filter])
  
  const loadLogs = async () => {
    try {
      setLoading(true)
      const response = await auditService.getAuditLogs(filter)
      setLogs(response.logs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading audit logs...</div>
  }
  
  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '6px' }}>
          Error: {error}
        </div>
      </div>
    )
  }
  
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Audit Logs</h3>
        
        <select 
          value={filter.action || ''}
          onChange={(e) => setFilter(prev => ({ ...prev, action: e.target.value || undefined }))}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
        >
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="EXPORT">Export</option>
          <option value="IMPORT">Import</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
        </select>
        
        <select
          value={filter.entity_type || ''}
          onChange={(e) => setFilter(prev => ({ ...prev, entity_type: e.target.value || undefined }))}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
        >
          <option value="">All Entities</option>
          <option value="user">Users</option>
          <option value="user_role">User Roles</option>
          <option value="engagement">Engagements</option>
          <option value="account">Accounts</option>
          <option value="engagement_type">Engagement Types</option>
          <option value="system">System</option>
        </select>
        
        <input
          type="date"
          value={filter.start_date || ''}
          onChange={(e) => setFilter(prev => ({ ...prev, start_date: e.target.value || undefined }))}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
        />
        
        <input
          type="date"
          value={filter.end_date || ''}
          onChange={(e) => setFilter(prev => ({ ...prev, end_date: e.target.value || undefined }))}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
        />
        
        <button
          onClick={() => setFilter({})}
          style={{
            padding: '8px 16px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Filters
        </button>
      </div>
      
      <div style={{ 
        background: 'white', 
        borderRadius: '8px', 
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Timestamp</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>User</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Action</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Entity</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  No audit logs found
                </td>
              </tr>
            ) : (
              logs.map((log, index) => (
                <tr key={log.id} style={{ borderBottom: index < logs.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {log.user_name || log.user_id || 'System'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: log.action === 'DELETE' ? '#fee2e2' : log.action === 'CREATE' ? '#d1fae5' : '#dbeafe',
                      color: log.action === 'DELETE' ? '#dc2626' : log.action === 'CREATE' ? '#065f46' : '#1d4ed8',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{log.entity_type}</div>
                      {log.entity_id && <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>ID: {log.entity_id}</div>}
                    </div>
                  </td>
                  <td style={{ padding: '12px', maxWidth: '200px' }}>
                    {log.details && (
                      <details style={{ fontSize: '12px' }}>
                        <summary style={{ cursor: 'pointer', color: '#4f46e5' }}>
                          View Details
                        </summary>
                        <pre style={{ 
                          marginTop: '8px', 
                          padding: '8px', 
                          background: '#f3f4f6', 
                          borderRadius: '4px',
                          overflow: 'auto',
                          maxHeight: '150px',
                          fontSize: '11px'
                        }}>
                          {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Reports() {
  return (
    <div style={{ padding: '20px' }}>
      <h3>Reports</h3>
      <p style={{ color: '#6b7280', marginBottom: '30px' }}>
        Generate and view system reports and analytics.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <SettingsCard
          title="User Activity Report"
          description="Track user logins, actions, and engagement across the system"
        >
          <button style={{
            padding: '8px 16px',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Generate Report
          </button>
        </SettingsCard>
        
        <SettingsCard
          title="System Performance"
          description="Monitor system performance metrics and resource usage"
        >
          <button style={{
            padding: '8px 16px',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            View Metrics
          </button>
        </SettingsCard>
        
        <SettingsCard
          title="Data Export"
          description="Export system data for backup or analysis purposes"
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              padding: '8px 16px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}>
              Users
            </button>
            <button style={{
              padding: '8px 16px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}>
              Audit Logs
            </button>
          </div>
        </SettingsCard>
      </div>
    </div>
  )
}

function EditUserModal({ user, userRoles, onSave, onClose }) {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    user_role_id: user?.user_role_id || '',
    job_title: user?.job_title || '',
    department: user?.department || '',
    is_active: user?.is_active !== false
  })
  
  const [errors, setErrors] = useState({})
  
  const handleSubmit = async (e) => {
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
    
    try {
      await onSave(user.id, formData)
      onClose()
    } catch (err) {
      setErrors({ general: err.message || 'Failed to update user' })
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
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h3 style={{ margin: '0 0 20px 0' }}>Edit User: {user?.first_name} {user?.last_name}</h3>
        
        {errors.general && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                First Name *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: errors.first_name ? '2px solid #dc2626' : '1px solid #d1d5db'
                }}
              />
              {errors.first_name && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {errors.first_name}
                </div>
              )}
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Last Name *
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: errors.last_name ? '2px solid #dc2626' : '1px solid #d1d5db'
                }}
              />
              {errors.last_name && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {errors.last_name}
                </div>
              )}
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: errors.email ? '2px solid #dc2626' : '1px solid #d1d5db'
                }}
              />
              {errors.email && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {errors.email}
                </div>
              )}
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Role
              </label>
              <select
                value={formData.user_role_id}
                onChange={(e) => setFormData(prev => ({ ...prev, user_role_id: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db'
                }}
              >
                <option value="">Select Role</option>
                {userRoles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Job Title
              </label>
              <input
                type="text"
                value={formData.job_title}
                onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
                Active User
              </label>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: '#6b7280',
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
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
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