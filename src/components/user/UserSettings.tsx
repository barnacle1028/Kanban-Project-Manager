import React, { useState, useEffect } from 'react'
import { X, Eye, EyeOff, User, Lock, Bell, Globe, Save, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import type { 
  UserPreferences, 
  ChangePasswordRequest, 
  UpdateUserRequest,
  UserWithRole
} from '../../types/userManagement'
import { userManagementService } from '../../api/userManagement'
import { DEFAULT_PASSWORD_REQUIREMENTS } from '../../types/userManagement'

interface UserSettingsProps {
  onClose: () => void
}

export default function UserSettings({ onClose }: UserSettingsProps) {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'preferences'>('profile')
  
  if (!user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">User Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 bg-gray-50">
            <nav className="p-4 space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'password' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Lock className="w-5 h-5" />
                Password
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'preferences' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell className="w-5 h-5" />
                Preferences
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {activeTab === 'profile' && <ProfileTab user={user} />}
            {activeTab === 'password' && <PasswordTab user={user} />}
            {activeTab === 'preferences' && <PreferencesTab user={user} />}
          </div>
        </div>
      </div>
    </div>
  )
}

// Profile Tab Component
function ProfileTab({ user }: { user: UserWithRole }) {
  const [formData, setFormData] = useState<UpdateUserRequest>({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    display_name: user.display_name || '',
    phone: user.phone || '',
    job_title: user.job_title || '',
    timezone: user.timezone || 'America/New_York'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      await userManagementService.updateUser(user.id, formData)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Information</h3>
        <p className="text-sm text-gray-600">
          Update your personal information and contact details.
        </p>
      </div>

      {success && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Profile updated successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={formData.first_name || ''}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.last_name || ''}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.display_name || ''}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="How your name appears to others"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <input
              type="text"
              value={formData.job_title || ''}
              onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Your role or position"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={formData.timezone || 'America/New_York'}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Australia/Sydney">Sydney</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Account Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Contact your administrator to change your email address
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID
              </label>
              <input
                type="text"
                value={user.employee_id || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

// Password Tab Component
function PasswordTab({ user }: { user: UserWithRole }) {
  const [formData, setFormData] = useState<ChangePasswordRequest>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    const requirements = DEFAULT_PASSWORD_REQUIREMENTS

    if (password.length < requirements.min_length) {
      errors.push(`Must be at least ${requirements.min_length} characters long`)
    }
    if (requirements.require_uppercase && !/[A-Z]/.test(password)) {
      errors.push('Must contain at least one uppercase letter')
    }
    if (requirements.require_lowercase && !/[a-z]/.test(password)) {
      errors.push('Must contain at least one lowercase letter')
    }
    if (requirements.require_numbers && !/\d/.test(password)) {
      errors.push('Must contain at least one number')
    }
    if (requirements.require_special_chars && !new RegExp(`[${requirements.special_chars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)) {
      errors.push('Must contain at least one special character (!@#$%^&*)')
    }

    return errors
  }

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, new_password: password })
    setPasswordErrors(validatePassword(password))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    if (formData.new_password !== formData.confirm_password) {
      setError('New passwords do not match')
      setIsLoading(false)
      return
    }

    if (passwordErrors.length > 0) {
      setError('Please fix the password requirements')
      setIsLoading(false)
      return
    }

    try {
      await userManagementService.changePassword(user.id, formData)
      setSuccess(true)
      setFormData({ current_password: '', new_password: '', confirm_password: '' })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Change Password</h3>
        <p className="text-sm text-gray-600">
          Ensure your account is secure by using a strong password.
        </p>
      </div>

      {success && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Password changed successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.current_password}
              onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your current password"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
            >
              {showPasswords.current ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.new_password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your new password"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
            >
              {showPasswords.new ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>

          {/* Password Requirements */}
          {formData.new_password && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-1">Password requirements:</p>
              <ul className="text-xs space-y-1">
                <li className={`flex items-center gap-1 ${formData.new_password.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-1 h-1 rounded-full ${formData.new_password.length >= 8 ? 'bg-green-600' : 'bg-red-600'}`}></div>
                  At least 8 characters
                </li>
                <li className={`flex items-center gap-1 ${/[A-Z]/.test(formData.new_password) ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(formData.new_password) ? 'bg-green-600' : 'bg-red-600'}`}></div>
                  One uppercase letter
                </li>
                <li className={`flex items-center gap-1 ${/[a-z]/.test(formData.new_password) ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-1 h-1 rounded-full ${/[a-z]/.test(formData.new_password) ? 'bg-green-600' : 'bg-red-600'}`}></div>
                  One lowercase letter
                </li>
                <li className={`flex items-center gap-1 ${/\d/.test(formData.new_password) ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-1 h-1 rounded-full ${/\d/.test(formData.new_password) ? 'bg-green-600' : 'bg-red-600'}`}></div>
                  One number
                </li>
                <li className={`flex items-center gap-1 ${/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(formData.new_password) ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-1 h-1 rounded-full ${/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(formData.new_password) ? 'bg-green-600' : 'bg-red-600'}`}></div>
                  One special character
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirm_password}
              onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Confirm your new password"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
            >
              {showPasswords.confirm ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>

          {formData.confirm_password && formData.new_password !== formData.confirm_password && (
            <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || passwordErrors.length > 0 || !formData.current_password || !formData.new_password || !formData.confirm_password}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            {isLoading ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  )
}

// Preferences Tab Component
function PreferencesTab({ user }: { user: UserWithRole }) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPreferences()
  }, [user.id])

  const loadPreferences = async () => {
    try {
      const prefs = await userManagementService.getUserPreferences(user.id)
      setPreferences(prefs || {
        id: `pref-${user.id}`,
        user_id: user.id,
        theme: 'light',
        language: 'en',
        timezone: 'America/New_York',
        date_format: 'MM/dd/yyyy',
        time_format: '12h',
        email_notifications: true,
        browser_notifications: true,
        weekly_digest: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    } catch (err) {
      setError('Failed to load preferences')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!preferences) return

    setIsSaving(true)
    setError('')
    setSuccess(false)

    try {
      await userManagementService.updateUserPreferences(user.id, preferences)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading preferences...</div>
  }

  if (!preferences) {
    return <div className="text-center py-8">Failed to load preferences</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">User Preferences</h3>
        <p className="text-sm text-gray-600">
          Customize your experience and notification settings.
        </p>
      </div>

      {success && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Preferences saved successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Appearance */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Appearance</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={preferences.theme}
                onChange={(e) => setPreferences({ ...preferences, theme: e.target.value as 'light' | 'dark' | 'auto' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (system preference)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Date & Time</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
                <option value="Australia/Sydney">Sydney</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Format
              </label>
              <select
                value={preferences.date_format}
                onChange={(e) => setPreferences({ ...preferences, date_format: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                <option value="MMM dd, yyyy">MMM dd, yyyy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Format
              </label>
              <select
                value={preferences.time_format}
                onChange={(e) => setPreferences({ ...preferences, time_format: e.target.value as '12h' | '24h' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="12h">12 hour (3:30 PM)</option>
                <option value="24h">24 hour (15:30)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Notifications</h4>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.email_notifications}
                onChange={(e) => setPreferences({ ...preferences, email_notifications: e.target.checked })}
                className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              />
              <span className="ml-3 text-sm text-gray-700">
                Email notifications
                <p className="text-xs text-gray-500">Receive notifications via email</p>
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.browser_notifications}
                onChange={(e) => setPreferences({ ...preferences, browser_notifications: e.target.checked })}
                className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              />
              <span className="ml-3 text-sm text-gray-700">
                Browser notifications
                <p className="text-xs text-gray-500">Show desktop notifications in your browser</p>
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.weekly_digest}
                onChange={(e) => setPreferences({ ...preferences, weekly_digest: e.target.checked })}
                className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              />
              <span className="ml-3 text-sm text-gray-700">
                Weekly digest
                <p className="text-xs text-gray-500">Receive a weekly summary of your activity</p>
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  )
}