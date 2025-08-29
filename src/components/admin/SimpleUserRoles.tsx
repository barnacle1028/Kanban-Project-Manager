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

export default function SimpleUserRoles() {
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRoles = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🧪 Direct Supabase test - fetching user roles...')
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name', { ascending: true })
      
      console.log('📊 Direct query result:', { data, error })
      
      if (error) {
        console.error('❌ Direct query error:', error)
        setError(`Database Error: ${error.message}`)
        return
      }
      
      console.log('✅ Direct query success - roles found:', data?.length || 0)
      setRoles(data || [])
      
    } catch (err) {
      console.error('💥 Exception in direct query:', err)
      setError(`Exception: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
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

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 
          background: '#fee', 
          color: '#c33', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '10px'
        }}>
          <strong>Error:</strong> {error}
        </div>
        <button 
          onClick={loadRoles}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007cba',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Simple User Roles Test</h2>
      <p>Direct Supabase Query Results:</p>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Total Roles Found: {roles.length}</strong>
      </div>

      {roles.length === 0 ? (
        <div style={{ 
          background: '#fffbf0', 
          border: '1px solid #f0c36d',
          padding: '10px', 
          borderRadius: '5px' 
        }}>
          No roles found in database
        </div>
      ) : (
        <div>
          {roles.map((role) => (
            <div 
              key={role.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '10px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <h4 style={{ margin: '0 0 8px 0' }}>{role.name}</h4>
              <div><strong>Type:</strong> {role.role_type}</div>
              <div><strong>Description:</strong> {role.description}</div>
              <div><strong>Dashboard Access:</strong> {role.dashboard_access}</div>
              <div><strong>Active:</strong> {role.is_active ? 'Yes' : 'No'}</div>
              <div><strong>Created:</strong> {new Date(role.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
      
      <button 
        onClick={loadRoles}
        style={{
          padding: '8px 16px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Refresh
      </button>
    </div>
  )
}