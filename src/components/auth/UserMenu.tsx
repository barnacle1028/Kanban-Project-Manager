import React, { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useNotifications } from '../../store/uiStore'
import styles from './UserMenu.module.css'

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuthStore()
  const { addNotification } = useNotifications()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    
    addNotification({
      type: 'info',
      title: 'Logged out',
      message: 'You have been successfully logged out'
    })
    
    setIsOpen(false)
  }

  if (!user) return null

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrator'
      case 'MANAGER': return 'Manager'
      case 'REP': return 'Representative'
      default: return role
    }
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN': return styles.adminBadge
      case 'MANAGER': return styles.managerBadge
      case 'REP': return styles.repBadge
      default: return styles.defaultBadge
    }
  }

  return (
    <div className={styles.userMenu} ref={menuRef}>
      <button
        className={styles.userButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className={styles.userAvatar}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.name}</span>
          <span className={`${styles.userRole} ${getRoleBadgeClass(user.role)}`}>
            {getRoleDisplayName(user.role)}
          </span>
        </div>
        <svg 
          className={`${styles.chevron} ${isOpen ? styles.chevronUp : ''}`}
          width="16" 
          height="16" 
          viewBox="0 0 16 16"
        >
          <path 
            fill="currentColor" 
            d="M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userEmail}>{user.email}</div>
            </div>
          </div>
          
          <div className={styles.dropdownDivider} />
          
          <div className={styles.dropdownItem}>
            <button className={styles.dropdownButton}>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path fill="currentColor" d="M8 8a3 3 0 100-6 3 3 0 000 6zm2.735 6.007c.158-.342.295-.654.397-.992A6.006 6.006 0 008 12c-1.07 0-2.062.28-2.932.796.132.337.269.65.397.992a7.514 7.514 0 004.27 0z"/>
              </svg>
              Profile Settings
            </button>
          </div>
          
          <div className={styles.dropdownItem}>
            <button className={styles.dropdownButton}>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path fill="currentColor" d="M8 16a2 2 0 002-2v-1.5c0-.28-.22-.5-.5-.5h-3c-.28 0-.5.22-.5.5V14a2 2 0 002 2zM8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM6.5 8A1.5 1.5 0 108 6.5 1.5 1.5 0 006.5 8z"/>
              </svg>
              Change Password
            </button>
          </div>

          {user.role === 'ADMIN' && (
            <>
              <div className={styles.dropdownDivider} />
              <div className={styles.dropdownItem}>
                <button className={styles.dropdownButton}>
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path fill="currentColor" d="M8 16A8 8 0 118 0a8 8 0 010 16zM6.5 5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM2 11c0-1.5 3-2.5 3-2.5s3 1 3 2.5v1H2v-1z"/>
                  </svg>
                  User Management
                </button>
              </div>
              <div className={styles.dropdownItem}>
                <button className={styles.dropdownButton}>
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path fill="currentColor" d="M8 4.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM2.5 8a.5.5 0 01.5-.5h4a.5.5 0 01.5.5v4a.5.5 0 01-.5.5H3a.5.5 0 01-.5-.5V8z"/>
                  </svg>
                  System Settings
                </button>
              </div>
            </>
          )}
          
          <div className={styles.dropdownDivider} />
          
          <div className={styles.dropdownItem}>
            <button 
              className={`${styles.dropdownButton} ${styles.logoutButton}`}
              onClick={handleLogout}
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path fill="currentColor" d="M2 2.75C2 1.784 2.784 1 3.75 1h2.5a.75.75 0 010 1.5h-2.5a.25.25 0 00-.25.25v11.5c0 .138.112.25.25.25h2.5a.75.75 0 010 1.5h-2.5A1.75 1.75 0 012 14.25V2.75zm10.44 5.72l-2.97-2.97a.75.75 0 00-1.06 1.06L10.69 8.5H5.75a.75.75 0 000 1.5h4.94l-2.22 2.22a.75.75 0 101.06 1.06l2.97-2.97a.75.75 0 000-1.06z"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}