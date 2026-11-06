import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockResponse } from '../test/helpers'
import { fetchCsrfToken, getAuthorSession, loginAuthor, logoutAuthor } from './auth'

const fetchMock = vi.fn()

describe('author authentication API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  it('loads the CSRF token using cookie credentials', async () => {
    const csrf = { token: 'csrf-token', headerName: 'X-CSRF-TOKEN' }
    fetchMock.mockResolvedValueOnce(mockResponse(csrf))

    await expect(fetchCsrfToken()).resolves.toEqual(csrf)
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/csrf', { credentials: 'include' })
  })

  it('returns no session for an unauthenticated author', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({}, 401))

    await expect(getAuthorSession()).resolves.toBeNull()
  })

  it('surfaces errors while checking the session', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({}, 500))

    await expect(getAuthorSession()).rejects.toThrow('Nie udało się sprawdzić sesji autorki.')
  })

  it('logs in with the CSRF header and returns the active session', async () => {
    const session = { username: 'autorka' }
    fetchMock
      .mockResolvedValueOnce(mockResponse({ token: 'token-1', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse({}))
      .mockResolvedValueOnce(mockResponse(session))

    await expect(loginAuthor('autorka', 'tajne hasło')).resolves.toEqual(session)

    const [, options] = fetchMock.mock.calls[1] as [string, RequestInit]
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/auth/csrf',
      '/api/auth/login',
      '/api/auth/me',
    ])
    expect(options.method).toBe('POST')
    expect(options.credentials).toBe('include')
    expect(new Headers(options.headers).get('X-CSRF-TOKEN')).toBe('token-1')
    expect(String(options.body)).toBe('username=autorka&password=tajne+has%C5%82o')
  })

  it('translates invalid credentials into a user-facing error', async () => {
    fetchMock
      .mockResolvedValueOnce(mockResponse({ token: 'token-1', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse({}, 401))

    await expect(loginAuthor('autorka', 'wrong')).rejects.toThrow('Nieprawidłowy login lub hasło.')
  })

  it('rejects a successful login without an active session', async () => {
    fetchMock
      .mockResolvedValueOnce(mockResponse({ token: 'token-1', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse({}))
      .mockResolvedValueOnce(mockResponse({}, 401))

    await expect(loginAuthor('autorka', 'hasło')).rejects.toThrow('Logowanie nie utworzyło aktywnej sesji.')
  })

  it('logs out with the CSRF header', async () => {
    fetchMock
      .mockResolvedValueOnce(mockResponse({ token: 'token-2', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse({}))

    await expect(logoutAuthor()).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/auth/logout', expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRF-TOKEN': 'token-2' },
    }))
  })
})
