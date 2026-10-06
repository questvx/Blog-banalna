import { useState } from 'react'
import TeaserOverlay from './teasers/TeaserOverlay'
import './HoroscopeOverlay.css'

const zodiacSigns = [
  { name: 'Baran', symbol: '♈', horoscope: 'Odwaga pomoże Ci ruszyć z miejsca w sprawie, którą odkładasz. Zostaw sobie jednak chwilę na spokojne przemyślenie decyzji.' },
  { name: 'Byk', symbol: '♉', horoscope: 'Postaw na swój rytm i małe przyjemności. Ktoś bliski doceni Twoją uważność bardziej, niż się spodziewasz.' },
  { name: 'Bliźnięta', symbol: '♊', horoscope: 'Rozmowa może przynieść świeży pomysł. Zapisz inspirację, zanim codzienny pośpiech odciągnie Cię od niej.' },
  { name: 'Rak', symbol: '♋', horoscope: 'Zadbaj o własny komfort, zanim weźmiesz na siebie kolejne sprawy. Spokojny wieczór pomoże Ci odzyskać równowagę.' },
  { name: 'Lew', symbol: '♌', horoscope: 'Twoja energia przyciągnie ludzi i nowe możliwości. Daj też innym przestrzeń, by mogli pokazać, co potrafią.' },
  { name: 'Panna', symbol: '♍', horoscope: 'Nie wszystko musi być dopięte na ostatni guzik. Elastyczność pozwoli Ci zauważyć rozwiązanie, które wcześniej umykało.' },
  { name: 'Waga', symbol: '♎', horoscope: 'Dobry moment na szczerą, życzliwą rozmowę. Jasno nazwane potrzeby ułatwią znalezienie wspólnego punktu.' },
  { name: 'Skorpion', symbol: '♏', horoscope: 'Zaufaj swojej intuicji, ale sprawdź fakty. Połączenie tych dwóch perspektyw pomoże Ci podjąć dobrą decyzję.' },
  { name: 'Strzelec', symbol: '♐', horoscope: 'Niewielka zmiana planów może okazać się miłą przygodą. Zostaw trochę miejsca na spontaniczność.' },
  { name: 'Koziorożec', symbol: '♑', horoscope: 'Konsekwencja przyniesie efekty, nawet jeśli nie zobaczysz ich od razu. Pamiętaj, by zauważyć także własny postęp.' },
  { name: 'Wodnik', symbol: '♒', horoscope: 'Nietypowy pomysł zasługuje na chwilę uwagi. Podziel się nim z kimś, kto pomoże Ci spojrzeć na niego z innej strony.' },
  { name: 'Ryby', symbol: '♓', horoscope: 'Twórcza chwila dobrze Ci zrobi. Wybierz to, co daje Ci spokój, i nie wymagaj od siebie natychmiastowych odpowiedzi.' },
] as const

function getHoroscopeDateRange() {
  const weekStart = new Date()
  weekStart.setHours(12, 0, 0, 0)
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const startParts = new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).formatToParts(weekStart)
  const endParts = new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).formatToParts(weekEnd)
  const getPart = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''
  const startDay = getPart(startParts, 'day')
  const endDay = getPart(endParts, 'day')

  if (weekStart.getFullYear() === weekEnd.getFullYear() && weekStart.getMonth() === weekEnd.getMonth()) {
    return `${startDay}–${endDay} ${getPart(endParts, 'month')} ${getPart(endParts, 'year')}`
  }

  return `${new Intl.DateTimeFormat('pl-PL', { dateStyle: 'long' }).format(weekStart)}–${new Intl.DateTimeFormat('pl-PL', { dateStyle: 'long' }).format(weekEnd)}`
}

type HoroscopeOverlayProps = {
  onClose: () => void
}

function HoroscopeOverlay({ onClose }: HoroscopeOverlayProps) {
  const [selectedSign, setSelectedSign] = useState<(typeof zodiacSigns)[number]>()

  return (
    <TeaserOverlay eyebrow="Horoskop tygodniowy" title="Co mówią gwiazdy?" onClose={onClose}>
      <p className="horoscope-date-range">
        Horoskop na okres <strong>{getHoroscopeDateRange()}</strong>
      </p>
      <p className="horoscope-sign-prompt">Wybierz swój znak zodiaku</p>
      <div className="horoscope-sign-grid" aria-label="Znaki zodiaku">
        {zodiacSigns.map((sign) => (
          <button
            key={sign.name}
            className={`horoscope-sign${selectedSign?.name === sign.name ? ' is-selected' : ''}`}
            type="button"
            onClick={() => setSelectedSign(sign)}
            aria-pressed={selectedSign?.name === sign.name}
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
            <p>{selectedSign.horoscope}</p>
          </div>
        </div>
      )}
      <p className="horoscope-disclaimer">Potraktuj horoskop jako lekką inspirację.</p>
    </TeaserOverlay>
  )
}

export default HoroscopeOverlay
