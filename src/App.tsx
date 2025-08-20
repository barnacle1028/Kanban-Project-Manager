import React from 'react'
import { useAuthStore } from './store/authStore'
import { useNotifications } from './store/uiStore'
import ProtectedRoute from './components/auth/ProtectedRoute'
import UserMenu from './components/auth/UserMenu'
import LoginForm from './components/auth/LoginForm'
import MainDashboard from './components/dashboards/MainDashboard'
import AdminPanel from './components/admin/AdminPanel'
import NotificationCenter from './components/ui/NotificationCenter'
import ErrorBoundary from './components/ErrorBoundary'
import styles from './styles/App.module.css'

function App() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <LoginForm />
  }

  return (
    <ErrorBoundary>
      <div className={styles.app}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.logo}>
              <h1>Kanban Engagement Manager</h1>
            </div>
            <nav className={styles.navigation}>
              <NavigationMenu user={user} />
            </nav>
            <div className={styles.headerActions}>
              <UserMenu />
            </div>
          </div>
        </header>

        <main className={styles.main}>
          <AppRoutes />
        </main>

        <NotificationCenter />
      </div>
    </ErrorBoundary>
  )
}

function NavigationMenu({ user }: { user: any }) {
  const [activeView, setActiveView] = React.useState('dashboard')

  const navItems = React.useMemo(() => {
    const items = [
      { id: 'dashboard', label: 'Dashboard', roles: ['REP', 'MANAGER', 'ADMIN'] },
      { id: 'engagements', label: 'Engagements', roles: ['REP', 'MANAGER', 'ADMIN'] },
    ]

    if (user.role === 'MANAGER' || user.role === 'ADMIN') {
      items.push({ id: 'team', label: 'Team Management', roles: ['MANAGER', 'ADMIN'] })
    }

    if (user.role === 'ADMIN') {
      items.push({ id: 'admin', label: 'Administration', roles: ['ADMIN'] })
    }

    return items.filter(item => item.roles.includes(user.role))
  }, [user.role])

  return (
    <nav className={styles.nav}>
      {navItems.map(item => (
        <button
          key={item.id}
          className={`${styles.navButton} ${activeView === item.id ? styles.navButtonActive : ''}`}
          onClick={() => setActiveView(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}

function AppRoutes() {
  return (
    <ProtectedRoute>
      <MainDashboard />
    </ProtectedRoute>
  )
}

function ManagerFeatures() {
  return (
    <div className={styles.managerFeatures}>
      <h2>Manager Dashboard</h2>
      <p>Team management and oversight features available here.</p>
      {/* Add manager-specific components here */}
    </div>
  )
}

function NotificationCenter() {
  const { notifications, removeNotification } = useNotifications()

  return (
    <div className={styles.notificationCenter}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`${styles.notification} ${styles[`notification${notification.type.charAt(0).toUpperCase()}${notification.type.slice(1)}`]}`}
        >
          <div className={styles.notificationContent}>
            <h4>{notification.title}</h4>
            {notification.message && <p>{notification.message}</p>}
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className={styles.notificationClose}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default App