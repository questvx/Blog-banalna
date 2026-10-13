export type HeroMessage = {
  message: string
}

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export async function fetchHeroMessage(signal?: AbortSignal): Promise<HeroMessage> {
  const response = await fetch(`${API_URL}/hero-message`, { signal })
  if (!response.ok) throw new Error(`Nie udało się pobrać wiadomości powitalnej (${response.status}).`)
  return response.json() as Promise<HeroMessage>
}
