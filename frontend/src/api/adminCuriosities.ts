import type { Curiosity } from '../data/curiosities'
import { fetchCsrfToken } from './auth'

export type AdminCuriosity = Curiosity & {
  status: 'DRAFT' | 'PUBLISHED'
}

export type CuriosityInput = Omit<AdminCuriosity, 'id'>

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

async function ensureSuccess(response: Response, action: string): Promise<Response> {
  if (response.status === 401) throw new Error('Sesja wygasła. Zaloguj się ponownie.')
  if (response.status === 403) throw new Error('Brak uprawnień do wykonania tej operacji.')
  if (!response.ok) throw new Error(`Nie udało się ${action} (${response.status}).`)
  return response
}

export async function fetchAdminCuriosities(): Promise<AdminCuriosity[]> {
  const response = await fetch(`${API_URL}/admin/curiosities`, { credentials: 'include' })
  await ensureSuccess(response, 'pobrać ciekawostek')
  return response.json() as Promise<AdminCuriosity[]>
}

export async function saveAdminCuriosity(id: number | null, curiosity: CuriosityInput): Promise<AdminCuriosity> {
  const csrf = await fetchCsrfToken()
  const response = await fetch(id === null ? `${API_URL}/admin/curiosities` : `${API_URL}/admin/curiosities/${id}`, {
    method: id === null ? 'POST' : 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify(curiosity),
  })
  await ensureSuccess(response, 'zapisać ciekawostki')
  return response.json() as Promise<AdminCuriosity>
}

export async function deleteAdminCuriosity(id: number): Promise<void> {
  const csrf = await fetchCsrfToken()
  const response = await fetch(`${API_URL}/admin/curiosities/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { [csrf.headerName]: csrf.token },
  })
  await ensureSuccess(response, 'usunąć ciekawostki')
}
