import { nanoid } from 'nanoid'
import type { Milestone } from '../types'

// Standard milestones that every engagement should have
export const createStandardMilestones = (assignedRep: string, startDate: string): Milestone[] => {
  return [
    {
      id: nanoid(),
      name: 'Kick-Off',
      stage: 'NOT_STARTED',
      owner: assignedRep,
      isStandard: true,
      stageHistory: [{ stage: 'NOT_STARTED', date: startDate }]
    },
    {
      id: nanoid(),
      name: 'Workflow Design',
      stage: 'NOT_STARTED',
      owner: assignedRep,
      isStandard: true,
      stageHistory: [{ stage: 'NOT_STARTED', date: startDate }]
    },
    {
      id: nanoid(),
      name: 'Content Strategy',
      stage: 'NOT_STARTED',
      owner: assignedRep,
      isStandard: true,
      stageHistory: [{ stage: 'NOT_STARTED', date: startDate }]
    },
    {
      id: nanoid(),
      name: 'CRM Integration',
      stage: 'NOT_STARTED',
      owner: assignedRep,
      isStandard: true,
      stageHistory: [{ stage: 'NOT_STARTED', date: startDate }]
    },
    {
      id: nanoid(),
      name: 'Data Migration',
      stage: 'NOT_STARTED',
      owner: assignedRep,
      isStandard: true,
      stageHistory: [{ stage: 'NOT_STARTED', date: startDate }]
    },
    {
      id: nanoid(),
      name: 'Change Readiness',
      stage: 'NOT_STARTED',
      owner: assignedRep,
      isStandard: true,
      stageHistory: [{ stage: 'NOT_STARTED', date: startDate }]
    },
    {
      id: nanoid(),
      name: 'User Training',
      stage: 'NOT_STARTED',
      owner: assignedRep,
      isStandard: true,
      stageHistory: [{ stage: 'NOT_STARTED', date: startDate }]
    },
    {
      id: nanoid(),
      name: 'User Office Hours',
      stage: 'NOT_STARTED',
      owner: assignedRep,
      isStandard: true,
      stageHistory: [{ stage: 'NOT_STARTED', date: startDate }]
    },
    {
      id: nanoid(),
      name: 'Manager Training',
      stage: 'NOT_STARTED',
      owner: assignedRep,
      isStandard: true,
      stageHistory: [{ stage: 'NOT_STARTED', date: startDate }]
    },
    {
      id: nanoid(),
      name: 'Admin Training',
      stage: 'NOT_STARTED',
      owner: assignedRep,
      isStandard: true,
      stageHistory: [{ stage: 'NOT_STARTED', date: startDate }]
    }
  ]
}