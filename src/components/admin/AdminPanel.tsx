import React, { useState } from 'react'
import { useUsers } from '../../hooks/useUsers'

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
        {activeSettingsTab === 'userManagement' && <UserManagement />}
        {activeSettingsTab === 'engagementManagement' && <EngagementManagementSettings />}
        {activeSettingsTab === 'engagementTypes' && <EngagementTypesSettings />}
        {activeSettingsTab === 'orgSettings' && <OrganizationSettings />}
      </div>
    </div>
  )
}

function UserRolesSettings() {
  return (
    <div>
      <h4>User Role Configuration</h4>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Define and manage user roles and their permissions.
      </p>
      <div style={{ 
        background: '#f9fafb', 
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        User role configuration interface would be implemented here.
      </div>
    </div>
  )
}

function UserManagement() {
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