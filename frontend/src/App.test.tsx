import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPost } from './test/fixtures'
import { mockResponse } from './test/helpers'
import App from './App'

vi.mock('./components/teasers/TeaserManager', () => ({ default: () => null }))
vi.mock('./components/layout/Hero', () => ({ default: () => null }))

const fetchMock = vi.fn()
const posts = [
  createPost({ id: 1, title: 'Wpis kulinarny', category: 'kuchnia' }),
  createPost({ id: 2, title: 'Recenzja filmu', category: 'filmy' }),
]
const curiosities = [{
  id: 1,
  title: 'Ciekawostka',
  content: 'Pełna treść ciekawostki.',
  createdAt: '2026-09-11T12:00:00',
}]

describe('blog application', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    window.history.replaceState({}, '', '/')
    fetchMock
      .mockResolvedValueOnce(mockResponse(posts))
      .mockResolvedValueOnce(mockResponse(curiosities))
  })

  it('lets the reader select only one category at a time and clear it by selecting again', async () => {
    render(<App />)
    await screen.findByRole('heading', { name: 'Wpis kulinarny' })

    fireEvent.click(screen.getByRole('button', { name: 'kuchnia' }))
    expect(screen.getByRole('button', { name: 'kuchnia' })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(screen.getByRole('button', { name: 'filmy' }))
    expect(screen.getByRole('button', { name: 'kuchnia' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'filmy' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { name: 'Recenzja filmu' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Wpis kulinarny' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'filmy' }))
    expect(screen.getByRole('button', { name: 'filmy' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('heading', { name: 'Wpis kulinarny' })).toBeInTheDocument()
  })

  it('shows curiosities in their own category without opening them as posts', async () => {
    render(<App />)
    await screen.findByRole('heading', { name: 'Ciekawostka' })

    fireEvent.click(screen.getByRole('button', { name: 'ciekawostka' }))

    expect(screen.getByRole('heading', { name: 'Ciekawostka' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Wpis kulinarny' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /ciekawostka/i })).not.toBeInTheDocument()
  })

  it('opens a post at the top of the page', async () => {
    render(<App />)
    fireEvent.click(await screen.findByRole('link', { name: 'Przeczytaj: Wpis kulinarny' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Wpis kulinarny' })).toBeInTheDocument()
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: 'instant' })
  })

  it('shows a readable error when the post list cannot be loaded', async () => {
    fetchMock.mockReset()
    fetchMock
      .mockResolvedValueOnce(mockResponse({}, 503))
      .mockResolvedValueOnce(mockResponse([]))
    render(<App />)

    expect(await screen.findByText('Nie udało się pobrać wpisów (503).')).toBeInTheDocument()
  })

  it('does not navigate to a curiosity when a random post is selected', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    render(<App />)
    await screen.findByRole('heading', { name: 'Wpis kulinarny' })

    fireEvent.click(screen.getByRole('button', { name: /losowy wpis/i }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Wpis kulinarny' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Ciekawostka' })).not.toBeInTheDocument()
    vi.restoreAllMocks()
  })
})
