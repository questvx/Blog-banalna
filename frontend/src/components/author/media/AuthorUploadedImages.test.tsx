import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthorPost } from '../../../api/adminPosts'
import { fetchAdminPosts } from '../../../api/adminPosts'
import { fetchAdminImageCardCrops, saveAdminImageCardCrops } from '../../../api/adminImageCardCrops'
import {
  deleteAuthorImage,
  fetchAuthorImages,
  replaceAuthorImage,
  uploadAuthorImage,
} from '../../../api/authorMedia'
import { createPost } from '../../../test/fixtures'
import AuthorUploadedImages from './AuthorUploadedImages'
import { createScaledImage } from './authorImageProcessing'

vi.mock('../../../api/adminPosts', () => ({ fetchAdminPosts: vi.fn() }))
vi.mock('../../../api/adminImageCardCrops', () => ({
  fetchAdminImageCardCrops: vi.fn(),
  saveAdminImageCardCrops: vi.fn(),
}))
vi.mock('../../../api/authorMedia', () => ({
  deleteAuthorImage: vi.fn(),
  fetchAuthorImages: vi.fn(),
  replaceAuthorImage: vi.fn(),
  uploadAuthorImage: vi.fn(),
}))
vi.mock('./authorImageProcessing', () => ({
  createScaledImage: vi.fn(),
  MIN_IMAGE_SCALE_PERCENT: 10,
  MAX_IMAGE_SCALE_PERCENT: 500,
}))
vi.mock('./AuthorImageCropEditor', () => ({
  default: ({
    imageUrl,
    onCancel,
    onSaveCroppedImage,
    onSaveCardCrops,
  }: {
    imageUrl: string
    onCancel: () => void
    onSaveCroppedImage: (image: { file: File; width: number; height: number }) => void
    onSaveCardCrops: (crops: {
      large: { zoomPercent: number; positionX: number; positionY: number }
      small: { zoomPercent: number; positionX: number; positionY: number }
    }) => void
  }) => (
    <div role="dialog" aria-label="Przytnij zdjęcie">
      <span>{imageUrl}</span>
      <button type="button" onClick={onCancel}>Anuluj kadr</button>
      <button
        type="button"
        onClick={() => onSaveCroppedImage({ file: new File(['crop'], 'cropped.png', { type: 'image/png' }), width: 640, height: 360 })}
      >
        Zapisz przycięte zdjęcie
      </button>
      <button
        type="button"
        onClick={() => onSaveCardCrops({
          large: { zoomPercent: 120, positionX: 30, positionY: 40 },
          small: { zoomPercent: 150, positionX: 60, positionY: 70 },
        })}
      >
        Zapisz kadry kart
      </button>
    </div>
  ),
}))

const mockedFetchPosts = vi.mocked(fetchAdminPosts)
const mockedFetchCardCrops = vi.mocked(fetchAdminImageCardCrops)
const mockedSaveCardCrops = vi.mocked(saveAdminImageCardCrops)
const mockedFetchImages = vi.mocked(fetchAuthorImages)
const mockedDeleteImage = vi.mocked(deleteAuthorImage)
const mockedReplaceImage = vi.mocked(replaceAuthorImage)
const mockedUploadImage = vi.mocked(uploadAuthorImage)
const mockedCreateScaledImage = vi.mocked(createScaledImage)
const imageUrl = 'https://blog.example/uploads/zdjecie.png'
const cardCrops = {
  fileName: 'zdjecie.png',
  large: { zoomPercent: 100, positionX: 50, positionY: 50 },
  small: { zoomPercent: 100, positionX: 50, positionY: 50 },
}

function authorPost(overrides: Partial<AuthorPost> = {}): AuthorPost {
  return {
    ...createPost(overrides),
    status: 'PUBLISHED',
    ...overrides,
  }
}

