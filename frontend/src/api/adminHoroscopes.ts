import { fetchCsrfToken } from './auth'

export const horoscopeSigns = [
  { id: 'ARIES', name: 'Baran', symbol: '♈' },
  { id: 'TAURUS', name: 'Byk', symbol: '♉' },
  { id: 'GEMINI', name: 'Bliźnięta', symbol: '♊' },
  { id: 'CANCER', name: 'Rak', symbol: '♋' },
  { id: 'LEO', name: 'Lew', symbol: '♌' },
  { id: 'VIRGO', name: 'Panna', symbol: '♍' },
  { id: 'LIBRA', name: 'Waga', symbol: '♎' },
  { id: 'SCORPIO', name: 'Skorpion', symbol: '♏' },
  { id: 'SAGITTARIUS', name: 'Strzelec', symbol: '♐' },
  { id: 'CAPRICORN', name: 'Koziorożec', symbol: '♑' },
  { id: 'AQUARIUS', name: 'Wodnik', symbol: '♒' },
  { id: 'PISCES', name: 'Ryby', symbol: '♓' },
] as const

export type HoroscopeSign = (typeof horoscopeSigns)[number]['id']
export type HoroscopeTexts = Record<HoroscopeSign, string>

export type AdminHoroscopeWeek = {
  weekStart: string
  signs: Partial<Record<HoroscopeSign, string>>
}

export type CurrentHoroscope = AdminHoroscopeWeek

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

async function ensureSuccess(response: Response): Promise<Response> {
  if (response.status === 401) throw new Error('Sesja wygasła. Zaloguj się ponownie.')
  if (response.status === 403) throw new Error('Brak uprawnień do wykonania tej operacji.')
  if (!response.ok) throw new Error(`Nie udało się pobrać ani zapisać horoskopu (${response.status}).`)
  return response
}

export async function fetchAdminHoroscopes(): Promise<AdminHoroscopeWeek[]> {
  const response = await fetch(`${API_URL}/admin/horoscopes`, { credentials: 'include' })
  await ensureSuccess(response)
  return response.json() as Promise<AdminHoroscopeWeek[]>
}

export async function fetchCurrentHoroscope(signal?: AbortSignal): Promise<CurrentHoroscope | null> {
  const response = await fetch(`${API_URL}/horoscopes/current`, { signal })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Nie udało się pobrać horoskopu (${response.status}).`)
  return response.json() as Promise<CurrentHoroscope>
}

export async function saveAdminHoroscope(
  weekStart: string,
  signs: HoroscopeTexts,
): Promise<AdminHoroscopeWeek> {
  const csrf = await fetchCsrfToken()
  const response = await fetch(`${API_URL}/admin/horoscopes/${weekStart}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify({ signs }),
  })
  await ensureSuccess(response)
  return response.json() as Promise<AdminHoroscopeWeek>
}

export function createEmptyHoroscopeTexts(): HoroscopeTexts {
  return Object.fromEntries(horoscopeSigns.map(({ id }) => [id, ''])) as HoroscopeTexts
}

export function getHoroscopeWeekDates(weekStart: string) {
  const start = new Date(`${weekStart}T12:00:00`)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const formatter = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
  return `${formatter.format(start)} – ${formatter.format(end)}`
}

export function getCurrentHoroscopeWeekStart() {
  const monday = new Date()
  monday.setHours(12, 0, 0, 0)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
}

export function addDaysToDate(date: string, days: number) {
  const result = new Date(`${date}T12:00:00`)
  result.setDate(result.getDate() + days)
  return `${result.getFullYear()}-${String(result.getMonth() + 1).padStart(2, '0')}-${String(result.getDate()).padStart(2, '0')}`
}
