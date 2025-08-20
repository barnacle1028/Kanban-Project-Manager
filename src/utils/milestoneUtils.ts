import type { Milestone, MilestoneStage } from '../types'

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0] // Returns YYYY-MM-DD format
}

export function getDateForMilestoneStage(
  milestone: Milestone,
  targetStage: MilestoneStage
): string | undefined {
  if (!milestone.stageHistory) return undefined
  
  const historyEntry = milestone.stageHistory.find(entry => entry.stage === targetStage)
  return historyEntry?.date
}

export function getCurrentStageDate(milestone: Milestone): string | undefined {
  return getDateForMilestoneStage(milestone, milestone.stage)
}

export function addStageToHistory(
  milestone: Milestone,
  newStage: MilestoneStage,
  movedBy?: string
): Milestone {
  const now = formatDate(new Date())
  const history = milestone.stageHistory || []
  
  // If moving to the same stage, don't change anything
  if (milestone.stage === newStage) {
    return milestone
  }
  
  // Find existing entry for this stage
  const existingEntryIndex = history.findIndex(entry => entry.stage === newStage)
  
  let newHistory
  if (existingEntryIndex >= 0) {
    // Update existing entry with current date (re-entering previous stage)
    newHistory = [...history]
    newHistory[existingEntryIndex] = {
      stage: newStage,
      date: now,
      movedBy
    }
  } else {
    // Add new entry for stage we haven't been to before
    newHistory = [...history, {
      stage: newStage,
      date: now,
      movedBy
    }]
  }
  
  return {
    ...milestone,
    stage: newStage,
    stageHistory: newHistory,
    dueDate: now // Set current date as the date for this stage
  }
}

export function initializeMilestoneWithStartDate(
  milestone: Milestone,
  startDate: string
): Milestone {
  // If milestone doesn't have history, initialize it
  if (!milestone.stageHistory) {
    const initialHistory = []
    
    // If milestone is already in a stage beyond NOT_STARTED, 
    // we need to backfill the history
    if (milestone.stage !== 'NOT_STARTED') {
      // Add NOT_STARTED entry with start date
      initialHistory.push({
        stage: 'NOT_STARTED' as MilestoneStage,
        date: startDate
      })
      
      // Add current stage entry with current date or existing dueDate
      initialHistory.push({
        stage: milestone.stage,
        date: milestone.dueDate || formatDate(new Date())
      })
    } else {
      // Milestone is in NOT_STARTED, so just set that with start date
      initialHistory.push({
        stage: 'NOT_STARTED' as MilestoneStage,
        date: startDate
      })
    }
    
    return {
      ...milestone,
      stageHistory: initialHistory,
      dueDate: getCurrentStageDate({ ...milestone, stageHistory: initialHistory }) || milestone.dueDate
    }
  }
  
  return milestone
}