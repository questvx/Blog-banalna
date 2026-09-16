import type { TeaserProps } from './teasers/TeaserTypes'
import './HormoneTeaser.css'

function HormoneTeaser({ isVisible, isDismissed, onToggle }: TeaserProps) {
  const isOpen = isVisible && !isDismissed
  const teaserClassName = [
    'hormone-teaser',
    isVisible ? 'is-visible' : '',
    isDismissed ? 'is-dismissed' : '',
  ].filter(Boolean).join(' ')

  return (
    <aside className={teaserClassName} aria-label="Hormony">
      <a className="hormone-teaser-link" href="#hormony">
        <span className="hormone-symbol" aria-hidden="true">✦</span>
        <span className="hormone-copy">
          <span className="hormone-eyebrow">wsłuchaj się w siebie</span>
          <span className="hormone-message">Sprawdź swoje hormony</span>
        </span>
      </a>
      <button
        className="hormone-close"
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? 'Zwiń hormony' : 'Rozwiń hormony'}
      >
        {isOpen ? '×' : ''}
      </button>
    </aside>
  )
}

export default HormoneTeaser
