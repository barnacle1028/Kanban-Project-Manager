import type { Engagement } from '../types'
import { initializeMilestoneWithStartDate } from './milestoneUtils'

export function migrateEngagementData(engagement: Engagement): Engagement {
  // Check if milestones already have stage history
  const needsMigration = engagement.milestones.some(m => !m.stageHistory)
  
  if (!needsMigration) {
    return engagement
  }

  console.log('Migrating milestone data to include stage tracking...')
  
  return {
    ...engagement,
    milestones: engagement.milestones.map(milestone =>
      initializeMilestoneWithStartDate(milestone, engagement.startDate || '2025-07-10')
    ),
  }
}