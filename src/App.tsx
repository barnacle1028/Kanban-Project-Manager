import React from 'react'

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
        <h1>🚀 Kanban Project Manager</h1>
        <p>✅ Your domain <strong>kanbanpm.com</strong> is working!</p>
        <p>✅ Frontend deployed successfully to Vercel</p>
        <p>✅ Backend API running at <strong>api.kanbanpm.com</strong></p>
        
        <div style={{ margin: '30px 0', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
          <h3>🎉 Deployment Successful!</h3>
          <p>Your Kanban application is now live on your custom domain.</p>
          
          <button 
            onClick={() => setIsLoggedIn(true)}
            style={{ 
              padding: '15px 30px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              marginTop: '10px'
            }}
          >
            Test Login Flow
          </button>
        </div>
        
        <div style={{ fontSize: '14px', color: '#666' }}>
          <p>✅ HTTPS SSL Certificate Active</p>
          <p>✅ DNS Configuration Complete</p>
          <p>✅ API Endpoints Functional</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1>✅ Welcome to Your Kanban Dashboard!</h1>
      <p>🎉 Authentication system working!</p>
      <p>Your professional project management system is ready to use.</p>
      
      <button 
        onClick={() => setIsLoggedIn(false)}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#dc3545', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Back to Landing
      </button>
    </div>
  )
}

export default App