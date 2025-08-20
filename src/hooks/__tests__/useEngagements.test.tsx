import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useEngagements } from '../useEngagements'
import { renderWithProviders, mockEngagement } from '../../test/test-utils'
import { engagementsApi } from '../../api'

// Mock the API
vi.mock('../../api', () => ({
  engagementsApi: {
    getAll: vi.fn(),
    getByUser: vi.fn(),
    getByManager: vi.fn(),
  },
}))

describe('useEngagements', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches all engagements when no filters provided', async () => {
    const mockEngagements = [mockEngagement]
    vi.mocked(engagementsApi.getAll).mockResolvedValue(mockEngagements)

    const { queryClient } = renderWithProviders(<div />)
    const { result } = renderHook(() => useEngagements(), {
      wrapper: ({ children }) => children,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockEngagements)
  })
})