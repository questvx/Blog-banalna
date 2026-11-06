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
            {mood.name}
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
            <h3 id="hormone-mood-title">{selectedMood.name}</h3>
            <p>{selectedMood.description}</p>
          </div>
        </section>
      )}
    </TeaserOverlay>
  )
}

export default HormoneOverlay
