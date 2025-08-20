import React, { useState, useMemo, useEffect, useCallback } from 'react'
import styles from './styles/App.module.css'
import KanbanBoard from './components/KanbanBoard'
import Header from './components/EngagementHeader'
import EngagementDetails from './components/EngagementDetails'
import MilestoneManager from './components/MilestoneManager'
import ErrorBoundary from './components/ErrorBoundary'
import { sampleEngagement } from './mockData'
import { dummyEngagements } from './data/dummyEngagements'
import RepDashboard from './components/RepDashboard'
import ManagerDashboard from './components/ManagerDashboard'
import RepAdmin from './components/RepAdmin'
import EngagementAdmin from './components/EngagementAdmin'
import type {
  ProjectStatus,
  MilestoneStage,
  Engagement,
  Milestone,
  Rep,
} from './types'
import { triggerConfetti } from './utils/confetti'
import {
  addStageToHistory,
  initializeMilestoneWithStartDate,
} from './utils/milestoneUtils'
import { migrateEngagementData } from './utils/migrationUtils'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useUndoRedo } from './hooks/useUndoRedo'
import { createStandardMilestones } from './utils/standardMilestones'

function calculateHealthStatus(
  status: ProjectStatus
): 'GREEN' | 'YELLOW' | 'RED' {
  if (status === 'CLAWED_BACK' || status === 'ON_HOLD') {
    return 'RED'
  }
  if (status === 'STALLED') {
    return 'YELLOW'
  }
  return 'GREEN'
}

