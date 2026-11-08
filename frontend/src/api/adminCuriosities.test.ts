import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteAdminCuriosity, fetchAdminCuriosities, saveAdminCuriosity } from './adminCuriosities'
import { mockResponse } from '../test/helpers'

const fetchMock = vi.fn()

describe('admin curiosity API', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('fetches curiosities using the author session', async () => {
    const curiosities = [{
      id: 8,
      title: 'Tytuł',
      content: 'Treść ciekawostki.',
      status: 'DRAFT',
      createdAt: '2026-11-08T12:00:00',
    }]
    fetchMock.mockResolvedValueOnce(mockResponse(curiosities))

    await expect(fetchAdminCuriosities()).resolves.toEqual(curiosities)
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/curiosities', { credentials: 'include' })
  })

  it('creates and updates curiosities with CSRF-protected JSON requests', async () => {
    const curiosity = {
      id: 8,
      title: 'Tytuł',
      content: 'Treść ciekawostki.',
      status: 'DRAFT' as const,
      createdAt: '2026-11-08T12:00:00',
    }
    fetchMock
      .mockResolvedValueOnce(mockResponse({ token: 'csrf-token', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse(curiosity))
      .mockResolvedValueOnce(mockResponse({ token: 'csrf-token', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse({ ...curiosity, status: 'PUBLISHED' }))

    await expect(saveAdminCuriosity(null, {
      title: curiosity.title,
      content: curiosity.content,
      status: curiosity.status,
      createdAt: curiosity.createdAt,
    }))
      .resolves.toEqual(curiosity)

    const [url, options] = fetchMock.mock.calls[1] as [string, RequestInit]
    expect(url).toBe('/api/admin/curiosities')
    expect(options.method).toBe('POST')
    expect(options.credentials).toBe('include')
    expect(new Headers(options.headers).get('X-CSRF-TOKEN')).toBe('csrf-token')
    expect(JSON.parse(String(options.body))).toEqual({
      title: curiosity.title,
      content: curiosity.content,
      status: curiosity.status,
      createdAt: curiosity.createdAt,
    })

    await expect(saveAdminCuriosity(8, {
      title: curiosity.title,
      content: curiosity.content,
      status: 'PUBLISHED',
      createdAt: curiosity.createdAt,
    })).resolves.toEqual({ ...curiosity, status: 'PUBLISHED' })
    expect(fetchMock.mock.calls[3][0]).toBe('/api/admin/curiosities/8')
    expect((fetchMock.mock.calls[3][1] as RequestInit).method).toBe('PUT')
  })

  it.each([
    [401, 'Sesja wygasła. Zaloguj się ponownie.'],
    [403, 'Brak uprawnień do wykonania tej operacji.'],
    [500, 'Nie udało się zapisać ciekawostki (500).'],
  ])('reports an authorization or server error (%i)', async (status, message) => {
    fetchMock
      .mockResolvedValueOnce(mockResponse({ token: 'csrf-token', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse({}, status))

    await expect(saveAdminCuriosity(null, {
      title: 'Tytuł',
      content: 'Treść',
      status: 'DRAFT',
      createdAt: '2026-11-08T12:00:00',
    })).rejects.toThrow(message)
  })

  it('deletes a curiosity with a CSRF-protected request', async () => {
    fetchMock
      .mockResolvedValueOnce(mockResponse({ token: 'csrf-token', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse({}))

    await expect(deleteAdminCuriosity(8)).resolves.toBeUndefined()
    expect(fetchMock.mock.calls[1]).toEqual([
      '/api/admin/curiosities/8',
      expect.objectContaining({
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-CSRF-TOKEN': 'csrf-token' },
      }),
    ])
  })
})
