import React, { useState } from 'react'
import EngagementAdminContent from '../EngagementAdminContent'
import AccountManagementAdmin from './AccountManagementAdmin'
import type { Engagement, Rep } from '../../types'

interface TabbedManagementInterfaceProps {
  engagements: Engagement[]
  reps: Rep[]
  onAddEngagement: (engagement: Omit<Engagement, 'id' | 'milestones'>) => void
  onUpdateEngagement: (id: string, updates: Partial<Engagement>) => void
  onDeleteEngagement: (id: string) => void
  onBackToManager: () => void
}

export default function TabbedManagementInterface({
  engagements,
  reps,
  onAddEngagement,
  onUpdateEngagement,
  onDeleteEngagement,
  onBackToManager
}: TabbedManagementInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'engagements' | 'accounts'>('engagements')

  return (
    <div style={{
      maxWidth: '1600px',
      margin: '0 auto',
      padding: '16px 20px',
      background: '#68BA7F',
      minHeight: '100vh'
    }}>
      {/* Header with Tabs */}
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h1 style={{
            margin: '0',
            fontSize: '24px',
            fontWeight: '600',
            color: '#253D2C',
            fontFamily: 'Trebuchet MS, Arial, sans-serif'
          }}>
            Business Management
          </h1>
          <button
            onClick={onBackToManager}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              color: 'white',
              background: '#68BA7F',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Trebuchet MS, Arial, sans-serif',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2E6F40'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#68BA7F'
            }}
          >
            ← Back to Manager Dashboard
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '4px',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '8px'
        }}>
          <button
            onClick={() => setActiveTab('engagements')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'engagements' ? '#2E6F40' : 'transparent',
              color: activeTab === 'engagements' ? 'white' : '#253D2C',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'Trebuchet MS, Arial, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'engagements') {
                e.currentTarget.style.background = '#f8fafc'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'engagements') {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            📝 Engagement Management
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'accounts' ? '#2E6F40' : 'transparent',
              color: activeTab === 'accounts' ? 'white' : '#253D2C',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'Trebuchet MS, Arial, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'accounts') {
                e.currentTarget.style.background = '#f8fafc'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'accounts') {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            🏢 Account Management
          </button>
        </div>

        <p style={{
          margin: '0',
          fontSize: '14px',
          color: '#68BA7F',
          fontFamily: 'Trebuchet MS, Arial, sans-serif'
        }}>
          {activeTab === 'engagements' 
            ? 'Manage all engagements and create new ones'
            : 'Manage client accounts and business relationships'
          }
        </p>
      </div>

      {/* Tab Content */}
      <div style={{ background: 'transparent' }}>
        {activeTab === 'engagements' ? (
          <div style={{ background: 'transparent' }}>
            <EngagementAdminContent
              engagements={engagements}
              reps={reps}
              onAddEngagement={onAddEngagement}
              onUpdateEngagement={onUpdateEngagement}
              onDeleteEngagement={onDeleteEngagement}
            />
          </div>
        ) : (
          <div style={{ background: 'transparent' }}>
            <AccountManagementAdmin />
          </div>
        )}
      </div>
    </div>
  )
}