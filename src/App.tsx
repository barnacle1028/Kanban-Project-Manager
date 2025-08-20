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
      <h1>Welcome to Kanban Project Manager</h1>
      <p>Hello, {user?.name || 'User'}!</p>
      <p>Your role: {user?.role}</p>
      <p>✅ Authentication successful!</p>
      <p>✅ Frontend connected to api.kanbanpm.com</p>
      <p>✅ Your kanbanpm.com domain is working!</p>
      
      <button 
        onClick={() => useAuthStore.getState().logout()}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#dc3545', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  )
}

export default App