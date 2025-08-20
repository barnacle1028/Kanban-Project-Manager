import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('displays the kanban board with stages', () => {
    render(<App />)
    expect(screen.getByText('Not Started')).toBeInTheDocument()
    expect(screen.getByText('Initial Call')).toBeInTheDocument()
    expect(screen.getByText('Workshop')).toBeInTheDocument()
    expect(screen.getAllByText('Completed')).toHaveLength(2) // One in select, one as column header
  })

  it('shows progress percentage', () => {
    render(<App />)
    expect(screen.getByText(/Overall progress:/)).toBeInTheDocument()
  })
})
