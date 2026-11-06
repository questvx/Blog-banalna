import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TeaserManager from './TeaserManager'

vi.mock('./teaserConfig', () => ({
  teaserSettings: {
    scrollThreshold: 10,
    definitions: [{
      id: 'test',
      revealDelayMs: 100,
      component: ({
        isVisible,
        isDismissed,
        onToggle,
      }: { isVisible: boolean; isDismissed: boolean; onToggle: () => void }) => (
        <button type="button" data-visible={isVisible} onClick={onToggle}>
          {isDismissed ? 'Pokaż teaser' : 'Ukryj teaser'}
        </button>
      ),
    }],
  },
}))

describe('TeaserManager', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
  })

  it('reveals teasers after the reader scrolls past the threshold and delay', () => {
    vi.useFakeTimers()
    Object.defineProperty(window, 'scrollY', { value: 20, configurable: true })
    render(<TeaserManager />)

    fireEvent.scroll(window)
    act(() => vi.advanceTimersByTime(100))

    expect(screen.getByRole('button')).toHaveAttribute('data-visible', 'true')
  })

  it('toggles a teaser between visible and dismissed states', () => {
    render(<TeaserManager />)
    const toggle = screen.getByRole('button', { name: 'Ukryj teaser' })

    fireEvent.click(toggle)

    expect(screen.getByRole('button', { name: 'Pokaż teaser' })).toBeInTheDocument()
  })
})
