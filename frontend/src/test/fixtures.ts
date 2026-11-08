import type { Post } from '../data/posts'

export function createPost(overrides: Partial<Post> = {}): Post {
  return {
    id: 1,
    title: 'Przykładowy wpis',
    excerpt: 'Krótki opis wpisu.',
    content: ['Treść wpisu.'],
    date: '2026-09-12',
    category: 'kuchnia',
    image: '/uploads/przyklad.jpg',
    featured: false,
    ...overrides,
  }
}
