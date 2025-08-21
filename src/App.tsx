import React from 'react'
import { useAuthStore } from './store/authStore'
import { comprehensiveEngagements, getEngagementsByRep, getEngagementsByManager, getEngagementById } from './data/comprehensiveEngagements'
import { userData, getUserByEmail, determineRoleFromEmail } from './data/userData'
import type { EngagementWithMilestones } from './api/types'


function CompleteEngagementSystem({ user }: { user: any }) {
  const [selectedEngagementId, setSelectedEngagementId] = React.useState<string | null>(null)
  
  // Get engagements based on user role
  const engagements = React.useMemo(() => {
    if (user.role === 'REP') {
      return getEngagementsByRep(user.id)
    } else if (user.role === 'MANAGER') {
      // If Derek (manager), show his reps' engagements
      if (user.name === 'Derek') {
        return getEngagementsByManager(user.id)
      }
      // If Chris (admin), show all engagements
      return comprehensiveEngagements
    }
    return []
  }, [user.role, user.id, user.name])

  const isAdmin = user.name === 'Chris'


  const selectedEngagement = selectedEngagementId 
    ? getEngagementById(selectedEngagementId)
    : null

  if (selectedEngagement) {
    return (
      <div style={{ background: '#68BA7F', minHeight: '100vh', padding: '20px' }}>
        {/* Header with back button */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '20px', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <button
            onClick={() => setSelectedEngagementId(null)}
            style={{
              background: '#6c757d',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              padding: '10px 20px',
              cursor: 'pointer',
              fontFamily: 'Trebuchet MS, Arial, sans-serif'
            }}
          >
            ← Back to Dashboard
          </button>
          <div>
            <h1 style={{ 
              margin: 0, 
              color: '#253D2C',
              fontFamily: 'Trebuchet MS, Arial, sans-serif'
            }}>
              {selectedEngagement.name}
            </h1>
            <p style={{ 
              margin: '5px 0 0 0', 
              color: '#68BA7F',
              fontFamily: 'Trebuchet MS, Arial, sans-serif'
            }}>
              Engagement Details & Milestone Management
            </p>
          </div>
        </div>

        {/* Engagement Details */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '20px', 
          marginBottom: '20px' 
        }}>
          <h2 style={{ 
            margin: '0 0 20px 0', 
            color: '#253D2C',
            fontFamily: 'Trebuchet MS, Arial, sans-serif'
          }}>
            Engagement Details
          </h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
            <div>
              <h3 style={{color: '#253D2C', marginBottom: '10px'}}>Account Information</h3>
              <p><strong>Account:</strong> {selectedEngagement.account.name}</p>
              <p><strong>Owner:</strong> {selectedEngagement.owner.name}</p>
              <p><strong>Status:</strong> <span style={{color: selectedEngagement.health === 'GREEN' ? '#28a745' : selectedEngagement.health === 'YELLOW' ? '#ffc107' : '#dc3545'}}>{selectedEngagement.status}</span></p>
              <p><strong>Health:</strong> <span style={{color: selectedEngagement.health === 'GREEN' ? '#28a745' : selectedEngagement.health === 'YELLOW' ? '#ffc107' : '#dc3545'}}>{selectedEngagement.health}</span></p>
            </div>
            <div>
              <h3 style={{color: '#253D2C', marginBottom: '10px'}}>Timeline</h3>
              <p><strong>Start Date:</strong> {selectedEngagement.start_date}</p>
              <p><strong>Target Launch:</strong> {selectedEngagement.target_launch_date}</p>
              <p><strong>Progress:</strong> {selectedEngagement.percent_complete}%</p>
              <p><strong>Priority:</strong> {selectedEngagement.priority}/5</p>
            </div>
          </div>
        </div>

        {/* Milestone Management */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '20px', 
          marginTop: '20px' 
        }}>
          <h2 style={{ 
            margin: '0 0 20px 0', 
            color: '#253D2C',
            fontFamily: 'Trebuchet MS, Arial, sans-serif'
          }}>
            Milestone Phases
          </h2>
          <SimpleKanbanView milestones={selectedEngagement.milestones} />
        </div>
      </div>
    )
  }

  // Show dashboard based on role
  if (user.role === 'REP') {
    return (
      <RepDashboardView
        engagements={engagements}
        user={user}
        onSelectEngagement={setSelectedEngagementId}
      />
    )
  }

  // Manager/Admin view - show all engagements across reps
  return (
    <ManagerDashboardView
      engagements={engagements}
      user={user}
      onSelectEngagement={setSelectedEngagementId}
      isAdmin={isAdmin}
    />
  )
}


