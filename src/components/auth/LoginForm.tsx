import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { useNotifications } from '../../store/uiStore'
import { api } from '../../api'
import styles from './Auth.module.css'

interface LoginFormProps {
  onSuccess?: () => void
}

interface LoginRequest {
  email: string
  password: string
  captchaId: string
  captchaSolution: string
}

interface CaptchaData {
  captchaId: string
  captchaSvg: string
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    captchaSolution: ''
  })
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const login = useAuthStore(state => state.login)
  const { addNotification } = useNotifications()

  // Fetch CAPTCHA
  const { mutate: fetchCaptcha, isPending: isFetchingCaptcha } = useMutation({
    mutationFn: () => api.get<CaptchaData>('/auth/captcha'),
    onSuccess: (data) => {
      setCaptcha(data)
      setFormData(prev => ({ ...prev, captchaSolution: '' }))
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Failed to load CAPTCHA',
        message: error.message
      })
    }
  })

  // Login mutation
  const { mutate: loginUser, isPending: isLoggingIn } = useMutation({
    mutationFn: (data: LoginRequest) => api.post('/auth/login', data),
    onSuccess: (data: any) => {
      // Store tokens in localStorage
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      
      // Update auth store
      login(data.user)
      
      addNotification({
        type: 'success',
        title: 'Login successful',
        message: `Welcome back, ${data.user.name}!`
      })
      
      onSuccess?.()
    },
    onError: (error: any) => {
      console.error('Login error:', error)
      
      // Refresh captcha on failed attempt
      fetchCaptcha()
      
      addNotification({
        type: 'error',
        title: 'Login failed',
        message: error.data?.error || 'Invalid credentials'
      })
    }
  })

  // Load CAPTCHA on component mount
  React.useEffect(() => {
    fetchCaptcha()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!captcha) {
      addNotification({
        type: 'error',
        title: 'CAPTCHA required',
        message: 'Please wait for CAPTCHA to load'
      })
      return
    }

    loginUser({
      email: formData.email,
      password: formData.password,
      captchaId: captcha.captchaId,
      captchaSolution: formData.captchaSolution
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h2>Sign In to Kanban</h2>
          <p>Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              autoComplete="email"
              className={styles.formInput}
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="current-password"
                className={styles.formInput}
                placeholder="Enter your password"
                minLength={8}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="captcha">Security Verification</label>
            <div className={styles.captchaContainer}>
              <div className={styles.captchaImage}>
                {captcha ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: captcha.captchaSvg }}
                    className={styles.captchaSvg}
                  />
                ) : (
                  <div className={styles.captchaLoading}>Loading...</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fetchCaptcha()}
                disabled={isFetchingCaptcha}
                className={styles.refreshCaptcha}
                aria-label="Refresh CAPTCHA"
              >
                🔄
              </button>
            </div>
            <input
              type="text"
              id="captcha"
              name="captchaSolution"
              value={formData.captchaSolution}
              onChange={handleInputChange}
              required
              className={styles.formInput}
              placeholder="Enter the text above"
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn || !captcha}
            className={styles.submitButton}
          >
            {isLoggingIn ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p>
            Need help? Contact your administrator
          </p>
        </div>
      </div>
    </div>
  )
}