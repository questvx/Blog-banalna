import { fireEvent, render, screen } from '@testing-library/react'
import type { FormEvent } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AuthorPostForm } from './authorPostForm'
import { createEmptyAuthorPostForm } from './authorPostForm'
import AuthorPostEditor from './AuthorPostEditor'

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')

function renderEditor(form: AuthorPostForm = createEmptyAuthorPostForm()) {
  const onChange = vi.fn()
  const onClose = vi.fn()
  const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault())

  render(
    <AuthorPostEditor
      form={form}
      editingId={null}
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

  it('notifies the parent when the editor is cancelled', () => {
    const { onClose } = renderEditor()

    fireEvent.click(screen.getByRole('button', { name: 'Anuluj' }))

    expect(onClose).toHaveBeenCalledOnce()
  })
})
