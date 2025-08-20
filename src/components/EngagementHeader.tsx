import React, { useState } from 'react'
import type { Engagement, ProjectStatus } from '../types'
import { AVAILABLE_REPS } from '../types'

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

const STATUS_LABELS: Record<ProjectStatus, string> = {
  NEW: 'New',
  KICK_OFF: 'Kick-Off',
  IN_PROGRESS: 'In-Progress',
  LAUNCHED: 'Launched',
  STALLED: 'Stalled',
  ON_HOLD: 'On Hold',
  CLAWED_BACK: 'Clawed Back',
  COMPLETED: 'Completed',
}

const EngagementHeader = React.memo(function EngagementHeader({
  engagement,
  onStatusChange,
  onRepChange,
  onEngagementChange,
}: {
  engagement: Engagement
  onStatusChange: (s: ProjectStatus) => void
  onRepChange: (rep: string) => void
  onEngagementChange: (updates: Partial<Engagement>) => void
}) {
  const [editingCompany, setEditingCompany] = useState(false)
  const [editingProject, setEditingProject] = useState(false)
  const [tempCompanyName, setTempCompanyName] = useState('')
  const [tempProjectName, setTempProjectName] = useState('')

  const startEditCompany = () => {
    setEditingCompany(true)
    setTempCompanyName(engagement.accountName)
  }

  const saveCompanyName = () => {
    onEngagementChange({ accountName: tempCompanyName })
    setEditingCompany(false)
  }

  const cancelEditCompany = () => {
    setEditingCompany(false)
    setTempCompanyName('')
  }

  const handleCompanyKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveCompanyName()
    } else if (e.key === 'Escape') {
      cancelEditCompany()
    }
  }

  const startEditProject = () => {
    setEditingProject(true)
    setTempProjectName(engagement.name)
  }

  const saveProjectName = () => {
    onEngagementChange({ name: tempProjectName })
    setEditingProject(false)
  }

  const cancelEditProject = () => {
    setEditingProject(false)
    setTempProjectName('')
  }

  const handleProjectKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveProjectName()
    } else if (e.key === 'Escape') {
      cancelEditProject()
    }
  }

  return (
    <div className="header">
      <div>
        {editingCompany ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="text"
              value={tempCompanyName}
              onChange={(e) => setTempCompanyName(e.target.value)}
              onKeyDown={handleCompanyKeyPress}
              onBlur={saveCompanyName}
              autoFocus
              style={{
                background: 'white',
                color: '#1e293b',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '48px',
                fontWeight: 'bold',
                margin: 0,
              }}
            />
            <button
              onClick={saveCompanyName}
              className="btn-primary"
              style={{
                fontSize: '12px',
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              ✓
            </button>
            <button
              onClick={cancelEditCompany}
              style={{
                background: '#ef4444',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '12px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s ease',
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <h1
            style={{
              margin: 0,
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: '3px',
              fontSize: '48px',
              fontWeight: 'bold',
            }}
            onClick={startEditCompany}
            title="Click to edit company name"
          >
            {engagement.accountName}
          </h1>
        )}

        {editingProject ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px',
            }}
          >
            <input
              type="text"
              value={tempProjectName}
              onChange={(e) => setTempProjectName(e.target.value)}
              onKeyDown={handleProjectKeyPress}
              onBlur={saveProjectName}
              autoFocus
              style={{
                background: 'white',
                color: '#1e293b',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '32px',
                fontWeight: 'bold',
              }}
            />
            <button
              onClick={saveProjectName}
              className="btn-primary"
              style={{
                fontSize: '12px',
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              ✓
            </button>
            <button
              onClick={cancelEditProject}
              style={{
                background: '#ef4444',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '12px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s ease',
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div
            onClick={startEditProject}
            style={{
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: '3px',
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1e293b',
            }}
            title="Click to edit project name"
          >
            {engagement.name}
          </div>
        )}
      </div>
      <div className="row">
        <span
          className="badge"
          style={{
            backgroundColor:
              engagement.health === 'GREEN'
                ? '#2E6F40'
                : engagement.health === 'YELLOW'
                  ? '#f59e0b'
                  : '#ef4444',
            borderColor:
              engagement.health === 'GREEN'
                ? '#2E6F40'
                : engagement.health === 'YELLOW'
                  ? '#d97706'
                  : '#dc2626',
            color: '#ffffff',
            background:
              engagement.health === 'GREEN'
                ? '#2E6F40'
                : engagement.health === 'YELLOW'
                  ? '#f59e0b'
                  : '#ef4444',
          }}
        >
          Health: {engagement.health}
        </span>
        <select
          className="select"
          value={engagement.assignedRep || ''}
          onChange={(e) => onRepChange(e.target.value)}
        >
          <option value="">Unassigned</option>
          {AVAILABLE_REPS.map((rep) => (
            <option key={rep} value={rep}>
              {rep}
            </option>
          ))}
        </select>
        <select
          className="select"
          value={engagement.status}
          onChange={(e) => onStatusChange(e.target.value as ProjectStatus)}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {STATUS_LABELS[o]}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
})

export default EngagementHeader
