import type { 
  User,
  UserWithRole,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedUserResponse,
  UserListFilter,
  UserListSort,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordRequest,
  UserActivity,
  UserPreferences,
  Department,
  WelcomeEmailData,
  PasswordResetEmailData,
  DEFAULT_PASSWORD_REQUIREMENTS
} from '../types/userManagement'
import { emailService } from '../services/emailService'

// Mock API service for User Management
// In a real application, this would make HTTP calls to your backend

class UserManagementService {
  private baseUrl = '/api/users'

  // User CRUD operations
  async getAllUsers(
    filter?: UserListFilter,
    sort?: UserListSort,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedUserResponse> {
    try {
      // Mock implementation with our dummy data
      let filteredUsers = mockUsersWithRoles

      // Apply filters
      if (filter) {
        if (filter.status) {
          filteredUsers = filteredUsers.filter(u => u.status === filter.status)
        }
        if (filter.employee_type) {
          filteredUsers = filteredUsers.filter(u => u.employee_type === filter.employee_type)
        }
        if (filter.department) {
          filteredUsers = filteredUsers.filter(u => u.department === filter.department)
        }
        if (filter.is_active !== undefined) {
          filteredUsers = filteredUsers.filter(u => u.is_active === filter.is_active)
        }
        if (filter.search) {
          const searchLower = filter.search.toLowerCase()
          filteredUsers = filteredUsers.filter(u => 
            u.first_name.toLowerCase().includes(searchLower) ||
            u.last_name.toLowerCase().includes(searchLower) ||
            u.email.toLowerCase().includes(searchLower) ||
            (u.employee_id && u.employee_id.toLowerCase().includes(searchLower))
          )
        }
      }

      // Apply sorting
      if (sort) {
        filteredUsers.sort((a, b) => {
          const aVal = a[sort.field] || ''
          const bVal = b[sort.field] || ''
          const comparison = aVal.toString().localeCompare(bVal.toString())
          return sort.direction === 'asc' ? comparison : -comparison
        })
      }

      // Apply pagination
      const total = filteredUsers.length
      const start = (page - 1) * limit
      const paginatedUsers = filteredUsers.slice(start, start + limit)

      return {
        users: paginatedUsers,
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      throw new Error('Failed to fetch users')
    }
  }

  async getUserById(id: string): Promise<UserWithRole | null> {
    try {
      return mockUsersWithRoles.find(user => user.id === id) || null
    } catch (error) {
      console.error('Error fetching user:', error)
      throw new Error('Failed to fetch user')
    }
  }

  async createUser(data: CreateUserRequest): Promise<UserWithRole> {
    try {
      // Generate temporary password
      const tempPassword = this.generateTemporaryPassword()
      
      const newUser: UserWithRole = {
        id: `user-${Date.now()}`,
        email: data.email,
        email_verified: false,
        first_name: data.first_name,
        last_name: data.last_name,
        display_name: data.display_name,
        phone: data.phone,
        job_title: data.job_title,
        department: data.department,
        employee_id: data.employee_id,
        employee_type: data.employee_type,
        hire_date: data.hire_date,
        manager_id: data.manager_id,
        address_line1: data.address_line1,
        address_line2: data.address_line2,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        country: data.country || 'United States',
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
        status: 'pending',
        is_active: true,
        timezone: data.timezone || 'America/New_York',
        locale: data.locale || 'en-US',
        temp_password: tempPassword,
        temp_password_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        must_change_password: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'current-user-id',
        notes: data.notes
      }

      mockUsersWithRoles.push(newUser)

      // Send welcome email if requested
      if (data.send_welcome_email) {
        await this.sendWelcomeEmail(newUser, tempPassword)
      }

      // Assign user role if provided
      if (data.user_role_id) {
        // This would integrate with the user role service
        console.log('Assigning role:', data.user_role_id, 'to user:', newUser.id)
      }

      // Log activity
      await this.logUserActivity(newUser.id, 'profile_update', `User created by admin`)

      return newUser
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error('Failed to create user')
    }
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<UserWithRole> {
    try {
      const userIndex = mockUsersWithRoles.findIndex(user => user.id === id)
      if (userIndex === -1) {
        throw new Error('User not found')
      }

      const updatedUser = {
        ...mockUsersWithRoles[userIndex],
        ...data,
        updated_at: new Date().toISOString()
      }

      mockUsersWithRoles[userIndex] = updatedUser

      // Log activity
      await this.logUserActivity(id, 'profile_update', 'Profile updated by admin')

      return updatedUser
    } catch (error) {
      console.error('Error updating user:', error)
      throw new Error('Failed to update user')
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const userIndex = mockUsersWithRoles.findIndex(user => user.id === id)
      if (userIndex === -1) {
        throw new Error('User not found')
      }

      // Instead of hard delete, mark as inactive
      mockUsersWithRoles[userIndex] = {
        ...mockUsersWithRoles[userIndex],
        is_active: false,
        status: 'inactive',
        updated_at: new Date().toISOString()
      }

      // Log activity
      await this.logUserActivity(id, 'profile_update', 'Account deactivated by admin')

      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      throw new Error('Failed to delete user')
    }
  }

  // Password management
  async requestPasswordReset(data: PasswordResetRequest): Promise<boolean> {
    try {
      const user = mockUsersWithRoles.find(u => u.email === data.email)
      if (!user) {
        // Don't reveal whether email exists for security
        return true
      }

      // Generate reset token
      const resetToken = this.generateSecureToken()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Update user with reset token
      const userIndex = mockUsersWithRoles.findIndex(u => u.id === user.id)
      mockUsersWithRoles[userIndex] = {
        ...user,
        password_reset_token: resetToken,
        password_reset_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      }

      // Send reset email
      await this.sendPasswordResetEmail(user, resetToken)

      // Log activity
      await this.logUserActivity(user.id, 'password_reset', 'Password reset requested')

      return true
    } catch (error) {
      console.error('Error requesting password reset:', error)
      throw new Error('Failed to request password reset')
    }
  }

  async confirmPasswordReset(data: PasswordResetConfirm): Promise<boolean> {
    try {
      if (data.new_password !== data.confirm_password) {
        throw new Error('Passwords do not match')
      }

      if (!this.validatePassword(data.new_password)) {
        throw new Error('Password does not meet security requirements')
      }

      const user = mockUsersWithRoles.find(u => 
        u.password_reset_token === data.token &&
        u.password_reset_expires_at &&
        new Date(u.password_reset_expires_at) > new Date()
      )

      if (!user) {
        throw new Error('Invalid or expired reset token')
      }

      // Update password and clear reset token
      const userIndex = mockUsersWithRoles.findIndex(u => u.id === user.id)
      mockUsersWithRoles[userIndex] = {
        ...user,
        password_reset_token: undefined,
        password_reset_expires_at: undefined,
        temp_password: undefined,
        temp_password_expires_at: undefined,
        must_change_password: false,
        status: 'active',
        updated_at: new Date().toISOString()
      }

      // Log activity
      await this.logUserActivity(user.id, 'password_change', 'Password reset completed')

      return true
    } catch (error) {
      console.error('Error confirming password reset:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to reset password')
    }
  }

  async changePassword(userId: string, data: ChangePasswordRequest): Promise<boolean> {
    try {
      if (data.new_password !== data.confirm_password) {
        throw new Error('Passwords do not match')
      }

      if (!this.validatePassword(data.new_password)) {
        throw new Error('Password does not meet security requirements')
      }

      const user = mockUsersWithRoles.find(u => u.id === userId)
      if (!user) {
        throw new Error('User not found')
      }

      // In real implementation, verify current_password if provided
      if (data.current_password) {
        // Verify current password logic here
      }

      // Update password
      const userIndex = mockUsersWithRoles.findIndex(u => u.id === userId)
      mockUsersWithRoles[userIndex] = {
        ...user,
        must_change_password: false,
        temp_password: undefined,
        temp_password_expires_at: undefined,
        updated_at: new Date().toISOString()
      }

      // Log activity
      await this.logUserActivity(userId, 'password_change', 'Password changed by user')

      return true
    } catch (error) {
      console.error('Error changing password:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to change password')
    }
  }

  // User activity and preferences
  async getUserActivities(userId: string, limit: number = 20): Promise<UserActivity[]> {
    try {
      return mockUserActivities.filter(a => a.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit)
    } catch (error) {
      console.error('Error fetching user activities:', error)
      throw new Error('Failed to fetch user activities')
    }
  }

  async logUserActivity(
    userId: string,
    activityType: UserActivity['activity_type'],
    description: string,
    metadata?: any
  ): Promise<UserActivity> {
    try {
      const activity: UserActivity = {
        id: `activity-${Date.now()}`,
        user_id: userId,
        activity_type: activityType,
        description,
        created_at: new Date().toISOString()
      }

      mockUserActivities.push(activity)
      return activity
    } catch (error) {
      console.error('Error logging user activity:', error)
      throw new Error('Failed to log user activity')
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      return mockUserPreferences.find(p => p.user_id === userId) || null
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      throw new Error('Failed to fetch user preferences')
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const existingIndex = mockUserPreferences.findIndex(p => p.user_id === userId)
      
      if (existingIndex >= 0) {
        const updated = {
          ...mockUserPreferences[existingIndex],
          ...preferences,
          updated_at: new Date().toISOString()
        }
        mockUserPreferences[existingIndex] = updated
        return updated
      } else {
        const newPrefs: UserPreferences = {
          id: `pref-${Date.now()}`,
          user_id: userId,
          theme: 'light',
          language: 'en',
          timezone: 'America/New_York',
          date_format: 'MM/dd/yyyy',
          time_format: '12h',
          email_notifications: true,
          browser_notifications: true,
          weekly_digest: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...preferences
        }
        mockUserPreferences.push(newPrefs)
        return newPrefs
      }
    } catch (error) {
      console.error('Error updating user preferences:', error)
      throw new Error('Failed to update user preferences')
    }
  }

  // Department management
  async getDepartments(): Promise<Department[]> {
    try {
      return mockDepartments
    } catch (error) {
      console.error('Error fetching departments:', error)
      throw new Error('Failed to fetch departments')
    }
  }

  // Email services
  private async sendWelcomeEmail(user: UserWithRole, tempPassword: string): Promise<boolean> {
    try {
      const emailData: WelcomeEmailData = {
        user_name: `${user.first_name} ${user.last_name}`,
        user_email: user.email,
        temp_password: tempPassword,
        login_url: window.location.origin,
        company_name: 'Kanban Project Manager'
      }

      return await emailService.sendWelcomeEmail(emailData)
    } catch (error) {
      console.error('Error sending welcome email:', error)
      return false
    }
  }

  private async sendPasswordResetEmail(user: UserWithRole, resetToken: string): Promise<boolean> {
    try {
      const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`
      const emailData: PasswordResetEmailData = {
        user_name: `${user.first_name} ${user.last_name}`,
        reset_url: resetUrl,
        expires_in_hours: 1,
        company_name: 'Kanban Project Manager'
      }

      return await emailService.sendPasswordResetEmail(emailData)
    } catch (error) {
      console.error('Error sending password reset email:', error)
      return false
    }
  }

  async sendRoleChangeNotification(userId: string, oldRoleName: string, newRoleName: string): Promise<boolean> {
    try {
      const user = mockUsersWithRoles.find(u => u.id === userId)
      if (!user) return false

      return await emailService.sendRoleChangeNotification(
        user.email, 
        `${user.first_name} ${user.last_name}`, 
        oldRoleName, 
        newRoleName
      )
    } catch (error) {
      console.error('Error sending role change notification:', error)
      return false
    }
  }

  async sendAccountStatusNotification(userId: string, newStatus: 'active' | 'inactive'): Promise<boolean> {
    try {
      const user = mockUsersWithRoles.find(u => u.id === userId)
      if (!user) return false

      const userName = `${user.first_name} ${user.last_name}`
      
      if (newStatus === 'active') {
        return await emailService.sendAccountActivationNotification(user.email, userName)
      } else {
        return await emailService.sendAccountDeactivationNotification(user.email, userName)
      }
    } catch (error) {
      console.error('Error sending account status notification:', error)
      return false
    }
  }

  // Utility functions
  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*'
    let result = ''
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  private generateSecureToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  private validatePassword(password: string): boolean {
    const requirements = DEFAULT_PASSWORD_REQUIREMENTS
    
    if (password.length < requirements.min_length) return false
    if (requirements.require_uppercase && !/[A-Z]/.test(password)) return false
    if (requirements.require_lowercase && !/[a-z]/.test(password)) return false
    if (requirements.require_numbers && !/\d/.test(password)) return false
    if (requirements.require_special_chars && !new RegExp(`[${requirements.special_chars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)) return false
    
    return true
  }

  // Authentication methods
  async authenticateUser(email: string, password: string): Promise<UserWithRole | null> {
    try {
      const user = mockUsersWithRoles.find(u => u.email === email && u.is_active)
      if (!user) return null

      // In real implementation, verify password hash
      // For now, accept any password for demo

      // Update last login
      const userIndex = mockUsersWithRoles.findIndex(u => u.id === user.id)
      mockUsersWithRoles[userIndex] = {
        ...user,
        last_login_at: new Date().toISOString()
      }

      // Log login activity
      await this.logUserActivity(user.id, 'login', 'User logged in')

      return mockUsersWithRoles[userIndex]
    } catch (error) {
      console.error('Error authenticating user:', error)
      return null
    }
  }
}

// Mock data for development/testing
const mockUsersWithRoles: UserWithRole[] = [
  {
    id: 'user-admin-001',
    email: 'chris@company.com',
    email_verified: true,
    email_verified_at: '2024-01-01T00:00:00Z',
    first_name: 'Chris',
    last_name: 'Administrator',
    display_name: 'Chris Admin',
    job_title: 'System Administrator',
    department: 'Operations',
    employee_id: 'EMP001',
    employee_type: 'full_time',
    hire_date: '2024-01-01',
    status: 'active',
    is_active: true,
    timezone: 'America/New_York',
    locale: 'en-US',
    must_change_password: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'system',
    last_login_at: new Date().toISOString(),
    user_role: {
      id: 'role-admin-1',
      name: 'System Administrator',
      role_type: 'Admin',
      dashboard_access: 'Admin',
      permissions: {}
    }
  },
  {
    id: 'user-manager-001',
    email: 'derek@company.com',
    email_verified: true,
    email_verified_at: '2024-01-01T00:00:00Z',
    first_name: 'Derek',
    last_name: 'Manager',
    display_name: 'Derek M.',
    job_title: 'Sales Manager',
    department: 'Sales',
    employee_id: 'EMP002',
    employee_type: 'full_time',
    hire_date: '2024-01-01',
    status: 'active',
    is_active: true,
    timezone: 'America/New_York',
    locale: 'en-US',
    must_change_password: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user-admin-001',
    last_login_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user_role: {
      id: 'role-manager-1',
      name: 'Team Manager',
      role_type: 'Manager',
      dashboard_access: 'Manager',
      permissions: {}
    }
  },
  {
    id: 'user-rep-001',
    email: 'rolando@company.com',
    email_verified: true,
    email_verified_at: '2024-01-01T00:00:00Z',
    first_name: 'Rolando',
    last_name: 'Representative',
    display_name: 'Rolando R.',
    phone: '(555) 123-4567',
    job_title: 'Sales Representative',
    department: 'Sales',
    employee_id: 'EMP003',
    employee_type: 'full_time',
    hire_date: '2024-01-15',
    manager_id: 'user-manager-001',
    city: 'New York',
    state: 'NY',
    status: 'active',
    is_active: true,
    timezone: 'America/New_York',
    locale: 'en-US',
    must_change_password: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user-admin-001',
    last_login_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user_role: {
      id: 'role-consultant-1',
      name: 'Sales Consultant',
      role_type: 'Consultant',
      dashboard_access: 'Rep',
      permissions: {}
    },
    manager: {
      id: 'user-manager-001',
      first_name: 'Derek',
      last_name: 'Manager',
      email: 'derek@company.com'
    }
  },
  {
    id: 'user-rep-002',
    email: 'amanda@company.com',
    email_verified: true,
    email_verified_at: '2024-01-01T00:00:00Z',
    first_name: 'Amanda',
    last_name: 'Smith',
    display_name: 'Amanda S.',
    phone: '(555) 234-5678',
    job_title: 'Senior Sales Representative',
    department: 'Sales',
    employee_id: 'EMP004',
    employee_type: 'full_time',
    hire_date: '2024-01-10',
    manager_id: 'user-manager-001',
    city: 'Boston',
    state: 'MA',
    status: 'active',
    is_active: true,
    timezone: 'America/New_York',
    locale: 'en-US',
    must_change_password: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user-admin-001',
    last_login_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    user_role: {
      id: 'role-consultant-1',
      name: 'Sales Consultant',
      role_type: 'Consultant',
      dashboard_access: 'Rep',
      permissions: {}
    },
    manager: {
      id: 'user-manager-001',
      first_name: 'Derek',
      last_name: 'Manager',
      email: 'derek@company.com'
    }
  },
  {
    id: 'user-rep-003',
    email: 'lisa@company.com',
    email_verified: true,
    first_name: 'Lisa',
    last_name: 'Johnson',
    display_name: 'Lisa J.',
    phone: '(555) 345-6789',
    job_title: 'Sales Representative',
    department: 'Sales',
    employee_id: 'EMP005',
    employee_type: 'full_time',
    hire_date: '2024-02-01',
    manager_id: 'user-manager-001',
    status: 'active',
    is_active: true,
    timezone: 'America/New_York',
    locale: 'en-US',
    must_change_password: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user-admin-001',
    last_login_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    user_role: {
      id: 'role-consultant-1',
      name: 'Sales Consultant',
      role_type: 'Consultant',
      dashboard_access: 'Rep',
      permissions: {}
    },
    manager: {
      id: 'user-manager-001',
      first_name: 'Derek',
      last_name: 'Manager',
      email: 'derek@company.com'
    }
  },
  {
    id: 'user-rep-004',
    email: 'josh@company.com',
    email_verified: true,
    first_name: 'Josh',
    last_name: 'Williams',
    display_name: 'Josh W.',
    phone: '(555) 456-7890',
    job_title: 'Junior Sales Representative',
    department: 'Sales',
    employee_id: 'EMP006',
    employee_type: 'full_time',
    hire_date: '2024-02-15',
    manager_id: 'user-manager-001',
    status: 'active',
    is_active: true,
    timezone: 'America/New_York',
    locale: 'en-US',
    must_change_password: true,
    temp_password: 'TempPass123!',
    temp_password_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user-admin-001',
    user_role: {
      id: 'role-consultant-1',
      name: 'Sales Consultant',
      role_type: 'Consultant',
      dashboard_access: 'Rep',
      permissions: {}
    },
    manager: {
      id: 'user-manager-001',
      first_name: 'Derek',
      last_name: 'Manager',
      email: 'derek@company.com'
    }
  },
  {
    id: 'user-rep-005',
    email: 'steph@company.com',
    email_verified: false,
    first_name: 'Steph',
    last_name: 'Davis',
    display_name: 'Steph D.',
    phone: '(555) 567-8901',
    job_title: 'Sales Representative',
    department: 'Sales',
    employee_id: 'EMP007',
    employee_type: 'part_time',
    hire_date: '2024-03-01',
    manager_id: 'user-manager-001',
    status: 'pending',
    is_active: true,
    timezone: 'America/New_York',
    locale: 'en-US',
    must_change_password: true,
    temp_password: 'Welcome2024!',
    temp_password_expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    created_by: 'user-admin-001',
    user_role: {
      id: 'role-consultant-1',
      name: 'Sales Consultant',
      role_type: 'Consultant',
      dashboard_access: 'Rep',
      permissions: {}
    },
    manager: {
      id: 'user-manager-001',
      first_name: 'Derek',
      last_name: 'Manager',
      email: 'derek@company.com'
    }
  }
]

const mockUserActivities: UserActivity[] = [
  {
    id: 'activity-001',
    user_id: 'user-admin-001',
    activity_type: 'login',
    description: 'Logged in successfully',
    created_at: new Date().toISOString()
  },
  {
    id: 'activity-002',
    user_id: 'user-rep-001',
    activity_type: 'password_change',
    description: 'Changed password',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'activity-003',
    user_id: 'user-rep-002',
    activity_type: 'profile_update',
    description: 'Updated profile information',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  }
]

const mockUserPreferences: UserPreferences[] = [
  {
    id: 'pref-001',
    user_id: 'user-admin-001',
    theme: 'dark',
    language: 'en',
    timezone: 'America/New_York',
    date_format: 'MM/dd/yyyy',
    time_format: '12h',
    email_notifications: true,
    browser_notifications: true,
    weekly_digest: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pref-002',
    user_id: 'user-rep-001',
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
    date_format: 'MM/dd/yyyy',
    time_format: '12h',
    email_notifications: true,
    browser_notifications: false,
    weekly_digest: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

const mockDepartments: Department[] = [
  {
    id: 'dept-001',
    name: 'Sales',
    description: 'Sales team and account management',
    manager_id: 'user-manager-001',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'dept-002',
    name: 'Operations',
    description: 'Business operations and system administration',
    manager_id: 'user-admin-001',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'dept-003',
    name: 'Marketing',
    description: 'Marketing and customer acquisition',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'dept-004',
    name: 'Engineering',
    description: 'Software development and technical teams',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

export const userManagementService = new UserManagementService()
export { mockUsersWithRoles, mockUserActivities, mockUserPreferences, mockDepartments }