import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a custom render function that includes providers
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  }
}

// Mock data helpers
export const mockEngagement = {
  id: '1',
  account_id: 'acc-1',
  owner_user_id: 'user-1',
  name: 'Test Engagement',
  status: 'IN_PROGRESS' as const,
  health: 'GREEN' as const,
  priority: 1,
  start_date: '2024-01-01',
  target_launch_date: '2024-06-01',
  status_entered_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  milestones: [],
  account: {
    id: 'acc-1',
    name: 'Test Account',
    segment: 'Enterprise',
    region: 'North America',
    created_at: '2024-01-01T00:00:00Z',
  },
  owner: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'REP' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  percent_complete: 25,
}

export const mockMilestone = {
  id: 'milestone-1',
  engagement_id: '1',
  template_id: 'template-1',
  stage: 'WORKSHOP' as const,
  owner_user_id: 'user-1',
  due_date: '2024-03-01',
  stage_entered_at: '2024-02-01T00:00:00Z',
  checklist_json: [],
  template: {
    id: 'template-1',
    name: 'Kick-off',
    weight: 1.0,
    order_index: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'