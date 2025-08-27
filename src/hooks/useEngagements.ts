import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabaseEngagementsApi } from '../api/supabaseEngagements'
import { EngagementWithMilestones, Engagement, EngagementMilestone } from '../api/types'

export const ENGAGEMENT_KEYS = {
  all: ['engagements'] as const,
  lists: () => [...ENGAGEMENT_KEYS.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...ENGAGEMENT_KEYS.lists(), filters] as const,
  details: () => [...ENGAGEMENT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ENGAGEMENT_KEYS.details(), id] as const,
}

export function useEngagements(filters?: { userId?: string; managerId?: string }) {
  return useQuery({
    queryKey: ENGAGEMENT_KEYS.list(filters),
    queryFn: () => {
      if (filters?.userId) {
        return supabaseEngagementsApi.getByUser(filters.userId)
      }
      if (filters?.managerId) {
        return supabaseEngagementsApi.getByManager(filters.managerId)
      }
      return supabaseEngagementsApi.getAll()
    },
  })
}

export function useEngagement(id: string) {
  return useQuery({
    queryKey: ENGAGEMENT_KEYS.detail(id),
    queryFn: () => supabaseEngagementsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateEngagement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: supabaseEngagementsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENGAGEMENT_KEYS.lists() })
    },
  })
}

export function useUpdateEngagement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Engagement> }) =>
      supabaseEngagementsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ENGAGEMENT_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: ENGAGEMENT_KEYS.lists() })
    },
  })
}

export function useUpdateEngagementStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Engagement['status'] }) =>
      supabaseEngagementsApi.update(id, { status }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ENGAGEMENT_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: ENGAGEMENT_KEYS.lists() })
    },
  })
}

export function useUpdateMilestoneStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      engagementId, 
      milestoneId, 
      stage 
    }: { 
      engagementId: string
      milestoneId: string
      stage: EngagementMilestone['stage'] 
    }) => supabaseEngagementsApi.milestones.updateStage(engagementId, milestoneId, stage),
    onSuccess: (_, { engagementId }) => {
      queryClient.invalidateQueries({ queryKey: ENGAGEMENT_KEYS.detail(engagementId) })
      queryClient.invalidateQueries({ queryKey: ENGAGEMENT_KEYS.lists() })
    },
  })
}