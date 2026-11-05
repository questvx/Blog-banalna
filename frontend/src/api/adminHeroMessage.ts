import { fetchCsrfToken } from './auth'

export type HeroMessage = {
  message: string
}

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

async function ensureSuccess(response: Response): Promise<Response> {
  if (response.status === 401) throw new Error('Sesja wygasła. Zaloguj się ponownie.')
  if (response.status === 403) throw new Error('Brak uprawnień do wykonania tej operacji.')
  if (!response.ok) throw new Error(`Nie udało się pobrać ani zapisać wiadomości (${response.status}).`)
  return response
}

export async function fetchAdminHeroMessage(): Promise<HeroMessage> {
  const response = await fetch(`${API_URL}/admin/hero-message`, { credentials: 'include' })
  await ensureSuccess(response)
  return response.json() as Promise<HeroMessage>
}

export async function saveAdminHeroMessage(message: string): Promise<HeroMessage> {
  const csrf = await fetchCsrfToken()
  const response = await fetch(`${API_URL}/admin/hero-message`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify({ message }),
  })
  await ensureSuccess(response)
  return response.json() as Promise<HeroMessage>
}
