import { useCallback, useState } from 'react'
import type { TeaserProps } from './teasers/TeaserTypes'
import HoroscopeOverlay from './HoroscopeOverlay'
import './HoroscopeTeaser.css'

function HoroscopeTeaser({ isVisible, isDismissed, onToggle }: TeaserProps) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const closeOverlay = useCallback(() => setIsOverlayOpen(false), [])
  const isOpen = isVisible && !isDismissed
  const teaserClassName = [
    'horoscope-teaser',
    isVisible ? 'is-visible' : '',
    isDismissed ? 'is-dismissed' : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      <aside className={teaserClassName} aria-label="Horoskop">
        <button
          className="horoscope-teaser-link"
          type="button"
          onClick={() => setIsOverlayOpen(true)}
          aria-haspopup="dialog"
        >
          <span className="horoscope-moon" aria-hidden="true" />
          <span className="horoscope-copy">
            <span className="horoscope-eyebrow">gwiazdy mówią</span>
            <span className="horoscope-message">Sprawdź swój horoskop</span>
          </span>
        </button>
        <button
          className="horoscope-close"
          type="button"
          onClick={onToggle}
          aria-label={isOpen ? 'Zwiń horoskop' : 'Rozwiń horoskop'}
        >
          {isOpen ? '×' : ''}
        </button>
      </aside>
      {isOverlayOpen && <HoroscopeOverlay onClose={closeOverlay} />}
    </>
  )
}

export default HoroscopeTeaser
