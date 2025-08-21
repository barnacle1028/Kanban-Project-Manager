import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, CheckCircle, AlertCircle, Lock } from 'lucide-react'
import type { PasswordResetConfirm } from '../../types/userManagement'
import { userManagementService } from '../../api/userManagement'
import { VALIDATION_PATTERNS, DEFAULT_PASSWORD_REQUIREMENTS } from '../../types/userManagement'

export default function PasswordResetConfirm() {
  // Get token from URL parameters manually since we don't use React Router
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')

  const [formData, setFormData] = useState<PasswordResetConfirm>({
    token: token || '',
    new_password: '',
    confirm_password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.')
    }
  }, [token])

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

    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (passwordErrors.length > 0) {
      setError('Please fix the password requirements')
      setIsLoading(false)
      return
    }

    try {
      await userManagementService.confirmPasswordReset(formData)
      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginRedirect = () => {
    window.location.href = '/'
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                Password reset successful
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
            </div>

            <div className="mt-8">
              <button
                onClick={handleLoginRedirect}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Continue to login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-green-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Set new password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose a strong password for your account.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                New password
              </label>
              <div className="mt-1 relative">
                <input
                  id="new_password"
                  name="new_password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.new_password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
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

            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                Confirm new password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
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

            <div>
              <button
                type="submit"
                disabled={isLoading || passwordErrors.length > 0 || !formData.new_password || !formData.confirm_password}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Resetting password...
                  </div>
                ) : (
                  'Reset password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}