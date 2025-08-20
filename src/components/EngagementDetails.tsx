import React, { useState } from 'react'
import type { Engagement, Speed, CRM, SalesType, AddOn } from '../types'

interface EngagementDetailsProps {
  engagement: Engagement
  onEngagementChange: (updates: Partial<Engagement>) => void
}

const EngagementDetails = React.memo(function EngagementDetails({
  engagement,
  onEngagementChange,
}: EngagementDetailsProps) {
  const [editing, setEditing] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState('')
  const [emailError, setEmailError] = useState('')

  const speedOptions: Speed[] = ['Slow', 'Medium', 'Fast']
  const crmOptions: CRM[] = [
    'Salesforce',
    'Dynamics',
    'Hubspot',
    'Other',
    'None',
  ]
  const salesTypeOptions: SalesType[] = [
    'Channel',
    'Direct Sell',
    'Greaser Sale',
  ]
  const addOnOptions: AddOn[] = [
    'Meet',
    'Deal',
    'Forecasting',
    'AI Agents',
    'Content',
    'Migration',
    'Managed Services',
  ]

  const startEdit = (
    field: string,
    currentValue: string | number | boolean | undefined
  ) => {
    setEditing(field)
    setTempValue(String(currentValue || ''))
    setEmailError('')
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const saveEdit = (field: string) => {
    if (
      field === 'primaryContactEmail' &&
      tempValue &&
      !validateEmail(tempValue)
    ) {
      setEmailError('Please enter a valid email address')
      return
    }

    let value: any = tempValue || undefined

    // Convert to appropriate types
    if (field === 'seatCount' || field === 'hoursAlloted') {
      value = tempValue ? parseInt(tempValue) : undefined
    } else if (field === 'addOnsPurchased') {
      // Handle multi-select array
      try {
        value = tempValue ? JSON.parse(tempValue) : []
      } catch {
        value = []
      }
    }

    onEngagementChange({ [field]: value })
    setEditing(null)
    setTempValue('')
    setEmailError('')
  }

  const cancelEdit = () => {
    setEditing(null)
    setTempValue('')
    setEmailError('')
  }

  const handleKeyPress = (e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter') {
      saveEdit(field)
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  const renderMultiSelect = (
    field: string,
    label: string,
    value: AddOn[] = [],
    options: AddOn[]
  ) => {
    const isEditing = editing === field
    let currentValues = value

    if (isEditing) {
      try {
        currentValues = tempValue ? JSON.parse(tempValue) : []
      } catch {
        currentValues = []
      }
    }

    return (
      <div style={{ marginBottom: '12px' }}>
        <label style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: '600',
          color: '#253D2C',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {label}
        </label>
        {isEditing ? (
          <div style={{
            background: '#CFFFDC',
            border: '1px solid #68BA7F',
            borderRadius: '6px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}>
            {options.map((option) => (
              <label
                key={option}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: '#253D2C',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={currentValues.includes(option)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v) => v !== option)
                    setTempValue(JSON.stringify(newValue))
                  }}
                  style={{ margin: 0, accentColor: '#2E6F40' }}
                />
                {option}
              </label>
            ))}
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <button
                onClick={() => saveEdit(field)}
                style={{
                  background: '#2E6F40',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '11px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
              <button
                onClick={cancelEdit}
                style={{
                  background: '#68BA7F',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '11px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => {
              setEditing(field)
              setTempValue(JSON.stringify(value || []))
              setEmailError('')
            }}
            style={{
              background: '#CFFFDC',
              border: '1px solid #68BA7F',
              borderRadius: '6px',
              padding: '8px',
              fontSize: '12px',
              color: '#253D2C',
              cursor: 'pointer',
              minHeight: '16px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#68BA7F'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#CFFFDC'
              e.currentTarget.style.color = '#253D2C'
            }}
          >
            {value && value.length > 0 ? value.join(', ') : 'Click to add'}
          </div>
        )}
      </div>
    )
  }

  const renderField = (
    field: string,
    label: string,
    value: any,
    type:
      | 'text'
      | 'date'
      | 'email'
      | 'number'
      | 'url'
      | 'select'
      | 'toggle' = 'text',
    options?: string[]
  ) => {
    const isEditing = editing === field

    return (
      <div style={{ marginBottom: '12px' }}>
        <label style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: '600',
          color: '#253D2C',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {label}
        </label>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {type === 'select' ? (
              <select
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={() => saveEdit(field)}
                autoFocus
                style={{
                  background: '#CFFFDC',
                  color: '#253D2C',
                  border: '1px solid #68BA7F',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  fontSize: '12px',
                  flex: 1,
                  outline: 'none'
                }}
              >
                <option value="">Select...</option>
                {options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={type}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, field)}
                onBlur={() => saveEdit(field)}
                autoFocus
                style={{
                  background: '#CFFFDC',
                  color: '#253D2C',
                  border: emailError ? '1px solid #ef4444' : '1px solid #68BA7F',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  fontSize: '12px',
                  flex: 1,
                  outline: 'none'
                }}
              />
            )}
            <button
              onClick={() => saveEdit(field)}
              style={{
                background: '#2E6F40',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                fontSize: '11px',
                padding: '4px 8px',
                cursor: 'pointer',
              }}
            >
              Save
            </button>
            <button
              onClick={cancelEdit}
              style={{
                background: '#68BA7F',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                fontSize: '11px',
                padding: '4px 8px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            {type === 'url' && value ? (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => window.open(value, '_blank', 'noopener,noreferrer')}
                  style={{
                    background: '#2E6F40',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '11px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  Open Link
                </button>
                <button
                  onClick={() => startEdit(field, value)}
                  style={{
                    background: '#68BA7F',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '11px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
              </div>
            ) : (
              <div
                onClick={() => startEdit(field, value)}
                style={{
                  background: '#CFFFDC',
                  border: '1px solid #68BA7F',
                  borderRadius: '6px',
                  padding: '8px',
                  fontSize: '12px',
                  color: value ? '#253D2C' : '#68BA7F',
                  cursor: 'pointer',
                  minHeight: '16px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#68BA7F'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#CFFFDC'
                  e.currentTarget.style.color = value ? '#253D2C' : '#68BA7F'
                }}
              >
                {value || 'Click to add'}
              </div>
            )}
          </>
        )}
        {emailError && (
          <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '2px' }}>
            {emailError}
          </div>
        )}
      </div>
    )
  }


  const renderGroup = (title: string, children: React.ReactNode) => (
    <div style={{
      background: 'white',
      border: '1px solid #68BA7F',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '13px',
        fontWeight: '700',
        color: '#2E6F40',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        borderBottom: '2px solid #68BA7F',
        paddingBottom: '8px'
      }}>
        {title}
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px'
      }}>
        {children}
      </div>
    </div>
  )

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '16px',
      margin: '16px 0'
    }}>
      {renderGroup(
        'Timeline',
        <>
          {renderField('startDate', 'Start Date', engagement.startDate, 'date')}
          {renderField('closeDate', 'Close Date', engagement.closeDate, 'date')}
          {renderField('salesType', 'Sales Type', engagement.salesType, 'select', salesTypeOptions)}
          {renderField('speed', 'Speed', engagement.speed, 'select', speedOptions)}
        </>
      )}

      {renderGroup(
        'Project Details',
        <>
          {renderField('crm', 'CRM', engagement.crm, 'select', crmOptions)}
          {renderField('soldBy', 'Sold By', engagement.soldBy, 'text')}
          {renderField('seatCount', 'Seat Count', engagement.seatCount, 'number')}
          {renderField('hoursAlloted', 'Hours Alloted', engagement.hoursAlloted, 'number')}
        </>
      )}

      {renderGroup(
        'Contact',
        <>
          {renderField('primaryContactName', 'Contact Name', engagement.primaryContactName, 'text')}
          {renderField('primaryContactEmail', 'Contact Email', engagement.primaryContactEmail, 'email')}
          {renderField('linkedinLink', 'LinkedIn', engagement.linkedinLink, 'url')}
        </>
      )}

      {renderGroup(
        'Links',
        <>
          {renderField('avazaLink', 'Avaza Project', engagement.avazaLink, 'url')}
          {renderField('projectFolderLink', 'Project Folder', engagement.projectFolderLink, 'url')}
          {renderField('clientWebsiteLink', 'Client Website', engagement.clientWebsiteLink, 'url')}
        </>
      )}

      {renderGroup(
        'Add-ons',
        <>
          {renderMultiSelect('addOnsPurchased', 'Purchased Add-ons', engagement.addOnsPurchased, addOnOptions)}
        </>
      )}
    </div>
  )
})

export default EngagementDetails
