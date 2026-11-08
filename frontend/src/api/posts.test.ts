import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockResponse } from '../test/helpers'
import { fetchPosts } from './posts'

const fetchMock = vi.fn()

describe('fetchPosts', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  it('fetches and returns the published post list', async () => {
    const posts = [{ id: 1, title: 'Wpis' }]
    fetchMock.mockResolvedValueOnce(mockResponse(posts))

    await expect(fetchPosts()).resolves.toEqual(posts)
    expect(fetchMock).toHaveBeenCalledWith('/api/posts')
  })

  it('reports the HTTP status when the request fails', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({}, 503))

    await expect(fetchPosts()).rejects.toThrow('Nie udało się pobrać wpisów (503).')
  })
})
