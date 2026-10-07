import { useEffect, useState } from 'react'
import { fetchCurrentHoroscope, getHoroscopeWeekDates, horoscopeSigns, type CurrentHoroscope } from '../api/adminHoroscopes'
import TeaserOverlay from './teasers/TeaserOverlay'
import './HoroscopeOverlay.css'

type HoroscopeOverlayProps = {
  onClose: () => void
}

function HoroscopeOverlay({ onClose }: HoroscopeOverlayProps) {
  const [selectedSign, setSelectedSign] = useState<(typeof horoscopeSigns)[number]>()
  const [horoscope, setHoroscope] = useState<CurrentHoroscope | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    fetchCurrentHoroscope(controller.signal)
      .then(setHoroscope)
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : 'Nie udało się pobrać horoskopu.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [])

  return (
    <TeaserOverlay eyebrow="Horoskop tygodniowy" title="Co mówią gwiazdy?" onClose={onClose}>
      <p className="horoscope-date-range">
        {horoscope
          ? <>Horoskop na okres <strong>{getHoroscopeWeekDates(horoscope.weekStart)}</strong></>
          : 'Horoskop tygodniowy'}
      </p>
      {isLoading && <p className="horoscope-unavailable" role="status">Ładuję horoskop tygodniowy...</p>}
      {error && <p className="horoscope-unavailable" role="alert">{error}</p>}
      {!isLoading && !error && !horoscope && (
        <p className="horoscope-unavailable" role="status">Horoskop na ten tydzień nie został jeszcze opublikowany.</p>
      )}
      <p className="horoscope-sign-prompt">Wybierz swój znak zodiaku</p>
      <div className="horoscope-sign-grid" aria-label="Znaki zodiaku">
        {horoscopeSigns.map((sign) => (
          <button
            key={sign.id}
            className={`horoscope-sign${selectedSign?.id === sign.id ? ' is-selected' : ''}`}
            type="button"
            onClick={() => setSelectedSign(sign)}
            aria-pressed={selectedSign?.id === sign.id}
          >
            <span className="horoscope-sign-symbol" aria-hidden="true">{sign.symbol}</span>
            <span>{sign.name}</span>
          </button>
        ))}
      </div>
      {selectedSign && (
        <div className="horoscope-reading" aria-live="polite">
          <span className="horoscope-reading-symbol" aria-hidden="true">{selectedSign.symbol}</span>
          <div>
            <h3>{selectedSign.name}</h3>
            {isLoading ? (
              <p>Ładuję horoskop...</p>
            ) : error ? (
              <p role="alert">{error}</p>
            ) : (
              <p>{horoscope?.signs[selectedSign.id] || 'Horoskop dla tego znaku nie został jeszcze opublikowany.'}</p>
            )}
          </div>
        </div>
      )}
      {!isLoading && !error && horoscope && (
        <p className="horoscope-disclaimer">Potraktuj horoskop jako lekką inspirację.</p>
      )}
    </TeaserOverlay>
  )
}

export default HoroscopeOverlay
