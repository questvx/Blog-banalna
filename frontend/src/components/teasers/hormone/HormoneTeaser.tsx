import { useCallback, useState } from 'react'
import type { TeaserProps } from '../shared/TeaserTypes'
import HormoneOverlay from './HormoneOverlay'
import './HormoneTeaser.css'

function HormoneTeaser({ isVisible, isDismissed, onToggle }: TeaserProps) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const closeOverlay = useCallback(() => setIsOverlayOpen(false), [])
  const isOpen = isVisible && !isDismissed
  const teaserClassName = [
    'hormone-teaser',
    isVisible ? 'is-visible' : '',
    isDismissed ? 'is-dismissed' : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      <aside className={teaserClassName} aria-label="Hormony">
        <button
          className="hormone-teaser-link"
          type="button"
          onClick={() => setIsOverlayOpen(true)}
          aria-haspopup="dialog"
          aria-label="Sprawdź swoje hormony"
        >
          <span className="hormone-symbol" aria-hidden="true">✦</span>
          <span className="hormone-copy">
            <span className="hormone-eyebrow">wsłuchaj się w siebie</span>
            <span className="hormone-message">Sprawdź swoje hormony</span>
          </span>
        </button>
        <button
          className="hormone-close"
          type="button"
          onClick={onToggle}
          aria-label={isOpen ? 'Zwiń hormony' : 'Rozwiń hormony'}
        >
          {isOpen ? '×' : ''}
        </button>
      </aside>
      {isOverlayOpen && <HormoneOverlay onClose={closeOverlay} />}
    </>
  )
}

export default HormoneTeaser
