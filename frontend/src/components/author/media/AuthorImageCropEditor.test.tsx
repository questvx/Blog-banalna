import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
  height: 250,
}

function renderCropEditor() {
  const onCancel = vi.fn()
  const onSave = vi.fn().mockResolvedValue(undefined)
  render(
    <AuthorImageCropEditor
      imageUrl={sourceUrl}
      previewUrl={`${sourceUrl}?scaled=1`}
      onCancel={onCancel}
      onSave={onSave}
    />,
  )

  const image = screen.getByAltText('Zdjęcie do przycięcia')
  Object.defineProperty(image, 'naturalWidth', { configurable: true, value: 1600 })
  Object.defineProperty(image, 'naturalHeight', { configurable: true, value: 900 })
  fireEvent.load(image)

  return { onCancel, onSave }
}

describe('AuthorImageCropEditor', () => {
  beforeEach(() => {
    mockedCreateCroppedImage.mockReset()
  })

  it('shows both card previews and saves the chosen aspect ratio and crop settings', async () => {
    mockedCreateCroppedImage.mockResolvedValue(processedImage)
    const { onSave } = renderCropEditor()

    expect(screen.getByRole('img', { name: 'Podgląd kadru na dużej karcie' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Podgląd kadru na małej karcie' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Mała karta · 1,7:1' }))
    fireEvent.change(screen.getByLabelText('Powiększenie kadru: 100%'), { target: { value: '150' } })
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz przycięcie' }))

    expect(await screen.findByLabelText('Powiększenie kadru: 150%')).toBeInTheDocument()
    expect(mockedCreateCroppedImage).toHaveBeenCalledWith(sourceUrl, 'small', 150, 0.5, 0.5)
    expect(onSave).toHaveBeenCalledWith(processedImage)
  })

  it('displays processing errors without closing the editor', async () => {
    mockedCreateCroppedImage.mockRejectedValue(new Error('Nie udało się przyciąć zdjęcia.'))
    renderCropEditor()
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz przycięcie' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Nie udało się przyciąć zdjęcia.')
    expect(screen.getByRole('dialog', { name: 'Przytnij zdjęcie' })).toBeInTheDocument()
  })
})
