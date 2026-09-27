import type { Post } from '../data/posts'
import { fetchCsrfToken } from './auth'

export type AuthorPost = Post & {
  status: 'DRAFT' | 'PUBLISHED'
}

export type PostInput = Omit<AuthorPost, 'id'>

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

async function ensureSuccess(response: Response): Promise<Response> {
  if (response.status === 401) throw new Error('Sesja wygasła. Zaloguj się ponownie.')
  if (response.status === 403) throw new Error('Brak uprawnień do wykonania tej operacji.')
  if (!response.ok) throw new Error(`Nie udało się zapisać zmian (${response.status}).`)
  return response
}

export async function fetchAdminPosts(): Promise<AuthorPost[]> {
  const response = await fetch(`${API_URL}/admin/posts`, { credentials: 'include' })
  await ensureSuccess(response)
  return response.json() as Promise<AuthorPost[]>
}

export async function saveAdminPost(id: number | null, post: PostInput): Promise<AuthorPost> {
  const csrf = await fetchCsrfToken()
  const response = await fetch(id === null ? `${API_URL}/admin/posts` : `${API_URL}/admin/posts/${id}`, {
    method: id === null ? 'POST' : 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify(post),
  })
  await ensureSuccess(response)
  return response.json() as Promise<AuthorPost>
}

export async function deleteAdminPost(id: number): Promise<void> {
  const csrf = await fetchCsrfToken()
  const response = await fetch(`${API_URL}/admin/posts/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { [csrf.headerName]: csrf.token },
  })
  await ensureSuccess(response)
}