import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addDaysToDate,
  createEmptyHoroscopeTexts,
  fetchCurrentHoroscope,
  getHoroscopeWeekDates,
  horoscopeSigns,
  saveAdminHoroscope,
} from './adminHoroscopes'
import { mockResponse } from '../test/helpers'

const fetchMock = vi.fn()

describe('horoscope API helpers', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('treats a missing current horoscope as an empty result', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({}, 404))

    await expect(fetchCurrentHoroscope()).resolves.toBeNull()
    expect(fetchMock).toHaveBeenCalledWith('/api/horoscopes/current', { signal: undefined })
  })

  it('surfaces errors when the current horoscope cannot be loaded', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({}, 503))

    await expect(fetchCurrentHoroscope()).rejects.toThrow('Nie udało się pobrać horoskopu (503).')
  })

  it('creates a blank entry for each zodiac sign', () => {
    const texts = createEmptyHoroscopeTexts()

    expect(Object.keys(texts)).toHaveLength(12)
    expect(Object.keys(texts)).toEqual(horoscopeSigns.map(({ id }) => id))
    expect(Object.values(texts).every((text) => text === '')).toBe(true)
  })

  it('adds calendar days across month and leap-year boundaries', () => {
    expect(addDaysToDate('2024-02-27', 3)).toBe('2024-03-01')
    expect(addDaysToDate('2025-12-29', 7)).toBe('2026-01-05')
  })

  it('formats the full date range of a horoscope week', () => {
    expect(getHoroscopeWeekDates('2026-09-07')).toBe('7 września 2026 – 13 września 2026')
  })

  it('saves weekly horoscope texts using a CSRF-protected update', async () => {
    const signs = createEmptyHoroscopeTexts()
    signs.ARIES = 'Dobry tydzień.'
    const savedWeek = { weekStart: '2026-09-07', signs }
    fetchMock
      .mockResolvedValueOnce(mockResponse({ token: 'csrf-token', headerName: 'X-CSRF-TOKEN' }))
      .mockResolvedValueOnce(mockResponse(savedWeek))

    await expect(saveAdminHoroscope('2026-09-07', signs)).resolves.toEqual(savedWeek)
    expect(fetchMock.mock.calls[1][0]).toBe('/api/admin/horoscopes/2026-09-07')
    expect(fetchMock.mock.calls[1][1]).toEqual(expect.objectContaining({
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify({ signs }),
    }))
  })
})
