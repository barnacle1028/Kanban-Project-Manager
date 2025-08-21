// User Management Types and Interfaces

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended'
export type EmployeeType = 'full_time' | 'part_time' | 'contractor' | 'intern'

export interface User {
  id: string
  // Authentication
  email: string
  password_hash?: string // Only used server-side
  email_verified: boolean
  email_verified_at?: string
  
  // Personal Information
  first_name: string
  last_name: string
  display_name?: string
  phone?: string
  avatar_url?: string
  
  // Professional Information
  job_title?: string
  department?: string
  employee_id?: string
  employee_type: EmployeeType
  hire_date?: string
  manager_id?: string
  
  // Contact & Address
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  
  // System Information
  status: UserStatus
  is_active: boolean
  last_login_at?: string
  timezone?: string
  locale?: string
  
  // Password Management
  temp_password?: string
  temp_password_expires_at?: string
  password_reset_token?: string
  password_reset_expires_at?: string
  must_change_password: boolean
  
  // Metadata
  created_at: string
  updated_at: string
  created_by: string
  notes?: string
}

export interface CreateUserRequest {
  // Required fields
  email: string
  first_name: string
  last_name: string
  user_role_id: string
  
  // Optional personal info
  display_name?: string
  phone?: string
  
  // Professional info
  job_title?: string
  department?: string
  employee_id?: string
  employee_type: EmployeeType
  hire_date?: string
  manager_id?: string
  
  // Contact info
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  
  // System settings
  timezone?: string
  locale?: string
  notes?: string
  
  // Send welcome email with temp password
  send_welcome_email?: boolean
}

export interface UpdateUserRequest {
  // Personal Information
  first_name?: string
  last_name?: string
  display_name?: string
  phone?: string
  avatar_url?: string
  
  // Professional Information
  job_title?: string
  department?: string
  employee_id?: string
  employee_type?: EmployeeType
  hire_date?: string
  manager_id?: string
  
  // Contact & Address
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  
  // System Information
  status?: UserStatus
  is_active?: boolean
  timezone?: string
  locale?: string
  notes?: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  new_password: string
  confirm_password: string
}

export interface ChangePasswordRequest {
  current_password?: string
  new_password: string
  confirm_password: string
}

export interface UserWithRole extends User {
  user_role?: {
    id: string
    name: string
    role_type: string
    dashboard_access: string
    permissions: any
  }
  manager?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
}

export interface UserListFilter {
  status?: UserStatus
  employee_type?: EmployeeType
  department?: string
  manager_id?: string
  user_role_id?: string
  search?: string
  is_active?: boolean
}

export interface UserListSort {
  field: 'first_name' | 'last_name' | 'email' | 'created_at' | 'last_login_at' | 'status'
  direction: 'asc' | 'desc'
}

export interface PaginatedUserResponse {
  users: UserWithRole[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// Password strength requirements
export interface PasswordRequirements {
  min_length: number
  require_uppercase: boolean
  require_lowercase: boolean
  require_numbers: boolean
  require_special_chars: boolean
  special_chars: string
}

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  min_length: 8,
  require_uppercase: true,
  require_lowercase: true,
  require_numbers: true,
  require_special_chars: true,
  special_chars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
}

// Email templates
export interface EmailTemplate {
  subject: string
  html_body: string
  text_body: string
  variables: Record<string, string>
}

export interface WelcomeEmailData {
  user_name: string
  user_email: string
  temp_password: string
  login_url: string
  company_name: string
}

export interface PasswordResetEmailData {
  user_name: string
  reset_url: string
  expires_in_hours: number
  company_name: string
}

// User activity tracking
export interface UserActivity {
  id: string
  user_id: string
  activity_type: 'login' | 'logout' | 'password_change' | 'profile_update' | 'role_change'
  description: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

// User preferences
export interface UserPreferences {
  id: string
  user_id: string
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  date_format: string
  time_format: '12h' | '24h'
  email_notifications: boolean
  browser_notifications: boolean
  weekly_digest: boolean
  created_at: string
  updated_at: string
}

// Department/Team structure
export interface Department {
  id: string
  name: string
  description?: string
  manager_id?: string
  parent_department_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  employee_id: /^[A-Za-z0-9\-_]{2,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{8,}$/
} as const

// Error types
export type UserManagementError = 
  | 'USER_NOT_FOUND'
  | 'EMAIL_ALREADY_EXISTS' 
  | 'INVALID_EMAIL'
  | 'WEAK_PASSWORD'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'EMAIL_SEND_FAILED'
  | 'DATABASE_ERROR'