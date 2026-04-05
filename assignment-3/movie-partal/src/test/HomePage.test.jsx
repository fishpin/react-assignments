import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import HomePage from '../pages/HomePage'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

const fakeGenres = [
  { id: 28, name: 'Action' },
  { id: 18, name: 'Drama' },
]

const fakeMovies = [
  { id: 1, title: 'The Godfather', vote_average: 9.2, release_date: '1972-03-24', poster_path: '/p1.jpg', genre_ids: [18] },
  { id: 2, title: 'Inception',     vote_average: 8.8, release_date: '2010-07-16', poster_path: '/p2.jpg', genre_ids: [28] },
]

function mockFetch() {
  global.fetch = vi.fn().mockImplementation((url) => {
    if (url.includes('/genre/')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ genres: fakeGenres }) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ results: fakeMovies, total_pages: 1 }) })
  })
}

beforeEach(() => {
  mockNavigate.mockClear()
  mockFetch()
})

describe('HomePage', () => {
  it('shows a loading state on first render', () => {
    render(<HomePage />)
    expect(screen.getByText(/loading the reel/i)).toBeInTheDocument()
  })

  it('renders movie titles after data loads', async () => {
    render(<HomePage />)
    expect(await screen.findByText('The Godfather', {}, { timeout: 2000 })).toBeInTheDocument()
    expect(screen.getByText('Inception')).toBeInTheDocument()
  })

  it('renders genre filter pills', async () => {
    render(<HomePage />)
    expect(await screen.findByRole('button', { name: 'Action' }, { timeout: 2000 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Drama' })).toBeInTheDocument()
  })

  it('renders a search input', () => {
    render(<HomePage />)
    expect(screen.getByPlaceholderText(/search films/i)).toBeInTheDocument()
  })

  it('shows an error when the movies fetch fails', async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/genre/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ genres: fakeGenres }) })
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) })
    })
    render(<HomePage />)
    expect(await screen.findByText(/failed to fetch movies/i, {}, { timeout: 2000 })).toBeInTheDocument()
  })

  it('navigates to the movie detail page when a card is clicked', async () => {
    render(<HomePage />)
    const card = await screen.findByText('The Godfather', {}, { timeout: 2000 })
    fireEvent.click(card.closest('[class]'))
    expect(mockNavigate).toHaveBeenCalledWith('/movie/1')
  })

  it('updates the search input when the user types', async () => {
    render(<HomePage />)
    await screen.findByText('The Godfather', {}, { timeout: 2000 })
    const input = screen.getByPlaceholderText(/search films/i)
    fireEvent.change(input, { target: { value: 'inception' } })
    expect(input.value).toBe('inception')
  })

  it('shows a clear button when the search has text', async () => {
    render(<HomePage />)
    await screen.findByText('The Godfather', {}, { timeout: 2000 })
    fireEvent.change(screen.getByPlaceholderText(/search films/i), { target: { value: 'god' } })
    await waitFor(() => expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument())
  })

  it('clears the search when the clear button is clicked', async () => {
    render(<HomePage />)
    await screen.findByText('The Godfather', {}, { timeout: 2000 })
    const input = screen.getByPlaceholderText(/search films/i)
    fireEvent.change(input, { target: { value: 'god' } })
    await waitFor(() => screen.getByRole('button', { name: /clear search/i }))
    fireEvent.click(screen.getByRole('button', { name: /clear search/i }))
    expect(input.value).toBe('')
  })

  it('hides pagination when there is only one page', async () => {
    render(<HomePage />)
    await screen.findByText('The Godfather', {}, { timeout: 2000 })
    expect(screen.queryByRole('button', { name: /prev/i })).not.toBeInTheDocument()
  })

  it('shows pagination when total_pages is greater than 1', async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/genre/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ genres: fakeGenres }) })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ results: fakeMovies, total_pages: 3 }) })
    })
    render(<HomePage />)
    expect(await screen.findByRole('button', { name: /← prev/i }, { timeout: 2000 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next →/i })).toBeInTheDocument()
  })

  it('disables the Prev button on page 1', async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/genre/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ genres: fakeGenres }) })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ results: fakeMovies, total_pages: 3 }) })
    })
    render(<HomePage />)
    const prev = await screen.findByRole('button', { name: /← prev/i }, { timeout: 2000 })
    expect(prev).toBeDisabled()
  })
})
