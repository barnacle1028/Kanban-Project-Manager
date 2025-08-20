import { create } from 'zustand'
import { EngagementWithMilestones, EngagementMilestone } from '../api/types'

interface EngagementState {
  // Current engagement being viewed/edited
  currentEngagement: EngagementWithMilestones | null
  setCurrentEngagement: (engagement: EngagementWithMilestones | null) => void
  
  // Drag and drop state
  draggedMilestone: EngagementMilestone | null
  setDraggedMilestone: (milestone: EngagementMilestone | null) => void
  
  // Optimistic updates
  optimisticMilestoneUpdates: Map<string, Partial<EngagementMilestone>>
  addOptimisticUpdate: (milestoneId: string, update: Partial<EngagementMilestone>) => void
  removeOptimisticUpdate: (milestoneId: string) => void
  clearOptimisticUpdates: () => void
  
  // Selection state
  selectedMilestones: Set<string>
  toggleMilestoneSelection: (milestoneId: string) => void
  clearSelection: () => void
  selectAll: (milestoneIds: string[]) => void
  
  // Bulk operations
  bulkUpdateStage: (milestoneIds: string[], stage: EngagementMilestone['stage']) => void
}

export const useEngagementStore = create<EngagementState>((set, get) => ({
  // Current engagement
  currentEngagement: null,
  setCurrentEngagement: (engagement) => set({ currentEngagement: engagement }),
  
  // Drag and drop
  draggedMilestone: null,
  setDraggedMilestone: (milestone) => set({ draggedMilestone: milestone }),
  
  // Optimistic updates
  optimisticMilestoneUpdates: new Map(),
  addOptimisticUpdate: (milestoneId, update) => {
    const updates = new Map(get().optimisticMilestoneUpdates)
    updates.set(milestoneId, { ...updates.get(milestoneId), ...update })
    set({ optimisticMilestoneUpdates: updates })
  },
  removeOptimisticUpdate: (milestoneId) => {
    const updates = new Map(get().optimisticMilestoneUpdates)
    updates.delete(milestoneId)
    set({ optimisticMilestoneUpdates: updates })
  },
  clearOptimisticUpdates: () => set({ optimisticMilestoneUpdates: new Map() }),
  
  // Selection
  selectedMilestones: new Set(),
  toggleMilestoneSelection: (milestoneId) => {
    const selected = new Set(get().selectedMilestones)
    if (selected.has(milestoneId)) {
      selected.delete(milestoneId)
    } else {
      selected.add(milestoneId)
    }
    set({ selectedMilestones: selected })
  },
  clearSelection: () => set({ selectedMilestones: new Set() }),
  selectAll: (milestoneIds) => set({ selectedMilestones: new Set(milestoneIds) }),
  
  // Bulk operations
  bulkUpdateStage: (milestoneIds, stage) => {
    // Add optimistic updates for all selected milestones
    const updates = new Map(get().optimisticMilestoneUpdates)
    milestoneIds.forEach(id => {
      updates.set(id, { stage })
    })
    set({ optimisticMilestoneUpdates: updates })
  },
}))

// Convenience hooks
export const useCurrentEngagement = () => useEngagementStore((state) => ({
  currentEngagement: state.currentEngagement,
  setCurrentEngagement: state.setCurrentEngagement,
}))

export const useMilestoneSelection = () => useEngagementStore((state) => ({
  selectedMilestones: state.selectedMilestones,
  toggleMilestoneSelection: state.toggleMilestoneSelection,
  clearSelection: state.clearSelection,
  selectAll: state.selectAll,
}))