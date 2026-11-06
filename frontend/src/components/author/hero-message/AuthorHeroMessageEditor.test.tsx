import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchAdminHeroMessage, saveAdminHeroMessage } from '../../../api/adminHeroMessage'
import AuthorHeroMessageEditor from './AuthorHeroMessageEditor'

vi.mock('../../../api/adminHeroMessage', () => ({
  fetchAdminHeroMessage: vi.fn(),
  saveAdminHeroMessage: vi.fn(),
}))

const mockedFetchMessage = vi.mocked(fetchAdminHeroMessage)
const mockedSaveMessage = vi.mocked(saveAdminHeroMessage)

describe('AuthorHeroMessageEditor', () => {
  beforeEach(() => {
    mockedFetchMessage.mockReset()
    mockedSaveMessage.mockReset()
  })

  it('loads the existing message and saves trimmed changes', async () => {
    mockedFetchMessage.mockResolvedValue({ message: 'Stara wiadomość' })
    mockedSaveMessage.mockResolvedValue({ message: 'Nowa wiadomość' })
    render(<AuthorHeroMessageEditor />)

    const textarea = await screen.findByLabelText('Tekst wiadomości')
    expect(textarea).toHaveValue('Stara wiadomość')
    fireEvent.change(textarea, { target: { value: '  Nowa wiadomość  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz wiadomość' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Wiadomość powitalna została zapisana.')
    expect(mockedSaveMessage).toHaveBeenCalledWith('Nowa wiadomość')
    expect(textarea).toHaveValue('Nowa wiadomość')
  })

  it('shows loading and saving errors', async () => {
    mockedFetchMessage.mockRejectedValue(new Error('Brak połączenia.'))
    render(<AuthorHeroMessageEditor />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Brak połączenia.')
    expect(screen.getByLabelText('Tekst wiadomości')).toHaveValue('')
  })
})
