import React from 'react'
import { useAuthStore } from './store/authStore'
import LoginForm from './components/auth/LoginForm'

function App() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <LoginForm />
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
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <h2>🎉 Kanban Application Ready!</h2>
          <p>✅ Authentication Working</p>
          <p>✅ User Role: {user?.role}</p>
          <p>✅ API Connected: api.kanbanpm.com</p>
          
          <div style={{ 
            marginTop: '30px', 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            maxWidth: '600px',
            margin: '30px auto'
          }}>
            <h3>Next: Kanban Board Features</h3>
            <p>Your authentication system is working! Ready to add:</p>
            <ul style={{ textAlign: 'left', margin: '15px 0' }}>
              <li>📋 Project boards and cards</li>
              <li>🔀 Drag & drop functionality</li>
              <li>👥 Team management</li>
              <li>📊 Progress tracking</li>
              <li>⚙️ Admin panel</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App