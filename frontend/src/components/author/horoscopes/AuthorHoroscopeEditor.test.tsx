import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { HoroscopeTexts } from '../../../api/adminHoroscopes'
import AuthorHoroscopeEditor from './AuthorHoroscopeEditor'

describe('AuthorHoroscopeEditor', () => {
  it('submits the selected weekly text for every zodiac sign', () => {
    const onSubmit = vi.fn()
    const initialSigns: Partial<HoroscopeTexts> = { ARIES: 'Dobry tydzień.' }
    render(
      <AuthorHoroscopeEditor
        weekStart="2026-09-07"
        initialSigns={initialSigns}
        isSaving={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByLabelText(/Baran/)).toHaveValue('Dobry tydzień.')
    fireEvent.change(screen.getByLabelText(/Byk/), { target: { value: 'Spokojny tydzień.' } })
    const form = screen.getByRole('button', { name: 'Zapisz horoskop' }).closest('form')
    if (!form) throw new Error('Horoscope form was not rendered.')
    fireEvent.submit(form)

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      ARIES: 'Dobry tydzień.',
      TAURUS: 'Spokojny tydzień.',
      PISCES: '',
    }))
  })

  it('closes on Escape unless the editor is saving', () => {
    const onClose = vi.fn()
    const props = {
      weekStart: '2026-09-07',
      initialSigns: {},
      onClose,
      onSubmit: vi.fn(),
    }
    const { rerender } = render(<AuthorHoroscopeEditor {...props} isSaving={false} />)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()

    onClose.mockClear()
    rerender(<AuthorHoroscopeEditor {...props} isSaving />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
