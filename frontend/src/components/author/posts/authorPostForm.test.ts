import { describe, expect, it } from 'vitest'
import type { AuthorPost } from '../../../api/adminPosts'
import {
  authorPostFormToInput,
  authorPostToForm,
  createEmptyAuthorPostForm,
} from './authorPostForm'

describe('author post form conversions', () => {
  it('creates a blank draft with a local ISO date', () => {
    const form = createEmptyAuthorPostForm()

    expect(form).toMatchObject({
      title: '',
      excerpt: '',
      content: '',
      category: 'inne',
      image: '',
      featured: false,
      status: 'DRAFT',
    })
    expect(form.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('converts an author post to editable form fields', () => {
    const post: AuthorPost = {
      id: 8,
      title: 'Tytuł',
      excerpt: 'Opis',
      content: ['Pierwszy akapit.', 'Drugi akapit.'],
      date: '2026-09-12',
      category: 'filmy',
      image: '/uploads/post.jpg',
      status: 'PUBLISHED',
    }

    expect(authorPostToForm(post)).toEqual({
      title: 'Tytuł',
      excerpt: 'Opis',
      content: 'Pierwszy akapit.\n\nDrugi akapit.',
      date: '2026-09-12',
      category: 'filmy',
      image: '/uploads/post.jpg',
      featured: false,
      status: 'PUBLISHED',
    })
  })

  it('trims fields and splits non-empty paragraphs when saving', () => {
    const form = createEmptyAuthorPostForm()
    form.title = '  Tytuł  '
    form.excerpt = '  Opis  '
    form.image = '  /uploads/post.jpg  '
    form.content = '  Pierwszy akapit.  \n\n \n Drugi akapit. \n\n'
    form.featured = true
    form.status = 'PUBLISHED'

    expect(authorPostFormToInput(form)).toMatchObject({
      title: 'Tytuł',
      excerpt: 'Opis',
      content: ['Pierwszy akapit.', 'Drugi akapit.'],
      image: '/uploads/post.jpg',
      featured: true,
      status: 'PUBLISHED',
    })
  })
})
