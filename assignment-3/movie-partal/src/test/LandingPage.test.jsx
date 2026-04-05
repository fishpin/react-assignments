import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import LandingPage from '../pages/LandingPage'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

beforeEach(() => {
  mockNavigate.mockClear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('LandingPage', () => {
  it('renders the title', () => {
    render(<LandingPage />)
    expect(screen.getByText('The Grand')).toBeInTheDocument()
    expect(screen.getByText('Cinémathèque')).toBeInTheDocument()
  })

  it('renders the enter button', () => {
    render(<LandingPage />)
    expect(screen.getByRole('button', { name: /enter the theatre/i })).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    render(<LandingPage />)
    expect(screen.getByText(/curated passage/i)).toBeInTheDocument()
  })

  it('navigates to /movies after clicking the button', () => {
    render(<LandingPage />)
    fireEvent.click(screen.getByRole('button', { name: /enter the theatre/i }))
    vi.runAllTimers()
    expect(mockNavigate).toHaveBeenCalledWith('/movies')
  })

  it('does not navigate immediately before the timeout', () => {
    render(<LandingPage />)
    fireEvent.click(screen.getByRole('button', { name: /enter the theatre/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
