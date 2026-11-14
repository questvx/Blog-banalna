import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchAdminImageCardCrops, saveAdminImageCardCrops } from './adminImageCardCrops'
import { mockResponse } from '../test/helpers'

const fetchMock = vi.fn()

describe('admin image card crop API', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('fetches the crop settings for an uploaded image', async () => {
    const crops = {
      fileName: 'photo.jpg',
      large: { zoomPercent: 120, positionX: 30, positionY: 40 },
      small: { zoomPercent: 150, positionX: 60, positionY: 70 },
    }
    fetchMock.mockResolvedValueOnce(mockResponse(crops))

    await expect(fetchAdminImageCardCrops('photo.jpg')).resolves.toEqual(crops)
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/image-card-crops/photo.jpg', {
      credentials: 'include',
    })
  })

  it('saves independent card settings with a CSRF-protected request', async () => {
    const crops = {
      large: { zoomPercent: 120, positionX: 30, positionY: 40 },
      small: { zoomPercent: 150, positionX: 60, positionY: 70 },
    }
    const savedCrops = { fileName: 'photo.jpg', ...crops }
    fetchMock
      .mockResolvedValueOnce(mockResponse({ token: 'csrf-token', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse(savedCrops))

    await expect(saveAdminImageCardCrops('photo.jpg', crops)).resolves.toEqual(savedCrops)

    const [url, options] = fetchMock.mock.calls[1] as [string, RequestInit]
    expect(url).toBe('/api/admin/image-card-crops/photo.jpg')
    expect(options.method).toBe('PUT')
    expect(new Headers(options.headers).get('X-CSRF-TOKEN')).toBe('csrf-token')
    expect(JSON.parse(String(options.body))).toEqual(crops)
  })
})
