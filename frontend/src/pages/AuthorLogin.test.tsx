import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuthorLogin from './AuthorLogin'
import { getAuthorSession, loginAuthor, logoutAuthor } from '../api/auth'

vi.mock('../api/auth', () => ({
  getAuthorSession: vi.fn(),
  loginAuthor: vi.fn(),
  logoutAuthor: vi.fn(),
}))

vi.mock('../components/author', () => ({
  AuthorDashboard: ({ session, onLogout }: { session: { username: string }; onLogout: () => void }) => (
    <button type="button" onClick={onLogout}>Panel {session.username} — wyloguj</button>
  ),
}))

const mockedGetSession = vi.mocked(getAuthorSession)
const mockedLogin = vi.mocked(loginAuthor)
const mockedLogout = vi.mocked(logoutAuthor)

describe('AuthorLogin', () => {
  beforeEach(() => {
    mockedGetSession.mockReset()
    mockedLogin.mockReset()
    mockedLogout.mockReset()
    mockedGetSession.mockResolvedValue(null)
  })

  it('checks for an existing session before showing the login form', async () => {
    render(<AuthorLogin />)

    expect(screen.getByRole('status')).toHaveTextContent('Sprawdzam sesję...')
    expect(await screen.findByRole('heading', { name: 'Panel autorki' })).toBeInTheDocument()
    expect(screen.getByLabelText('Login')).toBeInTheDocument()
  })

  it('shows the author dashboard after a successful login', async () => {
    mockedLogin.mockResolvedValue({ username: 'autorka' })
    render(<AuthorLogin />)

    fireEvent.change(await screen.findByLabelText('Login'), { target: { value: 'autorka' } })
    fireEvent.change(screen.getByLabelText('Hasło'), { target: { value: 'hasło' } })
    fireEvent.click(screen.getByRole('button', { name: 'Zaloguj się' }))

    expect(await screen.findByRole('button', { name: 'Panel autorka — wyloguj' })).toBeInTheDocument()
    expect(mockedLogin).toHaveBeenCalledWith('autorka', 'hasło')
  })

  it('displays login failures to the author', async () => {
    mockedLogin.mockRejectedValue(new Error('Nieprawidłowy login lub hasło.'))
    render(<AuthorLogin />)

    fireEvent.change(await screen.findByLabelText('Login'), { target: { value: 'autorka' } })
    fireEvent.change(screen.getByLabelText('Hasło'), { target: { value: 'błędne' } })
    fireEvent.click(screen.getByRole('button', { name: 'Zaloguj się' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Nieprawidłowy login lub hasło.')
  })

  it('returns to the login form after a successful logout', async () => {
    mockedGetSession.mockResolvedValue({ username: 'autorka' })
    mockedLogout.mockResolvedValue()
    render(<AuthorLogin />)

    fireEvent.click(await screen.findByRole('button', { name: 'Panel autorka — wyloguj' }))

    expect(await screen.findByRole('heading', { name: 'Panel autorki' })).toBeInTheDocument()
    expect(mockedLogout).toHaveBeenCalledOnce()
  })
})
