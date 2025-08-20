import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Store error info for detailed display
    this.setState({ errorInfo })
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo)
    
    // Log to external service in production
    if (import.meta.env.PROD) {
      // TODO: Send to logging service (e.g., Sentry, LogRocket)
      console.error('Production error logged:', { error, errorInfo })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              padding: '20px',
              margin: '20px',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
            }}
          >
            <h2>Something went wrong.</h2>
            <p>
              We're sorry, but an error occurred while rendering this component.
            </p>
            <details style={{ marginTop: '10px' }}>
              <summary>Error details</summary>
              <pre style={{ marginTop: '10px', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                {this.state.error?.message}
                {'\n\n'}
                {this.state.error?.stack}
                {this.state.errorInfo && '\n\nComponent Stack:'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
            <button
              onClick={() => this.setState({ hasError: false })}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
