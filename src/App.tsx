import React from 'react'
import { useAuthStore } from './store/authStore'

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
      </header>

      <main>
        <KanbanBoard user={user} />
      </main>
    </div>
  )
}

export default App