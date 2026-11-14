import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ImageCardCrops } from '../../../data/imageCardCrops'
import type { ProcessedImage } from './authorImageProcessing'
import AuthorImageCropEditor from './AuthorImageCropEditor'
import { createCroppedImage } from './authorImageProcessing'

vi.mock('./authorImageProcessing', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./authorImageProcessing')>()
  return { ...actual, createCroppedImage: vi.fn() }
})

const mockedCreateCroppedImage = vi.mocked(createCroppedImage)
const sourceUrl = 'https://blog.example/uploads/source.jpg'
const processedImage: ProcessedImage = {
  file: new File(['cropped'], 'source.jpg', { type: 'image/jpeg' }),
  width: 600,
  height: 400,
}
const initialCardCrops: ImageCardCrops = {
  fileName: 'source.jpg',
  large: { zoomPercent: 120, positionX: 25, positionY: 40 },
  small: { zoomPercent: 140, positionX: 60, positionY: 70 },
}

function renderCropEditor() {
  const onCancel = vi.fn()
  const onSaveCroppedImage = vi.fn().mockResolvedValue(undefined)
  const onSaveCardCrops = vi.fn().mockResolvedValue(undefined)
  render(
    <AuthorImageCropEditor
      imageUrl={sourceUrl}
      previewUrl={`${sourceUrl}?scaled=1`}
      initialCardCrops={initialCardCrops}
      onCancel={onCancel}
      onSaveCroppedImage={onSaveCroppedImage}
      onSaveCardCrops={onSaveCardCrops}
    />,
  )

  const image = screen.getByAltText('Zdjęcie do kadrowania')
  Object.defineProperty(image, 'naturalWidth', { configurable: true, value: 1600 })
  Object.defineProperty(image, 'naturalHeight', { configurable: true, value: 900 })
  fireEvent.load(image)

  return { onCancel, onSaveCroppedImage, onSaveCardCrops }
}

describe('AuthorImageCropEditor', () => {
  beforeEach(() => {
    mockedCreateCroppedImage.mockReset()
  })

  it('creates a freely sized crop without imposing a ratio', async () => {
    mockedCreateCroppedImage.mockResolvedValue(processedImage)
    const { onSaveCroppedImage, onSaveCardCrops } = renderCropEditor()

    expect(screen.getByRole('slider', { name: /Szerokość kadru/ })).toHaveValue('80')
    fireEvent.change(screen.getByRole('slider', { name: /Szerokość kadru/ }), { target: { value: '50' } })
    fireEvent.change(screen.getByRole('slider', { name: /Wysokość kadru/ }), { target: { value: '40' } })
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz przycięte zdjęcie' }))

    expect(await screen.findByText(/Kadr: 800 × 360 px/)).toBeInTheDocument()
    expect(mockedCreateCroppedImage).toHaveBeenCalledWith(sourceUrl, {
      x: 0.1,
      y: 0.1,
      width: 0.5,
      height: 0.4,
    })
    expect(onSaveCroppedImage).toHaveBeenCalledWith(processedImage)
    expect(onSaveCardCrops).not.toHaveBeenCalled()
  })

  it('saves independent large and small card crops without replacing the source image', async () => {
    const { onSaveCroppedImage, onSaveCardCrops } = renderCropEditor()

    fireEvent.click(screen.getByRole('button', { name: 'Kadruj na karcie wpisu' }))
    fireEvent.click(screen.getByRole('button', { name: 'Mała karta' }))
    fireEvent.change(screen.getByRole('slider', { name: /Powiększenie kadru/ }), { target: { value: '180' } })
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz kadry kart' }))

    expect(await screen.findByText(/zapis nie zmienia oryginalnego zdjęcia/)).toBeInTheDocument()
    expect(onSaveCardCrops).toHaveBeenCalledWith({
      large: initialCardCrops.large,
      small: { ...initialCardCrops.small, zoomPercent: 180 },
    })
    expect(mockedCreateCroppedImage).not.toHaveBeenCalled()
    expect(onSaveCroppedImage).not.toHaveBeenCalled()
  })

  it('displays processing errors without closing the editor', async () => {
    mockedCreateCroppedImage.mockRejectedValue(new Error('Nie udało się przyciąć zdjęcia.'))
    renderCropEditor()
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz przycięte zdjęcie' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Nie udało się przyciąć zdjęcia.')
    expect(screen.getByRole('dialog', { name: 'Kadruj zdjęcie' })).toBeInTheDocument()
  })
})
