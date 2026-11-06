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

    expect(screen.getByRole('dialog', { name: 'JAK HORMON jest DZIŚ Z TOBĄ?' })).toBeInTheDocument()
    expect(screen.getByText('Kim jesteś dzisiaj?')).toBeInTheDocument()

    for (const mood of hormoneMoods) {
      expect(screen.getByRole('button', { name: mood.name })).toHaveAttribute('aria-pressed', 'false')
    }
  })

  it.each(hormoneMoods)('shows the description for $name', (mood) => {
    openHormoneOverlay()
    fireEvent.click(screen.getByRole('button', { name: mood.name }))

    expect(screen.getByRole('heading', { name: mood.name })).toBeInTheDocument()
    expect(screen.getByText(mood.description)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: mood.name })).toHaveAttribute('aria-pressed', 'true')
  })

  it('lets the reader change mood and close the overlay with Escape', () => {
    openHormoneOverlay()
    fireEvent.click(screen.getByRole('button', { name: 'ZŁOŚNICA' }))
    fireEvent.click(screen.getByRole('button', { name: 'NIE DZIŚ' }))

    expect(screen.getByRole('button', { name: 'ZŁOŚNICA' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'NIE DZIŚ' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Nic Ci się dziś nie chce… Tak bardzo nie chce… I właściwie nie widzisz żadnego powodu, żeby to zmieniać.')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
