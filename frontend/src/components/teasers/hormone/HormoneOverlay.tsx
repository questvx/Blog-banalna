import { useState } from 'react'
import TeaserOverlay from '../shared/TeaserOverlay'
import { hormoneMoods, type HormoneMood } from './hormoneMoods'
import './HormoneOverlay.css'

type HormoneOverlayProps = {
  onClose: () => void
}

function HormoneOverlay({ onClose }: HormoneOverlayProps) {
  const [selectedMood, setSelectedMood] = useState<HormoneMood | null>(null)

  return (
    <TeaserOverlay
      eyebrow="SPRAWDŹ,"
      title="JAK HORMON jest DZIŚ Z TOBĄ?"
      theme="hormone"
      onClose={onClose}
    >
      <p className="hormone-overlay-prompt">Kim jesteś dzisiaj?</p>
      <div className="hormone-mood-grid" role="group" aria-label="Wybierz swój nastrój">
        {hormoneMoods.map((mood) => (
          <button
            key={mood.id}
            className={`hormone-mood-choice${selectedMood?.id === mood.id ? ' is-selected' : ''}`}
            type="button"
            aria-pressed={selectedMood?.id === mood.id}
            onClick={() => setSelectedMood(mood)}
          >
            <img className="hormone-mood-choice-image" src={mood.image} alt={mood.name} />
            <span>{mood.shortDescription}</span>
          </button>
        ))}
      </div>
      {selectedMood && (
        <section className="hormone-mood-detail" aria-live="polite" aria-labelledby="hormone-mood-title">
          {selectedMood.image && (
            <img
              className="hormone-mood-image"
              src={selectedMood.image}
              alt={`Ilustracja nastroju: ${selectedMood.name.toLocaleLowerCase('pl-PL')}`}
            />
          )}
          <div>
            <p className="hormone-mood-eyebrow">JAKI HORMON</p>
            <h3 id="hormone-mood-title">{selectedMood.name}</h3>
            {selectedMood.sections.map((section, sectionIndex) => (
              <div className="hormone-mood-section" key={`${selectedMood.id}-${sectionIndex}`}>
                {section.heading && <h4>{section.heading}</h4>}
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={`${selectedMood.id}-${sectionIndex}-${paragraphIndex}`}>{paragraph}</p>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}
    </TeaserOverlay>
  )
}

export default HormoneOverlay
