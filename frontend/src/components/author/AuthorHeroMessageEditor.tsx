import { useEffect, useState, type FormEvent } from 'react'
import { fetchAdminHeroMessage, saveAdminHeroMessage } from '../../api/adminHeroMessage'
import './AuthorHeroMessageEditor.css'

const MAX_MESSAGE_LENGTH = 1000

function AuthorHeroMessageEditor() {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let isActive = true

    fetchAdminHeroMessage()
      .then((result) => {
        if (isActive) setMessage(result.message)
      })
      .catch((loadError: unknown) => {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : 'Nie udało się pobrać wiadomości.')
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setIsSaving(true)

    try {
      const savedMessage = await saveAdminHeroMessage(message.trim())
      setMessage(savedMessage.message)
      setNotice('Wiadomość powitalna została zapisana.')
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Nie udało się zapisać wiadomości.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="author-hero-message-editor" aria-labelledby="author-hero-message-title">
      <p className="author-login-eyebrow">Treść strony głównej</p>
      <h2 id="author-hero-message-title">Wiadomość powitalna</h2>
      <p className="author-hero-message-intro">
        Wpisz tekst, który ma pojawić się pod nagłówkiem „Dzień dobry! Miło Cię widzieć!”.
      </p>

      {error && <p className="author-dashboard-message is-error" role="alert">{error}</p>}
      {notice && <p className="author-dashboard-message is-notice" role="status">{notice}</p>}

      {isLoading ? (
        <p className="author-dashboard-empty" role="status">Pobieram wiadomość...</p>
      ) : (
        <form className="author-hero-message-form" onSubmit={handleSubmit}>
          <label htmlFor="author-hero-message">Tekst wiadomości</label>
          <textarea
            id="author-hero-message"
            required
            maxLength={MAX_MESSAGE_LENGTH}
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={isSaving}
          />
          <div className="author-hero-message-form-footer">
            <span>{message.length} / {MAX_MESSAGE_LENGTH} znaków</span>
            <button className="author-dashboard-primary" type="submit" disabled={isSaving || !message.trim()}>
              {isSaving ? 'Zapisuję...' : 'Zapisz wiadomość'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

export default AuthorHeroMessageEditor
