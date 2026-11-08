import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PostInput } from './adminPosts'
import { deleteAdminPost, fetchAdminPosts, saveAdminPost } from './adminPosts'
import { mockResponse } from '../test/helpers'

const fetchMock = vi.fn()
const postInput: PostInput = {
  title: 'Wpis',
  excerpt: 'Opis',
  content: ['Treść'],
  date: '2026-09-12',
  category: 'kuchnia',
  image: '/uploads/wpis.jpg',
  featured: false,
  status: 'PUBLISHED',
}

describe('admin post API', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('fetches posts using the author session', async () => {
    const posts = [{ ...postInput, id: 7 }]
    fetchMock.mockResolvedValueOnce(mockResponse(posts))

    await expect(fetchAdminPosts()).resolves.toEqual(posts)
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/posts', { credentials: 'include' })
  })

  it.each([
    [401, 'Sesja wygasła. Zaloguj się ponownie.'],
    [403, 'Brak uprawnień do wykonania tej operacji.'],
    [500, 'Nie udało się zapisać zmian (500).'],
  ])('reports an authorization or server error (%i)', async (status, message) => {
    fetchMock.mockResolvedValueOnce(mockResponse({}, status))

    await expect(fetchAdminPosts()).rejects.toThrow(message)
  })

  it('creates a post with a CSRF-protected JSON request', async () => {
    const savedPost = { ...postInput, id: 12 }
    fetchMock
      .mockResolvedValueOnce(mockResponse({ token: 'csrf-token', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse(savedPost))

    await expect(saveAdminPost(null, postInput)).resolves.toEqual(savedPost)

    const [url, options] = fetchMock.mock.calls[1] as [string, RequestInit]
    expect(url).toBe('/api/admin/posts')
    expect(options.method).toBe('POST')
    expect(options.credentials).toBe('include')
    expect(new Headers(options.headers).get('X-CSRF-TOKEN')).toBe('csrf-token')
    expect(JSON.parse(String(options.body))).toEqual(postInput)
  })

  it('updates and deletes the selected post', async () => {
    fetchMock
      .mockResolvedValueOnce(mockResponse({ token: 'csrf-token', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse({ ...postInput, id: 9 }))
      .mockResolvedValueOnce(mockResponse({ token: 'csrf-token', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse({}))

    await saveAdminPost(9, postInput)
    await expect(deleteAdminPost(9)).resolves.toBeUndefined()

    expect(fetchMock.mock.calls[1][0]).toBe('/api/admin/posts/9')
    expect((fetchMock.mock.calls[1][1] as RequestInit).method).toBe('PUT')
    expect(fetchMock.mock.calls[3]).toEqual(['/api/admin/posts/9', expect.objectContaining({ method: 'DELETE' })])
  })
})
