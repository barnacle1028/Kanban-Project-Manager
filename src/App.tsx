import React from 'react'
import { useAuthStore } from './store/authStore'
import MainDashboard from './components/dashboards/MainDashboard'

// Sample Kanban data
const initialCards = [
  { id: '1', title: 'Set up project structure', description: 'Initialize repository and basic setup', status: 'done', priority: 'high', assignee: 'admin', dueDate: '2025-08-15' },
  { id: '2', title: 'Design user authentication', description: 'Implement secure login system', status: 'done', priority: 'high', assignee: 'admin', dueDate: '2025-08-18' },
  { id: '3', title: 'Create Kanban board UI', description: 'Build the main board interface', status: 'in-progress', priority: 'high', assignee: 'manager', dueDate: '2025-08-20' },
  { id: '4', title: 'Add drag & drop functionality', description: 'Implement card movement between columns', status: 'todo', priority: 'medium', assignee: 'rep', dueDate: '2025-08-22' },
  { id: '5', title: 'User management panel', description: 'Admin interface for managing users', status: 'todo', priority: 'medium', assignee: 'admin', dueDate: '2025-08-25' },
  { id: '6', title: 'API integration', description: 'Connect frontend to backend services', status: 'in-progress', priority: 'high', assignee: 'manager', dueDate: '2025-08-21' },
  { id: '7', title: 'Testing and deployment', description: 'Quality assurance and production deployment', status: 'todo', priority: 'low', assignee: 'rep', dueDate: '2025-08-30' },
]

function KanbanBoard({ user }: { user: any }) {
  const [cards, setCards] = React.useState(initialCards)
  const [newCardTitle, setNewCardTitle] = React.useState('')
  const [selectedColumn, setSelectedColumn] = React.useState('todo')

  const columns = [
    { id: 'todo', title: '📋 To Do', color: '#e3f2fd' },
    { id: 'in-progress', title: '🚀 In Progress', color: '#fff3e0' },
    { id: 'review', title: '👀 Review', color: '#f3e5f5' },
    { id: 'done', title: '✅ Done', color: '#e8f5e8' }
  ]

  const getCardsByStatus = (status: string) => 
    cards.filter(card => card.status === status)

  const addNewCard = () => {
    if (!newCardTitle.trim()) return
    
    const newCard = {
      id: Date.now().toString(),
      title: newCardTitle,
      description: 'New task description',
      status: selectedColumn,
      priority: 'medium',
      assignee: user.email.split('@')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
    
    setCards([...cards, newCard])
    setNewCardTitle('')
  }

  const moveCard = (cardId: string, newStatus: string) => {
    setCards(cards.map(card => 
      card.id === cardId ? { ...card, status: newStatus } : card
    ))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff6b6b'
      case 'medium': return '#feca57'
      case 'low': return '#48dbfb'
      default: return '#ddd'
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Add New Card Section */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>➕ Add New Task</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            placeholder="Enter task title..."
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            onKeyPress={(e) => e.key === 'Enter' && addNewCard()}
          />
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            {columns.map(col => (
              <option key={col.id} value={col.id}>{col.title}</option>
            ))}
          </select>
          <button
            onClick={addNewCard}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
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
                {getCardsByStatus(column.id).length}
              </span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {getCardsByStatus(column.id).map(card => (
                <div
                  key={card.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    padding: '15px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    border: `3px solid ${getPriorityColor(card.priority)}`
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
                    {card.title}
                  </h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666' }}>
                    {card.description}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                    <span style={{ 
                      backgroundColor: getPriorityColor(card.priority),
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '10px'
                    }}>
                      {card.priority.toUpperCase()}
                    </span>
                    <span style={{ color: '#888' }}>
                      👤 {card.assignee}
                    </span>
                  </div>
                  
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#888' }}>
                    📅 Due: {card.dueDate}
                  </div>

                  {/* Quick Move Buttons */}
                  <div style={{ marginTop: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {columns.filter(col => col.id !== card.status).map(targetCol => (
                      <button
                        key={targetCol.id}
                        onClick={() => moveCard(card.id, targetCol.id)}
                        style={{
                          fontSize: '10px',
                          padding: '4px 8px',
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #ddd',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                        title={`Move to ${targetCol.title}`}
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

      {/* Statistics Footer */}
      <div style={{ 
        marginTop: '20px', 
        backgroundColor: 'white', 
        padding: '15px', 
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{cards.length}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Total Tasks</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
            {getCardsByStatus('done').length}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Completed</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
            {getCardsByStatus('in-progress').length}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>In Progress</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
            {cards.filter(c => c.priority === 'high').length}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>High Priority</div>
        </div>
      </div>
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
  return <EngagementsDashboard user={user} />
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