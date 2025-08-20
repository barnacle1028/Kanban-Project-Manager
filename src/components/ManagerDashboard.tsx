import React, { useMemo, useState } from 'react'
import type { Engagement, Rep } from '../types'

interface ManagerDashboardProps {
  engagements: Engagement[]
  reps: Rep[]
  onSelectRep: (repName: string) => void
  repAvazaLinks: Record<string, string>
  onUpdateRepAvazaLink: (repName: string, link: string) => void
  onGoToRepAdmin: () => void
  onGoToEngagementAdmin: () => void
}

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

// Helper function to get the last milestone completion date for an engagement
function getEngagementCompletionDate(engagement: Engagement): Date | null {
  let latestCompletionDate: Date | null = null
  
  for (const milestone of engagement.milestones) {
    if (milestone.stage === 'COMPLETED' && milestone.stageHistory) {
      const completedEntry = milestone.stageHistory
        .filter(entry => entry.stage === 'COMPLETED')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      
      if (completedEntry) {
        const completionDate = new Date(completedEntry.date)
        if (!latestCompletionDate || completionDate > latestCompletionDate) {
          latestCompletionDate = completionDate
        }
      }
    }
  }
  
  return latestCompletionDate
}

// Helper function to check if an engagement is considered "completed"
function isEngagementCompleted(engagement: Engagement): boolean {
  // An engagement is completed if all its milestones are completed
  return engagement.milestones.length > 0 && 
         engagement.milestones.every(milestone => 
           milestone.stage === 'COMPLETED' || milestone.notPurchased
         )
}

type SortOption = {
  column: string
  direction: 'asc' | 'desc' | 'none'
}

