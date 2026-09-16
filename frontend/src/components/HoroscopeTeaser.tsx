import type { TeaserProps } from './teasers/TeaserTypes'
import './HoroscopeTeaser.css'

function HoroscopeTeaser({ isVisible, isDismissed, onToggle }: TeaserProps) {
  const isOpen = isVisible && !isDismissed
  const teaserClassName = [
    'horoscope-teaser',
    isVisible ? 'is-visible' : '',
    isDismissed ? 'is-dismissed' : '',
  ].filter(Boolean).join(' ')

  return (
    <aside className={teaserClassName} aria-label="Horoskop">
      <a className="horoscope-teaser-link" href="#horoskop">
        <span className="horoscope-moon" aria-hidden="true" />
        <span className="horoscope-copy">
          <span className="horoscope-eyebrow">gwiazdy mówią</span>
          <span className="horoscope-message">Sprawdź swój horoskop</span>
        </span>
      </a>
      <button
        className="horoscope-close"
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? 'Zwiń horoskop' : 'Rozwiń horoskop'}
      >
        {isOpen ? '×' : ''}
      </button>
    </aside>
  )
}

export default HoroscopeTeaser
