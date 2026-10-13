import { useEffect, useState, type FormEvent, type MouseEvent } from 'react'
import {
  createEmptyHoroscopeTexts,
  getHoroscopeWeekDates,
  horoscopeSigns,
  type HoroscopeTexts,
} from '../../api/adminHoroscopes'
import './AuthorHoroscopeEditor.css'

type AuthorHoroscopeEditorProps = {
  weekStart: string
  initialSigns: Partial<HoroscopeTexts>
  isSaving: boolean
  onClose: () => void
  onSubmit: (signs: HoroscopeTexts) => void
}

function AuthorHoroscopeEditor({
  weekStart,
  initialSigns,
  isSaving,
  onClose,
  onSubmit,
}: AuthorHoroscopeEditorProps) {
  const [signs, setSigns] = useState<HoroscopeTexts>(() => ({
    ...createEmptyHoroscopeTexts(),
    ...initialSigns,
  }))

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSaving, onClose])

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isSaving) onClose()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(signs)
  }

  return (
    <div className="author-horoscope-editor-backdrop" role="presentation" onMouseDown={handleBackdropMouseDown}>
      <section
        className="author-horoscope-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="author-horoscope-editor-title"
      >
        <div className="author-horoscope-editor-heading">
          <div>
            <p className="author-login-eyebrow">Horoskop tygodniowy</p>
            <h2 id="author-horoscope-editor-title">Edycja horoskopu</h2>
            <p>{getHoroscopeWeekDates(weekStart)}</p>
          </div>
          <button
            className="author-horoscope-editor-close"
            type="button"
            aria-label="Zamknij edytor horoskopu"
            onClick={onClose}
            disabled={isSaving}
          >
            ×
          </button>
        </div>
        <form className="author-horoscope-editor-form" onSubmit={handleSubmit}>
          {horoscopeSigns.map((sign) => (
            <div className="author-horoscope-field" key={sign.id}>
              <label htmlFor={`horoscope-${sign.id}`}>
                <span aria-hidden="true">{sign.symbol}</span> {sign.name}
              </label>
              <textarea
                id={`horoscope-${sign.id}`}
                required
                maxLength={5000}
                rows={3}
                value={signs[sign.id]}
                onChange={(event) => setSigns((current) => ({ ...current, [sign.id]: event.target.value }))}
              />
            </div>
          ))}
          <div className="author-horoscope-editor-actions">
            <button
              className="author-horoscope-editor-cancel"
              type="button"
              onClick={onClose}
              disabled={isSaving}
            >
              Anuluj
            </button>
            <button className="author-dashboard-primary" type="submit" disabled={isSaving}>
              {isSaving ? 'Zapisuję...' : 'Zapisz horoskop'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default AuthorHoroscopeEditor
