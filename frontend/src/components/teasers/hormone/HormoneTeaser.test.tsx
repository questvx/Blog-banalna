import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { hormoneMoods } from './hormoneMoods'
import HormoneTeaser from './HormoneTeaser'

function openHormoneOverlay() {
  const onToggle = vi.fn()
  render(<HormoneTeaser isVisible isDismissed={false} onToggle={onToggle} />)
  fireEvent.click(screen.getByRole('button', { name: 'Sprawdź swoje hormony' }))
  return { onToggle }
}

describe('HormoneTeaser', () => {
  it('opens the hormone overlay with every mood available', () => {
    openHormoneOverlay()

    expect(screen.getByRole('dialog', { name: 'Jaki hormon jest dziś z Tobą?' })).toBeInTheDocument()
    expect(screen.getByText('Kim jesteś dzisiaj?')).toBeInTheDocument()

    for (const mood of hormoneMoods) {
      const choice = screen.getByRole('button', { name: new RegExp(mood.name) })
      expect(choice).toHaveAttribute('aria-pressed', 'false')
      expect(choice).toHaveTextContent(mood.shortDescription)
      expect(screen.getByRole('img', { name: mood.name })).toBeInTheDocument()
    }
  })

  it.each(hormoneMoods)('shows the description for $name', (mood) => {
    openHormoneOverlay()
    fireEvent.click(screen.getByRole('button', { name: new RegExp(mood.name) }))

    expect(screen.getByRole('heading', { name: mood.name })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: new RegExp(mood.name) })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(mood.sections[0].paragraphs[1])).toBeInTheDocument()
  })

  it('lets the reader change mood and close the overlay with Escape', () => {
    openHormoneOverlay()
    fireEvent.click(screen.getByRole('button', { name: /ZŁOŚNICA/ }))
    fireEvent.click(screen.getByRole('button', { name: /KOCIAK/ }))

    expect(screen.getByRole('button', { name: /ZŁOŚNICA/ })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: /KOCIAK/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { name: 'A co na to hormony?' })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
