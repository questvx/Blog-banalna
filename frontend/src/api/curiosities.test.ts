import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchCuriosities } from './curiosities'
import { mockResponse } from '../test/helpers'

const fetchMock = vi.fn()

describe('fetchCuriosities', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('fetches published curiosities', async () => {
    const curiosities = [{
      id: 2,
      title: 'Ciekawostka',
      content: 'Pełna treść.',
      createdAt: '2026-11-08T12:00:00',
    }]
    fetchMock.mockResolvedValueOnce(mockResponse(curiosities))

    await expect(fetchCuriosities()).resolves.toEqual(curiosities)
    expect(fetchMock).toHaveBeenCalledWith('/api/curiosities')
  })

  it('reports an error if curiosities cannot be fetched', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({}, 503))

    await expect(fetchCuriosities()).rejects.toThrow('Nie udało się pobrać ciekawostek (503).')
  })
})
