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
      expect(choice).toHaveTextContent(mood.shortDescription)
      expect(screen.getByRole('img', { name: mood.name })).toBeInTheDocument()
    }
  })

  it.each(hormoneMoods)('shows the description for $name', (mood) => {
    openHormoneOverlay()
    fireEvent.click(screen.getByRole('button', { name: new RegExp(mood.name) }))

    expect(screen.getByRole('heading', { name: mood.name })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Wybierz swój nastrój' })).not.toBeInTheDocument()
    expect(screen.queryByText('Kim jesteś dzisiaj?')).not.toBeInTheDocument()
    expect(screen.getByText(mood.sections[0].paragraphs[1])).toBeInTheDocument()
  })

  it('shows only the selected mood and closes the overlay with Escape', () => {
    openHormoneOverlay()
    fireEvent.click(screen.getByRole('button', { name: /ZŁOŚNICA/ }))

    expect(screen.getByRole('heading', { name: 'ZŁOŚNICA' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /KOCIAK/ })).not.toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