export default function App() {
  const [currentView, setCurrentView] = useState<'manager' | 'dashboard' | 'engagement' | 'rep-admin' | 'engagement-admin'>('manager')
  const [selectedEngagementId, setSelectedEngagementId] = useState<string | null>(null)
  const [selectedRepName, setSelectedRepName] = useState<string>('Dakota')
  
  // Shared engagements state - loaded from localStorage or defaults to dummy data
  const [allEngagements, setAllEngagements] = useLocalStorage(
    'kanban-all-engagements',
    dummyEngagements
  )
  
  // Track if current engagement has unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // Rep data management
  const [reps, setReps] = useLocalStorage<Rep[]>(
    'kanban-reps',
    [
      {
        id: '1',
        name: 'Dakota',
        email: 'dakota@company.com',
        title: 'Senior Sales Rep',
        avazaTimekeepingLink: 'https://avaza.com/timekeeping/dakota',
        avazaDashboardLink: 'https://avaza.com/dashboard/dakota',
        isActive: true,
        createdDate: '2024-01-01'
      },
      {
        id: '2',
        name: 'Chris',
        email: 'chris@company.com',
        title: 'Sales Rep',
        avazaTimekeepingLink: 'https://avaza.com/timekeeping/chris',
        avazaDashboardLink: 'https://avaza.com/dashboard/chris',
        isActive: true,
        createdDate: '2024-01-01'
      },
      {
        id: '3',
        name: 'Amanda',
        email: 'amanda@company.com',
        title: 'Sales Rep',
        avazaTimekeepingLink: 'https://avaza.com/timekeeping/amanda',
        avazaDashboardLink: 'https://avaza.com/dashboard/amanda',
        isActive: true,
        createdDate: '2024-01-01'
      },
      {
        id: '4',
        name: 'Rolando',
        email: 'rolando@company.com',
        title: 'Sales Rep',
        avazaTimekeepingLink: 'https://avaza.com/timekeeping/rolando',
        avazaDashboardLink: 'https://avaza.com/dashboard/rolando',
        isActive: true,
        createdDate: '2024-01-01'
      },
      {
        id: '5',
        name: 'Lisa',
        email: 'lisa@company.com',
        title: 'Sales Rep',
        avazaTimekeepingLink: 'https://avaza.com/timekeeping/lisa',
        avazaDashboardLink: 'https://avaza.com/dashboard/lisa',
        isActive: true,
        createdDate: '2024-01-01'
      },
      {
        id: '6',
        name: 'Steph',
        email: 'steph@company.com',
        title: 'Sales Rep',
        avazaTimekeepingLink: 'https://avaza.com/timekeeping/steph',
        avazaDashboardLink: 'https://avaza.com/dashboard/steph',
        isActive: true,
        createdDate: '2024-01-01'
      },
      {
        id: '7',
        name: 'Josh',
        email: 'josh@company.com',
        title: 'Sales Rep',
        avazaTimekeepingLink: 'https://avaza.com/timekeeping/josh',
        avazaDashboardLink: 'https://avaza.com/dashboard/josh',
        isActive: true,
        createdDate: '2024-01-01'
      }
    ]
  )

  // Create rep avaza links object from reps data
  const repAvazaLinks = useMemo(() => {
    return reps.reduce((acc, rep) => {
      acc[rep.name] = rep.avazaDashboardLink || ''
      return acc
    }, {} as Record<string, string>)
  }, [reps])
  
  // Get current engagement data from shared state
  const currentEngagementData = useMemo(() => {
    if (selectedEngagementId) {
      const found = allEngagements.find(e => e.id === selectedEngagementId)
      if (found) return found
    }
    return sampleEngagement
  }, [selectedEngagementId, allEngagements])

  const [storedEngagement, setStoredEngagement] = useLocalStorage(
    'kanban-engagement',
    {
      ...currentEngagementData,
      health: calculateHealthStatus(currentEngagementData.status),
      // Initialize all milestones with proper stage history
      milestones: currentEngagementData.milestones.map(milestone =>
        initializeMilestoneWithStartDate(milestone, currentEngagementData.startDate || '2025-07-10')
      ),
    }
  )

  const {
    state: engagement,
    set: setEngagement,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo(storedEngagement)

  const [musicEnabled, setMusicEnabled] = useLocalStorage(
    'kanban-music-enabled',
    true
  )
  const [isLoading, setIsLoading] = useState(false)


  // Update stored engagement when current engagement data changes
  useEffect(() => {
    const newEngagement = {
      ...currentEngagementData,
      health: calculateHealthStatus(currentEngagementData.status),
      milestones: currentEngagementData.milestones.map(milestone =>
        initializeMilestoneWithStartDate(milestone, currentEngagementData.startDate || '2025-07-10')
      ),
    }
    setEngagement(newEngagement)
  }, [currentEngagementData, setEngagement])

  // Sync engagement state with localStorage and migrate data if needed
  useEffect(() => {
    const migratedEngagement = migrateEngagementData(engagement)
    if (migratedEngagement !== engagement) {
      setEngagement(migratedEngagement)
    }
    setStoredEngagement(migratedEngagement)
  }, [engagement, setStoredEngagement, setEngagement])

  const onStatusChange = useCallback(
    (next: ProjectStatus) => {
      setIsLoading(true)
      setTimeout(() => {
        setEngagement((prev) => ({
          ...prev,
          status: next,
          health: calculateHealthStatus(next),
        }))
        setHasUnsavedChanges(true)
        setIsLoading(false)
      }, 100)
    },
    [setEngagement]
  )

  const onRepChange = useCallback(
    (rep: string) => {
      setEngagement((prev) => ({
        ...prev,
        assignedRep: rep || undefined,
        milestones: prev.milestones.map((m) => ({
          ...m,
          owner: rep || undefined,
        })),
      }))
      setHasUnsavedChanges(true)
    },
    [setEngagement]
  )

  const onMilestoneOwnerChange = useCallback(
    (milestoneId: string, owner: string) => {
      setEngagement((prev) => ({
        ...prev,
        milestones: prev.milestones.map((m) =>
          m.id === milestoneId ? { ...m, owner: owner || undefined } : m
        ),
      }))
      setHasUnsavedChanges(true)
    },
    [setEngagement]
  )

  const onMilestoneStageChange = useCallback(
    (milestoneId: string, stage: MilestoneStage) => {
      setEngagement((prev) => {
        const milestone = prev.milestones.find((m) => m.id === milestoneId)

        // Trigger confetti if milestone is being moved to COMPLETED and it's not a "not purchased" milestone
        if (stage === 'COMPLETED' && milestone && !milestone.notPurchased) {
          setTimeout(() => triggerConfetti(musicEnabled), 100) // Small delay for smooth UX
        }

        return {
          ...prev,
          milestones: prev.milestones.map((m) =>
            m.id === milestoneId 
              ? addStageToHistory(m, stage, prev.assignedRep)
              : m
          ),
        }
      })
      setHasUnsavedChanges(true)
    },
    [setEngagement, musicEnabled]
  )

  const onMilestoneNotPurchasedChange = useCallback(
    (milestoneId: string, notPurchased: boolean) => {
      setEngagement((prev) => ({
        ...prev,
        milestones: prev.milestones.map((m) =>
          m.id === milestoneId
            ? {
                ...m,
                notPurchased,
                stage: notPurchased ? 'COMPLETED' : 'NOT_STARTED',
              }
            : m
        ),
      }))
      setHasUnsavedChanges(true)
    },
    [setEngagement]
  )

  const onEngagementDetailsChange = useCallback(
    (updates: Partial<Engagement>) => {
      setEngagement((prev) => ({ ...prev, ...updates }))
      setHasUnsavedChanges(true)
    },
    [setEngagement]
  )

  // Save engagement changes back to shared state
  const saveEngagement = useCallback(() => {
    if (selectedEngagementId) {
      setAllEngagements(prev => 
        prev.map(eng => 
          eng.id === selectedEngagementId ? engagement : eng
        )
      )
      setHasUnsavedChanges(false)
    }
  }, [selectedEngagementId, engagement, setAllEngagements])

  // Auto-save when engagement changes (with debounce effect)
  useEffect(() => {
    if (hasUnsavedChanges && selectedEngagementId) {
      const timeoutId = setTimeout(() => {
        saveEngagement()
      }, 1000) // Auto-save after 1 second of inactivity
      
      return () => clearTimeout(timeoutId)
    }
  }, [engagement, hasUnsavedChanges, selectedEngagementId, saveEngagement])

  const onAddMilestone = useCallback(
    async (milestone: Omit<Milestone, 'id'>) => {
      const { nanoid } = await import('nanoid')
      setEngagement((prev) => ({
        ...prev,
        milestones: [...prev.milestones, { ...milestone, id: nanoid() }],
      }))
      setHasUnsavedChanges(true)
    },
    [setEngagement]
  )

  const onRemoveMilestone = useCallback(
    (milestoneId: string) => {
      setEngagement((prev) => {
        const milestone = prev.milestones.find((m) => m.id === milestoneId)
        // Prevent deletion of standard milestones
        if (milestone?.isStandard) {
          return prev
        }
        setHasUnsavedChanges(true)
        return {
          ...prev,
          milestones: prev.milestones.filter((m) => m.id !== milestoneId),
        }
      })
    },
    [setEngagement]
  )

  const onUpdateMilestone = useCallback(
    (milestoneId: string, updates: Partial<Milestone>) => {
      setEngagement((prev) => ({
        ...prev,
        milestones: prev.milestones.map((m) =>
          m.id === milestoneId ? { ...m, ...updates } : m
        ),
      }))
      setHasUnsavedChanges(true)
    },
    [setEngagement]
  )


  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === 'z' &&
        !event.shiftKey
      ) {
        event.preventDefault()
        undo()
      } else if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === 'y' || (event.key === 'z' && event.shiftKey))
      ) {
        event.preventDefault()
        redo()
      } else if (
        (event.ctrlKey || event.metaKey) &&
        event.key === 's'
      ) {
        event.preventDefault()
        if (hasUnsavedChanges) {
          saveEngagement()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, hasUnsavedChanges, saveEngagement])

  // Warn user about unsaved changes before leaving page
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault()
        event.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])


  const pctComplete = useMemo(() => {
    return Math.round(
      100 *
        (engagement.milestones.filter((m) => m.stage === 'COMPLETED').length /
          engagement.milestones.length)
    )
  }, [engagement.milestones])

  const handleSelectEngagement = (engagementId: string) => {
    setSelectedEngagementId(engagementId)
    setCurrentView('engagement')
  }

  const handleSelectRep = (repName: string) => {
    setSelectedRepName(repName)
    setCurrentView('dashboard')
  }

  const handleUpdateRepAvazaLink = (repName: string, link: string) => {
    setReps(prev => prev.map(rep => 
      rep.name === repName 
        ? { ...rep, avazaDashboardLink: link }
        : rep
    ))
  }

  const handleGoToRepAdmin = () => {
    setCurrentView('rep-admin')
  }

  const handleAddRep = async (repData: Omit<Rep, 'id' | 'createdDate'>) => {
    const { nanoid } = await import('nanoid')
    const newRep: Rep = {
      ...repData,
      id: nanoid(),
      createdDate: new Date().toISOString().split('T')[0]
    }
    setReps(prev => [...prev, newRep])
  }

  const handleUpdateRep = (id: string, updates: Partial<Rep>) => {
    setReps(prev => prev.map(rep => 
      rep.id === id ? { ...rep, ...updates } : rep
    ))
  }

  const handleDeleteRep = (id: string) => {
    setReps(prev => prev.filter(rep => rep.id !== id))
  }

  const handleGoToEngagementAdmin = () => {
    setCurrentView('engagement-admin')
  }

  const handleAddEngagement = async (engagementData: Omit<Engagement, 'id' | 'milestones'>) => {
    const { nanoid } = await import('nanoid')
    const newEngagement: Engagement = {
      ...engagementData,
      id: nanoid(),
      milestones: createStandardMilestones(
        engagementData.assignedRep || 'Unassigned',
        engagementData.startDate || new Date().toISOString().split('T')[0]
      )
    }
    setAllEngagements(prev => [...prev, newEngagement])
  }

  const handleUpdateEngagement = (id: string, updates: Partial<Engagement>) => {
    setAllEngagements(prev => prev.map(eng => 
      eng.id === id ? { ...eng, ...updates } : eng
    ))
  }

  const handleDeleteEngagement = (id: string) => {
    setAllEngagements(prev => prev.filter(eng => eng.id !== id))
  }

  const handleBackToDashboard = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Do you want to save before leaving?'
      )
      if (confirmLeave) {
        saveEngagement()
      }
    }
    setCurrentView('dashboard')
    setSelectedEngagementId(null)
    setHasUnsavedChanges(false)
  }

  const handleBackToManager = () => {
    setCurrentView('manager')
    setSelectedRepName('Dakota')
  }

  if (currentView === 'manager') {
    return (
      <ErrorBoundary>
        <ManagerDashboard
          engagements={allEngagements}
          reps={reps}
          onSelectRep={handleSelectRep}
          repAvazaLinks={repAvazaLinks}
          onUpdateRepAvazaLink={handleUpdateRepAvazaLink}
          onGoToRepAdmin={handleGoToRepAdmin}
          onGoToEngagementAdmin={handleGoToEngagementAdmin}
        />
      </ErrorBoundary>
    )
  }

  if (currentView === 'rep-admin') {
    return (
      <ErrorBoundary>
        <RepAdmin
          reps={reps}
          onAddRep={handleAddRep}
          onUpdateRep={handleUpdateRep}
          onDeleteRep={handleDeleteRep}
          onBackToManager={() => setCurrentView('manager')}
        />
      </ErrorBoundary>
    )
  }

  if (currentView === 'engagement-admin') {
    return (
      <ErrorBoundary>
        <EngagementAdmin
          engagements={allEngagements}
          reps={reps}
          onAddEngagement={handleAddEngagement}
          onUpdateEngagement={handleUpdateEngagement}
          onDeleteEngagement={handleDeleteEngagement}
          onBackToManager={() => setCurrentView('manager')}
        />
      </ErrorBoundary>
    )
  }

  if (currentView === 'dashboard') {
    return (
      <ErrorBoundary>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '16px 20px',
          background: '#68BA7F',
          minHeight: '100vh'
        }}>
          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <button
              onClick={handleBackToManager}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'white',
                background: '#68BA7F',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Trebuchet MS, Arial, sans-serif',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2E6F40'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#68BA7F'
              }}
            >
              ← Back to Manager Dashboard
            </button>
            <span style={{
              fontSize: '14px',
              color: '#64748b',
              fontFamily: 'Trebuchet MS, Arial, sans-serif'
            }}>
              Viewing: {selectedRepName}'s Dashboard
            </span>
          </div>
          <RepDashboard
            engagements={allEngagements}
            repName={selectedRepName}
            onSelectEngagement={handleSelectEngagement}
          />
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className={styles.container}>
        <ErrorBoundary>
          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <button
              onClick={handleBackToDashboard}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'white',
                background: '#68BA7F',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Trebuchet MS, Arial, sans-serif',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2E6F40'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#68BA7F'
              }}
            >
              ← Back to {selectedRepName}'s Dashboard
            </button>
            {hasUnsavedChanges && (
              <button
                onClick={saveEngagement}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'white',
                  background: '#f59e0b',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Trebuchet MS, Arial, sans-serif',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#d97706'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f59e0b'
                }}
              >
                💾 Save Changes
              </button>
            )}
            {hasUnsavedChanges && (
              <span style={{
                fontSize: '12px',
                color: '#f59e0b',
                fontFamily: 'Trebuchet MS, Arial, sans-serif',
                fontWeight: '600'
              }}>
                ● Unsaved changes
              </span>
            )}
            <span style={{
              fontSize: '14px',
              color: '#64748b',
              fontFamily: 'Trebuchet MS, Arial, sans-serif'
            }}>
              Rep: {selectedRepName} | Engagement: {engagement.name}
            </span>
          </div>
          <Header
            engagement={engagement}
            onStatusChange={onStatusChange}
            onRepChange={onRepChange}
            onEngagementChange={onEngagementDetailsChange}
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <EngagementDetails
            engagement={engagement}
            onEngagementChange={onEngagementDetailsChange}
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <MilestoneManager
            milestones={engagement.milestones}
            onAdd={onAddMilestone}
            onRemove={onRemoveMilestone}
            onUpdate={onUpdateMilestone}
          />
        </ErrorBoundary>
        <div className={styles.footer}>
          <span className="badge">Overall progress: {pctComplete}%</span>
          <span className="muted">
            Drag milestones between columns to update stages.
          </span>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={undo}
              disabled={!canUndo || isLoading}
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid #68BA7F',
                background: canUndo && !isLoading ? 'white' : '#f3f4f6',
                color: canUndo && !isLoading ? '#253D2C' : '#9ca3af',
                cursor: canUndo && !isLoading ? 'pointer' : 'not-allowed',
              }}
              title="Undo (Ctrl+Z)"
            >
              ↶ Undo
            </button>
            <button
              onClick={redo}
              disabled={!canRedo || isLoading}
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid #68BA7F',
                background: canRedo && !isLoading ? 'white' : '#f3f4f6',
                color: canRedo && !isLoading ? '#253D2C' : '#9ca3af',
                cursor: canRedo && !isLoading ? 'pointer' : 'not-allowed',
              }}
              title="Redo (Ctrl+Y)"
            >
              ↷ Redo
            </button>
            <div
              style={{
                borderLeft: '1px solid #e2e8f0',
                height: '24px',
                margin: '0 4px',
              }}
            />
            {isLoading && (
              <span className="muted" style={{ fontSize: '12px' }}>
                Loading...
              </span>
            )}
          </div>
        </div>
        <div style={{ marginTop: '8px' }}>
          <ErrorBoundary>
            <KanbanBoard
              engagement={engagement}
              onMilestoneOwnerChange={onMilestoneOwnerChange}
              onMilestoneStageChange={onMilestoneStageChange}
              onMilestoneNotPurchasedChange={onMilestoneNotPurchasedChange}
              musicEnabled={musicEnabled}
              onMusicToggle={setMusicEnabled}
            />
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  )
}