function SimpleLoginForm() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const login = useAuthStore(state => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Mock authentication for demo
      if (email && password) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Get user from our data or create mock user
        const existingUser = getUserByEmail(email)
        const mockUser = existingUser || {
          id: `temp-${Date.now()}`,
          email,
          name: email.split('@')[0],
          role: determineRoleFromEmail(email),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        login(mockUser)
      } else {
        setError('Please enter email and password')
      }
    } catch {
      setError('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          Kanban Project Manager
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              placeholder="Enter your email"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              padding: '10px', 
              borderRadius: '4px', 
              marginBottom: '20px' 
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ 
          marginTop: '20px', 
          fontSize: '14px', 
          color: '#666', 
          textAlign: 'center' 
        }}>
          <p>Demo accounts:</p>
          <p>chris@company.com (Admin)</p>
          <p>derek@company.com (Manager)</p>
          <p>rolando@company.com (Rep)</p>
          <p>amanda@company.com (Rep)</p>
          <p>lisa@company.com (Rep)</p>
          <p>josh@company.com (Rep)</p>
          <p>steph@company.com (Rep)</p>
        </div>
      </div>
    </div>
  )
}

function App() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <SimpleLoginForm />
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ borderBottom: '1px solid #ddd', paddingBottom: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Kanban Project Manager</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span>Welcome, {user?.name || user?.email}</span>
            <span style={{ 
              backgroundColor: user?.role === 'ADMIN' ? '#dc3545' : user?.role === 'MANAGER' ? '#ffc107' : '#28a745',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {user?.role}
            </span>
            <button 
              onClick={() => useAuthStore.getState().logout()}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <NavigationMenu user={user} />
      </header>

      <main>
        <AppContent user={user} />
      </main>
    </div>
  )
}