export default function ManagerDashboard({
  engagements,
  reps,
  onSelectRep,
  repAvazaLinks,
  onUpdateRepAvazaLink,
  onGoToRepAdmin,
  onGoToEngagementAdmin
}: ManagerDashboardProps) {
  const [editingRep, setEditingRep] = useState<string | null>(null)
  const [editingLink, setEditingLink] = useState('')
  const [sortConfig, setSortConfig] = useState<SortOption>({ column: '', direction: 'none' })
  const [showInactive, setShowInactive] = useState(true)

  // Calculate rep statistics (filter by active status if needed)
  const repStats = useMemo(() => {
    const filteredReps = showInactive ? reps : reps.filter(rep => rep.isActive)
    
    const stats = filteredReps.map(rep => {
      const repEngagements = engagements.filter(eng => eng.assignedRep === rep.name)
      const totalEngagements = repEngagements.length
      const activeEngagements = repEngagements.filter(eng => eng.status === 'ACTIVE').length
      const healthStats = {
        green: repEngagements.filter(eng => eng.health === 'GREEN').length,
        yellow: repEngagements.filter(eng => eng.health === 'YELLOW').length,
        red: repEngagements.filter(eng => eng.health === 'RED').length
      }

      return {
        name: rep.name,
        displayName: rep.isActive ? rep.name : `${rep.name} (Inactive)`,
        isActive: rep.isActive,
        totalEngagements,
        activeEngagements,
        healthStats,
        avazaLink: repAvazaLinks[rep.name] || ''
      }
    })

    // Apply sorting if configured
    if (sortConfig.direction === 'none') {
      return stats
    }

    return [...stats].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortConfig.column) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'total':
          aValue = a.totalEngagements
          bValue = b.totalEngagements
          break
        case 'active':
          aValue = a.activeEngagements
          bValue = b.activeEngagements
          break
        case 'status':
          aValue = a.isActive ? 1 : 0
          bValue = b.isActive ? 1 : 0
          break
        case 'health':
          // Sort by green count (most green first)
          aValue = a.healthStats.green
          bValue = b.healthStats.green
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
  }, [engagements, reps, repAvazaLinks, sortConfig, showInactive])

  // Calculate completion statistics
  const completionStats = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const completedEngagements = engagements.filter(isEngagementCompleted)
    
    const completedThisYear = completedEngagements.filter(engagement => {
      const completionDate = getEngagementCompletionDate(engagement)
      return completionDate && completionDate.getFullYear() === currentYear
    }).length
    
    const completedAllTime = completedEngagements.length
    
    return {
      thisYear: completedThisYear,
      allTime: completedAllTime
    }
  }, [engagements])

  const handleEditLink = (repName: string) => {
    setEditingRep(repName)
    setEditingLink(repAvazaLinks[repName] || '')
  }

  const handleSaveLink = () => {
    if (editingRep) {
      onUpdateRepAvazaLink(editingRep, editingLink)
      setEditingRep(null)
      setEditingLink('')
    }
  }

  const handleCancelEdit = () => {
    setEditingRep(null)
    setEditingLink('')
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
            Manager Dashboard
          </h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowInactive(!showInactive)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'white',
                background: showInactive ? '#ef4444' : '#10b981',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Trebuchet MS, Arial, sans-serif',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (showInactive) {
                  e.currentTarget.style.background = '#dc2626'
                } else {
                  e.currentTarget.style.background = '#059669'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = showInactive ? '#ef4444' : '#10b981'
              }}
            >
              {showInactive ? '👁️ Hide Inactive' : '👁️‍🗨️ Show Inactive'}
            </button>
            <button
              onClick={onGoToEngagementAdmin}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'white',
                background: '#f59e0b',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Trebuchet MS, Arial, sans-serif',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#d97706'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f59e0b'
              }}
            >
              📋 Manage Engagements
            </button>
            <button
              onClick={onGoToRepAdmin}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'white',
                background: '#8b5cf6',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Trebuchet MS, Arial, sans-serif',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#7c3aed'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#8b5cf6'
              }}
            >
              ⚙️ Manage Reps
            </button>
          </div>
        </div>
        <p style={{
          margin: '0',
          fontSize: '14px',
          color: '#68BA7F',
          fontFamily: 'Trebuchet MS, Arial, sans-serif'
        }}>
          Overview of all reps and their engagement portfolio
        </p>
      </div>

      {/* Rep Overview Table */}
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
          gridTemplateColumns: '2fr 120px 120px 150px 120px 150px',
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
            Rep Name {getSortIcon('name')}
          </div>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('total')}
          >
            Total {getSortIcon('total')}
          </div>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('active')}
          >
            Active {getSortIcon('active')}
          </div>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('health')}
          >
            Health Status {getSortIcon('health')}
          </div>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('status')}
          >
            Status {getSortIcon('status')}
          </div>
          <div>Actions</div>
        </div>

        {/* Rep Rows */}
        {repStats.map((rep, index) => (
          <div
            key={rep.name}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 120px 120px 150px 120px 150px',
              gap: '12px',
              padding: '16px 20px',
              borderBottom: index < repStats.length - 1 ? '1px solid #e2e8f0' : 'none',
              transition: 'background-color 0.2s ease',
              fontFamily: 'Trebuchet MS, Arial, sans-serif',
              opacity: rep.isActive ? 1 : 0.7
            }}
          >
            {/* Rep Name - Clickable */}
            <div 
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: rep.isActive ? '#2E6F40' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                cursor: rep.isActive ? 'pointer' : 'default',
                textDecoration: rep.isActive ? 'underline' : 'none',
                transition: 'color 0.2s ease'
              }}
              onClick={() => rep.isActive && onSelectRep(rep.name)}
              onMouseEnter={(e) => {
                if (rep.isActive) {
                  e.currentTarget.style.color = '#1f4a2b'
                }
              }}
              onMouseLeave={(e) => {
                if (rep.isActive) {
                  e.currentTarget.style.color = '#2E6F40'
                }
              }}
            >
              {rep.displayName}
            </div>

            {/* Total Engagements */}
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#253D2C',
              display: 'flex',
              alignItems: 'center'
            }}>
              {rep.totalEngagements}
            </div>

            {/* Active Engagements */}
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#253D2C',
              display: 'flex',
              alignItems: 'center'
            }}>
              {rep.activeEngagements}
            </div>

            {/* Health Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px'
            }}>
              <span>{getHealthIcon('GREEN')} {rep.healthStats.green}</span>
              <span>{getHealthIcon('YELLOW')} {rep.healthStats.yellow}</span>
              <span>{getHealthIcon('RED')} {rep.healthStats.red}</span>
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
                background: rep.isActive ? '#10b981' : '#ef4444'
              }}>
                {rep.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {editingRep === rep.name ? (
                <>
                  <input
                    type="text"
                    value={editingLink}
                    onChange={(e) => setEditingLink(e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                      fontSize: '10px',
                      fontFamily: 'Trebuchet MS, Arial, sans-serif',
                      width: '80px'
                    }}
                    placeholder="Avaza link"
                  />
                  <button
                    onClick={handleSaveLink}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: 'white',
                      background: '#10b981',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'Trebuchet MS, Arial, sans-serif'
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
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
                </>
              ) : (
                <button
                  onClick={() => handleEditLink(rep.name)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '600',
                    color: 'white',
                    background: '#2E6F40',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Trebuchet MS, Arial, sans-serif'
                  }}
                >
                  Edit Link
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '16px',
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#253D2C',
          fontFamily: 'Trebuchet MS, Arial, sans-serif'
        }}>
          Summary
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          fontFamily: 'Trebuchet MS, Arial, sans-serif'
        }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#2E6F40' }}>
              {repStats.reduce((sum, rep) => sum + rep.totalEngagements, 0)}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Total Engagements</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#2E6F40' }}>
              {repStats.reduce((sum, rep) => sum + rep.activeEngagements, 0)}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Active Engagements</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#8b5cf6' }}>
              {completionStats.thisYear}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Completed This Year</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#8b5cf6' }}>
              {completionStats.allTime}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Completed All Time</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#10b981' }}>
              {repStats.reduce((sum, rep) => sum + rep.healthStats.green, 0)}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Green Health</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#f59e0b' }}>
              {repStats.reduce((sum, rep) => sum + rep.healthStats.yellow, 0)}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Yellow Health</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#ef4444' }}>
              {repStats.reduce((sum, rep) => sum + rep.healthStats.red, 0)}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Red Health</div>
          </div>
        </div>
      </div>
    </div>
  )
}