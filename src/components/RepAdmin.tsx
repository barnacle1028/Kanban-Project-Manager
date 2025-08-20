import React, { useState, useMemo } from 'react'
import type { Rep } from '../types'

type SortOption = {
  column: string
  direction: 'asc' | 'desc' | 'none'
}

interface RepAdminProps {
  reps: Rep[]
  onAddRep: (rep: Omit<Rep, 'id' | 'createdDate'>) => void
  onUpdateRep: (id: string, updates: Partial<Rep>) => void
  onDeleteRep: (id: string) => void
  onBackToManager: () => void
}

export default function RepAdmin({
  reps,
  onAddRep,
  onUpdateRep,
  onDeleteRep,
  onBackToManager
}: RepAdminProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRep, setEditingRep] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<SortOption>({ column: '', direction: 'none' })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    avazaTimekeepingLink: '',
    isActive: true
  })

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.email) {
      onAddRep(formData)
      setFormData({
        name: '',
        email: '',
        title: '',
        avazaTimekeepingLink: '',
        isActive: true
      })
      setShowAddForm(false)
    }
  }

  const handleEdit = (rep: Rep) => {
    setEditingRep(rep.id)
    setFormData({
      name: rep.name,
      email: rep.email,
      title: rep.title,
      avazaTimekeepingLink: rep.avazaTimekeepingLink,
      isActive: rep.isActive
    })
  }

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingRep && formData.name && formData.email) {
      onUpdateRep(editingRep, formData)
      setEditingRep(null)
      setFormData({
        name: '',
        email: '',
        title: '',
        avazaTimekeepingLink: '',
        isActive: true
      })
    }
  }

  const handleCancel = () => {
    setEditingRep(null)
    setShowAddForm(false)
    setFormData({
      name: '',
      email: '',
      title: '',
      avazaTimekeepingLink: '',
      isActive: true
    })
  }

  const handleSort = (column: string) => {
    setSortConfig(prev => {
      if (prev.column === column) {
        // Cycle through: none -> asc -> desc -> none
        if (prev.direction === 'none') return { column, direction: 'asc' }
        if (prev.direction === 'asc') return { column, direction: 'desc' }
        return { column: '', direction: 'none' }
      }
      return { column, direction: 'asc' }
    })
  }

  const getSortIcon = (column: string) => {
    if (sortConfig.column !== column || sortConfig.direction === 'none') {
      return '↕️'
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  // Sort reps based on current sort config
  const sortedReps = useMemo(() => {
    if (sortConfig.direction === 'none') {
      return reps
    }

    return [...reps].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortConfig.column) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'email':
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case 'title':
          aValue = (a.title || '').toLowerCase()
          bValue = (b.title || '').toLowerCase()
          break
        case 'status':
          aValue = a.isActive ? 1 : 0
          bValue = b.isActive ? 1 : 0
          break
        case 'created':
          aValue = new Date(a.createdDate).getTime()
          bValue = new Date(b.createdDate).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [reps, sortConfig])

  const handleDelete = (rep: Rep) => {
    if (window.confirm(`Are you sure you want to delete ${rep.name}? This action cannot be undone.`)) {
      onDeleteRep(rep.id)
    }
  }

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '16px 20px',
      background: '#68BA7F',
      minHeight: '100vh'
    }}>
      {/* Header */}
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
          <h1 style={{
            margin: '0',
            fontSize: '24px',
            fontWeight: '600',
            color: '#253D2C',
            fontFamily: 'Trebuchet MS, Arial, sans-serif'
          }}>
            Rep Administration
          </h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowAddForm(true)}
              disabled={showAddForm || editingRep !== null}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'white',
                background: showAddForm || editingRep ? '#94a3b8' : '#10b981',
                border: 'none',
                cursor: showAddForm || editingRep ? 'not-allowed' : 'pointer',
                fontFamily: 'Trebuchet MS, Arial, sans-serif'
              }}
            >
              + Add New Rep
            </button>
            <button
              onClick={onBackToManager}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'white',
                background: '#68BA7F',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Trebuchet MS, Arial, sans-serif',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2E6F40'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#68BA7F'
              }}
            >
              ← Back to Manager Dashboard
            </button>
          </div>
        </div>
        <p style={{
          margin: '0',
          fontSize: '14px',
          color: '#68BA7F',
          fontFamily: 'Trebuchet MS, Arial, sans-serif'
        }}>
          Manage sales representatives and their information
        </p>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingRep) && (
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
            {editingRep ? 'Edit Rep' : 'Add New Rep'}
          </h3>
          <form onSubmit={editingRep ? handleSubmitEdit : handleSubmitAdd}>
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
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
                  Avaza Timekeeping Link
                </label>
                <input
                  type="url"
                  value={formData.avazaTimekeepingLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, avazaTimekeepingLink: e.target.value }))}
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#253D2C',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  Active Rep
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'white',
                  background: '#10b981',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif'
                }}
              >
                {editingRep ? 'Update Rep' : 'Add Rep'}
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

      {/* Reps List */}
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
          gridTemplateColumns: '2fr 2fr 1.5fr 2fr 1fr 100px 200px',
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
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('name')}
          >
            Name {getSortIcon('name')}
          </div>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('email')}
          >
            Email {getSortIcon('email')}
          </div>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('title')}
          >
            Title {getSortIcon('title')}
          </div>
          <div>Timekeeping Link</div>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('status')}
          >
            Status {getSortIcon('status')}
          </div>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('created')}
          >
            Created {getSortIcon('created')}
          </div>
          <div>Actions</div>
        </div>

        {/* Rep Rows */}
        {sortedReps.map((rep, index) => (
          <div
            key={rep.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1.5fr 2fr 1fr 100px 200px',
              gap: '12px',
              padding: '16px 20px',
              borderBottom: index < sortedReps.length - 1 ? '1px solid #e2e8f0' : 'none',
              opacity: rep.isActive ? 1 : 0.7,
              fontFamily: 'Trebuchet MS, Arial, sans-serif'
            }}
          >
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: rep.isActive ? '#253D2C' : '#94a3b8',
              display: 'flex',
              alignItems: 'center'
            }}>
              {rep.isActive ? rep.name : `${rep.name} (Inactive)`}
            </div>
            <div style={{
              fontSize: '13px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center'
            }}>
              {rep.email}
            </div>
            <div style={{
              fontSize: '13px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center'
            }}>
              {rep.title || 'N/A'}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              {rep.avazaTimekeepingLink ? (
                <a
                  href={rep.avazaTimekeepingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    color: 'white',
                    background: '#8b5cf6',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Timekeeping
                </a>
              ) : (
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>No link</span>
              )}
            </div>
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
                background: rep.isActive ? '#10b981' : '#ef4444'
              }}>
                {rep.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center'
            }}>
              {new Date(rep.createdDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <button
                onClick={() => handleEdit(rep)}
                disabled={showAddForm || (editingRep && editingRep !== rep.id)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: 'white',
                  background: (showAddForm || (editingRep && editingRep !== rep.id)) ? '#94a3b8' : '#2E6F40',
                  border: 'none',
                  cursor: (showAddForm || (editingRep && editingRep !== rep.id)) ? 'not-allowed' : 'pointer',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif'
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(rep)}
                disabled={showAddForm || editingRep !== null}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: 'white',
                  background: (showAddForm || editingRep) ? '#94a3b8' : '#ef4444',
                  border: 'none',
                  cursor: (showAddForm || editingRep) ? 'not-allowed' : 'pointer',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        
        {sortedReps.length === 0 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#64748b',
            fontFamily: 'Trebuchet MS, Arial, sans-serif'
          }}>
            No reps found. Click "Add New Rep" to get started.
          </div>
        )}
      </div>
    </div>
  )
}