async function renderImageLibrary(images = [imageUrl], posts: AuthorPost[] = []) {
  mockedFetchImages.mockResolvedValue(images)
  mockedFetchPosts.mockResolvedValue(posts)
  mockedFetchCardCrops.mockResolvedValue(cardCrops)
  render(<AuthorUploadedImages />)
  await screen.findByText('Nie jest używane w żadnym wpisie.')
}

describe('AuthorUploadedImages', () => {
  beforeEach(() => {
    mockedFetchImages.mockReset()
    mockedFetchPosts.mockReset()
    mockedFetchCardCrops.mockReset()
    mockedSaveCardCrops.mockReset()
    mockedDeleteImage.mockReset()
    mockedReplaceImage.mockReset()
    mockedUploadImage.mockReset()
    mockedCreateScaledImage.mockReset()
  })

  it('shows main-image and in-content usages for each post', async () => {
    const sharedUrl = 'https://blog.example/uploads/zdjecie.png'
    const mainOnlyUrl = 'https://blog.example/uploads/naglowek.png'
    const contentOnlyUrl = 'https://blog.example/uploads/tresc.png'
    const unusedUrl = 'https://blog.example/uploads/nieuzywane.png'
    await renderImageLibrary(
      [sharedUrl, mainOnlyUrl, contentOnlyUrl, unusedUrl],
      [
        authorPost({
          title: 'Post ze zdjęciem',
          image: mainOnlyUrl,
          content: [`<img src="${sharedUrl}" alt="Wpis">`, `<img src="${contentOnlyUrl}">`],
        }),
        authorPost({
          title: 'Post ze wspólnym zdjęciem',
          image: sharedUrl,
          content: [`<img src="${sharedUrl}" alt="Wpis">`],
        }),
      ],
    )

    const sharedUsage = screen.getByLabelText('Użycie zdjęcia 1')
    expect(within(sharedUsage).getByText('Post ze zdjęciem')).toBeInTheDocument()
    expect(sharedUsage).toHaveTextContent('zdjęcie główne')
    expect(sharedUsage).toHaveTextContent('treść')
    expect(screen.getByAltText('Wgrane zdjęcie 1').closest('.author-uploaded-image')).toHaveClass('is-main-image')
    expect(screen.getByAltText('Wgrane zdjęcie 2').closest('.author-uploaded-image')).toHaveClass('is-main-image')
    expect(screen.getByAltText('Wgrane zdjęcie 3').closest('.author-uploaded-image')).toHaveClass('is-content-image')
    expect(screen.getByAltText('Wgrane zdjęcie 4').closest('.author-uploaded-image')).toHaveClass('is-unused')
    expect(screen.getByLabelText('Użycie zdjęcia 4')).toHaveTextContent('Nie jest używane w żadnym wpisie.')
  })

  it('copies the complete image tag with the fallback alt text', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    await renderImageLibrary()

    fireEvent.click(screen.getByRole('button', { name: 'Kopiuj znacznik <img>' }))

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(
      `<img src="${imageUrl}" alt="nie udało się załadować zdjęcia">`,
    ))
    expect(screen.getByRole('button', { name: 'Skopiowano' })).toBeInTheDocument()
  })

  it('uploads selected files and reports the result', async () => {
    mockedUploadImage.mockResolvedValue('https://blog.example/uploads/nowe.png')
    await renderImageLibrary()

    fireEvent.change(screen.getByLabelText('Wybierz zdjęcia do wgrania'), {
      target: { files: [new File(['image'], 'nowe.png', { type: 'image/png' })] },
    })

    expect(await screen.findByText('Zdjęcie zostało wgrane.')).toBeInTheDocument()
    expect(mockedUploadImage).toHaveBeenCalledOnce()
    expect(screen.getByAltText('Wgrane zdjęcie 1')).toBeInTheDocument()
  })

  it('validates image scale percentage before processing', async () => {
    await renderImageLibrary()
    const image = screen.getByAltText('Wgrane zdjęcie 1')
    Object.defineProperty(image, 'naturalWidth', { configurable: true, value: 1200 })
    Object.defineProperty(image, 'naturalHeight', { configurable: true, value: 800 })
    fireEvent.load(image)
    fireEvent.click(screen.getByRole('button', { name: 'Skaluj zdjęcie' }))
    fireEvent.change(screen.getByLabelText('Skala (10–500%)'), { target: { value: '501' } })

    expect(screen.getByRole('button', { name: 'Zastosuj rozmiar' })).toBeDisabled()
    expect(mockedCreateScaledImage).not.toHaveBeenCalled()
  })

  it('previews proportional dimensions and saves the scaled image', async () => {
    mockedCreateScaledImage.mockResolvedValue({
      file: new File(['scaled'], 'zdjecie.png', { type: 'image/png' }),
      width: 600,
      height: 400,
    })
    mockedReplaceImage.mockResolvedValue(imageUrl)
    await renderImageLibrary()

    const image = screen.getByAltText('Wgrane zdjęcie 1')
    Object.defineProperty(image, 'naturalWidth', { configurable: true, value: 1200 })
    Object.defineProperty(image, 'naturalHeight', { configurable: true, value: 800 })
    fireEvent.load(image)
    fireEvent.click(screen.getByRole('button', { name: 'Skaluj zdjęcie' }))
    fireEvent.change(screen.getByLabelText('Skala (10–500%)'), { target: { value: '50' } })
    expect(screen.getByText('Wymiary: 1200 × 800 → 600 × 400 px')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Zastosuj rozmiar' }))

    expect(await screen.findByText('Zdjęcie przeskalowano do 600 × 400 px.')).toBeInTheDocument()
    expect(mockedCreateScaledImage).toHaveBeenCalledWith(imageUrl, 50)
    expect(mockedReplaceImage).toHaveBeenCalledOnce()
  })

  it('saves a crop and updates the library status', async () => {
    mockedReplaceImage.mockResolvedValue(imageUrl)
    await renderImageLibrary()
    fireEvent.click(screen.getByRole('button', { name: 'Przytnij zdjęcie' }))

    expect(await screen.findByRole('dialog', { name: 'Przytnij zdjęcie' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz przycięte zdjęcie' }))

    expect(await screen.findByText('Oryginalne zdjęcie przycięto do 640 × 360 px.')).toBeInTheDocument()
    expect(mockedReplaceImage).toHaveBeenCalledOnce()
  })

  it('saves card crop metadata without replacing the uploaded image', async () => {
    mockedSaveCardCrops.mockResolvedValue({
      fileName: 'zdjecie.png',
      large: { zoomPercent: 120, positionX: 30, positionY: 40 },
      small: { zoomPercent: 150, positionX: 60, positionY: 70 },
    })
    await renderImageLibrary()
    fireEvent.click(screen.getByRole('button', { name: 'Przytnij zdjęcie' }))
    await screen.findByRole('dialog', { name: 'Przytnij zdjęcie' })
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz kadry kart' }))

    expect(await screen.findByText(/oryginalne zdjęcie nie zostało zmienione/i)).toBeInTheDocument()
    expect(mockedSaveCardCrops).toHaveBeenCalledWith('zdjecie.png', {
      large: { zoomPercent: 120, positionX: 30, positionY: 40 },
      small: { zoomPercent: 150, positionX: 60, positionY: 70 },
    })
    expect(mockedReplaceImage).not.toHaveBeenCalled()
  })

  it('deletes an image only after confirmation', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockedDeleteImage.mockResolvedValue(undefined)
    await renderImageLibrary()

    fireEvent.click(screen.getByRole('button', { name: 'Usuń' }))

    expect(await screen.findByText('Nie ma jeszcze wgranych zdjęć.')).toBeInTheDocument()
    expect(confirm).toHaveBeenCalledOnce()
    expect(mockedDeleteImage).toHaveBeenCalledWith(imageUrl)
  })
})
