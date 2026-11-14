import type { ImageCardCrops } from '../data/imageCardCrops'
import { fetchCsrfToken } from './auth'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

async function ensureSuccess(response: Response, action: string): Promise<Response> {
  if (response.status === 401) throw new Error('Sesja wygasła. Zaloguj się ponownie.')
  if (response.status === 403) throw new Error('Brak uprawnień do zmiany kadru zdjęcia.')
  if (response.status === 404) throw new Error('Nie znaleziono wgranego zdjęcia.')
  if (!response.ok) throw new Error(`Nie udało się ${action} (${response.status}).`)
  return response
}

export async function fetchAdminImageCardCrops(fileName: string): Promise<ImageCardCrops> {
  const response = await fetch(`${API_URL}/admin/image-card-crops/${encodeURIComponent(fileName)}`, {
    credentials: 'include',
  })
  await ensureSuccess(response, 'pobrać kadru zdjęcia')
  return response.json() as Promise<ImageCardCrops>
}

export async function saveAdminImageCardCrops(
  fileName: string,
  crops: Omit<ImageCardCrops, 'fileName'>,
): Promise<ImageCardCrops> {
  const csrf = await fetchCsrfToken()
  const response = await fetch(`${API_URL}/admin/image-card-crops/${encodeURIComponent(fileName)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify(crops),
  })
  await ensureSuccess(response, 'zapisać kadru zdjęcia')
  return response.json() as Promise<ImageCardCrops>
}
