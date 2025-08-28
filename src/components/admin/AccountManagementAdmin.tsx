import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accountsApi, type CreateAccountData, type UpdateAccountData } from '../../api/accounts'
import type { Account } from '../../api/types'

type SortOption = {
  column: string
  direction: 'asc' | 'desc' | 'none'
}

const ACCOUNT_TYPE_OPTIONS = [
  'Prospect',
  'Active Client', 
  'Former Client',
  'Partner'
]

const SEGMENT_OPTIONS = [
  'SMB',
  'Mid-Market',
  'Enterprise'
]

const REGION_OPTIONS = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East & Africa'
]

function getAccountTypeColor(accountType: string | undefined) {
  switch (accountType) {
    case 'Prospect':
      return '#3b82f6'
    case 'Active Client':
      return '#10b981'
    case 'Former Client':
      return '#6b7280'
    case 'Partner':
      return '#8b5cf6'
    default:
      return '#6b7280'
  }
}

export default function AccountManagementAdmin() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [sortConfig, setSortConfig] = useState<SortOption>({ column: '', direction: 'none' })
  const [segmentFilter, setSegmentFilter] = useState<string>('ALL')
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    name: '',
    segment: '',
    region: '',
    account_type: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_zip: '',
    primary_contact_name: '',
    primary_contact_title: '',
    primary_contact_email: '',
    account_note: '',
    industry: ''
  })

  // Fetch all accounts
  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAll,
  })

  // Create account mutation
  const createMutation = useMutation({
    mutationFn: accountsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })

  // Update account mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountData }) => 
      accountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })

  // Delete account mutation
  const deleteMutation = useMutation({
    mutationFn: accountsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name) {
      createMutation.mutate(formData as CreateAccountData)
      handleCancel()
    }
  }

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingAccount && formData.name) {
      updateMutation.mutate({ 
        id: editingAccount.id, 
        data: formData as UpdateAccountData 
      })
      handleCancel()
    }
  }

  const handleCancel = () => {
    setEditingAccount(null)
    setShowAddForm(false)
    setFormData({
      name: '',
      segment: '',
      region: '',
      account_type: '',
      address_street: '',
      address_city: '',
      address_state: '',
      address_zip: '',
      primary_contact_name: '',
      primary_contact_title: '',
      primary_contact_email: '',
      account_note: '',
      industry: ''
    })
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      name: account.name || '',
      segment: account.segment || '',
      region: account.region || '',
      account_type: account.account_type || '',
      address_street: account.address_street || '',
      address_city: account.address_city || '',
      address_state: account.address_state || '',
      address_zip: account.address_zip || '',
      primary_contact_name: account.primary_contact_name || '',
      primary_contact_title: account.primary_contact_title || '',
      primary_contact_email: account.primary_contact_email || '',
      account_note: account.account_note || '',
      industry: account.industry || ''
    })
    setShowAddForm(false)
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

  const handleDelete = (account: Account) => {
    if (window.confirm(`Are you sure you want to delete "${account.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(account.id)
    }
  }

  // Filter and sort accounts
  const filteredAndSortedAccounts = useMemo(() => {
    let filtered = accounts
    
    // Apply segment filter
    if (segmentFilter !== 'ALL') {
      filtered = filtered.filter(acc => acc.segment === segmentFilter)
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
        case 'segment':
          aValue = (a.segment || '').toLowerCase()
          bValue = (b.segment || '').toLowerCase()
          break
        case 'region':
          aValue = (a.region || '').toLowerCase()
          bValue = (b.region || '').toLowerCase()
          break
        case 'account_type':
          aValue = (a.account_type || '').toLowerCase()
          bValue = (b.account_type || '').toLowerCase()
          break
        case 'industry':
          aValue = (a.industry || '').toLowerCase()
          bValue = (b.industry || '').toLowerCase()
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
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
  }, [accounts, segmentFilter, sortConfig])

  if (isLoading) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{
          fontSize: '18px',
          color: '#253D2C',
          fontFamily: 'Trebuchet MS, Arial, sans-serif'
        }}>
          Loading accounts...
        </div>
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
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{
          fontSize: '18px',
          color: '#dc3545',
          marginBottom: '10px',
          fontFamily: 'Trebuchet MS, Arial, sans-serif'
        }}>
          Error loading accounts
        </div>
        <div style={{
          fontSize: '14px',
          color: '#6b7280',
          fontFamily: 'Trebuchet MS, Arial, sans-serif'
        }}>
          {error instanceof Error ? error.message : 'Unknown error'}
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
            Account Administration
          </h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                fontFamily: 'Trebuchet MS, Arial, sans-serif'
              }}
            >
              <option value="ALL">All Segments</option>
              {SEGMENT_OPTIONS.map(segment => (
                <option key={segment} value={segment}>{segment}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAddForm(true)}
              disabled={showAddForm || editingAccount !== null}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'white',
                background: showAddForm || editingAccount ? '#94a3b8' : '#10b981',
                border: 'none',
                cursor: showAddForm || editingAccount ? 'not-allowed' : 'pointer',
                fontFamily: 'Trebuchet MS, Arial, sans-serif'
              }}
            >
              + Add New Account
            </button>
          </div>
        </div>
        <p style={{
          margin: '0',
          fontSize: '14px',
          color: '#68BA7F',
          fontFamily: 'Trebuchet MS, Arial, sans-serif'
        }}>
          Manage all client accounts and business relationships • Showing {filteredAndSortedAccounts.length} of {accounts.length} accounts
        </p>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingAccount) && (
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
            {editingAccount ? 'Edit Account' : 'Add New Account'}
          </h3>
          <form onSubmit={editingAccount ? handleSubmitEdit : handleSubmitAdd}>
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
                  Account Name *
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
                  Account Type
                </label>
                <select
                  value={formData.account_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, account_type: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    fontFamily: 'Trebuchet MS, Arial, sans-serif'
                  }}
                >
                  <option value="">Select Type</option>
                  {ACCOUNT_TYPE_OPTIONS.map(type => (
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
                  Segment
                </label>
                <select
                  value={formData.segment}
                  onChange={(e) => setFormData(prev => ({ ...prev, segment: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    fontFamily: 'Trebuchet MS, Arial, sans-serif'
                  }}
                >
                  <option value="">Select Segment</option>
                  {SEGMENT_OPTIONS.map(segment => (
                    <option key={segment} value={segment}>{segment}</option>
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
                  Region
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    fontFamily: 'Trebuchet MS, Arial, sans-serif'
                  }}
                >
                  <option value="">Select Region</option>
                  {REGION_OPTIONS.map(region => (
                    <option key={region} value={region}>{region}</option>
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
                  Industry
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
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

            {/* Address Section */}
            <h4 style={{
              margin: '16px 0 8px 0',
              fontSize: '14px',
              fontWeight: '600',
              color: '#253D2C',
              fontFamily: 'Trebuchet MS, Arial, sans-serif'
            }}>
              Address Information
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#253D2C',
                  marginBottom: '4px',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif'
                }}>
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address_street}
                  onChange={(e) => setFormData(prev => ({ ...prev, address_street: e.target.value }))}
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
                  City
                </label>
                <input
                  type="text"
                  value={formData.address_city}
                  onChange={(e) => setFormData(prev => ({ ...prev, address_city: e.target.value }))}
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
                  State
                </label>
                <input
                  type="text"
                  value={formData.address_state}
                  onChange={(e) => setFormData(prev => ({ ...prev, address_state: e.target.value }))}
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
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.address_zip}
                  onChange={(e) => setFormData(prev => ({ ...prev, address_zip: e.target.value }))}
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

            {/* Contact Section */}
            <h4 style={{
              margin: '16px 0 8px 0',
              fontSize: '14px',
              fontWeight: '600',
              color: '#253D2C',
              fontFamily: 'Trebuchet MS, Arial, sans-serif'
            }}>
              Primary Contact
            </h4>
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
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.primary_contact_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_contact_name: e.target.value }))}
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
                  Contact Title
                </label>
                <input
                  type="text"
                  value={formData.primary_contact_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_contact_title: e.target.value }))}
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
                  value={formData.primary_contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_contact_email: e.target.value }))}
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

            {/* Account Note */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#253D2C',
                marginBottom: '4px',
                fontFamily: 'Trebuchet MS, Arial, sans-serif'
              }}>
                Account Notes
              </label>
              <textarea
                value={formData.account_note}
                onChange={(e) => setFormData(prev => ({ ...prev, account_note: e.target.value }))}
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
                💾 {editingAccount ? 'Update Account' : 'Save Account'}
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

      {/* Accounts List */}
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
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 150px',
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
            Account Name {getSortIcon('name')}
          </div>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('account_type')}
          >
            Type {getSortIcon('account_type')}
          </div>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('segment')}
          >
            Segment {getSortIcon('segment')}
          </div>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('region')}
          >
            Region {getSortIcon('region')}
          </div>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('industry')}
          >
            Industry {getSortIcon('industry')}
          </div>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('created_at')}
          >
            Created {getSortIcon('created_at')}
          </div>
          <div>Actions</div>
        </div>

        {/* Account Rows */}
        {filteredAndSortedAccounts.map((account, index) => (
          <div
            key={account.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 150px',
              gap: '12px',
              padding: '16px 20px',
              borderBottom: index < filteredAndSortedAccounts.length - 1 ? '1px solid #e2e8f0' : 'none',
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
            {/* Account Name */}
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#253D2C',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <div>{account.name}</div>
              {account.primary_contact_name && (
                <div style={{
                  fontSize: '11px',
                  color: '#64748b',
                  fontWeight: 'normal'
                }}>
                  {account.primary_contact_name}
                  {account.primary_contact_title && ` • ${account.primary_contact_title}`}
                </div>
              )}
            </div>

            {/* Account Type */}
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
                background: getAccountTypeColor(account.account_type)
              }}>
                {account.account_type || 'N/A'}
              </span>
            </div>

            {/* Segment */}
            <div style={{
              fontSize: '13px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center'
            }}>
              {account.segment || 'N/A'}
            </div>

            {/* Region */}
            <div style={{
              fontSize: '13px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center'
            }}>
              {account.region || 'N/A'}
            </div>

            {/* Industry */}
            <div style={{
              fontSize: '13px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center'
            }}>
              {account.industry || 'N/A'}
            </div>

            {/* Created Date */}
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center'
            }}>
              {new Date(account.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <button
                onClick={() => handleEdit(account)}
                disabled={showAddForm || editingAccount !== null}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: 'white',
                  background: (showAddForm || editingAccount) ? '#94a3b8' : '#3b82f6',
                  border: 'none',
                  cursor: (showAddForm || editingAccount) ? 'not-allowed' : 'pointer',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif',
                  marginRight: '4px'
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(account)}
                disabled={showAddForm || editingAccount !== null}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: 'white',
                  background: (showAddForm || editingAccount) ? '#94a3b8' : '#ef4444',
                  border: 'none',
                  cursor: (showAddForm || editingAccount) ? 'not-allowed' : 'pointer',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {filteredAndSortedAccounts.length === 0 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#64748b',
            fontFamily: 'Trebuchet MS, Arial, sans-serif'
          }}>
            {segmentFilter === 'ALL' 
              ? 'No accounts found. Click "Add New Account" to get started.'
              : `No accounts found with segment "${segmentFilter}".`
            }
          </div>
        )}
      </div>
    </>
  )
}