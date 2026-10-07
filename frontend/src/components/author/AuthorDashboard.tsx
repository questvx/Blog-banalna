import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from 'react'
import { deleteAdminPost, fetchAdminPosts, saveAdminPost, type AuthorPost } from '../../api/adminPosts'
import {
  addDaysToDate,
  fetchAdminHoroscopes,
  getCurrentHoroscopeWeekStart,
  saveAdminHoroscope,
  type AdminHoroscopeWeek,
  type HoroscopeTexts,
} from '../../api/adminHoroscopes'
import type { AuthorSession } from '../../api/auth'
import AuthorPostFilters, { type FeaturedFilter, type PostDateSort } from './AuthorPostFilters'
import AuthorPostEditor from './AuthorPostEditor'
import AuthorHoroscopeEditor from './AuthorHoroscopeEditor'
import AuthorHoroscopeList from './AuthorHoroscopeList'
import AuthorPostList from './AuthorPostList'
import {
  authorCategories,
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

const dashboardTabs = ['posts', 'horoscope'] as const
type DashboardTab = (typeof dashboardTabs)[number]
const INITIAL_HOROSCOPE_WEEKS = 12

function AuthorDashboard({ session, error: sessionError, onLogout, isLoggingOut }: AuthorDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('posts')
  const [posts, setPosts] = useState<AuthorPost[]>([])
  const [form, setForm] = useState<AuthorPostForm>(createEmptyAuthorPostForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [horoscopes, setHoroscopes] = useState<AdminHoroscopeWeek[]>([])
  const [horoscopeLoadingError, setHoroscopeLoadingError] = useState('')
  const [horoscopeSaveError, setHoroscopeSaveError] = useState('')
  const [isHoroscopeLoading, setIsHoroscopeLoading] = useState(true)
  const [isHoroscopeSaving, setIsHoroscopeSaving] = useState(false)
  const [editingHoroscopeWeek, setEditingHoroscopeWeek] = useState<string | null>(null)
  const [horoscopeWeekCount, setHoroscopeWeekCount] = useState(INITIAL_HOROSCOPE_WEEKS)
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>('ALL')
  const [dateSort, setDateSort] = useState<PostDateSort>('NEWEST')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const filteredPosts = [...posts]
    .filter((post) => selectedCategory === 'ALL' || post.category === selectedCategory)
    .filter((post) => featuredFilter === 'ALL'
      || (featuredFilter === 'FEATURED' ? post.featured : !post.featured))
    .sort((first, second) => dateSort === 'NEWEST'
      ? second.date.localeCompare(first.date)
      : first.date.localeCompare(second.date))

  useEffect(() => {
    fetchAdminPosts()
      .then(setPosts)
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : 'Nie udało się pobrać wpisów.')
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    fetchAdminHoroscopes()
      .then(setHoroscopes)
      .catch((loadError: unknown) => {
        setHoroscopeLoadingError(loadError instanceof Error ? loadError.message : 'Nie udało się pobrać horoskopów.')
      })
      .finally(() => setIsHoroscopeLoading(false))
  }, [])

  const horoscopeWeeks = useMemo(() => {
    const weeks = new Set(horoscopes.map(({ weekStart }) => weekStart))
    let weekStart = getCurrentHoroscopeWeekStart()
    for (let index = 0; index < horoscopeWeekCount; index += 1) {
      weeks.add(weekStart)
      weekStart = addDaysToDate(weekStart, 7)
    }
    return [...weeks].sort()
  }, [horoscopes, horoscopeWeekCount])

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

  const handleSaveHoroscope = async (signs: HoroscopeTexts) => {
    if (!editingHoroscopeWeek) return
    setHoroscopeSaveError('')
    setNotice('')
    setIsHoroscopeSaving(true)

    try {
      const savedHoroscope = await saveAdminHoroscope(editingHoroscopeWeek, signs)
      setHoroscopes((current) => [
        ...current.filter((week) => week.weekStart !== savedHoroscope.weekStart),
        savedHoroscope,
      ])
      setNotice('Horoskop tygodniowy został zapisany.')
      setEditingHoroscopeWeek(null)
    } catch (saveError: unknown) {
      setHoroscopeSaveError(saveError instanceof Error ? saveError.message : 'Nie udało się zapisać horoskopu.')
    } finally {
      setIsHoroscopeSaving(false)
    }
  }

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = dashboardTabs.indexOf(activeTab)
    let nextIndex: number

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % dashboardTabs.length
        break
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + dashboardTabs.length) % dashboardTabs.length
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = dashboardTabs.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    setActiveTab(dashboardTabs[nextIndex])
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus()
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
            <h1 id="author-dashboard-title">{activeTab === 'posts' ? 'Posty' : 'Horoskopy'}</h1>
          </div>
          {activeTab === 'posts' && (
            <button className="author-dashboard-primary" type="button" onClick={openNewPost}>+ Nowy wpis</button>
          )}
        </div>

        <div className="author-dashboard-tabs" role="tablist" aria-label="Sekcje panelu autorki" onKeyDown={handleTabKeyDown}>
          <button
            id="author-tab-posts"
            className="author-dashboard-tab"
            type="button"
            role="tab"
            aria-selected={activeTab === 'posts'}
            aria-controls="author-tabpanel"
            tabIndex={activeTab === 'posts' ? 0 : -1}
            onClick={() => setActiveTab('posts')}
          >
            Posty
          </button>
          <button
            id="author-tab-horoscope"
            className="author-dashboard-tab"
            type="button"
            role="tab"
            aria-selected={activeTab === 'horoscope'}
            aria-controls="author-tabpanel"
            tabIndex={activeTab === 'horoscope' ? 0 : -1}
            onClick={() => setActiveTab('horoscope')}
          >
            Horoskopy
          </button>
        </div>

        {(error || sessionError) && <p className="author-dashboard-message is-error" role="alert">{error || sessionError}</p>}
        {notice && <p className="author-dashboard-message is-notice" role="status">{notice}</p>}

        {activeTab === 'horoscope' && horoscopeLoadingError && (
          <p className="author-dashboard-message is-error" role="alert">{horoscopeLoadingError}</p>
        )}
        {activeTab === 'horoscope' && horoscopeSaveError && (
          <p className="author-dashboard-message is-error" role="alert">{horoscopeSaveError}</p>
        )}

        <div
          className="author-dashboard-tabpanel"
          id="author-tabpanel"
          role="tabpanel"
          aria-labelledby={`author-tab-${activeTab}`}
          tabIndex={0}
        >
          {activeTab === 'posts' ? (
            isLoading ? (
              <p className="author-dashboard-empty" role="status">Pobieram posty...</p>
            ) : (
              <>
                <AuthorPostFilters
                  categories={authorCategories}
                  totalCount={posts.length}
                  resultCount={filteredPosts.length}
                  selectedCategory={selectedCategory}
                  featuredFilter={featuredFilter}
                  dateSort={dateSort}
                  onCategoryChange={setSelectedCategory}
                  onFeaturedFilterChange={setFeaturedFilter}
                  onDateSortChange={setDateSort}
                />
                <AuthorPostList
                  posts={filteredPosts}
                  deletingId={deletingId}
                  emptyMessage={posts.length ? 'Nie znaleziono wpisów dla wybranych filtrów.' : 'Nie ma jeszcze żadnych wpisów.'}
                  onEdit={openEditPost}
                  onDelete={handleDelete}
                />
              </>
            )
          ) : isHoroscopeLoading ? (
            <p className="author-dashboard-empty" role="status">Pobieram horoskopy...</p>
          ) : (
            <>
              <AuthorHoroscopeList
                weeks={horoscopeWeeks}
                horoscopes={horoscopes}
                onEdit={(weekStart) => {
                  setHoroscopeSaveError('')
                  setEditingHoroscopeWeek(weekStart)
                }}
              />
              <button
                className="author-dashboard-more-weeks"
                type="button"
                onClick={() => setHoroscopeWeekCount((count) => count + INITIAL_HOROSCOPE_WEEKS)}
              >
                Pokaż kolejne tygodnie
              </button>
            </>
          )}
        </div>
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
      {editingHoroscopeWeek && (
        <AuthorHoroscopeEditor
          key={editingHoroscopeWeek}
          weekStart={editingHoroscopeWeek}
          initialSigns={horoscopes.find((week) => week.weekStart === editingHoroscopeWeek)?.signs ?? {}}
          isSaving={isHoroscopeSaving}
          onClose={() => setEditingHoroscopeWeek(null)}
          onSubmit={handleSaveHoroscope}
        />
      )}
    </main>
  )
}

export default AuthorDashboard