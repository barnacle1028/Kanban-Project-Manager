import React, { useState, useMemo, useEffect, useRef } from 'react'
import type { Engagement, Rep, ProjectStatus, SalesType, Speed, CRM, AddOn } from '../types'
import type { UserWithRole } from '../types/userManagement'
import { createStandardMilestones } from '../utils/standardMilestones'
import { userManagementService } from '../api/userManagement'
import { engagementTypesApi, type EngagementType } from '../api/engagementTypes'
import { useQuery } from '@tanstack/react-query'
import { auditService } from '../services/auditService'
import { CsvService } from '../services/csvService'

type SortOption = {
  column: string
  direction: 'asc' | 'desc' | 'none'
}

interface EngagementAdminContentProps {
  engagements: Engagement[]
  reps: Rep[]
  onAddEngagement: (engagement: Omit<Engagement, 'id' | 'milestones'>) => void
  onUpdateEngagement: (id: string, updates: Partial<Engagement>) => void
  onDeleteEngagement: (id: string) => void
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

export default function EngagementAdminContent({
  engagements,
  reps,
  onAddEngagement,
  onUpdateEngagement,
  onDeleteEngagement
}: EngagementAdminContentProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEngagement, setEditingEngagement] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<SortOption>({ column: '', direction: 'none' })
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL')
  const [activeUsers, setActiveUsers] = useState<UserWithRole[]>([])
  const csvFileInputRef = useRef<HTMLInputElement>(null)

