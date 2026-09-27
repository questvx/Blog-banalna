import type { AuthorPost, PostInput } from '../../api/adminPosts'

export type AuthorPostForm = {
  title: string
  excerpt: string
  content: string
  date: string
  category: string
  image: string
  featured: boolean
  status: 'DRAFT' | 'PUBLISHED'
}

export const authorCategories = ['kuchnia', 'filmy', 'książka', 'technologia', 'sport', 'dlaczego?', 'inne']

function today() {
  const localDate = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}

export function createEmptyAuthorPostForm(): AuthorPostForm {
  return {
    title: '',
    excerpt: '',
    content: '',
    date: today(),
    category: 'inne',
    image: '',
    featured: false,
    status: 'DRAFT',
  }
}

export function authorPostToForm(post: AuthorPost): AuthorPostForm {
  return {
    title: post.title,
    excerpt: post.excerpt,
    content: post.content.join('\n\n'),
    date: post.date,
    category: post.category,
    image: post.image,
    featured: post.featured ?? false,
    status: post.status,
  }
}

export function authorPostFormToInput(form: AuthorPostForm): PostInput {
  return {
    title: form.title.trim(),
    excerpt: form.excerpt.trim(),
    content: form.content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean),
    date: form.date,
    category: form.category,
    image: form.image.trim(),
    featured: form.featured,
    status: form.status,
  }
}