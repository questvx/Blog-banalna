export const MIN_IMAGE_SCALE_PERCENT = 10
export const MAX_IMAGE_SCALE_PERCENT = 500
export const POST_CARD_CROP_ASPECT_RATIOS = {
  large: 2.4,
  small: 2,
} as const

export type PostCardCropType = keyof typeof POST_CARD_CROP_ASPECT_RATIOS

export type ProcessedImage = {
  file: File
  width: number
  height: number
}

type ImageSource = {
  image: HTMLImageElement
  fileName: string
  contentType: string
  release: () => void
}

const IMAGE_CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}
const MAX_IMAGE_DIMENSION = 10_000
const MAX_IMAGE_PIXELS = 20_000_000

function isAnimatedWebp(bytes: Uint8Array): boolean {
  const isWebp = String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF'
    && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  if (!isWebp) return false

  let offset = 12
  while (offset + 8 <= bytes.length) {
    const chunk = String.fromCharCode(...bytes.slice(offset, offset + 4))
    if (chunk === 'ANIM' || chunk === 'ANMF') return true

    const chunkSize = bytes[offset + 4]
      + bytes[offset + 5] * 0x100
      + bytes[offset + 6] * 0x10000
      + bytes[offset + 7] * 0x1000000
    const nextOffset = offset + 8 + chunkSize + (chunkSize % 2)
    if (!Number.isSafeInteger(nextOffset) || nextOffset > bytes.length) return false
    offset = nextOffset
  }

  return false
}

async function loadImageForEditing(imageUrl: string): Promise<ImageSource> {
  const url = new URL(imageUrl)
  const fileName = url.pathname.split('/').pop()
  if (!fileName) throw new Error('Nie udało się rozpoznać pliku zdjęcia.')

  const extension = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (extension === 'gif') {
    throw new Error('Edycja GIF nie jest obsługiwana, ponieważ mogłaby usunąć animację.')
  }
  const contentType = IMAGE_CONTENT_TYPES[extension]
  if (!contentType) throw new Error('Ten format zdjęcia nie jest obsługiwany.')

  const response = await fetch(imageUrl, { credentials: 'include', cache: 'no-store' })
  if (!response.ok) throw new Error(`Nie udało się pobrać zdjęcia (${response.status}).`)
  const blob = await response.blob()

  if (extension === 'webp' && isAnimatedWebp(new Uint8Array(await blob.arrayBuffer()))) {
    throw new Error('Edycja animowanego WebP nie jest obsługiwana, aby nie utracić animacji.')
  }

  const objectUrl = URL.createObjectURL(blob)
  const image = new Image()
  image.src = objectUrl
  try {
    await image.decode()
  } catch {
    URL.revokeObjectURL(objectUrl)
    throw new Error('Nie udało się odczytać zdjęcia.')
  }

  if (!image.naturalWidth || !image.naturalHeight) {
    URL.revokeObjectURL(objectUrl)
    throw new Error('Nie udało się odczytać wymiarów zdjęcia.')
  }

  return {
    image,
    fileName,
    contentType,
    release: () => URL.revokeObjectURL(objectUrl),
  }
}

function validateOutputDimensions(width: number, height: number): void {
  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION || width * height > MAX_IMAGE_PIXELS) {
    throw new Error(`Zdjęcie przekroczyłoby limit ${MAX_IMAGE_DIMENSION} px na bok lub ${MAX_IMAGE_PIXELS.toLocaleString('pl-PL')} pikseli.`)
  }
}

async function exportCanvas(canvas: HTMLCanvasElement, fileName: string, contentType: string): Promise<File> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result)
      else reject(new Error('Nie udało się utworzyć przetworzonego zdjęcia.'))
    }, contentType, contentType === 'image/png' ? undefined : 0.92)
  })

  if (blob.type !== contentType) {
    throw new Error('Ta przeglądarka nie obsługuje zapisu zdjęcia w jego dotychczasowym formacie.')
  }

  return new File([blob], fileName, { type: contentType })
}

export async function createScaledImage(imageUrl: string, scalePercent: number): Promise<ProcessedImage> {
  if (!Number.isInteger(scalePercent) || scalePercent < MIN_IMAGE_SCALE_PERCENT || scalePercent > MAX_IMAGE_SCALE_PERCENT) {
    throw new Error(`Podaj liczbę od ${MIN_IMAGE_SCALE_PERCENT} do ${MAX_IMAGE_SCALE_PERCENT}.`)
  }

  const source = await loadImageForEditing(imageUrl)
  try {
    const width = Math.max(1, Math.round(source.image.naturalWidth * scalePercent / 100))
    const height = Math.max(1, Math.round(source.image.naturalHeight * scalePercent / 100))
    validateOutputDimensions(width, height)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Przeglądarka nie może przygotować zdjęcia do skalowania.')
    context.drawImage(source.image, 0, 0, width, height)

    return {
      file: await exportCanvas(canvas, source.fileName, source.contentType),
      width,
      height,
    }
  } finally {
    source.release()
  }
}

export async function createCroppedImage(
  imageUrl: string,
  cropType: PostCardCropType,
  zoomPercent: number,
  positionX: number,
  positionY: number,
): Promise<ProcessedImage> {
  const aspectRatio = POST_CARD_CROP_ASPECT_RATIOS[cropType]
  if (!Number.isFinite(zoomPercent) || zoomPercent < 100 || zoomPercent > 300) {
    throw new Error('Powiększenie kadru musi mieścić się w zakresie 100–300%.')
  }
  if (!Number.isFinite(positionX) || !Number.isFinite(positionY)) {
    throw new Error('Nie udało się odczytać położenia kadru.')
  }

  const source = await loadImageForEditing(imageUrl)
  try {
    const sourceWidth = source.image.naturalWidth
    const sourceHeight = source.image.naturalHeight
    const sourceAspectRatio = sourceWidth / sourceHeight
    const baseWidth = sourceAspectRatio > aspectRatio ? sourceHeight * aspectRatio : sourceWidth
    const baseHeight = baseWidth / aspectRatio
    const cropWidth = baseWidth * 100 / zoomPercent
    const cropHeight = baseHeight * 100 / zoomPercent
    const cropX = (sourceWidth - cropWidth) * Math.max(0, Math.min(1, positionX))
    const cropY = (sourceHeight - cropHeight) * Math.max(0, Math.min(1, positionY))
    const width = Math.max(1, Math.round(cropWidth))
    const height = Math.max(1, Math.round(cropHeight))
    validateOutputDimensions(width, height)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Przeglądarka nie może przygotować zdjęcia do przycinania.')
    context.drawImage(source.image, cropX, cropY, cropWidth, cropHeight, 0, 0, width, height)

    return {
      file: await exportCanvas(canvas, source.fileName, source.contentType),
      width,
      height,
    }
  } finally {
    source.release()
  }
}
