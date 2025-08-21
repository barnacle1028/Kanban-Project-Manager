import React, { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useEngagements } from '../../hooks/useEngagements'
import KanbanBoard from '../KanbanBoard'
import RepDashboard from '../RepDashboard'
import ManagerDashboard from '../ManagerDashboard'
import ErrorBoundary from '../ErrorBoundary'
import UserRoleManagement from '../admin/UserRoleManagement'
import UserManagement from '../admin/UserManagement'
import { Settings, Users, Shield, Plus } from 'lucide-react'
import { hasPermission, canAccessDashboard } from '../../utils/permissionUtils'

export default function MainDashboard() {
  const { user } = useAuthStore()

  if (!user) return null

  return (
    <ErrorBoundary>
      <div>
        {user.role === 'REP' && <RepDashboard />}
        {user.role === 'MANAGER' && <ManagerDashboard />}
        {user.role === 'ADMIN' && <AdminDashboard />}
      </div>
    </ErrorBoundary>
  )
}

function AdminDashboard() {
  const { data: engagements, isLoading, error } = useEngagements()
  const { user } = useAuthStore()
  const [showUserRoleManagement, setShowUserRoleManagement] = useState(false)
  const [showUserManagement, setShowUserManagement] = useState(false)

  // Check if user has admin capabilities
  // For now using simple role-based checks, can be enhanced with permission system later
  const hasAdminAccess = user?.role === 'ADMIN'
  const canManageUsers = user?.role === 'ADMIN' // Only full admins can manage users
  const canManageRoles = user?.role === 'ADMIN' // Only full admins can manage roles
  
  // Future enhancement: Use permission-based checks when user object includes role permissions
  // const hasAdminAccess = canAccessDashboard(user as UserWithRole, 'Admin')
  // const canManageUsers = hasPermission(user as UserWithRole, 'can_create_users')
  // const canManageRoles = hasPermission(user as UserWithRole, 'can_manage_user_roles')

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#dc2626' }}>
        <p>Error loading dashboard: {error.message}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Administrator Dashboard</h2>
        
        {/* Admin Tools Section */}
        {hasAdminAccess ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {canManageUsers && (
                <button
                  onClick={() => setShowUserManagement(true)}
                  className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
                >
                  <Users className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-medium text-green-900">User Management</div>
                    <div className="text-sm text-green-700">Add, edit, and manage users</div>
                  </div>
                </button>
              )}
              
              {canManageRoles && (
                <button
                  onClick={() => setShowUserRoleManagement(true)}
                  className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
                >
                  <Shield className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-900">Role Management</div>
                    <div className="text-sm text-blue-700">Create and assign user roles</div>
                  </div>
                </button>
              )}
              
              {canManageUsers && (
                <button
                  onClick={() => setShowUserManagement(true)}
                  className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
                >
                  <Plus className="w-6 h-6 text-purple-600" />
                  <div>
                    <div className="font-medium text-purple-900">Add New User</div>
                    <div className="text-sm text-purple-700">Create a new user account</div>
                  </div>
                </button>
              )}
              
              {canManageRoles && (
                <button
                  onClick={() => setShowUserRoleManagement(true)}
                  className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-left"
                >
                  <Settings className="w-6 h-6 text-orange-600" />
                  <div>
                    <div className="font-medium text-orange-900">System Settings</div>
                    <div className="text-sm text-orange-700">Configure system settings</div>
                  </div>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-3">⚠️</div>
              <div>
                <h3 className="text-lg font-medium text-yellow-800">Admin Access Required</h3>
                <p className="text-yellow-700">You need administrator privileges to access admin tools.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <DashboardCard
          title="Total Engagements"
          value={engagements?.length || 0}
          trend="+12%"
          color="#4f46e5"
        />
        <DashboardCard
          title="Active Projects"
          value={engagements?.filter(e => e.status === 'IN_PROGRESS').length || 0}
          trend="+5%"
          color="#059669"
        />
        <DashboardCard
          title="Completed This Month"
          value={engagements?.filter(e => e.status === 'COMPLETED').length || 0}
          trend="+18%"
          color="#dc2626"
        />
        <DashboardCard
          title="Team Members"
          value="24"
          trend="+3%"
          color="#7c3aed"
        />
      </div>
      
      {engagements && <KanbanBoard engagements={engagements} />}

      {/* User Management Modals - Only show if user has permissions */}
      {showUserRoleManagement && canManageRoles && (
        <UserRoleManagement onClose={() => setShowUserRoleManagement(false)} />
      )}
      
      {showUserManagement && canManageUsers && (
        <UserManagement onClose={() => setShowUserManagement(false)} />
      )}
    </div>
  )
}

interface DashboardCardProps {
  title: string
  value: string | number
  trend: string
  color: string
}

function DashboardCard({ title, value, trend, color }: DashboardCardProps) {
  return (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: `3px solid ${color}20`
    }}>
      <h3 style={{ 
        margin: '0 0 10px 0', 
        fontSize: '14px', 
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        {title}
      </h3>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: color 
        }}>
          {value}
        </span>
        <span style={{ 
          fontSize: '12px', 
          color: trend.startsWith('+') ? '#059669' : '#dc2626',
          fontWeight: '500'
        }}>
          {trend}
        </span>
      </div>
    </div>
  )
}