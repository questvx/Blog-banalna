import { fetchCsrfToken } from './auth'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

type ImageUploadResponse = {
  url: string
}

export async function uploadAuthorImage(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Wybierz obraz JPEG, PNG, GIF lub WebP.')
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Obraz może mieć maksymalnie 5 MB.')
  }

  const csrf = await fetchCsrfToken()
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_URL}/admin/uploads`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers: { [csrf.headerName]: csrf.token },
  })

  if (response.status === 401) throw new Error('Sesja wygasła. Zaloguj się ponownie.')
  if (response.status === 403) throw new Error('Brak uprawnień do wysłania obrazu.')
  if (response.status === 413) throw new Error('Obraz może mieć maksymalnie 5 MB.')
  if (response.status === 415) throw new Error('Ten format obrazu nie jest obsługiwany.')
  if (!response.ok) throw new Error(`Nie udało się wysłać obrazu (${response.status}).`)

  const { url } = await response.json() as ImageUploadResponse
  const apiOrigin = new URL(API_URL, window.location.origin).origin
  return new URL(url, apiOrigin).toString()
}