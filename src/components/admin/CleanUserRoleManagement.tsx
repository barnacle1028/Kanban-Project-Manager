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
  const [showEditModal, setShowEditModal] = useState(false)

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

  const editRole = async (roleId: string, roleData: Partial<CreateRoleData>) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('user_roles')
        .update(roleData)
        .eq('id', roleId)
      
      if (error) throw error
      
      await loadRoles()
      setShowEditModal(false)
      setEditingRole(null)
      
    } catch (err) {
      console.error('Error updating role:', err)
      setError(`Failed to update role: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const openEditModal = (role: UserRole) => {
    setEditingRole(role)
    setShowEditModal(true)
  }

  const exportToCSV = () => {
    try {
      const csvData = roles.map(role => ({
        Name: role.name,
        Type: role.role_type,
        Description: role.description || '',
        'Dashboard Access': role.dashboard_access,
        Active: role.is_active ? 'Yes' : 'No',
        'Created Date': new Date(role.created_at).toLocaleDateString(),
        Permissions: JSON.stringify(role.permissions)
      }))

      const headers = Object.keys(csvData[0] || {})
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row]
            return typeof value === 'string' && value.includes(',') 
              ? `"${value.replace(/"/g, '""')}"` 
              : value
          }).join(',')
        )
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `user_roles_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (err) {
      console.error('Error exporting CSV:', err)
      setError('Failed to export CSV file')
    }
  }

  const importFromCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError(null)
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        setError('CSV file must contain headers and at least one data row')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const requiredHeaders = ['Name', 'Type', 'Dashboard Access']
      
      const missingHeaders = requiredHeaders.filter(req => 
        !headers.some(header => header.toLowerCase().includes(req.toLowerCase()))
      )
      
      if (missingHeaders.length > 0) {
        setError(`Missing required columns: ${missingHeaders.join(', ')}`)
        return
      }

      const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'))
      const typeIndex = headers.findIndex(h => h.toLowerCase().includes('type'))
      const descIndex = headers.findIndex(h => h.toLowerCase().includes('description'))
      const dashboardIndex = headers.findIndex(h => h.toLowerCase().includes('dashboard'))
      const activeIndex = headers.findIndex(h => h.toLowerCase().includes('active'))

      // Get user ID for created_by
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('is_active', true)
        .limit(1)
      
      const createdBy = users?.[0]?.id || 'system'

      const rolesToImport = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
        
        if (values.length < 3) continue

        const roleData = {
          name: values[nameIndex] || `Role ${i}`,
          role_type: (['Admin', 'Manager', 'Consultant', 'Custom'].includes(values[typeIndex]) 
            ? values[typeIndex] 
            : 'Custom') as 'Admin' | 'Manager' | 'Consultant' | 'Custom',
          description: values[descIndex] || '',
          dashboard_access: (['Admin', 'Manager', 'Rep'].includes(values[dashboardIndex]) 
            ? values[dashboardIndex] 
            : 'Rep') as 'Admin' | 'Manager' | 'Rep',
          is_active: activeIndex >= 0 ? values[activeIndex]?.toLowerCase() === 'yes' : true,
          permissions: {},
          created_by: createdBy
        }

        rolesToImport.push(roleData)
      }

      if (rolesToImport.length === 0) {
        setError('No valid roles found in CSV file')
        return
      }

      // Import roles
      const { error: importError } = await supabase
        .from('user_roles')
        .insert(rolesToImport)

      if (importError) throw importError

      await loadRoles()
      
      // Reset file input
      event.target.value = ''

    } catch (err) {
      console.error('Error importing CSV:', err)
      setError(`Failed to import CSV: ${err instanceof Error ? err.message : 'Unknown error'}`)
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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="file"
            accept=".csv"
            onChange={importFromCSV}
            style={{ display: 'none' }}
            id="csv-import"
          />
          <label
            htmlFor="csv-import"
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '10px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'inline-block'
            }}
          >
            📤 Import CSV
          </label>
          <button
            onClick={exportToCSV}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '10px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            📥 Export CSV
          </button>
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
                  onClick={() => openEditModal(role)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #3b82f6',
                    borderRadius: '4px',
                    backgroundColor: '#eff6ff',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Edit
                </button>
                
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

      {showEditModal && editingRole && (
        <EditRoleModal 
          role={editingRole}
          onSave={(data) => editRole(editingRole.id, data)}
          onCancel={() => {
            setShowEditModal(false)
            setEditingRole(null)
          }}
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

interface EditRoleModalProps {
  role: UserRole
  onSave: (data: Partial<CreateRoleData>) => void
  onCancel: () => void
}

function EditRoleModal({ role, onSave, onCancel }: EditRoleModalProps) {
  const [formData, setFormData] = useState<CreateRoleData>({
    name: role.name,
    role_type: role.role_type as 'Admin' | 'Manager' | 'Consultant' | 'Custom',
    description: role.description || '',
    dashboard_access: role.dashboard_access as 'Admin' | 'Manager' | 'Rep',
    permissions: role.permissions || {}
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
        <h3 style={{ margin: '0 0 20px 0' }}>Edit User Role</h3>
        
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}