import { fireEvent, render, screen } from '@testing-library/react'
import type { FormEvent } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AuthorPost } from '../../../api/adminPosts'
import type { AuthorPostForm } from './authorPostForm'
import { createEmptyAuthorPostForm } from './authorPostForm'
import AuthorPostEditor from './AuthorPostEditor'

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')

function renderEditor(
  form: AuthorPostForm = createEmptyAuthorPostForm(),
  posts: AuthorPost[] = [],
  editingId: number | null = null,
) {
  const onChange = vi.fn()
  const onClose = vi.fn()
  const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault())

  render(
    <AuthorPostEditor
      form={form}
      editingId={editingId}
      posts={posts}
      isSaving={false}
      onChange={onChange}
      onClose={onClose}
      onSubmit={onSubmit}
    />,
  )

  return { onChange, onClose, onSubmit }
}

afterEach(() => {
  if (originalClipboard) {
    Object.defineProperty(navigator, 'clipboard', originalClipboard)
  } else {
    Reflect.deleteProperty(navigator, 'clipboard')
  }
})

describe('AuthorPostEditor', () => {
  it('copies a safe HTML link that opens in a new tab', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    renderEditor()

    fireEvent.change(screen.getByLabelText('Tekst linku'), { target: { value: 'Polecana <strona>' } })
    fireEvent.change(screen.getByLabelText('Adres strony'), { target: { value: 'https://example.com/polecana?a=1&b=2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Kopiuj znacznik linku' }))

    expect(await screen.findByRole('button', { name: 'Skopiowano znacznik' })).toBeInTheDocument()
    expect(writeText).toHaveBeenCalledWith(
      '<a href="https://example.com/polecana?a=1&amp;b=2" target="_blank" rel="noopener noreferrer">Polecana &lt;strona&gt;</a>',
    )
  })

  it('rejects non-HTTP links before writing to the clipboard', async () => {
    const writeText = vi.fn()
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    renderEditor()

    fireEvent.change(screen.getByLabelText('Tekst linku'), { target: { value: 'Strona' } })
    fireEvent.change(screen.getByLabelText('Adres strony'), { target: { value: 'javascript:alert(1)' } })
    fireEvent.click(screen.getByRole('button', { name: 'Kopiuj znacznik linku' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Link może prowadzić tylko do strony HTTP lub HTTPS.')
    expect(writeText).not.toHaveBeenCalled()
  })

  it('copies a host-independent recommendation marker for another published post', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const posts: AuthorPost[] = [
      {
        id: 11,
        title: 'Polecany wpis',
        excerpt: 'Nagłówek',
        content: [],
        date: '2026-10-01',
        category: 'inne',
        image: '/uploads/post.jpg',
        status: 'PUBLISHED',
      },
      {
        id: 12,
        title: 'Edytowany wpis',
        excerpt: 'Nagłówek',
        content: [],
        date: '2026-10-01',
        category: 'inne',
        image: '/uploads/post.jpg',
        status: 'PUBLISHED',
      },
      {
        id: 13,
        title: 'Szkic',
        excerpt: 'Nagłówek',
        content: [],
        date: '2026-10-01',
        category: 'inne',
        image: '/uploads/draft.jpg',
        status: 'DRAFT',
      },
    ]
    renderEditor(createEmptyAuthorPostForm(), posts, 12)

    const selector = screen.getByLabelText('Wpis do polecenia')
    expect(selector).toHaveTextContent('Polecany wpis')
    expect(selector).not.toHaveTextContent('Edytowany wpis')
    expect(selector).not.toHaveTextContent('Szkic')
    fireEvent.change(selector, { target: { value: '11' } })
    fireEvent.click(screen.getByRole('button', { name: 'Kopiuj polecajkę' }))

    expect(await screen.findByRole('button', { name: 'Skopiowano polecajkę' })).toBeInTheDocument()
    expect(writeText).toHaveBeenCalledWith('<polecajka id="11"></polecajka>')
  })

  it('notifies the parent when the editor is cancelled', () => {
    const { onClose } = renderEditor()

    fireEvent.click(screen.getByRole('button', { name: 'Anuluj' }))

    expect(onClose).toHaveBeenCalledOnce()
  })
})
