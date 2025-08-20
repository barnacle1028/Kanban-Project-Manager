import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { User } from '../../api/types'
import LoginForm from './LoginForm'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: User['role']
  requiredRoles?: User['role'][]
  fallback?: React.ReactNode
}

const ROLE_HIERARCHY = {
  'REP': 1,
  'MANAGER': 2,
  'ADMIN': 3
} as const

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredRoles,
  fallback 
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore()

  // Not authenticated - show login
  if (!isAuthenticated || !user) {
    return <LoginForm />
  }

  // Check role requirements
  if (requiredRole || requiredRoles) {
    const userRoleLevel = ROLE_HIERARCHY[user.role]
    
    // Check single required role (hierarchy-based)
    if (requiredRole) {
      const requiredLevel = ROLE_HIERARCHY[requiredRole]
      if (userRoleLevel < requiredLevel) {
        return fallback || <AccessDenied userRole={user.role} requiredRole={requiredRole} />
      }
    }
    
    // Check multiple allowed roles (exact match)
    if (requiredRoles && !requiredRoles.includes(user.role)) {
      return fallback || <AccessDenied userRole={user.role} requiredRoles={requiredRoles} />
    }
  }

  return <>{children}</>
}

interface AccessDeniedProps {
  userRole: User['role']
  requiredRole?: User['role']
  requiredRoles?: User['role'][]
}

function AccessDenied({ userRole, requiredRole, requiredRoles }: AccessDeniedProps) {
  const logout = useAuthStore(state => state.logout)

  const handleLogout = () => {
    logout()
    // Clear tokens
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
        <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>
          Access Denied
        </h2>
        <p style={{ marginBottom: '24px', color: '#6b7280' }}>
          You don't have permission to access this page.
        </p>
        <div style={{ 
          backgroundColor: '#f9fafb', 
          padding: '16px', 
          borderRadius: '6px',
          marginBottom: '24px'
        }}>
          <p><strong>Your Role:</strong> {userRole}</p>
          <p><strong>Required:</strong> {
            requiredRole ? `${requiredRole} or higher` :
            requiredRoles ? requiredRoles.join(', ') :
            'Higher privileges'
          }</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Switch Account
          </button>
        </div>
      </div>
    </div>
  )
}