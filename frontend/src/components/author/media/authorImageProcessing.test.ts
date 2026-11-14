import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createCroppedImage,
  createScaledImage,
  MAX_IMAGE_SCALE_PERCENT,
  MIN_IMAGE_SCALE_PERCENT,
  POST_CARD_CROP_ASPECT_RATIOS,
} from './authorImageProcessing'

const fetchMock = vi.fn()
const originalImageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'Image')
const originalCreateObjectURL = Object.getOwnPropertyDescriptor(URL, 'createObjectURL')
const originalRevokeObjectURL = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL')
const originalGetContext = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'getContext')
const originalToBlob = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'toBlob')

function restoreDescriptor(target: object, key: string, descriptor: PropertyDescriptor | undefined) {
  if (descriptor) Object.defineProperty(target, key, descriptor)
  else Reflect.deleteProperty(target, key)
}

function prepareImageProcessing(width: number, height: number) {
  const drawImage = vi.fn()
  const image = {
    naturalWidth: width,
    naturalHeight: height,
    decode: vi.fn().mockResolvedValue(undefined),
    src: '',
  }
  const createObjectURL = vi.fn(() => 'blob:source-image')
  const revokeObjectURL = vi.fn()
  const toBlob = vi.fn((callback: BlobCallback) => callback(new Blob(['processed'], { type: 'image/jpeg' })))

  class MockImage {
    naturalWidth = image.naturalWidth
    naturalHeight = image.naturalHeight
    decode = image.decode
    src = ''
  }

  Object.defineProperty(globalThis, 'Image', { configurable: true, value: MockImage })
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL })
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL })
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: vi.fn(() => ({ drawImage })),
  })
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', { configurable: true, value: toBlob })
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    blob: async () => new Blob(['original'], { type: 'image/jpeg' }),
  })

  return { drawImage, createObjectURL, revokeObjectURL }
}

describe('author image processing constraints', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    restoreDescriptor(globalThis, 'Image', originalImageDescriptor)
    restoreDescriptor(URL, 'createObjectURL', originalCreateObjectURL)
    restoreDescriptor(URL, 'revokeObjectURL', originalRevokeObjectURL)
    restoreDescriptor(HTMLCanvasElement.prototype, 'getContext', originalGetContext)
    restoreDescriptor(HTMLCanvasElement.prototype, 'toBlob', originalToBlob)
  })

  it('defines the supported card crop ratios and scale limits', () => {
    expect(POST_CARD_CROP_ASPECT_RATIOS).toEqual({ large: 2.4, small: 1.7 })
    expect(MIN_IMAGE_SCALE_PERCENT).toBe(10)
    expect(MAX_IMAGE_SCALE_PERCENT).toBe(500)
  })

  it.each([9, 501, 50.5])('rejects invalid scale percentage %s before downloading', async (scale) => {
    await expect(createScaledImage('https://blog.example/photo.jpg', scale)).rejects.toThrow(
      'Podaj liczbę od 10 do 500.',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects unsupported animated image formats before downloading', async () => {
    await expect(createScaledImage('https://blog.example/animation.gif', 50)).rejects.toThrow(
      'Edycja GIF nie jest obsługiwana, ponieważ mogłaby usunąć animację.',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects a freeform crop outside the image before downloading', async () => {
    await expect(createCroppedImage('https://blog.example/photo.jpg', {
      x: 0.8,
      y: 0.5,
      width: 0.4,
      height: 0.5,
    })).rejects.toThrow(
      'Nie udało się odczytać położenia i rozmiaru kadru.',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('scales both dimensions proportionally and releases the source image', async () => {
    const { drawImage, createObjectURL, revokeObjectURL } = prepareImageProcessing(1200, 800)

    const result = await createScaledImage('https://blog.example/photo.jpg', 50)

    expect(result).toMatchObject({ width: 600, height: 400 })
    expect(result.file).toMatchObject({ name: 'photo.jpg', type: 'image/jpeg' })
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 600, 400)
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:source-image')
  })

  it('creates a freeform crop without changing its aspect ratio', async () => {
    const { drawImage, revokeObjectURL } = prepareImageProcessing(1600, 900)

    const result = await createCroppedImage('https://blog.example/photo.jpg', {
      x: 0.1,
      y: 0.2,
      width: 0.5,
      height: 0.3,
    })

    expect(result).toMatchObject({ width: 800, height: 270 })
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 160, 180, 800, 270, 0, 0, 800, 270)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:source-image')
  })
})
