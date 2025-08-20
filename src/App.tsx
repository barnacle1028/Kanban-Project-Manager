import React from 'react'
import { useAuthStore } from './store/authStore'
import MainDashboard from './components/dashboards/MainDashboard'

// Import original engagement components
import RepDashboard from './components/RepDashboard'
import EngagementDetails from './components/EngagementDetails'
import KanbanBoard from './components/KanbanBoard'
import MilestoneManager from './components/MilestoneManager'

// Sample engagement data with your original structure
const mockEngagements = [
  {
    id: '1',
    name: 'ABC Corporation Website Redesign',
    assignedRep: 'rep',
    health: 'GREEN' as const,
    status: 'ACTIVE' as const,
    startDate: '2025-08-01',
    closeDate: '2025-09-15',
    salesType: 'Direct Sell' as const,
    speed: 'Fast' as const,
    crm: 'Salesforce' as const,
    soldBy: 'John Sales',
    seatCount: 50,
    hoursAlloted: 40,
    primaryContactName: 'Jane Smith',
    primaryContactEmail: 'jane@abccorp.com',
    linkedinLink: 'https://linkedin.com/in/janesmith',
    avazaLink: 'https://app.avaza.com/project/123',
    projectFolderLink: 'https://drive.google.com/folder/abc123',
    clientWebsiteLink: 'https://abccorp.com',
    addOnsPurchased: ['Meet', 'Deal'] as const,
    milestones: [
      {
        id: 'm1',
        name: 'Requirements Gathering',
        stage: 'COMPLETED' as const,
        owner: 'rep',
        dueDate: '2025-08-10',
        notPurchased: false,
        stageHistory: [
          { stage: 'COMPLETED' as const, date: '2025-08-09', note: 'Completed ahead of schedule' }
        ]
      },
      {
        id: 'm2', 
        name: 'Design Mockups',
        stage: 'WORKSHOP' as const,
        owner: 'rep',
        dueDate: '2025-08-20',
        notPurchased: false,
        stageHistory: [
          { stage: 'INITIAL_CALL' as const, date: '2025-08-15', note: 'Initial design call completed' }
        ]
      },
      {
        id: 'm3',
        name: 'Frontend Development', 
        stage: 'INITIAL_CALL' as const,
        owner: 'rep',
        dueDate: '2025-09-01',
        notPurchased: false,
        stageHistory: []
      },
      {
        id: 'm4',
        name: 'Testing & Launch',
        stage: 'NOT_STARTED' as const,
        owner: '',
        dueDate: '2025-09-15',
        notPurchased: false,
        stageHistory: []
      }
    ]
  },
  {
    id: '2',
    name: 'XYZ Industries CRM Implementation',
    assignedRep: 'rep',
    health: 'YELLOW' as const,
    status: 'ACTIVE' as const,
    startDate: '2025-08-15',
    closeDate: '2025-10-01',
    salesType: 'Channel' as const,
    speed: 'Medium' as const,
    crm: 'Hubspot' as const,
    soldBy: 'Sarah Sales',
    seatCount: 25,
    hoursAlloted: 60,
    primaryContactName: 'Bob Johnson',
    primaryContactEmail: 'bob@xyzind.com',
    linkedinLink: 'https://linkedin.com/in/bobjohnson',
    avazaLink: 'https://app.avaza.com/project/456',
    projectFolderLink: 'https://drive.google.com/folder/xyz456',
    clientWebsiteLink: 'https://xyzindustries.com',
    addOnsPurchased: ['Forecasting', 'AI Agents'] as const,
    milestones: [
      {
        id: 'm5',
        name: 'Discovery Workshop',
        stage: 'COMPLETED' as const,
        owner: 'rep',
        dueDate: '2025-08-25',
        notPurchased: false,
        stageHistory: [
          { stage: 'COMPLETED' as const, date: '2025-08-24', note: 'Workshop completed successfully' }
        ]
      },
      {
        id: 'm6',
        name: 'Data Migration Planning',
        stage: 'WORKSHOP' as const,
        owner: 'rep',
        dueDate: '2025-09-05',
        notPurchased: false,
        stageHistory: []
      },
      {
        id: 'm7',
        name: 'User Training',
        stage: 'NOT_STARTED' as const,
        owner: '',
        dueDate: '2025-09-20',
        notPurchased: false,
        stageHistory: []
      },
      {
        id: 'm8',
        name: 'Go Live Support',
        stage: 'NOT_STARTED' as const,
        owner: '',
        dueDate: '2025-10-01',
        notPurchased: false,
        stageHistory: []
      }
    ]
  }
]

