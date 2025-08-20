import React, { useMemo, useState } from 'react'
import styles from '../styles/Board.module.css'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Engagement, Milestone, MilestoneStage } from '../types'
import { AVAILABLE_REPS } from '../types'
import { getCurrentStageDate } from '../utils/milestoneUtils'

const STAGES: MilestoneStage[] = [
  'NOT_STARTED',
  'INITIAL_CALL',
  'WORKSHOP',
  'COMPLETED',
]

const STAGE_LABELS: Record<MilestoneStage, string> = {
  NOT_STARTED: 'Not Started',
  INITIAL_CALL: 'Initial Call',
  WORKSHOP: 'Workshop',
  COMPLETED: 'Completed',
}

function StageColumn({
  id,
  children,
  musicToggle,
}: {
  id: MilestoneStage
  children: React.ReactNode
  musicToggle?: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      className={styles.col}
      ref={setNodeRef}
      style={{
        outline: isOver ? '3px dashed #2E6F40' : 'none',
        backgroundColor: isOver ? 'rgba(255, 255, 255, 0.9)' : 'white',
        transform: isOver ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <h3 style={{ margin: '8px 8px 8px 8px' }}>{STAGE_LABELS[id]}</h3>
        {musicToggle}
      </div>
      {children}
    </div>
  )
}

function MilestoneCard({
  milestone,
  onOwnerChange,
  onNotPurchasedChange,
}: {
  milestone: Milestone
  onOwnerChange: (milestoneId: string, owner: string) => void
  onNotPurchasedChange: (milestoneId: string, notPurchased: boolean) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: milestone.id,
    disabled: false, // Ensure all milestones can be dragged
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : milestone.notPurchased ? 0.7 : 1,
    background: isDragging
      ? '#2E6F40'
      : milestone.notPurchased
        ? '#f0f9ff'
        : '#2E6F40',
    border: isDragging
      ? '2px solid #253D2C'
      : milestone.notPurchased
        ? '1px solid #68BA7F'
        : '1px solid #68BA7F',
    boxShadow: isDragging ? '0 8px 16px rgba(46, 111, 64, 0.4)' : 'inherit',
    color: isDragging ? 'white' : 'inherit',
    zIndex: isDragging ? 1000 : 'auto',
  }
  return (
    <div className={styles.card} ref={setNodeRef} style={style} {...attributes}>
      <div
        className="row"
        style={{ justifyContent: 'space-between', alignItems: 'center' }}
      >
        <strong
          style={{
            textDecoration: milestone.notPurchased ? 'line-through' : 'none',
            color: isDragging
              ? 'white'
              : milestone.notPurchased
                ? '#68BA7F'
                : 'white',
            fontSize: '13px',
          }}
        >
          {milestone.name}
        </strong>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label
            style={{
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={milestone.notPurchased || false}
              onChange={(e) =>
                onNotPurchasedChange(milestone.id, e.target.checked)
              }
              onClick={(e) => e.stopPropagation()}
              style={{ margin: 0, width: '12px', height: '12px' }}
            />
            <span
              className="muted"
              style={{
                color: isDragging ? 'rgba(255,255,255,0.8)' : undefined,
              }}
            >
              NP
            </span>
          </label>
          <div
            {...listeners}
            style={{
              cursor: 'grab',
              color: isDragging
                ? 'rgba(255,255,255,0.9)'
                : milestone.notPurchased
                  ? '#68BA7F'
                  : 'rgba(255,255,255,0.8)',
              fontSize: '12px',
            }}
          >
            ⋮⋮⋮
          </div>
        </div>
      </div>
      {!milestone.notPurchased && (
        <div
          className="row"
          style={{ justifyContent: 'space-between', marginTop: 6, gap: '8px' }}
        >
          <select
            className="select"
            style={{
              fontSize: '10px',
              padding: '1px 4px',
              flex: 1,
              minWidth: '0',
            }}
            value={milestone.owner || ''}
            onChange={(e) => onOwnerChange(milestone.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">Unassigned</option>
            {AVAILABLE_REPS.map((rep) => (
              <option key={rep} value={rep}>
                {rep}
              </option>
            ))}
          </select>
          <span
            className="muted"
            style={{ fontSize: '10px', whiteSpace: 'nowrap' }}
            title={`Moved to ${milestone.stage.toLowerCase().replace('_', ' ')} on ${getCurrentStageDate(milestone) || milestone.dueDate || 'unknown date'}`}
          >
            {getCurrentStageDate(milestone) || milestone.dueDate || '—'}
          </span>
        </div>
      )}
    </div>
  )
}

interface KanbanBoardProps {
  engagement: Engagement
  onMilestoneOwnerChange: (milestoneId: string, owner: string) => void
  onMilestoneStageChange: (milestoneId: string, stage: MilestoneStage) => void
  onMilestoneNotPurchasedChange: (
    milestoneId: string,
    notPurchased: boolean
  ) => void
  musicEnabled: boolean
  onMusicToggle: (enabled: boolean) => void
}

export default function KanbanBoard({
  engagement,
  onMilestoneOwnerChange,
  onMilestoneStageChange,
  onMilestoneNotPurchasedChange,
  musicEnabled,
  onMusicToggle,
}: KanbanBoardProps) {
  const milestones = engagement.milestones

  const itemsByStage = useMemo(() => {
    const map: Record<MilestoneStage, Milestone[]> = {
      NOT_STARTED: [],
      INITIAL_CALL: [],
      WORKSHOP: [],
      COMPLETED: [],
    }
    for (const m of milestones) map[m.stage].push(m)
    return map
  }, [milestones])

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const overId = over.id as string
    if (
      ['NOT_STARTED', 'INITIAL_CALL', 'WORKSHOP', 'COMPLETED'].includes(overId)
    ) {
      onMilestoneStageChange(active.id as string, overId as MilestoneStage)
      return
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <div className={styles.board}>
        {(
          [
            'NOT_STARTED',
            'INITIAL_CALL',
            'WORKSHOP',
            'COMPLETED',
          ] as MilestoneStage[]
        ).map((stage) => (
          <StageColumn
            key={stage}
            id={stage}
            musicToggle={
              stage === 'COMPLETED' ? (
                <button
                  onClick={() => onMusicToggle(!musicEnabled)}
                  style={{
                    background: musicEnabled ? 'white' : 'transparent',
                    border: '1px solid #68BA7F',
                    borderRadius: '12px',
                    color: musicEnabled ? '#253D2C' : '#68BA7F',
                    fontSize: '12px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                  }}
                  title={
                    musicEnabled
                      ? 'Disable celebration sounds'
                      : 'Enable celebration sounds'
                  }
                >
                  {musicEnabled ? '🔊' : '🔇'}
                  <span style={{ fontSize: '10px' }}>
                    {musicEnabled ? 'ON' : 'OFF'}
                  </span>
                </button>
              ) : undefined
            }
          >
            <SortableContext
              items={itemsByStage[stage].map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              {itemsByStage[stage].map((m) => (
                <MilestoneCard
                  key={m.id}
                  milestone={m}
                  onOwnerChange={onMilestoneOwnerChange}
                  onNotPurchasedChange={onMilestoneNotPurchasedChange}
                />
              ))}
            </SortableContext>
          </StageColumn>
        ))}
      </div>
    </DndContext>
  )
}
