import React, { useState } from 'react'
import { nanoid } from 'nanoid'
import type { Milestone, MilestoneStage } from '../types'
import { AVAILABLE_REPS } from '../types'
import { getCurrentStageDate } from '../utils/milestoneUtils'

interface MilestoneManagerProps {
  milestones: Milestone[]
  onAdd: (milestone: Omit<Milestone, 'id'>) => void
  onRemove: (milestoneId: string) => void
  onUpdate: (milestoneId: string, updates: Partial<Milestone>) => void
}

export default function MilestoneManager({
  milestones,
  onAdd,
  onRemove,
  onUpdate,
}: MilestoneManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [newMilestone, setNewMilestone] = useState({
    name: '',
    stage: 'NOT_STARTED' as MilestoneStage,
    owner: '',
    dueDate: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMilestone.name.trim()) return

    onAdd({
      name: newMilestone.name,
      stage: newMilestone.stage,
      owner: newMilestone.owner || undefined,
      dueDate: newMilestone.dueDate || undefined,
    })

    setNewMilestone({
      name: '',
      stage: 'NOT_STARTED' as MilestoneStage,
      owner: '',
      dueDate: '',
    })
    setShowAddForm(false)
  }

  const handleCancel = () => {
    setNewMilestone({
      name: '',
      stage: 'NOT_STARTED' as MilestoneStage,
      owner: '',
      dueDate: '',
    })
    setShowAddForm(false)
  }

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px',
        margin: '8px 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#253D2C',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
            }}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <h3
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: '600',
              color: '#253D2C',
            }}
          >
            Milestone Management ({milestones.length} total)
          </h3>
        </div>
        {isExpanded && (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              background: '#2E6F40',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            + Add Milestone
          </button>
        )}
      </div>

      {isExpanded && showAddForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 120px 120px 120px auto',
              gap: '8px',
              alignItems: 'end',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px',
                }}
              >
                Milestone Name *
              </label>
              <input
                type="text"
                value={newMilestone.name}
                onChange={(e) =>
                  setNewMilestone((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter milestone name"
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px',
                }}
              >
                Stage
              </label>
              <select
                value={newMilestone.stage}
                onChange={(e) =>
                  setNewMilestone((prev) => ({
                    ...prev,
                    stage: e.target.value as MilestoneStage,
                  }))
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                <option value="NOT_STARTED">New</option>
                <option value="INITIAL_CALL">Initial Call</option>
                <option value="WORKSHOP">Workflow</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px',
                }}
              >
                Owner
              </label>
              <select
                value={newMilestone.owner}
                onChange={(e) =>
                  setNewMilestone((prev) => ({
                    ...prev,
                    owner: e.target.value,
                  }))
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                <option value="">Unassigned</option>
                {AVAILABLE_REPS.map((rep) => (
                  <option key={rep} value={rep}>
                    {rep}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px',
                }}
              >
                Due Date
              </label>
              <input
                type="date"
                value={newMilestone.dueDate}
                onChange={(e) =>
                  setNewMilestone((prev) => ({
                    ...prev,
                    dueDate: e.target.value,
                  }))
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="submit"
                style={{
                  background: '#2E6F40',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Add
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {isExpanded && (
        <div
          style={{
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {milestones.map((milestone) => (
          <div
            key={milestone.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              marginBottom: '4px',
              background: milestone.notPurchased ? '#f3f4f6' : 'white',
              opacity: milestone.isStandard ? 0.8 : 1,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong
                  style={{
                    fontSize: '13px',
                    textDecoration: milestone.notPurchased
                      ? 'line-through'
                      : 'none',
                    color: milestone.notPurchased ? '#9ca3af' : '#111827',
                  }}
                >
                  {milestone.name}
                </strong>
                {milestone.isStandard && (
                  <span
                    style={{
                      fontSize: '9px',
                      background: '#68BA7F',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                    }}
                  >
                    Standard
                  </span>
                )}
              </div>
              <div
                style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}
              >
                {milestone.stage.replace('_', ' ')} • {milestone.owner || 'Unassigned'} •{' '}
                {getCurrentStageDate(milestone) || milestone.dueDate || 'No date'}
                {milestone.notPurchased && ' • Not Purchased'}
              </div>
            </div>
            {!milestone.isStandard && (
              <button
                onClick={() => onRemove(milestone.id)}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
                title="Remove milestone"
              >
                Remove
              </button>
            )}
            {milestone.isStandard && (
              <span
                style={{
                  fontSize: '10px',
                  color: '#9ca3af',
                  fontStyle: 'italic',
                  padding: '4px 8px',
                }}
              >
                Protected
              </span>
            )}
          </div>
          ))}
        </div>
      )}
    </div>
  )
}
