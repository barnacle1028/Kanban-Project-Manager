import React, { useState, useMemo } from 'react'
import type { Engagement, Rep, ProjectStatus, SalesType, Speed, CRM, AddOn } from '../types'
import { createStandardMilestones } from '../utils/standardMilestones'

type SortOption = {
  column: string
  direction: 'asc' | 'desc' | 'none'
}

interface EngagementAdminProps {
  engagements: Engagement[]
  reps: Rep[]
  onAddEngagement: (engagement: Omit<Engagement, 'id' | 'milestones'>) => void
  onUpdateEngagement: (id: string, updates: Partial<Engagement>) => void
  onDeleteEngagement: (id: string) => void
  onBackToManager: () => void
}

const STATUS_OPTIONS: ProjectStatus[] = [
  'NEW',
  'KICK_OFF', 
  'IN_PROGRESS',
  'LAUNCHED',
  'STALLED',
  'ON_HOLD',
  'CLAWED_BACK',
  'COMPLETED',
]

const SALES_TYPE_OPTIONS: SalesType[] = [
  'Channel',
  'Direct Sell',
  'Greaser Sale'
]

const SPEED_OPTIONS: Speed[] = [
  'Slow',
  'Medium', 
  'Fast'
]

const CRM_OPTIONS: CRM[] = [
  'Salesforce',
  'Dynamics',
  'Hubspot',
  'Other',
  'None'
]

const ADDON_OPTIONS: AddOn[] = [
  'Meet',
  'Deal',
  'Forecasting',
  'AI Agents',
  'Content',
  'Migration',
  'Managed Services'
]

function getHealthIcon(health: 'GREEN' | 'YELLOW' | 'RED') {
  switch (health) {
    case 'GREEN':
      return '🟢'
    case 'YELLOW':
      return '🟡'
    case 'RED':
      return '🔴'
    default:
      return '⚪'
  }
}

function getStatusColor(status: ProjectStatus) {
  switch (status) {
    case 'NEW':
    case 'KICK_OFF':
      return '#3b82f6'
    case 'IN_PROGRESS':
    case 'LAUNCHED':
      return '#10b981'
    case 'STALLED':
      return '#f59e0b'
    case 'ON_HOLD':
    case 'CLAWED_BACK':
      return '#ef4444'
    case 'COMPLETED':
      return '#8b5cf6'
    default:
      return '#6b7280'
  }
}

