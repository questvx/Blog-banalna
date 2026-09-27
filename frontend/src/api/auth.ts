const API_URL = import.meta.env.VITE_API_URL ?? '/api'

type CsrfResponse = {
  token: string
  headerName: string
}

export type AuthorSession = {
  username: string
}

async function fetchCsrfToken(): Promise<CsrfResponse> {
  const response = await fetch(`${API_URL}/auth/csrf`, { credentials: 'include' })
  if (!response.ok) throw new Error('Nie udało się przygotować bezpiecznego logowania.')
  return response.json() as Promise<CsrfResponse>
}

export async function getAuthorSession(): Promise<AuthorSession | null> {
  const response = await fetch(`${API_URL}/auth/me`, { credentials: 'include' })
  if (response.status === 401) return null
  if (!response.ok) throw new Error('Nie udało się sprawdzić sesji autorki.')
  return response.json() as Promise<AuthorSession>
}

export async function loginAuthor(username: string, password: string): Promise<AuthorSession> {
  const csrf = await fetchCsrfToken()
  const body = new URLSearchParams({ username, password })
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    body,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      [csrf.headerName]: csrf.token,
    },
  })

  if (response.status === 401) throw new Error('Nieprawidłowy login lub hasło.')
  if (!response.ok) throw new Error('Logowanie nie powiodło się. Spróbuj ponownie.')

  const session = await getAuthorSession()
  if (!session) throw new Error('Logowanie nie utworzyło aktywnej sesji.')
  return session
}

export async function logoutAuthor(): Promise<void> {
  const csrf = await fetchCsrfToken()
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { [csrf.headerName]: csrf.token },
  })

  if (!response.ok) throw new Error('Nie udało się wylogować.')
}