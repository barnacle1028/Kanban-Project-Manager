import React, { useMemo, useState } from 'react'
import type { Engagement } from '../types'

interface RepDashboardProps {
  engagements: Engagement[]
  repName: string
  onSelectEngagement: (engagementId: string) => void
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

function getStatusColor(status: string) {
  switch (status) {
    case 'ACTIVE':
      return '#2E6F40'
    case 'STALLED':
      return '#f59e0b'
    case 'ON_HOLD':
      return '#ef4444'
    case 'CLAWED_BACK':
      return '#dc2626'
    default:
      return '#6b7280'
  }
}

function getMostRecentCompletedMilestone(engagement: Engagement): string {
  const completedMilestones = engagement.milestones
    .filter(m => m.stage === 'COMPLETED')
    .map(m => ({
      name: m.name,
      date: m.stageHistory?.find(h => h.stage === 'COMPLETED')?.date || ''
    }))
    .filter(m => m.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return completedMilestones.length > 0 ? completedMilestones[0].name : 'None'
}

type SortOption = {
  column: string
  direction: 'asc' | 'desc' | 'none'
}

export default function RepDashboard({
  engagements,
  repName,
  onSelectEngagement
}: RepDashboardProps) {
  const [sortConfig, setSortConfig] = useState<SortOption>({ column: '', direction: 'none' })

  // Filter engagements for this rep
  const repEngagements = useMemo(() => {
    return engagements.filter(engagement => engagement.assignedRep === repName)
  }, [engagements, repName])

  // Sort engagements based on current sort config
  const sortedEngagements = useMemo(() => {
    if (sortConfig.direction === 'none') {
      // Default sort by health (Green first, then Yellow, then Red)
      return [...repEngagements].sort((a, b) => {
        const healthOrder = { GREEN: 0, YELLOW: 1, RED: 2 }
        return healthOrder[a.health] - healthOrder[b.health]
      })
    }

    return [...repEngagements].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortConfig.column) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'health':
          const healthOrder = { GREEN: 0, YELLOW: 1, RED: 2 }
          aValue = healthOrder[a.health]
          bValue = healthOrder[b.health]
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
        case 'milestone':
          aValue = getMostRecentCompletedMilestone(a).toLowerCase()
          bValue = getMostRecentCompletedMilestone(b).toLowerCase()
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
  }, [repEngagements, sortConfig])

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
        <h1 style={{
          margin: '0 0 8px 0',
          fontSize: '24px',
          fontWeight: '600',
          color: '#253D2C',
          fontFamily: 'Trebuchet MS, Arial, sans-serif'
        }}>
          {repName}'s Dashboard
        </h1>
        <p style={{
          margin: '0',
          fontSize: '14px',
          color: '#68BA7F',
          fontFamily: 'Trebuchet MS, Arial, sans-serif'
        }}>
          Manage your {sortedEngagements.length} active engagement{sortedEngagements.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Engagement List */}
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
          gridTemplateColumns: '2fr 80px 120px 100px 100px 2fr 120px 120px',
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
            Company Name {getSortIcon('name')}
          </div>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleSort('health')}
          >
            Health {getSortIcon('health')}
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
            onClick={() => handleSort('milestone')}
          >
            Latest Milestone {getSortIcon('milestone')}
          </div>
          <div>Avaza Project</div>
          <div>Project Folder</div>
        </div>

        {/* Engagement Rows */}
        {sortedEngagements.map((engagement, index) => {
          const mostRecentMilestone = getMostRecentCompletedMilestone(engagement)
          
          return (
            <div
              key={engagement.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 80px 120px 100px 100px 2fr 120px 120px',
                gap: '12px',
                padding: '16px 20px',
                borderBottom: index < sortedEngagements.length - 1 ? '1px solid #e2e8f0' : 'none',
                transition: 'background-color 0.2s ease',
                cursor: 'pointer',
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
              <div 
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2E6F40',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  transition: 'color 0.2s ease'
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectEngagement(engagement.id)
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#1f4a2b'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#2E6F40'
                }}
              >
                {engagement.name}
              </div>

              {/* Health */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '18px'
              }}>
                {getHealthIcon(engagement.health)}
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

              {/* Most Recent Milestone */}
              <div style={{
                fontSize: '13px',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center'
              }}>
                {mostRecentMilestone}
              </div>

              {/* Avaza Link */}
              <div style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                {engagement.avazaLink ? (
                  <a
                    href={engagement.avazaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textDecoration: 'none',
                      color: 'white',
                      background: '#68BA7F',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#2E6F40'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#68BA7F'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    View
                  </a>
                ) : (
                  <span style={{
                    fontSize: '11px',
                    color: '#94a3b8'
                  }}>
                    No link
                  </span>
                )}
              </div>

              {/* Project Folder Link */}
              <div style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                {engagement.projectFolderLink ? (
                  <a
                    href={engagement.projectFolderLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textDecoration: 'none',
                      color: 'white',
                      background: '#68BA7F',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#2E6F40'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#68BA7F'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    View
                  </a>
                ) : (
                  <span style={{
                    fontSize: '11px',
                    color: '#94a3b8'
                  }}>
                    No link
                  </span>
                )}
              </div>

            </div>
          )
        })}
      </div>

      {sortedEngagements.length === 0 && (
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          marginTop: '16px'
        }}>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            margin: 0,
            fontFamily: 'Trebuchet MS, Arial, sans-serif'
          }}>
            No engagements assigned to {repName}
          </p>
        </div>
      )}
    </div>
  )
}