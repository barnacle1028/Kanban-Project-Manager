import React, { useMemo } from 'react'
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
  NOT_STARTED: 'New',
  INITIAL_CALL: 'Initial Call',
  WORKSHOP: 'Workflow',
  COMPLETED: 'Completed',
}

function StageColumn({
  id,
  children,
}: {
  id: MilestoneStage
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{
        background: isOver ? '#CFFFDC' : 'white',
        border: isOver ? '2px dashed #2E6F40' : '1px solid #68BA7F',
        borderRadius: '8px',
        padding: '12px',
        minHeight: '300px',
        transition: 'all 0.2s ease',
      }}
    >
      <h3 style={{
        margin: '0 0 12px 0',
        fontSize: '12px',
        fontWeight: '700',
        color: '#2E6F40',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        borderBottom: '2px solid #68BA7F',
        paddingBottom: '6px'
      }}>
        {STAGE_LABELS[id]}
      </h3>
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
    disabled: false,
  })
  
  const isStandard = milestone.isStandard
  const isNotPurchased = milestone.notPurchased
  
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        background: isDragging ? '#2E6F40' : isNotPurchased ? '#CFFFDC' : '#2E6F40',
        border: `1px solid ${isDragging ? '#253D2C' : '#68BA7F'}`,
        borderRadius: '6px',
        padding: '8px',
        marginBottom: '6px',
        opacity: isDragging ? 0.9 : isNotPurchased ? 0.7 : 1,
        boxShadow: isDragging ? '0 4px 8px rgba(46, 111, 64, 0.3)' : '0 1px 2px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        zIndex: isDragging ? 1000 : 'auto',
      }}
      {...attributes}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
          <span style={{
            fontSize: '11px',
            fontWeight: '600',
            color: isDragging ? 'white' : isNotPurchased ? '#68BA7F' : 'white',
            textDecoration: isNotPurchased ? 'line-through' : 'none',
            flex: 1
          }}>
            {milestone.name}
          </span>
          {isStandard && (
            <span style={{
              fontSize: '8px',
              background: '#68BA7F',
              color: 'white',
              padding: '1px 4px',
              borderRadius: '3px',
              fontWeight: '600'
            }}>
              STD
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <label style={{
            fontSize: '9px',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            cursor: 'pointer',
            color: isDragging ? 'white' : '#68BA7F'
          }}>
            <input
              type="checkbox"
              checked={isNotPurchased || false}
              onChange={(e) => onNotPurchasedChange(milestone.id, e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              style={{ margin: 0, width: '10px', height: '10px', accentColor: '#2E6F40' }}
            />
            NP
          </label>
          <div
            {...listeners}
            style={{
              cursor: 'grab',
              color: isDragging ? 'white' : '#68BA7F',
              fontSize: '12px',
              padding: '2px'
            }}
          >
            ≡
          </div>
        </div>
      </div>
      {!isNotPurchased && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '4px'
        }}>
          <select
            value={milestone.owner || ''}
            onChange={(e) => onOwnerChange(milestone.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={{
              fontSize: '9px',
              padding: '2px 4px',
              border: '1px solid #68BA7F',
              borderRadius: '3px',
              background: '#CFFFDC',
              color: '#253D2C',
              flex: 1,
              minWidth: '0',
              outline: 'none'
            }}
          >
            <option value="">Unassigned</option>
            {AVAILABLE_REPS.map((rep) => (
              <option key={rep} value={rep}>{rep}</option>
            ))}
          </select>
          <span style={{
            fontSize: '8px',
            color: isDragging ? 'rgba(255,255,255,0.8)' : '#68BA7F',
            whiteSpace: 'nowrap'
          }}>
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        padding: '0',
        '@media (max-width: 768px)': {
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px'
        }
      }}>
        {STAGES.map((stage) => (
          <StageColumn key={stage} id={stage}>
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
