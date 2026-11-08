import { useEffect, useState, type FormEvent, type MouseEvent } from 'react'
import type { AdminCuriosity, CuriosityInput } from '../../../api/adminCuriosities'
import './AuthorCuriosityEditor.css'

function getLocalDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

type AuthorCuriosityEditorProps = {
  curiosity: AdminCuriosity | null
  error: string
  isSaving: boolean
  onClose: () => void
  onSubmit: (curiosity: CuriosityInput) => void
}

function AuthorCuriosityEditor({ curiosity, error, isSaving, onClose, onSubmit }: AuthorCuriosityEditorProps) {
  const [title, setTitle] = useState(curiosity?.title ?? '')
  const [content, setContent] = useState(curiosity?.content ?? '')
  const [status, setStatus] = useState<CuriosityInput['status']>(curiosity?.status ?? 'DRAFT')
  const [date, setDate] = useState(curiosity?.createdAt.slice(0, 10) ?? getLocalDate())
  const [validationError, setValidationError] = useState('')

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
    if (!title.trim() || !content.trim()) {
      setValidationError('Wpisz tytuł i treść ciekawostki.')
      return
    }

    setValidationError('')
    onSubmit({ title, content, status, createdAt: `${date}T12:00:00` })
  }

  return (
    <div className="author-curiosity-editor-backdrop" role="presentation" onMouseDown={handleBackdropMouseDown}>
      <section
        className="author-curiosity-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="author-curiosity-editor-title"
      >
        <div className="author-curiosity-editor-heading">
          <div>
            <p className="author-login-eyebrow">{curiosity ? 'Edycja materiału' : 'Nowy materiał'}</p>
            <h2 id="author-curiosity-editor-title">
              {curiosity ? 'Edytuj ciekawostkę' : 'Nowa ciekawostka'}
            </h2>
          </div>
          <button
            className="author-curiosity-editor-close"
            type="button"
            aria-label="Zamknij edytor ciekawostki"
            onClick={onClose}
            disabled={isSaving}
          >
            ×
          </button>
        </div>
        <form className="author-curiosity-editor-form" onSubmit={handleSubmit}>
          <div className="author-curiosity-field">
            <label htmlFor="curiosity-title">Tytuł</label>
            <input
              id="curiosity-title"
              required
              maxLength={255}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                setValidationError('')
              }}
            />
          </div>
          <div className="author-curiosity-field">
            <label htmlFor="curiosity-content">Treść</label>
            <textarea
              id="curiosity-content"
              required
              rows={10}
              value={content}
              onChange={(event) => {
                setContent(event.target.value)
                setValidationError('')
              }}
            />
          </div>
          <div className="author-curiosity-field">
            <label htmlFor="curiosity-date">Data</label>
            <input
              id="curiosity-date"
              required
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div className="author-curiosity-field">
            <label htmlFor="curiosity-status">Status</label>
            <select
              id="curiosity-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as CuriosityInput['status'])}
            >
              <option value="DRAFT">Szkic</option>
              <option value="PUBLISHED">Opublikowany</option>
            </select>
          </div>
          {(validationError || error) && (
            <p className="author-curiosity-editor-error" role="alert">{validationError || error}</p>
          )}
          <div className="author-curiosity-editor-actions">
            <button
              className="author-curiosity-editor-cancel"
              type="button"
              onClick={onClose}
              disabled={isSaving}
            >
              Anuluj
            </button>
            <button className="author-dashboard-primary" type="submit" disabled={isSaving}>
              {isSaving ? 'Zapisuję...' : curiosity ? 'Zapisz zmiany' : 'Dodaj ciekawostkę'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default AuthorCuriosityEditor
