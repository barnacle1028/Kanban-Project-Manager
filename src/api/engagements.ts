import { api } from './client'
import { Engagement, EngagementWithMilestones, EngagementMilestone } from './types'

export const engagementsApi = {
  // Get all engagements
  getAll: () => api.get<EngagementWithMilestones[]>('/engagements'),

  // Get engagement by ID with milestones
  getById: (id: string) => api.get<EngagementWithMilestones>(`/engagements/${id}`),

  // Get engagements by user
  getByUser: (userId: string) => api.get<EngagementWithMilestones[]>(`/engagements?owner_user_id=${userId}`),

  // Get engagements by manager
  getByManager: (managerId: string) => api.get<EngagementWithMilestones[]>(`/engagements?manager_id=${managerId}`),

  // Create new engagement
  create: (data: Partial<Engagement>) => api.post<Engagement>('/engagements', data),

  // Update engagement
  update: (id: string, data: Partial<Engagement>) => 
    api.patch<Engagement>(`/engagements/${id}`, data),

  // Update engagement status
  updateStatus: (id: string, status: Engagement['status']) =>
    api.patch<Engagement>(`/engagements/${id}`, { status }),

  // Delete engagement
  delete: (id: string) => api.delete(`/engagements/${id}`),

  // Milestone operations
  milestones: {
    // Update milestone stage
    updateStage: (engagementId: string, milestoneId: string, stage: EngagementMilestone['stage']) =>
      api.patch<EngagementMilestone>(`/engagements/${engagementId}/milestones/${milestoneId}`, { stage }),

    // Update milestone checklist
    updateChecklist: (engagementId: string, milestoneId: string, checklist_json: any[]) =>
      api.patch<EngagementMilestone>(`/engagements/${engagementId}/milestones/${milestoneId}`, { checklist_json }),

    // Assign milestone owner
    assignOwner: (engagementId: string, milestoneId: string, owner_user_id: string) =>
      api.patch<EngagementMilestone>(`/engagements/${engagementId}/milestones/${milestoneId}`, { owner_user_id }),

    // Update due date
    updateDueDate: (engagementId: string, milestoneId: string, due_date: string) =>
      api.patch<EngagementMilestone>(`/engagements/${engagementId}/milestones/${milestoneId}`, { due_date }),
  },
}