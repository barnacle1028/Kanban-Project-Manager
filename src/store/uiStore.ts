import { create } from 'zustand'

export type ViewMode = 'board' | 'list' | 'timeline'
export type FilterStatus = 'all' | 'active' | 'stalled' | 'completed'

interface UIState {
  // View preferences
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  
  // Filters
  filterStatus: FilterStatus
  setFilterStatus: (status: FilterStatus) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  
  // UI state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // Modal state
  activeModal: string | null
  openModal: (modal: string) => void
  closeModal: () => void
  
  // Notifications
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
  }>
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void
  removeNotification: (id: string) => void
  
  // Loading states
  globalLoading: boolean
  setGlobalLoading: (loading: boolean) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  // View preferences
  viewMode: 'board',
  setViewMode: (mode) => set({ viewMode: mode }),
  
  // Filters
  filterStatus: 'all',
  setFilterStatus: (status) => set({ filterStatus: status }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // UI state
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  // Modal state
  activeModal: null,
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  
  // Notifications
  notifications: [],
  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }))
    
    // Auto-remove notification after duration (default 5 seconds)
    const duration = notification.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(id)
      }, duration)
    }
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },
  
  // Loading states
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}))

// Convenience hooks for specific UI states
export const useViewMode = () => useUIStore((state) => ({
  viewMode: state.viewMode,
  setViewMode: state.setViewMode,
}))

export const useFilters = () => useUIStore((state) => ({
  filterStatus: state.filterStatus,
  setFilterStatus: state.setFilterStatus,
  searchQuery: state.searchQuery,
  setSearchQuery: state.setSearchQuery,
}))

export const useNotifications = () => useUIStore((state) => ({
  notifications: state.notifications,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
}))