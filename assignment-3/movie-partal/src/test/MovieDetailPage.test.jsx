import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import MovieDetailPage from '../pages/MovieDetailPage'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1' }),
}))

const fakeMovie = {
  id: 1,
  title: 'The Godfather',
  tagline: "An offer you can't refuse.",
  overview: 'The aging patriarch of an organized crime dynasty transfers control to his reluctant son.',
  vote_average: 9.2,
  release_date: '1972-03-24',
  runtime: 175,
  backdrop_path: '/backdrop.jpg',
  poster_path: '/poster.jpg',
  genres: [{ id: 18, name: 'Drama' }, { id: 80, name: 'Crime' }],
  credits: {
    cast: [
      { id: 1, name: 'Marlon Brando' },
      { id: 2, name: 'Al Pacino' },
      { id: 3, name: 'James Caan' },
      { id: 4, name: 'Richard Castellano' },
      { id: 5, name: 'Robert Duvall' },
      { id: 6, name: 'Sterling Hayden' },
      { id: 7, name: 'John Marley' },
      { id: 8, name: 'Richard Conte' }, // 8th — should not appear, component slices to 7
    ],
    crew: [{ id: 10, name: 'Francis Ford Coppola', job: 'Director' }],
  },
}

beforeEach(() => {
  mockNavigate.mockClear()
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(fakeMovie),
  })
})

describe('MovieDetailPage', () => {
  it('shows a loading state before data arrives', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}))
    render(<MovieDetailPage />)
    expect(screen.getByText(/loading the reel/i)).toBeInTheDocument()
  })

  it('renders the movie title', async () => {
    render(<MovieDetailPage />)
    expect(await screen.findByText('The Godfather')).toBeInTheDocument()
  })

  it('renders the tagline', async () => {
    render(<MovieDetailPage />)
    await screen.findByText('The Godfather')
    expect(screen.getByText(/"An offer you can't refuse\."/)).toBeInTheDocument()
  })

  it('renders the rating', async () => {
    render(<MovieDetailPage />)
    await screen.findByText('The Godfather')
    expect(screen.getByText(/9\.2 \/ 10/)).toBeInTheDocument()
  })

  it('renders the release year', async () => {
    render(<MovieDetailPage />)
    await screen.findByText('The Godfather')
    expect(screen.getByText('1972')).toBeInTheDocument()
  })

  it('renders the formatted runtime', async () => {
    render(<MovieDetailPage />)
    await screen.findByText('The Godfather')
    expect(screen.getByText('2h 55m')).toBeInTheDocument()
  })

  it('renders genre tags', async () => {
    render(<MovieDetailPage />)
    await screen.findByText('The Godfather')
    expect(screen.getByText('Drama')).toBeInTheDocument()
    expect(screen.getByText('Crime')).toBeInTheDocument()
  })

  it('renders the overview', async () => {
    render(<MovieDetailPage />)
    await screen.findByText('The Godfather')
    expect(screen.getByText(/aging patriarch/i)).toBeInTheDocument()
  })

  it('renders up to 7 cast members and not the 8th', async () => {
    render(<MovieDetailPage />)
    await screen.findByText('The Godfather')
    expect(screen.getByText('John Marley')).toBeInTheDocument()
    expect(screen.queryByText('Richard Conte')).not.toBeInTheDocument()
  })

  it('renders the director', async () => {
    render(<MovieDetailPage />)
    await screen.findByText('The Godfather')
    expect(screen.getByText('Francis Ford Coppola')).toBeInTheDocument()
  })

  it('shows an error when the fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({}) })
    render(<MovieDetailPage />)
    expect(await screen.findByText(/failed to load movie details/i)).toBeInTheDocument()
  })

  it('does not show the tagline when it is empty', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...fakeMovie, tagline: '' }),
    })
    render(<MovieDetailPage />)
    await screen.findByText('The Godfather')
    expect(screen.queryByText(/offer/i)).not.toBeInTheDocument()
  })

  it('shows fallback text when overview is missing', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...fakeMovie, overview: '' }),
    })
    render(<MovieDetailPage />)
    await screen.findByText('The Godfather')
    expect(screen.getByText(/no overview available/i)).toBeInTheDocument()
  })

  it('navigates back to /movies when the close button is clicked', async () => {
    render(<MovieDetailPage />)
    await screen.findByText('The Godfather')
    fireEvent.click(screen.getByRole('button'))
    expect(mockNavigate).toHaveBeenCalledWith('/movies')
  })

  it('navigates back to /movies when the backdrop overlay is clicked', async () => {
    render(<MovieDetailPage />)
    await screen.findByText('The Godfather')
    const overlay = document.querySelector('[class*="overlay"]')
    fireEvent.click(overlay)
    expect(mockNavigate).toHaveBeenCalledWith('/movies')
  })

  it('does not navigate when clicking inside the panel', async () => {
    render(<MovieDetailPage />)
    await screen.findByText('The Godfather')
    const panel = document.querySelector('[class*="panel"]')
    fireEvent.click(panel)
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
