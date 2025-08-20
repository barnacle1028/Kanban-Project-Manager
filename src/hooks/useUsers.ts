import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../api'
import { User } from '../api/types'

export const USER_KEYS = {
  all: ['users'] as const,
  lists: () => [...USER_KEYS.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...USER_KEYS.lists(), filters] as const,
  details: () => [...USER_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USER_KEYS.details(), id] as const,
}

export function useUsers(filters?: { role?: User['role']; managerId?: string }) {
  return useQuery({
    queryKey: USER_KEYS.list(filters),
    queryFn: () => {
      if (filters?.role) {
        return usersApi.getByRole(filters.role)
      }
      if (filters?.managerId) {
        return usersApi.getTeamMembers(filters.managerId)
      }
      return usersApi.getAll()
    },
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: USER_KEYS.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  })
}