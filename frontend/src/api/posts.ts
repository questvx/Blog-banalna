import type { Post } from '../data/posts'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export async function fetchPosts(): Promise<Post[]> {
  const response = await fetch(`${API_URL}/posts`)

  if (!response.ok) {
    throw new Error(`Nie udało się pobrać wpisów (${response.status}).`)
  }

  return response.json() as Promise<Post[]>
}