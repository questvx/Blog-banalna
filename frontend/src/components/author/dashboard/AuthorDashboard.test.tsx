import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthorPost } from '../../../api/adminPosts'
import AuthorDashboard from './AuthorDashboard'
import { createPost } from '../../../test/fixtures'
import { mockResponse } from '../../../test/helpers'

const fetchMock = vi.fn()

function authorPost(overrides: Partial<AuthorPost> = {}): AuthorPost {
  return {
    ...createPost(overrides),
    status: 'PUBLISHED',
    ...overrides,
  }
}

function renderDashboard(posts: AuthorPost[]) {
  fetchMock
    .mockResolvedValueOnce(mockResponse(posts))
    .mockResolvedValueOnce(mockResponse([]))

  return render(
    <AuthorDashboard
      session={{ username: 'autorka' }}
      error=""
      onLogout={vi.fn()}
      isLoggingOut={false}
    />,
  )
}

describe('AuthorDashboard', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    window.history.replaceState({}, '', '/autorka')
  })

  it('loads the author post list and filters it by category', async () => {
    renderDashboard([
      authorPost({ id: 1, title: 'Post kuchenny', category: 'kuchnia' }),
      authorPost({ id: 2, title: 'Post filmowy', category: 'filmy' }),
    ])

    const postList = await screen.findByRole('list', { name: 'Lista wpisów' })
    expect(within(postList).getByText('Post kuchenny')).toBeInTheDocument()
    expect(within(postList).getByText('Post filmowy')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Kategoria'), { target: { value: 'filmy' } })

    expect(within(postList).getByText('Post filmowy')).toBeInTheDocument()
    expect(within(postList).queryByText('Post kuchenny')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('1 z 2 wpisów')
  })

  it('creates a post and adds the saved result to the list', async () => {
    const savedPost = authorPost({ id: 3, title: 'Nowy artykuł' })
    renderDashboard([])
    await screen.findByRole('button', { name: '+ Nowy wpis' })
    fetchMock
      .mockResolvedValueOnce(mockResponse({ token: 'csrf-token', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse(savedPost))

    fireEvent.click(screen.getByRole('button', { name: '+ Nowy wpis' }))
    fireEvent.change(screen.getByLabelText('Tytuł'), { target: { value: 'Nowy artykuł' } })
    fireEvent.change(screen.getByLabelText('Nagłówek'), { target: { value: 'Krótki opis.' } })
    fireEvent.change(screen.getByLabelText(/Treść/), { target: { value: 'Treść artykułu.' } })
    fireEvent.change(screen.getByLabelText('Adres obrazu'), { target: { value: 'https://example.com/obraz.jpg' } })
    fireEvent.click(screen.getByRole('button', { name: 'Dodaj wpis' }))

    expect(await screen.findByText('Wpis został dodany.')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Lista wpisów' })).toHaveTextContent('Nowy artykuł')
    expect(fetchMock.mock.calls[3][0]).toBe('/api/admin/posts')
    expect((fetchMock.mock.calls[3][1] as RequestInit).method).toBe('POST')
  })

  it('deletes a post after confirmation', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderDashboard([authorPost({ id: 10, title: 'Do usunięcia' })])
    const postList = await screen.findByRole('list', { name: 'Lista wpisów' })
    fetchMock
      .mockResolvedValueOnce(mockResponse({ token: 'csrf-token', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse({}))

    fireEvent.click(within(postList).getByRole('button', { name: 'Usuń' }))

    await waitFor(() => expect(screen.queryByText('Do usunięcia')).not.toBeInTheDocument())
    expect(confirm).toHaveBeenCalledOnce()
    expect(screen.getByText('Wpis został usunięty.')).toBeInTheDocument()
  })
})
