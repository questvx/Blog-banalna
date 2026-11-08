import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteAuthorImage, fetchAuthorImages, replaceAuthorImage, uploadAuthorImage } from './authorMedia'
import { mockResponse } from '../test/helpers'

const fetchMock = vi.fn()

function createFile(name = 'zdjecie.png', type = 'image/png', size = 4) {
  return new File([new Uint8Array(size)], name, { type })
}

describe('author media API', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('resolves uploaded image URLs against the site origin', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse([{ url: '/uploads/zdjecie.png' }]))

    await expect(fetchAuthorImages()).resolves.toEqual([
      new URL('/uploads/zdjecie.png', window.location.origin).toString(),
    ])
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/uploads', { credentials: 'include' })
  })

  it('rejects unsupported image types before making a request', async () => {
    await expect(uploadAuthorImage(createFile('animacja.svg', 'image/svg+xml'))).rejects.toThrow(
      'Wybierz obraz JPEG, PNG, GIF lub WebP.',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects files larger than 5 MB before making a request', async () => {
    await expect(uploadAuthorImage(createFile('duze.png', 'image/png', 5 * 1024 * 1024 + 1))).rejects.toThrow(
      'Obraz może mieć maksymalnie 5 MB.',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('uploads supported files with the CSRF token', async () => {
    fetchMock
      .mockResolvedValueOnce(mockResponse({ token: 'csrf-token', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse({ url: '/uploads/nowe.png' }))

    await expect(uploadAuthorImage(createFile())).resolves.toBe(
      new URL('/uploads/nowe.png', window.location.origin).toString(),
    )

    const [url, options] = fetchMock.mock.calls[1] as [string, RequestInit]
    expect(url).toBe('/api/admin/uploads')
    expect(options.method).toBe('POST')
    expect(options.body).toBeInstanceOf(FormData)
    expect(new Headers(options.headers).get('X-CSRF-TOKEN')).toBe('csrf-token')
  })

  it('replaces an existing image using its encoded filename', async () => {
    fetchMock
      .mockResolvedValueOnce(mockResponse({ token: 'csrf-token', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse({ url: '/uploads/zmienione.png' }))

    await expect(replaceAuthorImage('https://blog.example/uploads/moje zdjecie.png', createFile())).resolves.toBe(
      new URL('/uploads/zmienione.png', window.location.origin).toString(),
    )

    expect(fetchMock.mock.calls[1][0]).toBe('/api/admin/uploads?fileName=moje%20zdjecie.png')
    expect((fetchMock.mock.calls[1][1] as RequestInit).method).toBe('PUT')
  })

  it('prevents editing animated GIFs that would lose their animation', async () => {
    await expect(replaceAuthorImage('https://blog.example/uploads/animacja.gif', createFile('nowy.gif', 'image/gif')))
      .rejects.toThrow('Skalowanie GIF nie jest obsługiwane, ponieważ mogłoby usunąć animację.')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('deletes an image using its decoded filename', async () => {
    fetchMock
      .mockResolvedValueOnce(mockResponse({ token: 'csrf-token', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse({}))

    await expect(deleteAuthorImage('https://blog.example/uploads/moje zdjecie.png')).resolves.toBeUndefined()

    expect(fetchMock.mock.calls[1][0]).toBe('/api/admin/uploads?fileName=moje%20zdjecie.png')
    expect((fetchMock.mock.calls[1][1] as RequestInit).method).toBe('DELETE')
  })
})
