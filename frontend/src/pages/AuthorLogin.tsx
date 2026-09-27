import { useEffect, useState, type FormEvent } from 'react'
import { getAuthorSession, loginAuthor, logoutAuthor, type AuthorSession } from '../api/auth'
import { AuthorDashboard } from '../components/author'
import './AuthorLogin.css'

function AuthorLogin() {
  const [session, setSession] = useState<AuthorSession | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getAuthorSession()
      .then(setSession)
      .catch((sessionError: unknown) => {
        setError(sessionError instanceof Error ? sessionError.message : 'Nie udało się sprawdzić sesji.')
      })
      .finally(() => setIsCheckingSession(false))
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const authorSession = await loginAuthor(username, password)
      setSession(authorSession)
      setPassword('')
    } catch (loginError: unknown) {
      setError(loginError instanceof Error ? loginError.message : 'Logowanie nie powiodło się.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    setError('')
    setIsSubmitting(true)

    try {
      await logoutAuthor()
      setSession(null)
      setUsername('')
    } catch (logoutError: unknown) {
      setError(logoutError instanceof Error ? logoutError.message : 'Nie udało się wylogować.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (session) {
    return <AuthorDashboard session={session} error={error} isLoggingOut={isSubmitting} onLogout={handleLogout} />
  }

  return (
    <main className="author-login-page">
      <a className="author-login-wordmark" href="/">banalna... i tyle</a>
      <section className="author-login-panel" aria-labelledby="author-login-title">
        <p className="author-login-eyebrow">Strefa autorki</p>
        <h1 id="author-login-title">Panel autorki</h1>
        <p className="author-login-intro">Zaloguj się, aby przejść do swojego panelu.</p>

        {isCheckingSession ? (
          <p className="author-login-status" role="status">Sprawdzam sesję...</p>
        ) : (
          <form className="author-login-form" onSubmit={handleSubmit}>
            <label htmlFor="author-username">Login</label>
            <input
              autoComplete="username"
              id="author-username"
              name="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <label htmlFor="author-password">Hasło</label>
            <input
              autoComplete="current-password"
              id="author-password"
              name="password"
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {error && <p className="author-login-error" role="alert">{error}</p>}
            <button className="author-login-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
            </button>
          </form>
        )}

      </section>
      <a className="author-login-back" href="/">Wróć na stronę główną</a>
    </main>
  )
}

export default AuthorLogin