  // Fetch engagement types
  const { data: engagementTypes = [], isLoading: engagementTypesLoading, error: engagementTypesError } = useQuery({
    queryKey: ['engagement-types'],
    queryFn: engagementTypesApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Debug logging for engagement types
  useEffect(() => {
    console.log('📊 Engagement Types Query Status:')
    console.log('   Loading:', engagementTypesLoading)
    console.log('   Error:', engagementTypesError?.message || 'None')
    console.log('   Data:', engagementTypes?.length || 0, 'types loaded')
    
    if (engagementTypes && engagementTypes.length > 0) {
      console.log('   First few types:', engagementTypes.slice(0, 3).map(t => t.name))
    }
  }, [engagementTypesLoading, engagementTypesError, engagementTypes])

  // Initialize engagement types on first load
  useEffect(() => {
    const initializeTypes = async () => {
      try {
        await engagementTypesApi.initializeTypes()
      } catch (error) {
        console.warn('Engagement types already initialized or error:', error)
      }
    }
    initializeTypes()
  }, [])
  const [formData, setFormData] = useState({
    name: '',
    accountName: '',
    assignedRep: '',
    status: 'NEW' as ProjectStatus,
    health: 'GREEN' as 'GREEN' | 'YELLOW' | 'RED',
    startDate: '',
    closeDate: '',
    salesType: 'Direct Sell' as SalesType,
    speed: 'Medium' as Speed,
    crm: 'Salesforce' as CRM,
    engagementType: '',
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

  // Load active users on component mount
  useEffect(() => {
    const loadActiveUsers = async () => {
      try {
        const response = await userManagementService.getAllUsers({ is_active: true })
        setActiveUsers(response.users)
      } catch (error) {
        console.error('Error loading active users:', error)
      }
    }
    loadActiveUsers()
  }, [])

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.accountName) {
      const newEngagement = {
        ...formData
      }
      onAddEngagement(newEngagement)
      
      auditService.logAction(
        'system-user',
        'System User',
        'CREATE',
        'engagement',
        `Created engagement: ${newEngagement.name} for ${newEngagement.accountName}`
      )
      setFormData({
        name: '',
        accountName: '',
        assignedRep: '',
        status: 'NEW',
        health: 'GREEN',
        startDate: '',
        closeDate: '',
        salesType: 'Direct Sell',
        speed: 'Medium',
        crm: 'Salesforce',
        engagementType: '',
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
      health: 'GREEN',
      startDate: '',
      closeDate: '',
      salesType: 'Direct Sell',
      speed: 'Medium',
      crm: 'Salesforce',
      engagementType: '',
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
      
      auditService.logAction(
        'system-user',
        'System User',
        'DELETE',
        'engagement',
        `Deleted engagement: ${engagement.name} for ${engagement.accountName}`,
        engagement.id
      )
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

  const handleDownloadCSV = () => {
    const columnMapping = {
      name: 'Project Name',
      accountName: 'Company Name',
      assignedRep: 'Assigned Rep',
      status: 'Status',
      startDate: 'Start Date',
      closeDate: 'Close Date',
      salesType: 'Sales Type',
      speed: 'Speed',
      crm: 'CRM',
      engagementType: 'Engagement Type',
      soldBy: 'Sold By',
      seatCount: 'Seat Count',
      hoursAlloted: 'Hours Allotted',
      health: 'Health'
    }
    
    CsvService.downloadCSV(filteredAndSortedEngagements, 'engagements', columnMapping)
    
    auditService.logAction(
      'system-user',
      'System User',
      'EXPORT',
      'engagement',
      `Exported ${filteredAndSortedEngagements.length} engagements to CSV`
    )
  }

  const handleUploadCSV = CsvService.createUploadHandler<Partial<Engagement>>(
    (data) => {
      const validEngagements = data.filter(eng => eng.name && eng.accountName)
      
      if (validEngagements.length === 0) {
        alert('No valid engagements found in CSV')
        return
      }

      if (window.confirm(`Import ${validEngagements.length} engagements? This will add new engagements to the system.`)) {
        validEngagements.forEach(engData => {
          const newEngagement = {
            name: engData.name!.trim(),
            accountName: engData.accountName!.trim(),
            assignedRep: engData.assignedRep || '',
            status: (engData.status as ProjectStatus) || 'NEW',
            startDate: engData.startDate || '',
            closeDate: engData.closeDate || '',
            salesType: (engData.salesType as SalesType) || 'Direct Sell',
            speed: (engData.speed as Speed) || 'Medium',
            crm: (engData.crm as CRM) || 'Salesforce',
            engagementType: engData.engagementType || '',
            soldBy: engData.soldBy || '',
            seatCount: engData.seatCount || 0,
            hoursAlloted: engData.hoursAlloted || 0,
            addOnsPurchased: (engData.addOnsPurchased as AddOn[]) || [],
            avazaLink: engData.avazaLink || '',
            projectFolderLink: engData.projectFolderLink || '',
            clientWebsiteLink: engData.clientWebsiteLink || '',
            primaryContactName: engData.primaryContactName || '',
            primaryContactEmail: engData.primaryContactEmail || '',
            linkedinLink: engData.linkedinLink || '',
            health: 'GREEN' as const
          }
          onAddEngagement(newEngagement)
        })

        auditService.logAction(
          'system-user',
          'System User',
          'IMPORT',
          'engagement',
          `Imported ${validEngagements.length} engagements from CSV`
        )
      }
    },
    {
      'Project Name': 'name',
      'Company Name': 'accountName',
      'Assigned Rep': 'assignedRep',
      'Status': 'status',
      'Start Date': 'startDate',
      'Close Date': 'closeDate',
      'Sales Type': 'salesType',
      'Speed': 'speed',
      'CRM': 'crm',
      'Engagement Type': 'engagementType',
      'Sold By': 'soldBy',
      'Seat Count': 'seatCount',
      'Hours Allotted': 'hoursAlloted'
    },
    (data) => {
      const errors: string[] = []
      data.forEach((item, index) => {
        if (!item.name || !item.name.trim()) {
          errors.push(`Row ${index + 1}: Project Name is required`)
        }
        if (!item.accountName || !item.accountName.trim()) {
          errors.push(`Row ${index + 1}: Company Name is required`)
        }
      })
      return { valid: errors.length === 0, errors }
    }
  )

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
            Engagement Administration
          </h2>
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
              onClick={handleDownloadCSV}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'white',
                background: '#3b82f6',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Trebuchet MS, Arial, sans-serif'
              }}
            >
              📥 Download CSV
            </button>
            <input
              ref={csvFileInputRef}
              type="file"
              accept=".csv"
              onChange={handleUploadCSV}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => csvFileInputRef.current?.click()}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'white',
                background: '#f59e0b',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Trebuchet MS, Arial, sans-serif'
              }}
            >
              📤 Upload CSV
            </button>
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
            {/* Basic Information Section */}
            <div style={{
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #68BA7F'
            }}>
              <h4 style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#68BA7F',
                fontFamily: 'Trebuchet MS, Arial, sans-serif'
              }}>
                Basic Information
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
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
                    Engagement Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter engagement name"
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
                    Account Name *
                  </label>
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                    placeholder="Enter account name"
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
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '16px'
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

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#253D2C',
                    marginBottom: '4px',
                    fontFamily: 'Trebuchet MS, Arial, sans-serif'
                  }}>
                    Health
                  </label>
                  <select
                    value={formData.health || 'GREEN'}
                    onChange={(e) => setFormData(prev => ({ ...prev, health: e.target.value as 'GREEN' | 'YELLOW' | 'RED' }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontSize: '14px',
                      fontFamily: 'Trebuchet MS, Arial, sans-serif'
                    }}
                  >
                    <option value="GREEN">Green</option>
                    <option value="YELLOW">Yellow</option>
                    <option value="RED">Red</option>
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
                    <option value="">Select Assigned Rep</option>
                    {activeUsers.map(user => (
                      <option key={user.id} value={`${user.first_name} ${user.last_name}`}>
                        {user.first_name} {user.last_name} ({user.job_title || 'No Title'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div style={{
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #68BA7F'
            }}>
              <h4 style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#68BA7F',
                fontFamily: 'Trebuchet MS, Arial, sans-serif'
              }}>
                Timeline
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: '16px'
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
                    <option value="Direct Sell">Direct Sell</option>
                    <option value="Partner Sell">Partner Sell</option>
                    <option value="Channel Sell">Channel Sell</option>
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
                    <option value="Slow">Slow</option>
                    <option value="Medium">Medium</option>
                    <option value="Fast">Fast</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Project Details Section */}
            <div style={{
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #68BA7F'
            }}>
              <h4 style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#68BA7F',
                fontFamily: 'Trebuchet MS, Arial, sans-serif'
              }}>
                Project Details
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: '16px'
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
                    <option value="Salesforce">Salesforce</option>
                    <option value="HubSpot">HubSpot</option>
                    <option value="Pipedrive">Pipedrive</option>
                    <option value="Other">Other</option>
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
                    placeholder="Enter who sold this"
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
                    placeholder="Number of seats"
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
                    Hours Alloted
                  </label>
                  <input
                    type="number"
                    value={formData.hoursAlloted}
                    onChange={(e) => setFormData(prev => ({ ...prev, hoursAlloted: parseInt(e.target.value) || 0 }))}
                    placeholder="Hours allotted"
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
              </div>
            </div>

            {/* Contact Section */}
            <div style={{
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #68BA7F'
            }}>
              <h4 style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#68BA7F',
                fontFamily: 'Trebuchet MS, Arial, sans-serif'
              }}>
                Contact
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '16px'
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
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.primaryContactName}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryContactName: e.target.value }))}
                    placeholder="Primary contact name"
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
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.primaryContactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryContactEmail: e.target.value }))}
                    placeholder="contact@company.com"
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
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedinLink: e.target.value }))}
                    placeholder="LinkedIn profile URL"
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
            </div>

            {/* Links Section */}
            <div style={{
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #68BA7F'
            }}>
              <h4 style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#68BA7F',
                fontFamily: 'Trebuchet MS, Arial, sans-serif'
              }}>
                Links
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '16px'
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
                    Avaza Project
                  </label>
                  <input
                    type="url"
                    value={formData.avazaLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, avazaLink: e.target.value }))}
                    placeholder="Avaza project URL"
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
                    Project Folder
                  </label>
                  <input
                    type="url"
                    value={formData.projectFolderLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectFolderLink: e.target.value }))}
                    placeholder="Project folder URL"
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
                    Client Website
                  </label>
                  <input
                    type="url"
                    value={formData.clientWebsiteLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientWebsiteLink: e.target.value }))}
                    placeholder="Client website URL"
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
            </div>

            {/* Add-ons Section */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#68BA7F',
                fontFamily: 'Trebuchet MS, Arial, sans-serif'
              }}>
                Add-ons
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
              }}>
                {(['Meet', 'AI Agents', 'Managed Services', 'Deal', 'Content', 'Forecasting', 'Migration'] as AddOn[]).map(addon => (
                  <label key={addon} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#253D2C',
                    fontFamily: 'Trebuchet MS, Arial, sans-serif',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.addOnsPurchased.includes(addon)}
                      onChange={(e) => handleAddOnChange(addon, e.target.checked)}
                      style={{ marginRight: '4px' }}
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
    </>
  )
}