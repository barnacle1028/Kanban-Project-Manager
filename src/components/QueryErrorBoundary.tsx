import React from 'react'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import ErrorBoundary from './ErrorBoundary'

interface QueryErrorBoundaryProps {
  children: React.ReactNode
}

export default function QueryErrorBoundary({ children }: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onError={() => {
            // Reset React Query on error
            reset()
          }}
          fallback={
            <div
              style={{
                padding: '20px',
                margin: '20px',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                backgroundColor: '#fffbeb',
                color: '#92400e',
              }}
            >
              <h2>Unable to load data</h2>
              <p>
                There was a problem loading the data. This might be due to a
                network issue or a problem with our servers.
              </p>
              <button
                onClick={reset}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
            </div>
          }
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}