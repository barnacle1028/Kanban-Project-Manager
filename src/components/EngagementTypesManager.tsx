import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { engagementTypesApi, type EngagementType } from '../api/engagementTypes'
import { supabase } from '../lib/supabase'

export default function EngagementTypesManager() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingType, setEditingType] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    default_duration_hours: '',
    sort_order: '',
    is_active: true
  })

  const queryClient = useQueryClient()

  const { data: engagementTypes = [], isLoading, error } = useQuery({
    queryKey: ['engagement-types-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engagement_types')
        .select('*')
        .order('sort_order')
      
      if (error) throw new Error(error.message)
      return data || []
    }
  })

  const createMutation = useMutation({
    mutationFn: engagementTypesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['engagement-types-all'])
      queryClient.invalidateQueries(['engagement-types'])
      handleCancel()
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<EngagementType> }) =>
      engagementTypesApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['engagement-types-all'])
      queryClient.invalidateQueries(['engagement-types'])
      handleCancel()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: engagementTypesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['engagement-types-all'])
      queryClient.invalidateQueries(['engagement-types'])
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) return

    const typeData = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      default_duration_hours: formData.default_duration_hours ? parseInt(formData.default_duration_hours) : null,
      sort_order: formData.sort_order ? parseInt(formData.sort_order) : (engagementTypes.length + 1),
      is_active: formData.is_active
    }

    if (editingType) {
      updateMutation.mutate({ id: editingType, updates: typeData })
    } else {
      createMutation.mutate(typeData)
    }
  }

  const handleEdit = (type: EngagementType) => {
    setEditingType(type.id)
    setFormData({
      name: type.name,
      description: type.description || '',
      default_duration_hours: type.default_duration_hours?.toString() || '',
      sort_order: type.sort_order?.toString() || '',
      is_active: type.is_active
    })
    setShowAddForm(true)
  }

  const handleDelete = (type: EngagementType) => {
    if (window.confirm(`Are you sure you want to delete "${type.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(type.id)
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingType(null)
    setFormData({
      name: '',
      description: '',
      default_duration_hours: '',
      sort_order: '',
      is_active: true
    })
  }

  if (isLoading) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        fontFamily: 'Trebuchet MS, Arial, sans-serif',
        color: '#64748b'
      }}>
        Loading engagement types...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        fontFamily: 'Trebuchet MS, Arial, sans-serif'
      }}>
        <div style={{
          background: '#fee2e2',
          color: '#dc2626',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          Error loading engagement types: {(error as Error).message}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Controls Header */}
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <h2 style={{
            margin: '0',
            fontSize: '20px',
            fontWeight: '600',
            color: '#253D2C',
            fontFamily: 'Trebuchet MS, Arial, sans-serif'
          }}>
            Engagement Types Manager
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              color: 'white',
              background: showAddForm ? '#94a3b8' : '#10b981',
              border: 'none',
              cursor: showAddForm ? 'not-allowed' : 'pointer',
              fontFamily: 'Trebuchet MS, Arial, sans-serif'
            }}
          >
            + Add New Type
          </button>
        </div>
        <p style={{
          margin: '0',
          fontSize: '14px',
          color: '#68BA7F',
          fontFamily: 'Trebuchet MS, Arial, sans-serif'
        }}>
          Manage engagement types with full CRUD operations • {engagementTypes.length} types configured
        </p>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#253D2C',
            fontFamily: 'Trebuchet MS, Arial, sans-serif'
          }}>
            {editingType ? 'Edit Engagement Type' : 'Add New Engagement Type'}
          </h3>

          {(createMutation.error || updateMutation.error) && (
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontFamily: 'Trebuchet MS, Arial, sans-serif'
            }}>
              Error: {((createMutation.error || updateMutation.error) as Error)?.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#253D2C',
                  marginBottom: '4px',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif'
                }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    fontFamily: 'Trebuchet MS, Arial, sans-serif'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#253D2C',
                  marginBottom: '4px',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif'
                }}>
                  Default Duration (Hours)
                </label>
                <input
                  type="number"
                  value={formData.default_duration_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, default_duration_hours: e.target.value }))}
                  min="0"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    fontFamily: 'Trebuchet MS, Arial, sans-serif'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#253D2C',
                  marginBottom: '4px',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif'
                }}>
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: e.target.value }))}
                  min="1"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    fontFamily: 'Trebuchet MS, Arial, sans-serif'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '20px' }}>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  style={{ marginRight: '8px' }}
                />
                <label style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#253D2C',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif'
                }}>
                  Active
                </label>
              </div>
            </div>

            <div style={{
              gridColumn: '1 / -1',
              marginBottom: '16px'
            }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#253D2C',
                marginBottom: '4px',
                fontFamily: 'Trebuchet MS, Arial, sans-serif'
              }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                disabled={createMutation.isLoading || updateMutation.isLoading}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'white',
                  background: (createMutation.isLoading || updateMutation.isLoading) ? '#94a3b8' : '#10b981',
                  border: 'none',
                  cursor: (createMutation.isLoading || updateMutation.isLoading) ? 'not-allowed' : 'pointer',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif'
                }}
              >
                {(createMutation.isLoading || updateMutation.isLoading) 
                  ? 'Saving...' 
                  : editingType 
                    ? '💾 Update Type' 
                    : '💾 Save Type'
                }
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'white',
                  background: '#ef4444',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Engagement Types List */}
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '3fr 2fr 1fr 1fr 1fr 150px',
          gap: '12px',
          padding: '16px 20px',
          background: '#2E6F40',
          color: 'white',
          fontSize: '12px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontFamily: 'Trebuchet MS, Arial, sans-serif'
        }}>
          <div>Name</div>
          <div>Description</div>
          <div>Duration (hrs)</div>
          <div>Sort Order</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {/* Engagement Type Rows */}
        {engagementTypes.map((type, index) => (
          <div
            key={type.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '3fr 2fr 1fr 1fr 1fr 150px',
              gap: '12px',
              padding: '16px 20px',
              borderBottom: index < engagementTypes.length - 1 ? '1px solid #e2e8f0' : 'none',
              transition: 'background-color 0.2s ease',
              fontFamily: 'Trebuchet MS, Arial, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            {/* Name */}
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#253D2C',
              display: 'flex',
              alignItems: 'center'
            }}>
              {type.name}
            </div>

            {/* Description */}
            <div style={{
              fontSize: '13px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center'
            }}>
              {type.description || 'No description'}
            </div>

            {/* Duration */}
            <div style={{
              fontSize: '13px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center'
            }}>
              {type.default_duration_hours || 'N/A'}
            </div>

            {/* Sort Order */}
            <div style={{
              fontSize: '13px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center'
            }}>
              {type.sort_order}
            </div>

            {/* Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '600',
                textTransform: 'uppercase',
                color: 'white',
                background: type.is_active ? '#10b981' : '#ef4444'
              }}>
                {type.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <button
                onClick={() => handleEdit(type)}
                disabled={showAddForm}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: 'white',
                  background: showAddForm ? '#94a3b8' : '#3b82f6',
                  border: 'none',
                  cursor: showAddForm ? 'not-allowed' : 'pointer',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif'
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(type)}
                disabled={showAddForm || deleteMutation.isLoading}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: 'white',
                  background: (showAddForm || deleteMutation.isLoading) ? '#94a3b8' : '#ef4444',
                  border: 'none',
                  cursor: (showAddForm || deleteMutation.isLoading) ? 'not-allowed' : 'pointer',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif'
                }}
              >
                {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}

        {engagementTypes.length === 0 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#64748b',
            fontFamily: 'Trebuchet MS, Arial, sans-serif'
          }}>
            No engagement types found. Click "Add New Type" to create your first engagement type.
          </div>
        )}
      </div>
    </>
  )
}