export default function EngagementAdmin({
  engagements,
  reps,
  onAddEngagement,
  onUpdateEngagement,
  onDeleteEngagement,
  onBackToManager
}: EngagementAdminProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEngagement, setEditingEngagement] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<SortOption>({ column: '', direction: 'none' })
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL')
  const [formData, setFormData] = useState({
    name: '',
    accountName: '',
    assignedRep: '',
    status: 'NEW' as ProjectStatus,
    startDate: '',
    closeDate: '',
    salesType: 'Direct Sell' as SalesType,
    speed: 'Medium' as Speed,
    crm: 'Salesforce' as CRM,
    soldBy: '',
    seatCount: 0,
    hoursAlloted: 0,
    addOnsPurchased: [] as AddOn[],
    avazaLink: '',
    projectFolderLink: '',
    clientWebsiteLink: '',
    primaryContactName: '',
    primaryContactEmail: '',
    linkedinLink: ''
  })

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.accountName) {
      onAddEngagement({
        ...formData,
        health: 'GREEN' as const
      })
      setFormData({
        name: '',
        accountName: '',
        assignedRep: '',
        status: 'NEW',
        startDate: '',
        closeDate: '',
        salesType: 'Direct Sell',
        speed: 'Medium',
        crm: 'Salesforce',
        soldBy: '',
        seatCount: 0,
        hoursAlloted: 0,
        addOnsPurchased: [],
        avazaLink: '',
        projectFolderLink: '',
        clientWebsiteLink: '',
        primaryContactName: '',
        primaryContactEmail: '',
        linkedinLink: ''
      })
      setShowAddForm(false)
    }
  }

  const handleCancel = () => {
    setEditingEngagement(null)
    setShowAddForm(false)
    setFormData({
      name: '',
      accountName: '',
      assignedRep: '',
      status: 'NEW',
      startDate: '',
      closeDate: '',
      salesType: 'Direct Sell',
      speed: 'Medium',
      crm: 'Salesforce',
      soldBy: '',
      seatCount: 0,
      hoursAlloted: 0,
      addOnsPurchased: [],
      avazaLink: '',
      projectFolderLink: '',
      clientWebsiteLink: '',
      primaryContactName: '',
      primaryContactEmail: '',
      linkedinLink: ''
    })
  }

  const handleSort = (column: string) => {
    setSortConfig(prev => {
      if (prev.column === column) {
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

  const handleAddonChange = (addon: AddOn, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      addOnsPurchased: checked 
        ? [...prev.addOnsPurchased, addon]
        : prev.addOnsPurchased.filter(a => a !== addon)
    }))
  }

  const handleDelete = (engagement: Engagement) => {
    if (window.confirm(`Are you sure you want to delete "${engagement.name}"? This action cannot be undone.`)) {
      onDeleteEngagement(engagement.id)
    }
  }

  // Filter and sort engagements
  const filteredAndSortedEngagements = useMemo(() => {
    let filtered = engagements
    
    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(eng => eng.status === statusFilter)
    }

    // Apply sorting
    if (sortConfig.direction === 'none') {
      return filtered
    }

    return [...filtered].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortConfig.column) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'accountName':
          aValue = a.accountName.toLowerCase()
          bValue = b.accountName.toLowerCase()
          break
        case 'assignedRep':
          aValue = (a.assignedRep || '').toLowerCase()
          bValue = (b.assignedRep || '').toLowerCase()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'startDate':
          aValue = a.startDate ? new Date(a.startDate).getTime() : 0
          bValue = b.startDate ? new Date(b.startDate).getTime() : 0
          break
        case 'closeDate':
          aValue = a.closeDate ? new Date(a.closeDate).getTime() : 0
          bValue = b.closeDate ? new Date(b.closeDate).getTime() : 0
          break
        case 'health':
          const healthOrder = { GREEN: 0, YELLOW: 1, RED: 2 }
          aValue = healthOrder[a.health]
          bValue = healthOrder[b.health]
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
  }, [engagements, statusFilter, sortConfig])

  return (
    <div style={{
      maxWidth: '1600px',
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
            Engagement Administration
          </h1>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'ALL')}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                fontFamily: 'Trebuchet MS, Arial, sans-serif'
              }}
            >
              <option value="ALL">All Statuses</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAddForm(true)}
              disabled={showAddForm || editingEngagement !== null}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'white',
                background: showAddForm || editingEngagement ? '#94a3b8' : '#10b981',
                border: 'none',
                cursor: showAddForm || editingEngagement ? 'not-allowed' : 'pointer',
                fontFamily: 'Trebuchet MS, Arial, sans-serif'
              }}
            >
              + Add New Engagement
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
          Manage all engagements and create new ones • Showing {filteredAndSortedEngagements.length} of {engagements.length} engagements
        </p>
      </div>

      {/* Add Form */}
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
            Add New Engagement
          </h3>
          <form onSubmit={handleSubmitAdd}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '16px'
            }}>
              {/* Basic Info */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#253D2C',
                  marginBottom: '4px',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif'
                }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
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
                  Project Name *
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
                  Assigned Rep
                </label>
                <select
                  value={formData.assignedRep}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedRep: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    fontFamily: 'Trebuchet MS, Arial, sans-serif'
                  }}
                >
                  <option value="">Select Rep</option>
                  {reps.filter(rep => rep.isActive).map(rep => (
                    <option key={rep.id} value={rep.name}>{rep.name}</option>
                  ))}
                </select>
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
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    fontFamily: 'Trebuchet MS, Arial, sans-serif'
                  }}
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>{status.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#253D2C',
                  marginBottom: '4px',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif'
                }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
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
                  Close Date
                </label>
                <input
                  type="date"
                  value={formData.closeDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, closeDate: e.target.value }))}
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

              {/* Sales Info */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#253D2C',
                  marginBottom: '4px',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif'
                }}>
                  Sales Type
                </label>
                <select
                  value={formData.salesType}
                  onChange={(e) => setFormData(prev => ({ ...prev, salesType: e.target.value as SalesType }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    fontFamily: 'Trebuchet MS, Arial, sans-serif'
                  }}
                >
                  {SALES_TYPE_OPTIONS.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
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
                  Speed
                </label>
                <select
                  value={formData.speed}
                  onChange={(e) => setFormData(prev => ({ ...prev, speed: e.target.value as Speed }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    fontFamily: 'Trebuchet MS, Arial, sans-serif'
                  }}
                >
                  {SPEED_OPTIONS.map(speed => (
                    <option key={speed} value={speed}>{speed}</option>
                  ))}
                </select>
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
                  CRM
                </label>
                <select
                  value={formData.crm}
                  onChange={(e) => setFormData(prev => ({ ...prev, crm: e.target.value as CRM }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    fontFamily: 'Trebuchet MS, Arial, sans-serif'
                  }}
                >
                  {CRM_OPTIONS.map(crm => (
                    <option key={crm} value={crm}>{crm}</option>
                  ))}
                </select>
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
                  Sold By
                </label>
                <input
                  type="text"
                  value={formData.soldBy}
                  onChange={(e) => setFormData(prev => ({ ...prev, soldBy: e.target.value }))}
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
                  Seat Count
                </label>
                <input
                  type="number"
                  value={formData.seatCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, seatCount: parseInt(e.target.value) || 0 }))}
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
                  Hours Allotted
                </label>
                <input
                  type="number"
                  value={formData.hoursAlloted}
                  onChange={(e) => setFormData(prev => ({ ...prev, hoursAlloted: parseInt(e.target.value) || 0 }))}
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
            </div>

            {/* Add-ons */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#253D2C',
                marginBottom: '8px',
                fontFamily: 'Trebuchet MS, Arial, sans-serif'
              }}>
                Add-ons
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '8px'
              }}>
                {ADDON_OPTIONS.map(addon => (
                  <label
                    key={addon}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      fontFamily: 'Trebuchet MS, Arial, sans-serif',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.addOnsPurchased.includes(addon)}
                      onChange={(e) => handleAddonChange(addon, e.target.checked)}
                    />
                    {addon}
                  </label>
                ))}
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
                💾 Save Engagement
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

      {/* Engagements List */}
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
          gridTemplateColumns: '2fr 2fr 1fr 120px 100px 100px 80px 150px',
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
            onClick={() => handleSort('accountName')}
          >
            Company Name {getSortIcon('accountName')}
          </div>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('name')}
          >
            Project Name {getSortIcon('name')}
          </div>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('assignedRep')}
          >
            Assigned Rep {getSortIcon('assignedRep')}
          </div>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('status')}
          >
            Status {getSortIcon('status')}
          </div>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('startDate')}
          >
            Start Date {getSortIcon('startDate')}
          </div>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('closeDate')}
          >
            Close Date {getSortIcon('closeDate')}
          </div>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('health')}
          >
            Health {getSortIcon('health')}
          </div>
          <div>Actions</div>
        </div>

        {/* Engagement Rows */}
        {filteredAndSortedEngagements.map((engagement, index) => (
          <div
            key={engagement.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1fr 120px 100px 100px 80px 150px',
              gap: '12px',
              padding: '16px 20px',
              borderBottom: index < filteredAndSortedEngagements.length - 1 ? '1px solid #e2e8f0' : 'none',
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
            {/* Company Name */}
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#253D2C',
              display: 'flex',
              alignItems: 'center'
            }}>
              {engagement.accountName}
            </div>

            {/* Project Name */}
            <div style={{
              fontSize: '13px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center'
            }}>
              {engagement.name}
            </div>

            {/* Assigned Rep */}
            <div style={{
              fontSize: '13px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center'
            }}>
              {engagement.assignedRep || 'Unassigned'}
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
                background: getStatusColor(engagement.status)
              }}>
                {engagement.status.replace('_', ' ')}
              </span>
            </div>

            {/* Start Date */}
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center'
            }}>
              {engagement.startDate ? new Date(engagement.startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : 'N/A'}
            </div>

            {/* Close Date */}
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center'
            }}>
              {engagement.closeDate ? new Date(engagement.closeDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : 'N/A'}
            </div>

            {/* Health */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '18px'
            }}>
              {getHealthIcon(engagement.health)}
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <button
                onClick={() => handleDelete(engagement)}
                disabled={showAddForm || editingEngagement !== null}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: 'white',
                  background: (showAddForm || editingEngagement) ? '#94a3b8' : '#ef4444',
                  border: 'none',
                  cursor: (showAddForm || editingEngagement) ? 'not-allowed' : 'pointer',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {filteredAndSortedEngagements.length === 0 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#64748b',
            fontFamily: 'Trebuchet MS, Arial, sans-serif'
          }}>
            {statusFilter === 'ALL' 
              ? 'No engagements found. Click "Add New Engagement" to get started.'
              : `No engagements found with status "${statusFilter.replace('_', ' ')}".`
            }
          </div>
        )}
      </div>
    </div>
  )
}