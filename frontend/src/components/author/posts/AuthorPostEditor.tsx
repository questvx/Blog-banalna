import { useState, type FormEvent, type MouseEvent } from 'react'
import { fetchAuthorImages } from '../../../api/authorMedia'
import { authorCategories, type AuthorPostForm } from './authorPostForm'
import AuthorImageUploader from '../media/AuthorImageUploader'
import './AuthorPostEditor.css'

const HTML_ESCAPE_CHARACTERS: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPE_CHARACTERS[character])
}

type AuthorPostEditorProps = {
  form: AuthorPostForm
  editingId: number | null
  isSaving: boolean
  onChange: <K extends keyof AuthorPostForm>(key: K, value: AuthorPostForm[K]) => void
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function AuthorPostEditor({ form, editingId, isSaving, onChange, onClose, onSubmit }: AuthorPostEditorProps) {
  const [isImageUploading, setIsImageUploading] = useState(false)
  const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false)
  const [isImageLibraryLoading, setIsImageLibraryLoading] = useState(false)
  const [imageLibraryError, setImageLibraryError] = useState('')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [linkText, setLinkText] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkError, setLinkError] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)

  const handleOpenImageLibrary = async () => {
    setIsImageLibraryOpen(true)
    setIsImageLibraryLoading(true)
    setImageLibraryError('')

    try {
      setUploadedImages(await fetchAuthorImages())
    } catch (loadError: unknown) {
      setImageLibraryError(loadError instanceof Error ? loadError.message : 'Nie udało się pobrać zdjęć.')
    } finally {
      setIsImageLibraryLoading(false)
    }
  }

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isSaving) onClose()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (isImageUploading) {
      event.preventDefault()
      return
    }
    onSubmit(event)
  }

  const handleCopyLinkTag = async () => {
    const text = linkText.trim()
    const address = linkUrl.trim()
    if (!text || !address) {
      setLinkError('Wpisz tekst linku i adres strony.')
      return
    }

    let url: URL
    try {
      url = new URL(address)
    } catch {
      setLinkError('Wpisz poprawny adres zaczynający się od http:// lub https://.')
      return
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      setLinkError('Link może prowadzić tylko do strony HTTP lub HTTPS.')
      return
    }

    const anchor = `<a href="${escapeHtml(url.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`
    try {
      await navigator.clipboard.writeText(anchor)
      setLinkCopied(true)
    } catch {
      setLinkCopied(false)
      setLinkError('Nie udało się skopiować znacznika linku. Sprawdź uprawnienia przeglądarki do schowka.')
      return
    }

    setLinkError('')
  }

  return (
    <div className="author-editor-backdrop" role="presentation" onMouseDown={handleBackdropMouseDown}>
      <section className="author-editor" role="dialog" aria-modal="true" aria-labelledby="author-editor-title">
        <div className="author-editor-heading">
          <div>
            <p className="author-login-eyebrow">Edytor wpisu</p>
            <h2 id="author-editor-title">{editingId === null ? 'Nowy wpis' : 'Edytuj wpis'}</h2>
          </div>
          <button className="author-editor-close" type="button" aria-label="Zamknij edytor" onClick={onClose} disabled={isSaving}>×</button>
        </div>
        <form className="author-editor-form" onSubmit={handleSubmit}>
          <label htmlFor="post-title">Tytuł</label>
          <input id="post-title" required maxLength={255} value={form.title} onChange={(event) => onChange('title', event.target.value)} />
          <label htmlFor="post-excerpt">Nagłówek</label>
          <textarea id="post-excerpt" required rows={2} value={form.excerpt} onChange={(event) => onChange('excerpt', event.target.value)} />
          <label htmlFor="post-content">Treść <span>Enter = nowa linia, pusty wiersz = nowy akapit.</span></label>
          <div className="author-editor-content-layout">
            <textarea className="author-editor-content" id="post-content" required rows={8} value={form.content} onChange={(event) => onChange('content', event.target.value)} />
            <aside className="author-editor-html-help" aria-labelledby="author-editor-html-help-title">
              <h3 id="author-editor-html-help-title">Ściągawka HTML</h3>
              <p><code>&lt;b&gt;pogrubione&lt;/b&gt;</code></p>
              <p><code>&lt;strong&gt;ważne&lt;/strong&gt;</code></p>
              <p><code>&lt;i&gt;pochylony tekst&lt;/i&gt;</code></p>
              <p><code>&lt;em&gt;wyróżnione&lt;/em&gt;</code></p>
              <p><code>&lt;u&gt;podkreślone&lt;/u&gt;</code></p>
              <p><code>&lt;mark&gt;flamaster&lt;/mark&gt;</code></p>
              <p><code>&lt;small&gt;małe&lt;/small&gt;</code></p>
              <p><code>&lt;serif&gt;większy tekst szeryfowy&lt;/serif&gt;</code></p>
              <p><code>&lt;ciekawostka&gt;treść ciekawostki&lt;/ciekawostka&gt;</code></p>
              <p><code>&lt;del&gt;skreślone&lt;/del&gt;</code></p>
              <p><code>&lt;br&gt;</code> — nowa linia</p>
              <p><code>&lt;blockquote&gt;cytat&lt;/blockquote&gt;</code></p>
              <p><code>&lt;a href="https://..." target="_blank" rel="noopener noreferrer"&gt;polecana strona&lt;/a&gt;</code></p>
              <p><code>&lt;img src="WKLEJ_TU_SKOPIOWANY_ADRES" alt="Opis zdjęcia"&gt;</code></p>
              <p className="author-editor-html-note">Adres zdjęcia skopiujesz w zakładce „Wgrane zdjęcia”. Wklej go w miejsce WKLEJ_TU_SKOPIOWANY_ADRES.</p>
              <div className="author-editor-link-tool">
                <h4>Dodaj link</h4>
                <label htmlFor="post-link-text">Tekst linku</label>
                <input
                  id="post-link-text"
                  placeholder="polecana strona"
                  value={linkText}
                  onChange={(event) => {
                    setLinkText(event.target.value)
                    setLinkError('')
                    setLinkCopied(false)
                  }}
                />
                <label htmlFor="post-link-url">Adres strony</label>
                <input
                  id="post-link-url"
                  inputMode="url"
                  type="text"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(event) => {
                    setLinkUrl(event.target.value)
                    setLinkError('')
                    setLinkCopied(false)
                  }}
                />
                {linkError && <p className="author-editor-link-error" role="alert">{linkError}</p>}
                <button type="button" disabled={isSaving} onClick={handleCopyLinkTag}>
                  {linkCopied ? 'Skopiowano znacznik' : 'Kopiuj znacznik linku'}
                </button>
                <p className="author-editor-link-hint">Wklej skopiowany znacznik w treści wpisu. Link otworzy się w nowej karcie.</p>
              </div>
            </aside>
          </div>
          <div className="author-editor-grid">
            <div>
              <label htmlFor="post-date">Data</label>
              <input id="post-date" required type="date" value={form.date} onChange={(event) => onChange('date', event.target.value)} />
            </div>
            <div>
              <label htmlFor="post-category">Kategoria</label>
              <select id="post-category" value={form.category} onChange={(event) => onChange('category', event.target.value)}>
                {authorCategories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
          </div>
          <p className="author-image-section-label">Zdjęcie wpisu</p>
          <AuthorImageUploader
            imageUrl={form.image}
            disabled={isSaving}
            isImageLibraryLoading={isImageLibraryLoading}
            onChooseFromLibrary={handleOpenImageLibrary}
            onUploaded={(url) => onChange('image', url)}
            onUploadingChange={setIsImageUploading}
          />
          {isImageLibraryOpen && (
            <div className="author-image-library-panel" aria-label="Wybór wgranego zdjęcia">
              <div className="author-image-library-heading">
                <strong>Wybierz zdjęcie do wpisu</strong>
                <button type="button" onClick={() => setIsImageLibraryOpen(false)}>Zamknij</button>
              </div>
              {isImageLibraryLoading ? (
                <p role="status">Pobieram zdjęcia...</p>
              ) : imageLibraryError ? (
                <p className="author-image-library-error" role="alert">{imageLibraryError}</p>
              ) : uploadedImages.length === 0 ? (
                <p>Nie ma jeszcze wgranych zdjęć.</p>
              ) : (
                <div className="author-image-library-grid">
                  {uploadedImages.map((imageUrl, index) => (
                    <button
                      className={`author-image-library-option ${form.image === imageUrl ? 'is-selected' : ''}`}
                      key={imageUrl}
                      type="button"
                      aria-pressed={form.image === imageUrl}
                      onClick={() => {
                        onChange('image', imageUrl)
                        setIsImageLibraryOpen(false)
                      }}
                    >
                      <img src={imageUrl} alt="" loading="lazy" />
                      <span>Zdjęcie {index + 1}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <label htmlFor="post-image">Adres obrazu</label>
          <input id="post-image" required type="url" value={form.image} onChange={(event) => onChange('image', event.target.value)} />
          <div className="author-editor-grid author-editor-options">
            <div className="author-editor-featured">
              <span>Wpis polecany</span>
              <button
                aria-label={form.featured ? 'Usuń wpis z polecanych' : 'Dodaj wpis do polecanych'}
                aria-pressed={form.featured}
                className={`author-editor-star ${form.featured ? 'is-active' : ''}`}
                title={form.featured ? 'Usuń z polecanych' : 'Dodaj do polecanych'}
                type="button"
                onClick={() => onChange('featured', !form.featured)}
              >
                <span aria-hidden="true">{form.featured ? '★' : '☆'}</span>
              </button>
            </div>
            <div>
              <label htmlFor="post-status">Status</label>
              <select id="post-status" value={form.status} onChange={(event) => onChange('status', event.target.value as AuthorPostForm['status'])}>
                <option value="DRAFT">Szkic</option>
                <option value="PUBLISHED">Opublikowany</option>
              </select>
            </div>
          </div>
          <div className="author-editor-actions">
            <button className="author-editor-cancel" type="button" onClick={onClose} disabled={isSaving || isImageUploading}>Anuluj</button>
            <button className="author-dashboard-primary" type="submit" disabled={isSaving || isImageUploading}>
              {isImageUploading ? 'Wgrywam zdjęcie...' : isSaving ? 'Zapisuję...' : editingId === null ? 'Dodaj wpis' : 'Zapisz zmiany'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default AuthorPostEditor