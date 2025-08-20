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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          minWidth: '250px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="muted"
            style={{ fontSize: '12px', minWidth: '120px', fontWeight: '500' }}
          >
            {label}:
          </span>
          {isEditing ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flex: 1,
              }}
            >
              <div
                style={{
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '12px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {options.map((option) => (
                  <label
                    key={option}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: '#1e293b',
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
                      style={{ margin: 0 }}
                    />
                    {option}
                  </label>
                ))}
              </div>
              <button
                onClick={() => saveEdit(field)}
                style={{
                  background: '#2E6F40',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '12px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                }}
              >
                ✓
              </button>
              <button
                onClick={cancelEdit}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '12px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1,
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  color: value && value.length > 0 ? '#64748b' : '#94a3b8',
                  minHeight: '20px',
                  padding: '4px 6px',
                  borderRadius: '12px',
                  flex: 1,
                  border: '1px solid transparent',
                }}
              >
                {value && value.length > 0 ? value.join(', ') : 'None selected'}
              </span>
              <button
                onClick={() => {
                  setEditing(field)
                  setTempValue(JSON.stringify(value || []))
                  setEmailError('')
                }}
                className="btn-secondary"
                style={{
                  fontSize: '11px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                title="Edit add-ons"
              >
                Edit
              </button>
            </div>
          )}
        </div>
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
    options?: string[],
    isDarkBackground = false
  ) => {
    const isEditing = editing === field

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          minWidth: '200px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="muted"
            style={{
              fontSize: '11px',
              minWidth: '100px',
              fontWeight: '500',
              color: isDarkBackground ? 'rgba(255,255,255,0.8)' : '#68BA7F',
            }}
          >
            {label}:
          </span>
          {isEditing ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flex: 1,
              }}
            >
              {type === 'select' ? (
                <select
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onBlur={() => saveEdit(field)}
                  autoFocus
                  style={{
                    background: 'white',
                    color: '#1e293b',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    padding: '4px 6px',
                    fontSize: '12px',
                    flex: 1,
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
                    background: 'white',
                    color: '#1e293b',
                    border: emailError
                      ? '1px solid #ef4444'
                      : '1px solid #334155',
                    borderRadius: '4px',
                    padding: '4px 6px',
                    fontSize: '12px',
                    flex: 1,
                  }}
                />
              )}
              <button
                onClick={() => saveEdit(field)}
                style={{
                  background: '#2E6F40',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '12px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                }}
              >
                ✓
              </button>
              <button
                onClick={cancelEdit}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '12px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1,
              }}
            >
              {type === 'url' ? (
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {value ? (
                    <>
                      <button
                        onClick={() =>
                          window.open(value, '_blank', 'noopener,noreferrer')
                        }
                        className="btn-primary"
                        style={{
                          fontSize: '12px',
                          padding: '8px 16px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                        title={`Open ${value}`}
                      >
                        Click Here
                      </button>
                      <button
                        onClick={() => startEdit(field, value)}
                        className="btn-secondary"
                        style={{
                          fontSize: '11px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                        title="Edit link"
                      >
                        Edit
                      </button>
                    </>
                  ) : (
                    <span
                      onClick={() => startEdit(field, value)}
                      style={{
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#94a3b8',
                        textDecoration: 'underline',
                        minHeight: '20px',
                        padding: '4px 6px',
                        borderRadius: '3px',
                      }}
                      title="Click to add link"
                    >
                      Click to add
                    </span>
                  )}
                </div>
              ) : (
                <span
                  onClick={() => startEdit(field, value)}
                  style={{
                    cursor: 'pointer',
                    fontSize: '12px',
                    color:
                      value !== undefined && value !== null && value !== ''
                        ? '#e2e8f0'
                        : '#94a3b8',
                    textDecoration:
                      value !== undefined && value !== null && value !== ''
                        ? 'none'
                        : 'underline',
                    minHeight: '20px',
                    padding: '4px 6px',
                    borderRadius: '12px',
                    flex: 1,
                    border: '1px solid transparent',
                  }}
                  title="Click to edit"
                >
                  {value || 'Click to add'}
                </span>
              )}
            </div>
          )}
        </div>
        {emailError && (
          <span
            style={{ fontSize: '10px', color: '#ef4444', marginLeft: '120px' }}
          >
            {emailError}
          </span>
        )}
      </div>
    )
  }

  const renderFieldDark = (
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
    return renderField(field, label, value, type, options, true)
  }

  const renderGroup = (
    title: string,
    children: React.ReactNode,
    isDarkBackground = false
  ) => (
    <div
      style={{
        background: isDarkBackground ? '#2E6F40' : 'white',
        border: `1px solid ${isDarkBackground ? '#2E6F40' : '#68BA7F'}`,
        borderRadius: '6px',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <h4
        style={{
          margin: 0,
          fontSize: '11px',
          fontWeight: '600',
          color: isDarkBackground ? 'white' : '#253D2C',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderBottom: `1px solid ${isDarkBackground ? 'rgba(255,255,255,0.2)' : '#68BA7F'}`,
          paddingBottom: '3px',
        }}
      >
        {title}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {children}
      </div>
    </div>
  )

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '8px',
        margin: '8px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '8px',
        }}
      >
        {renderGroup(
          'Project Timeline',
          <>
            {renderFieldDark(
              'startDate',
              'Start Date',
              engagement.startDate,
              'date'
            )}
            {renderFieldDark(
              'closeDate',
              'Close Date',
              engagement.closeDate,
              'date'
            )}
            {renderFieldDark(
              'salesType',
              'Sales Type',
              engagement.salesType,
              'select',
              salesTypeOptions
            )}
            {renderFieldDark(
              'speed',
              'Speed',
              engagement.speed,
              'select',
              speedOptions
            )}
          </>,
          true
        )}

        {renderGroup(
          'Project Details',
          <>
            {renderFieldDark(
              'crm',
              'CRM',
              engagement.crm,
              'select',
              crmOptions
            )}
            {renderFieldDark('soldBy', 'Sold By', engagement.soldBy, 'text')}
            {renderFieldDark(
              'seatCount',
              'Seat Count',
              engagement.seatCount,
              'number'
            )}
            {renderFieldDark(
              'hoursAlloted',
              'Hours Alloted',
              engagement.hoursAlloted,
              'number'
            )}
          </>,
          true
        )}

        {renderGroup(
          'Primary Contact',
          <>
            {renderFieldDark(
              'primaryContactName',
              'Contact Name',
              engagement.primaryContactName,
              'text'
            )}
            {renderFieldDark(
              'primaryContactEmail',
              'Contact Email',
              engagement.primaryContactEmail,
              'email'
            )}
            {renderFieldDark(
              'linkedinLink',
              'LinkedIn Link',
              engagement.linkedinLink,
              'url'
            )}
          </>,
          true
        )}
      </div>

      <div style={{ width: '100%' }}>
        <div
          style={{
            background: 'white',
            border: '1px solid #68BA7F',
            borderRadius: '6px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: '11px',
              fontWeight: '600',
              color: '#253D2C',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '1px solid #68BA7F',
              paddingBottom: '3px',
            }}
          >
            Links
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '6px',
            }}
          >
            {renderField(
              'avazaLink',
              'Avaza Link',
              engagement.avazaLink,
              'url'
            )}
            {renderField(
              'projectFolderLink',
              'Project Folder',
              engagement.projectFolderLink,
              'url'
            )}
            {renderField(
              'clientWebsiteLink',
              'Client Website',
              engagement.clientWebsiteLink,
              'url'
            )}
          </div>
        </div>
      </div>

      <div style={{ width: '100%' }}>
        <div
          style={{
            background: 'white',
            border: '1px solid #68BA7F',
            borderRadius: '6px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: '11px',
              fontWeight: '600',
              color: '#253D2C',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '1px solid #68BA7F',
              paddingBottom: '3px',
            }}
          >
            Add-On's Purchased
          </h4>
          <div>
            {renderMultiSelect(
              'addOnsPurchased',
              'Selected Add-Ons',
              engagement.addOnsPurchased,
              addOnOptions
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export default EngagementDetails
