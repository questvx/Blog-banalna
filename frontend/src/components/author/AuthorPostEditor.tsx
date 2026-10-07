import { useState, type FormEvent, type MouseEvent } from 'react'
import { authorCategories, type AuthorPostForm } from './authorPostForm'
import AuthorImageUploader from './AuthorImageUploader'
import './AuthorPostEditor.css'

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
          <label htmlFor="post-content">Treść <span>Oddziel akapity pustą linią.</span></label>
          <textarea id="post-content" required rows={8} value={form.content} onChange={(event) => onChange('content', event.target.value)} />
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
            onUploaded={(url) => onChange('image', url)}
            onUploadingChange={setIsImageUploading}
          />
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