function NavigationMenu({ user }: { user: any }) {
  const [activeView, setActiveView] = React.useState('dashboard')

  const navItems = React.useMemo(() => {
    const items = [
      { id: 'dashboard', label: '📊 Dashboard', roles: ['REP', 'MANAGER', 'ADMIN'] },
      { id: 'engagements', label: '📝 My Engagements', roles: ['REP', 'MANAGER', 'ADMIN'] },
    ]

    if (user.role === 'MANAGER' || user.role === 'ADMIN') {
      items.push({ id: 'team', label: '👥 All Reps', roles: ['MANAGER', 'ADMIN'] })
    }

    if (user.role === 'ADMIN') {
      items.push({ id: 'admin', label: '⚙️ Administration', roles: ['ADMIN'] })
    }

    return items.filter(item => item.roles.includes(user.role))
  }, [user.role])

  return (
    <nav style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            style={{
              padding: '10px 20px',
              backgroundColor: activeView === item.id ? '#007bff' : '#f8f9fa',
              color: activeView === item.id ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      {/* Pass activeView to parent */}
      <div style={{ display: 'none' }}>{window.currentView = activeView}</div>
    </nav>
  )
}

function AppContent({ user }: { user: any }) {
  const [currentView, setCurrentView] = React.useState('dashboard')
  
  // Listen for view changes from NavigationMenu
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (window.currentView && window.currentView !== currentView) {
        setCurrentView(window.currentView)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [currentView])

  switch (currentView) {
    case 'engagements':
      return <EngagementsView user={user} />
    
    case 'team':
      return <TeamManagement user={user} />
    
    case 'admin':
      return <AdminPanel user={user} />
    
    default:
      return <Dashboard user={user} />
  }
}

function Dashboard({ user }: { user: any }) {
  return (
    <div style={{ padding: '20px' }}>
      <h2>📊 Dashboard Overview</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px' }}>
          <h3>👤 Your Profile</h3>
          <p><strong>Name:</strong> {user?.name || 'User'}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
          <p><strong>Status:</strong> ✅ Active</p>
        </div>
        
        <div style={{ backgroundColor: '#f3e5f5', padding: '20px', borderRadius: '8px' }}>
          <h3>📈 Engagement Stats</h3>
          <p><strong>Active Engagements:</strong> 3</p>
          <p><strong>Completed:</strong> 2</p>
          <p><strong>Total Milestones:</strong> 12</p>
          <p><strong>Overdue Items:</strong> 1</p>
        </div>
        
        <div style={{ backgroundColor: '#e8f5e8', padding: '20px', borderRadius: '8px' }}>
          <h3>🚀 Recent Activity</h3>
          <p>• Completed milestone: Design Review</p>
          <p>• Started new engagement: ABC Corp</p>
          <p>• Updated deliverable status</p>
          <p>• Assigned new milestone</p>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>🎯 Available Features</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <h4>📝 My Engagements</h4>
            <p>Client projects with milestone tracking</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <h4>📋 Milestone Kanban</h4>
            <p>Drag & drop milestone management</p>
          </div>
          {(user.role === 'MANAGER' || user.role === 'ADMIN') && (
            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <h4>👥 All Reps</h4>
              <p>View all rep engagements rollup</p>
            </div>
          )}
          {user.role === 'ADMIN' && (
            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <h4>⚙️ Administration</h4>
              <p>User management & system config</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EngagementsView({ user }: { user: any }) {
  return <CompleteEngagementSystem user={user} />
}


function EngagementDetail({ engagement, onBack }: { engagement: any, onBack: () => void }) {
  const [milestones, setMilestones] = React.useState(engagement.milestones)

  const columns = [
    { id: 'TODO', title: '📋 To Do', color: '#e3f2fd' },
    { id: 'IN_PROGRESS', title: '🚀 In Progress', color: '#fff3e0' },
    { id: 'REVIEW', title: '👀 Review', color: '#f3e5f5' },
    { id: 'DONE', title: '✅ Done', color: '#e8f5e8' }
  ]

  const getMilestonesByStage = (stage: string) => 
    milestones.filter((m: any) => m.stage === stage)

  const moveMilestone = (milestoneId: string, newStage: string) => {
    setMilestones(milestones.map((m: any) => 
      m.id === milestoneId ? { ...m, stage: newStage } : m
    ))
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <button 
          onClick={onBack}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        <div>
          <h2 style={{ margin: 0 }}>{engagement.title}</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>Client: {engagement.client}</p>
        </div>
      </div>

      {/* Milestone Kanban Board */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '20px',
        minHeight: '70vh'
      }}>
        {columns.map(column => (
          <div
            key={column.id}
            style={{
              backgroundColor: column.color,
              borderRadius: '8px',
              padding: '15px',
              minHeight: '500px'
            }}
          >
            <h3 style={{ 
              margin: '0 0 15px 0', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              {column.title}
              <span style={{
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '12px'
              }}>
                {getMilestonesByStage(column.id).length}
              </span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {getMilestonesByStage(column.id).map((milestone: any) => (
                <div
                  key={milestone.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    padding: '15px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    cursor: 'pointer'
                  }}
                >
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                    {milestone.title}
                  </h4>
                  <div style={{ fontSize: '11px', color: '#888' }}>
                    📅 Due: {milestone.dueDate}
                  </div>
                  
                  {/* Move buttons */}
                  <div style={{ marginTop: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {columns.filter(col => col.id !== milestone.stage).map(targetCol => (
                      <button
                        key={targetCol.id}
                        onClick={() => moveMilestone(milestone.id, targetCol.id)}
                        style={{
                          fontSize: '10px',
                          padding: '4px 8px',
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #ddd',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        → {targetCol.title.split(' ')[1]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TeamManagement({ user }: { user: any }) {
  return (
    <div style={{ padding: '20px' }}>
      <h2>👥 Team Management</h2>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <p>Team management features for {user.role} role.</p>
        <p>Manage team members, assign roles, and track performance.</p>
      </div>
    </div>
  )
}

function AdminPanel({ user }: { user: any }) {
  return (
    <div style={{ padding: '20px' }}>
      <h2>⚙️ Administration Panel</h2>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <p>Administrative features for {user.role} role.</p>
        <p>System configuration, user management, and security settings.</p>
      </div>
    </div>
  )
}

// Add to window for communication between components
declare global {
  interface Window {
    currentView: string
  }
}

// Simple Kanban view component
function SimpleKanbanView({ milestones }: { milestones: any[] }) {
  const stages = {
    'NOT_STARTED': { label: 'Not Started', color: '#f3f4f6' },
    'INITIAL_CALL': { label: 'Initial Call', color: '#fef3c7' },
    'WORKSHOP': { label: 'Workshop', color: '#dbeafe' },
    'COMPLETED': { label: 'Completed', color: '#d1fae5' }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
      {Object.entries(stages).map(([stageKey, stage]) => {
        const stageMilestones = milestones.filter(m => m.stage === stageKey)
        return (
          <div key={stageKey} style={{ 
            background: stage.color, 
            padding: '15px', 
            borderRadius: '8px',
            minHeight: '200px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#374151' }}>{stage.label} ({stageMilestones.length})</h4>
            {stageMilestones.map(milestone => (
              <div key={milestone.id} style={{
                background: 'white',
                padding: '8px',
                margin: '5px 0',
                borderRadius: '4px',
                fontSize: '12px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {milestone.template?.name || 'Milestone'}
                </div>
                {milestone.due_date && (
                  <div style={{ color: '#6b7280', fontSize: '10px' }}>
                    Due: {milestone.due_date}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// Rep Dashboard View
function RepDashboardView({ engagements, user, onSelectEngagement }: {
  engagements: EngagementWithMilestones[]
  user: any
  onSelectEngagement: (id: string) => void
}) {
  return (
    <div style={{ background: '#68BA7F', minHeight: '100vh', padding: '20px' }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '20px', 
        marginBottom: '20px' 
      }}>
        <h1 style={{ 
          margin: 0, 
          color: '#253D2C',
          fontFamily: 'Trebuchet MS, Arial, sans-serif'
        }}>
          {user.name}'s Dashboard
        </h1>
        <p style={{ 
          margin: '5px 0 0 0', 
          color: '#68BA7F',
          fontFamily: 'Trebuchet MS, Arial, sans-serif'
        }}>
          Your active engagements and milestones
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {engagements.map(engagement => (
          <div key={engagement.id} style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          onClick={() => onSelectEngagement(engagement.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#253D2C' }}>{engagement.account.name}</h3>
              <span style={{
                background: engagement.health === 'GREEN' ? '#d1fae5' : engagement.health === 'YELLOW' ? '#fef3c7' : '#fee2e2',
                color: engagement.health === 'GREEN' ? '#065f46' : engagement.health === 'YELLOW' ? '#92400e' : '#991b1b',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {engagement.health}
              </span>
            </div>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 10px 0' }}>
              Status: {engagement.status} | Progress: {engagement.percent_complete}%
            </p>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '0' }}>
              Due: {engagement.target_launch_date}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Manager Dashboard View  
function ManagerDashboardView({ engagements, user, onSelectEngagement, isAdmin = false }: {
  engagements: EngagementWithMilestones[]
  user: any
  onSelectEngagement: (id: string) => void
  isAdmin?: boolean
}) {
  const repEngagements = React.useMemo(() => {
    const repMap: Record<string, EngagementWithMilestones[]> = {}
    engagements.forEach(eng => {
      const repName = eng.owner.name
      if (!repMap[repName]) repMap[repName] = []
      repMap[repName].push(eng)
    })
    return repMap
  }, [engagements])

  const [selectedRep, setSelectedRep] = React.useState<string | null>(null)

  if (selectedRep && repEngagements[selectedRep]) {
    const selectedRepUser = userData.find(u => u.name === selectedRep)
    return (
      <RepDashboardView 
        engagements={repEngagements[selectedRep]}
        user={selectedRepUser || { name: selectedRep }}
        onSelectEngagement={onSelectEngagement}
      />
    )
  }

  return (
    <div style={{ background: '#68BA7F', minHeight: '100vh', padding: '20px' }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '20px', 
        marginBottom: '20px' 
      }}>
        <h1 style={{ 
          margin: 0, 
          color: '#253D2C',
          fontFamily: 'Trebuchet MS, Arial, sans-serif'
        }}>
          {isAdmin ? 'Admin' : 'Manager'} Dashboard - {user.name}
        </h1>
        <p style={{ 
          margin: '5px 0 0 0', 
          color: '#68BA7F',
          fontFamily: 'Trebuchet MS, Arial, sans-serif'
        }}>
          {isAdmin ? 'System administration and user management' : 'Overview of all team engagements'}
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <h3 style={{ color: '#253D2C', margin: '0 0 10px 0' }}>Total Engagements</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2E6F40' }}>{engagements.length}</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <h3 style={{ color: '#253D2C', margin: '0 0 10px 0' }}>Active Reps</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2E6F40' }}>{Object.keys(repEngagements).length}</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <h3 style={{ color: '#253D2C', margin: '0 0 10px 0' }}>In Progress</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2E6F40' }}>{engagements.filter(e => e.status === 'IN_PROGRESS').length}</div>
        </div>
        {isAdmin && (
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#253D2C', margin: '0 0 10px 0' }}>System Users</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2E6F40' }}>{userData.length}</div>
          </div>
        )}
      </div>

      {isAdmin && (
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '20px', 
          marginBottom: '20px' 
        }}>
          <h2 style={{ 
            margin: '0 0 20px 0', 
            color: '#253D2C',
            fontFamily: 'Trebuchet MS, Arial, sans-serif'
          }}>
            Admin Tools
          </h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button style={{
              background: '#2E6F40',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Trebuchet MS, Arial, sans-serif'
            }}>
              Add New User
            </button>
            <button style={{
              background: '#2E6F40',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Trebuchet MS, Arial, sans-serif'
            }}>
              Add New Engagement
            </button>
            <button style={{
              background: '#2E6F40',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Trebuchet MS, Arial, sans-serif'
            }}>
              Manage User Roles
            </button>
            <button style={{
              background: '#2E6F40',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Trebuchet MS, Arial, sans-serif'
            }}>
              System Settings
            </button>
          </div>
        </div>
      )}

      {/* Rep Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
        {Object.entries(repEngagements).map(([repName, repEngagements]) => (
          <div key={repName} style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          onClick={() => setSelectedRep(repName)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#253D2C' }}>{repName}</h3>
              <span style={{ color: '#68BA7F', fontSize: '14px' }}>Click to view →</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2E6F40' }}>{repEngagements.length}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Total</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2E6F40' }}>{repEngagements.filter(e => e.status === 'IN_PROGRESS').length}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Active</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2E6F40' }}>{repEngagements.filter(e => e.health === 'GREEN').length}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Healthy</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {repEngagements.slice(0, 3).map(engagement => (
                <div key={engagement.id} style={{
                  flex: 1,
                  padding: '8px',
                  background: '#f9fafb',
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: '#6b7280'
                }}>
                  {engagement.account.name.substring(0, 15)}...
                </div>
              ))}
              {repEngagements.length > 3 && (
                <div style={{ padding: '8px', fontSize: '10px', color: '#6b7280' }}>+{repEngagements.length - 3}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {selectedRep && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            onClick={() => setSelectedRep(null)}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ← Back to All Reps
          </button>
        </div>
      )}
    </div>
  )
}

export default App