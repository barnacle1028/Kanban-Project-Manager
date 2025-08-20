import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { useEngagements } from '../../hooks/useEngagements'
import KanbanBoard from '../KanbanBoard'
import RepDashboard from '../RepDashboard'
import ManagerDashboard from '../ManagerDashboard'
import ErrorBoundary from '../ErrorBoundary'

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
      <h2>Administrator Dashboard</h2>
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