function CompleteEngagementSystem({ user }: { user: any }) {
  const [selectedEngagementId, setSelectedEngagementId] = React.useState<string | null>(null)
  const [engagements, setEngagements] = React.useState(mockEngagements)
  const [musicEnabled, setMusicEnabled] = React.useState(false)

  const updateEngagement = (engagementId: string, updates: any) => {
    setEngagements(prev => prev.map(eng => 
      eng.id === engagementId ? { ...eng, ...updates } : eng
    ))
  }

  const updateMilestone = (engagementId: string, milestoneId: string, updates: any) => {
    setEngagements(prev => prev.map(eng => {
      if (eng.id === engagementId) {
        return {
          ...eng,
          milestones: eng.milestones.map(m => 
            m.id === milestoneId ? { ...m, ...updates } : m
          )
        }
      }
      return eng
    }))
  }

  const addMilestone = (engagementId: string, milestone: any) => {
    setEngagements(prev => prev.map(eng => {
      if (eng.id === engagementId) {
        return {
          ...eng,
          milestones: [...eng.milestones, { ...milestone, id: `custom-${Date.now()}` }]
        }
      }
      return eng
    }))
  }

  const removeMilestone = (engagementId: string, milestoneId: string) => {
    setEngagements(prev => prev.map(eng => {
      if (eng.id === engagementId) {
        return {
          ...eng,
          milestones: eng.milestones.filter(m => m.id !== milestoneId)
        }
      }
      return eng
    }))
  }

  const selectedEngagement = selectedEngagementId 
    ? engagements.find(e => e.id === selectedEngagementId)
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
        <EngagementDetails 
          engagement={selectedEngagement}
          onEngagementChange={(updates) => updateEngagement(selectedEngagement.id, updates)}
        />

        {/* Milestone Manager */}
        <MilestoneManager
          milestones={selectedEngagement.milestones}
          onAdd={(milestone) => addMilestone(selectedEngagement.id, milestone)}
          onRemove={(milestoneId) => removeMilestone(selectedEngagement.id, milestoneId)}
          onUpdate={(milestoneId, updates) => updateMilestone(selectedEngagement.id, milestoneId, updates)}
        />

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
          <KanbanBoard
            engagement={selectedEngagement}
            onMilestoneOwnerChange={(milestoneId, owner) => 
              updateMilestone(selectedEngagement.id, milestoneId, { owner })
            }
            onMilestoneStageChange={(milestoneId, stage) => 
              updateMilestone(selectedEngagement.id, milestoneId, { stage })
            }
            onMilestoneNotPurchasedChange={(milestoneId, notPurchased) =>
              updateMilestone(selectedEngagement.id, milestoneId, { notPurchased })
            }
            musicEnabled={musicEnabled}
            onMusicToggle={setMusicEnabled}
          />
        </div>
      </div>
    )
  }

  // Show dashboard based on role
  if (user.role === 'REP') {
    return (
      <RepDashboard
        engagements={engagements}
        repName={user.email.split('@')[0]}
        onSelectEngagement={setSelectedEngagementId}
      />
    )
  }

  // Manager/Admin view - show all engagements across reps
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
          All Rep Engagements - {user.role} View
        </h1>
        <p style={{ 
          margin: '5px 0 0 0', 
          color: '#68BA7F',
          fontFamily: 'Trebuchet MS, Arial, sans-serif'
        }}>
          Overview of all representative engagements
        </p>
      </div>

      <RepDashboard
        engagements={engagements}
        repName="All Reps"
        onSelectEngagement={setSelectedEngagementId}
      />
    </div>
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
        
        // Mock user data
        const mockUser = {
          id: '1',
          email,
          name: email.split('@')[0],
          role: email.includes('admin') ? 'ADMIN' : email.includes('manager') ? 'MANAGER' : 'REP'
        }
        
        login(mockUser)
      } else {
        setError('Please enter email and password')
      }
    } catch (err) {
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
          <p>admin@kanbanpm.com (Admin)</p>
          <p>manager@kanbanpm.com (Manager)</p>
          <p>rep@kanbanpm.com (Rep)</p>
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

function EngagementsDashboard({ user }: { user: any }) {
  // Mock engagement data based on user role
  const mockEngagements = React.useMemo(() => {
    if (user.role === 'REP') {
      return [
        {
          id: '1',
          title: 'ABC Corp Website Redesign',
          client: 'ABC Corporation',
          status: 'IN_PROGRESS',
          startDate: '2025-08-01',
          endDate: '2025-09-15',
          assignedRep: user.email.split('@')[0],
          milestones: [
            { id: '1', title: 'Requirements Gathering', stage: 'DONE', dueDate: '2025-08-10' },
            { id: '2', title: 'Design Mockups', stage: 'IN_PROGRESS', dueDate: '2025-08-20' },
            { id: '3', title: 'Development', stage: 'TODO', dueDate: '2025-09-01' },
            { id: '4', title: 'Testing & Launch', stage: 'TODO', dueDate: '2025-09-15' },
          ]
        },
        {
          id: '2',
          title: 'XYZ Marketing Campaign',
          client: 'XYZ Industries',
          status: 'PLANNING',
          startDate: '2025-08-15',
          endDate: '2025-10-01',
          assignedRep: user.email.split('@')[0],
          milestones: [
            { id: '5', title: 'Market Research', stage: 'IN_PROGRESS', dueDate: '2025-08-25' },
            { id: '6', title: 'Strategy Development', stage: 'TODO', dueDate: '2025-09-05' },
            { id: '7', title: 'Creative Assets', stage: 'TODO', dueDate: '2025-09-20' },
            { id: '8', title: 'Campaign Launch', stage: 'TODO', dueDate: '2025-10-01' },
          ]
        }
      ]
    } else {
      // Manager/Admin sees multiple reps' engagements
      return [
        {
          id: '1',
          title: 'ABC Corp Website Redesign',
          client: 'ABC Corporation',
          status: 'IN_PROGRESS',
          assignedRep: 'john',
          milestones: [{ id: '1', title: 'Design Mockups', stage: 'IN_PROGRESS', dueDate: '2025-08-20' }]
        },
        {
          id: '2',
          title: 'XYZ Marketing Campaign',
          client: 'XYZ Industries',
          status: 'PLANNING',
          assignedRep: 'sarah',
          milestones: [{ id: '2', title: 'Market Research', stage: 'IN_PROGRESS', dueDate: '2025-08-25' }]
        },
        {
          id: '3',
          title: 'DEF Mobile App',
          client: 'DEF Solutions',
          status: 'IN_PROGRESS',
          assignedRep: 'mike',
          milestones: [{ id: '3', title: 'UI Development', stage: 'IN_PROGRESS', dueDate: '2025-08-30' }]
        }
      ]
    }
  }, [user.role, user.email])

  const [selectedEngagement, setSelectedEngagement] = React.useState<string | null>(null)

  if (selectedEngagement && user.role === 'REP') {
    const engagement = mockEngagements.find(e => e.id === selectedEngagement)
    if (engagement) {
      return <EngagementDetail engagement={engagement} onBack={() => setSelectedEngagement(null)} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING': return '#ffc107'
      case 'IN_PROGRESS': return '#007bff'
      case 'COMPLETED': return '#28a745'
      case 'ON_HOLD': return '#dc3545'
      default: return '#6c757d'
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>{user.role === 'REP' ? '📝 My Engagements' : '👥 All Rep Engagements'}</h2>
        {user.role === 'REP' && (
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            ➕ New Engagement
          </button>
        )}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: user.role === 'REP' ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '20px' 
      }}>
        {mockEngagements.map(engagement => (
          <div
            key={engagement.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #e1e5e9',
              cursor: user.role === 'REP' ? 'pointer' : 'default'
            }}
            onClick={() => user.role === 'REP' && setSelectedEngagement(engagement.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>{engagement.title}</h3>
              <span style={{
                backgroundColor: getStatusColor(engagement.status),
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {engagement.status.replace('_', ' ')}
              </span>
            </div>
            
            <p style={{ margin: '0 0 10px 0', color: '#666' }}>
              <strong>Client:</strong> {engagement.client}
            </p>
            
            {user.role !== 'REP' && (
              <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                <strong>Rep:</strong> {engagement.assignedRep}
              </p>
            )}

            <div style={{ marginTop: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>📋 Milestones Progress</h4>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {engagement.milestones?.slice(0, 4).map(milestone => (
                  <span
                    key={milestone.id}
                    style={{
                      backgroundColor: milestone.stage === 'DONE' ? '#28a745' : 
                                      milestone.stage === 'IN_PROGRESS' ? '#ffc107' : '#e9ecef',
                      color: milestone.stage === 'TODO' ? '#495057' : 'white',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}
                  >
                    {milestone.title}
                  </span>
                ))}
                {engagement.milestones && engagement.milestones.length > 4 && (
                  <span style={{ fontSize: '10px', color: '#666' }}>
                    +{engagement.milestones.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {user.role === 'REP' && (
              <div style={{ marginTop: '15px', textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: '#007bff' }}>
                  Click to view milestones →
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
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

export default App