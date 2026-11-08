import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthorPost } from '../../../api/adminPosts'
import type { AdminCuriosity } from '../../../api/adminCuriosities'
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

function renderDashboard(posts: AuthorPost[], curiosities: AdminCuriosity[] = []) {
  fetchMock
    .mockResolvedValueOnce(mockResponse(posts))
    .mockResolvedValueOnce(mockResponse(curiosities))
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
    ], [{
      id: 3,
      title: 'Ciekawostka o filmie',
      content: 'Treść.',
      status: 'PUBLISHED',
      createdAt: '2026-09-11T12:00:00',
    }])

    const postList = await screen.findByRole('list', { name: 'Lista wpisów' })
    expect(within(postList).getByText('Post kuchenny')).toBeInTheDocument()
    expect(within(postList).getByText('Post filmowy')).toBeInTheDocument()
    expect(within(postList).getByText('Ciekawostka o filmie')).toBeInTheDocument()
    expect(within(postList).getByText('Ciekawostka')).toHaveClass('author-post-curiosity')

    fireEvent.change(screen.getByLabelText('Kategoria'), { target: { value: 'ciekawostka' } })

    expect(within(postList).getByText('Ciekawostka o filmie')).toBeInTheDocument()
    expect(within(postList).queryByText('Post filmowy')).not.toBeInTheDocument()
    expect(within(postList).queryByText('Post kuchenny')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('1 z 3 wpisów')
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
    expect(fetchMock.mock.calls[4][0]).toBe('/api/admin/posts')
    expect((fetchMock.mock.calls[4][1] as RequestInit).method).toBe('POST')
  })

  it('creates a curiosity as a draft and adds it to the list', async () => {
    const savedCuriosity = {
      id: 4,
      title: 'Tytuł ciekawostki',
      content: 'Treść ciekawostki.',
      status: 'DRAFT' as const,
      createdAt: '2026-09-11T12:00:00',
    }
    renderDashboard([])
    await screen.findByRole('button', { name: '+ Nowa ciekawostka' })
    fetchMock
      .mockResolvedValueOnce(mockResponse({ token: 'csrf-token', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse(savedCuriosity))

    fireEvent.click(screen.getByRole('button', { name: '+ Nowa ciekawostka' }))
    const dialog = screen.getByRole('dialog', { name: 'Nowa ciekawostka' })
    fireEvent.change(within(dialog).getByLabelText('Tytuł'), {
      target: { value: savedCuriosity.title },
    })
    fireEvent.change(within(dialog).getByLabelText('Treść'), {
      target: { value: savedCuriosity.content },
    })
    fireEvent.change(within(dialog).getByLabelText('Data'), {
      target: { value: '2026-09-11' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Dodaj ciekawostkę' }))

    expect(await screen.findByText('Ciekawostka została dodana.')).toBeInTheDocument()
    expect(fetchMock.mock.calls[4][0]).toBe('/api/admin/curiosities')
    expect(JSON.parse(String((fetchMock.mock.calls[4][1] as RequestInit).body))).toEqual({
      title: savedCuriosity.title,
      content: savedCuriosity.content,
      status: savedCuriosity.status,
      createdAt: '2026-09-11T12:00:00',
    })
    expect(screen.getByRole('list', { name: 'Lista wpisów' })).toHaveTextContent(savedCuriosity.title)
  })

  it('updates the curiosity content and publication status', async () => {
    const curiosity = {
      id: 5,
      title: 'Stary tytuł',
      content: 'Stara treść.',
      status: 'DRAFT' as const,
      createdAt: '2026-09-10T12:00:00',
    }
    const updatedCuriosity = {
      ...curiosity,
      title: 'Nowy tytuł',
      content: 'Nowa treść.',
      status: 'PUBLISHED' as const,
      createdAt: '2026-09-12T12:00:00',
    }
    renderDashboard([], [curiosity])
    const postList = await screen.findByRole('list', { name: 'Lista wpisów' })
    fetchMock
      .mockResolvedValueOnce(mockResponse({ token: 'csrf-token', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse(updatedCuriosity))

    fireEvent.click(within(postList).getByRole('button', { name: 'Edytuj' }))
    const dialog = screen.getByRole('dialog', { name: 'Edytuj ciekawostkę' })
    fireEvent.change(within(dialog).getByLabelText('Tytuł'), { target: { value: updatedCuriosity.title } })
    fireEvent.change(within(dialog).getByLabelText('Treść'), { target: { value: updatedCuriosity.content } })
    fireEvent.change(within(dialog).getByLabelText('Data'), { target: { value: '2026-09-12' } })
    fireEvent.change(within(dialog).getByLabelText('Status'), { target: { value: 'PUBLISHED' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Zapisz zmiany' }))

    expect(await screen.findByText('Zmiany ciekawostki zostały zapisane.')).toBeInTheDocument()
    expect(postList).toHaveTextContent(updatedCuriosity.title)
    expect(within(postList).getByText('Opublikowany')).toBeInTheDocument()
    expect(fetchMock.mock.calls[4][0]).toBe('/api/admin/curiosities/5')
    expect((fetchMock.mock.calls[4][1] as RequestInit).method).toBe('PUT')
    expect(JSON.parse(String((fetchMock.mock.calls[4][1] as RequestInit).body))).toEqual({
      title: updatedCuriosity.title,
      content: updatedCuriosity.content,
      status: updatedCuriosity.status,
      createdAt: updatedCuriosity.createdAt,
    })
  })

  it('deletes a curiosity after confirmation', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const curiosity = {
      id: 6,
      title: 'Do usunięcia',
      content: 'Treść.',
      status: 'DRAFT' as const,
      createdAt: '2026-09-10T12:00:00',
    }
    renderDashboard([], [curiosity])
    const postList = await screen.findByRole('list', { name: 'Lista wpisów' })
    fetchMock
      .mockResolvedValueOnce(mockResponse({ token: 'csrf-token', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse({}))

    fireEvent.click(within(postList).getByRole('button', { name: 'Usuń' }))

    await waitFor(() => expect(within(postList).queryByText(curiosity.title)).not.toBeInTheDocument())
    expect(confirm).toHaveBeenCalledOnce()
    expect(screen.getByText('Ciekawostka została usunięta.')).toBeInTheDocument()
    expect(fetchMock.mock.calls[4][0]).toBe('/api/admin/curiosities/6')
    expect((fetchMock.mock.calls[4][1] as RequestInit).method).toBe('DELETE')
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
