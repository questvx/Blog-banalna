import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockResponse } from '../test/helpers'
import { fetchAdminHeroMessage, saveAdminHeroMessage } from './adminHeroMessage'

const fetchMock = vi.fn()

describe('admin hero message API', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('fetches the saved welcome message with author credentials', async () => {
    const message = { message: 'Dzień dobry!' }
    fetchMock.mockResolvedValueOnce(mockResponse(message))

    await expect(fetchAdminHeroMessage()).resolves.toEqual(message)
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/hero-message', { credentials: 'include' })
  })

  it('saves the message using a CSRF-protected request', async () => {
    const message = { message: 'Nowa wiadomość' }
    fetchMock
      .mockResolvedValueOnce(mockResponse({ token: 'csrf-token', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse(message))

    await expect(saveAdminHeroMessage(message.message)).resolves.toEqual(message)
    expect(fetchMock.mock.calls[1][0]).toBe('/api/admin/hero-message')
    expect(fetchMock.mock.calls[1][1]).toEqual(expect.objectContaining({
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify(message),
    }))
  })
})
