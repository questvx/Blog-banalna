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

describe('blog application', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    window.history.replaceState({}, '', '/')
    fetchMock.mockResolvedValueOnce(mockResponse(posts))
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

  it('opens a post at the top of the page', async () => {
    render(<App />)
    fireEvent.click(await screen.findByRole('link', { name: 'Przeczytaj: Wpis kulinarny' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Wpis kulinarny' })).toBeInTheDocument()
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: 'instant' })
  })

  it('shows a readable error when the post list cannot be loaded', async () => {
    fetchMock.mockReset()
    fetchMock.mockResolvedValueOnce(mockResponse({}, 503))
    render(<App />)

    expect(await screen.findByText('Nie udało się pobrać wpisów (503).')).toBeInTheDocument()
  })
})
