import type { Curiosity } from '../data/curiosities'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export async function fetchCuriosities(): Promise<Curiosity[]> {
  const response = await fetch(`${API_URL}/curiosities`)

  if (!response.ok) {
    throw new Error(`Nie udało się pobrać ciekawostek (${response.status}).`)
  }

  return response.json() as Promise<Curiosity[]>
}
