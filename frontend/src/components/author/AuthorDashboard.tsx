import { useEffect, useState, type FormEvent } from 'react'
import { deleteAdminPost, fetchAdminPosts, saveAdminPost, type AuthorPost } from '../../api/adminPosts'
import type { AuthorSession } from '../../api/auth'
import AuthorPostEditor from './AuthorPostEditor'
import AuthorPostList from './AuthorPostList'
import {
  authorPostFormToInput,
  authorPostToForm,
  createEmptyAuthorPostForm,
  type AuthorPostForm,
} from './authorPostForm'
import './AuthorDashboard.css'

type AuthorDashboardProps = {
  session: AuthorSession
  error: string
  onLogout: () => void
  isLoggingOut: boolean
}

function AuthorDashboard({ session, error: sessionError, onLogout, isLoggingOut }: AuthorDashboardProps) {
  const [posts, setPosts] = useState<AuthorPost[]>([])
  const [form, setForm] = useState<AuthorPostForm>(createEmptyAuthorPostForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    fetchAdminPosts()
      .then(setPosts)
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : 'Nie udało się pobrać wpisów.')
      })
      .finally(() => setIsLoading(false))
  }, [])

  const updateForm = <K extends keyof AuthorPostForm>(key: K, value: AuthorPostForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const openNewPost = () => {
    setForm(createEmptyAuthorPostForm())
    setEditingId(null)
    setIsFormOpen(true)
    setError('')
    setNotice('')
  }

  const openEditPost = (post: AuthorPost) => {
    setForm(authorPostToForm(post))
    setEditingId(post.id)
    setIsFormOpen(true)
    setError('')
    setNotice('')
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingId(null)
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setIsSaving(true)

    try {
      const savedPost = await saveAdminPost(editingId, authorPostFormToInput(form))
      setPosts((current) => editingId === null
        ? [savedPost, ...current]
        : current.map((post) => post.id === savedPost.id ? savedPost : post))
      setNotice(editingId === null ? 'Wpis został dodany.' : 'Zmiany zostały zapisane.')
      closeForm()
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Nie udało się zapisać wpisu.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (post: AuthorPost) => {
    if (!window.confirm(`Czy na pewno usunąć wpis „${post.title}”? Tej operacji nie można cofnąć.`)) return
    setError('')
    setNotice('')
    setDeletingId(post.id)

    try {
      await deleteAdminPost(post.id)
      setPosts((current) => current.filter((item) => item.id !== post.id))
      if (editingId === post.id) closeForm()
      setNotice('Wpis został usunięty.')
    } catch (deleteError: unknown) {
      setError(deleteError instanceof Error ? deleteError.message : 'Nie udało się usunąć wpisu.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="author-dashboard-page">
      <header className="author-dashboard-header">
        <a className="author-dashboard-wordmark" href="/">banalna... i tyle</a>
        <div className="author-dashboard-account">
          <span>Zalogowano jako <strong>{session.username}</strong></span>
          <button type="button" className="author-dashboard-logout" onClick={onLogout} disabled={isLoggingOut}>
            {isLoggingOut ? 'Wylogowywanie...' : 'Wyloguj'}
          </button>
        </div>
      </header>

      <section className="author-dashboard-content" aria-labelledby="author-dashboard-title">
        <div className="author-dashboard-title-row">
          <div>
            <p className="author-login-eyebrow">Strefa autorki</p>
            <h1 id="author-dashboard-title">Wpisy</h1>
          </div>
          <button className="author-dashboard-primary" type="button" onClick={openNewPost}>+ Nowy wpis</button>
        </div>

        {(error || sessionError) && <p className="author-dashboard-message is-error" role="alert">{error || sessionError}</p>}
        {notice && <p className="author-dashboard-message is-notice" role="status">{notice}</p>}

        {isLoading ? (
          <p className="author-dashboard-empty" role="status">Pobieram wpisy...</p>
        ) : (
          <AuthorPostList posts={posts} deletingId={deletingId} onEdit={openEditPost} onDelete={handleDelete} />
        )}
      </section>

      {isFormOpen && (
        <AuthorPostEditor
          form={form}
          editingId={editingId}
          isSaving={isSaving}
          onChange={updateForm}
          onClose={closeForm}
          onSubmit={handleSave}
        />
      )}
    </main>
  )
}

export default AuthorDashboard