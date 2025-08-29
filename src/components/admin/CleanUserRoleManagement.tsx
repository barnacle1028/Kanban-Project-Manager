import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface UserRole {
  id: string
  name: string
  role_type: string
  description: string
  is_active: boolean
  dashboard_access: string
  permissions: any
  created_at: string
  updated_at: string
  created_by: string
}

interface CreateRoleData {
  name: string
  role_type: 'Admin' | 'Manager' | 'Consultant' | 'Custom'
  description: string
  dashboard_access: 'Admin' | 'Manager' | 'Rep'
  permissions: any
}

export default function CleanUserRoleManagement() {
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRole, setEditingRole] = useState<UserRole | null>(null)

  const loadRoles = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) throw error
      
      setRoles(data || [])
      
    } catch (err) {
      console.error('Error loading roles:', err)
      setError(`Failed to load roles: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const createRole = async (roleData: CreateRoleData) => {
    try {
      setError(null)
      
      // Get a user ID for created_by (use first available user)
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('is_active', true)
        .limit(1)
      
      const createdBy = users?.[0]?.id || 'system'
      
      const { data, error } = await supabase
        .from('user_roles')
        .insert([{
          ...roleData,
          created_by: createdBy
        }])
        .select()
        .single()
      
      if (error) throw error
      
      await loadRoles()
      setShowCreateModal(false)
      
    } catch (err) {
      console.error('Error creating role:', err)
      setError(`Failed to create role: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const deleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the "${roleName}" role?`)) {
      return
    }
    
    try {
      setError(null)
      
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId)
      
      if (error) throw error
      
      await loadRoles()
      
    } catch (err) {
      console.error('Error deleting role:', err)
      setError(`Failed to delete role: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const toggleRoleStatus = async (role: UserRole) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: !role.is_active })
        .eq('id', role.id)
      
      if (error) throw error
      
      await loadRoles()
      
    } catch (err) {
      console.error('Error updating role status:', err)
      setError(`Failed to update role: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  useEffect(() => {
    loadRoles()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading User Roles...</div>
      </div>
    )
  }

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '16px'
      }}>
        <h2 style={{ margin: 0, color: '#111827' }}>User Role Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            backgroundColor: '#22c55e',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          + Create New Role
        </button>
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          color: '#dc2626', 
          padding: '12px', 
          borderRadius: '6px',
          marginBottom: '16px',
          border: '1px solid #fecaca'
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#374151' }}>
          User Roles ({roles.length})
        </h3>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {roles.map((role) => (
          <div 
            key={role.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: role.is_active ? '#f9fafb' : '#f3f4f6'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, color: '#111827' }}>{role.name}</h4>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: role.is_active ? '#dcfce7' : '#f3f4f6',
                    color: role.is_active ? '#166534' : '#6b7280'
                  }}>
                    {role.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af'
                  }}>
                    {role.role_type}
                  </span>
                </div>
                
                <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>
                  {role.description || 'No description'}
                </p>
                
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  <strong>Dashboard Access:</strong> {role.dashboard_access} | 
                  <strong> Created:</strong> {new Date(role.created_at).toLocaleDateString()}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => toggleRoleStatus(role)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {role.is_active ? 'Disable' : 'Enable'}
                </button>
                
                <button
                  onClick={() => deleteRole(role.id, role.name)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #dc2626',
                    borderRadius: '4px',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <CreateRoleModal 
          onSave={createRole}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}

interface CreateRoleModalProps {
  onSave: (data: CreateRoleData) => void
  onCancel: () => void
}

function CreateRoleModal({ onSave, onCancel }: CreateRoleModalProps) {
  const [formData, setFormData] = useState<CreateRoleData>({
    name: '',
    role_type: 'Custom',
    description: '',
    dashboard_access: 'Rep',
    permissions: {}
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    
    onSave(formData)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '500px',
        maxWidth: '90vw'
      }}>
        <h3 style={{ margin: '0 0 20px 0' }}>Create New User Role</h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>
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
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="Enter role name"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>
              Role Type
            </label>
            <select
              value={formData.role_type}
              onChange={(e) => setFormData(prev => ({ ...prev, role_type: e.target.value as any }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="Custom">Custom</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Consultant">Consultant</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>
              Dashboard Access
            </label>
            <select
              value={formData.dashboard_access}
              onChange={(e) => setFormData(prev => ({ ...prev, dashboard_access: e.target.value as any }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="Rep">Rep Dashboard</option>
              <option value="Manager">Manager Dashboard</option>
              <option value="Admin">Admin Dashboard</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                minHeight: '80px'
              }}
              placeholder="Describe this role's purpose and responsibilities"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#3b82f6',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600'
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