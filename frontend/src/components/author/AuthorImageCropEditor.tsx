import { useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react'
import {
  createCroppedImage,
  POST_CARD_CROP_ASPECT_RATIOS,
  type PostCardCropType,
  type ProcessedImage,
} from './authorImageProcessing'
import './AuthorImageCropEditor.css'

type AuthorImageCropEditorProps = {
  imageUrl: string
  previewUrl: string
  onCancel: () => void
  onSave: (image: ProcessedImage) => Promise<void>
}

type ImageDimensions = {
  width: number
  height: number
}

type CropPosition = {
  x: number
  y: number
}

type CropRect = CropPosition & {
  width: number
  height: number
}

type CropDrag = {
  pointerX: number
  pointerY: number
  positionX: number
  positionY: number
}

function getCropSize(dimensions: ImageDimensions, aspectRatio: number, zoomPercent: number) {
  const sourceAspectRatio = dimensions.width / dimensions.height
  const baseWidth = sourceAspectRatio > aspectRatio ? aspectRatio / sourceAspectRatio : 1
  const baseHeight = sourceAspectRatio > aspectRatio ? 1 : sourceAspectRatio / aspectRatio
  const zoom = zoomPercent / 100

  return {
    width: baseWidth / zoom,
    height: baseHeight / zoom,
  }
}

function getCardPreviewRect(crop: CropRect, dimensions: ImageDimensions, aspectRatio: number): CropRect {
  const cropAspectRatio = crop.width * dimensions.width / (crop.height * dimensions.height)

  if (cropAspectRatio > aspectRatio) {
    const width = crop.width * aspectRatio / cropAspectRatio
    return { x: crop.x + (crop.width - width) / 2, y: crop.y, width, height: crop.height }
  }

  const height = crop.height * cropAspectRatio / aspectRatio
  return { x: crop.x, y: crop.y + (crop.height - height) / 2, width: crop.width, height }
}

function getCardPreviewStyle(imageUrl: string, rect: CropRect): CSSProperties {
  const horizontalPosition = rect.width >= 1 ? 50 : rect.x / (1 - rect.width) * 100
  const verticalPosition = rect.height >= 1 ? 50 : rect.y / (1 - rect.height) * 100

  return {
    backgroundImage: `url("${imageUrl}")`,
    backgroundPosition: `${horizontalPosition}% ${verticalPosition}%`,
    backgroundSize: `${100 / rect.width}% ${100 / rect.height}%`,
  }
}

function AuthorImageCropEditor({ imageUrl, previewUrl, onCancel, onSave }: AuthorImageCropEditorProps) {
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null)
  const [cropType, setCropType] = useState<PostCardCropType>('large')
  const [zoomPercent, setZoomPercent] = useState(100)
  const [position, setPosition] = useState<CropPosition>({ x: 0.5, y: 0.5 })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const dragRef = useRef<CropDrag | null>(null)

  const aspectRatio = POST_CARD_CROP_ASPECT_RATIOS[cropType]
  const cropSize = dimensions ? getCropSize(dimensions, aspectRatio, zoomPercent) : null
  const cropRect = cropSize ? {
    x: position.x * (1 - cropSize.width),
    y: position.y * (1 - cropSize.height),
    ...cropSize,
  } : null
  const largePreviewRect = cropRect && dimensions
    ? getCardPreviewRect(cropRect, dimensions, POST_CARD_CROP_ASPECT_RATIOS.large)
    : null
  const smallPreviewRect = cropRect && dimensions
    ? getCardPreviewRect(cropRect, dimensions, POST_CARD_CROP_ASPECT_RATIOS.small)
    : null

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isSaving) onCancel()
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!cropSize || !dimensions || isSaving) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      positionX: position.x,
      positionY: position.y,
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const stage = event.currentTarget.parentElement
    if (!drag || !stage || !cropSize) return

    const stageBounds = stage.getBoundingClientRect()
    const maxX = Math.max(0, 1 - cropSize.width)
    const maxY = Math.max(0, 1 - cropSize.height)
    const deltaX = maxX > 0 ? (event.clientX - drag.pointerX) / (stageBounds.width * maxX) : 0
    const deltaY = maxY > 0 ? (event.clientY - drag.pointerY) / (stageBounds.height * maxY) : 0
    setPosition({
      x: Math.max(0, Math.min(1, drag.positionX + deltaX)),
      y: Math.max(0, Math.min(1, drag.positionY + deltaY)),
    })
  }

  const handlePointerUp = () => {
    dragRef.current = null
  }

  const handleSave = async () => {
    if (!dimensions) {
      setError('Poczekaj, aż zdjęcie zostanie wczytane.')
      return
    }

    setError('')
    setIsSaving(true)
    try {
      const croppedImage = await createCroppedImage(
        imageUrl,
        cropType,
        zoomPercent,
        position.x,
        position.y,
      )
      await onSave(croppedImage)
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Nie udało się przyciąć zdjęcia.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="author-image-crop-backdrop" role="presentation" onMouseDown={handleBackdropMouseDown}>
      <section className="author-image-crop-dialog" role="dialog" aria-modal="true" aria-labelledby="author-image-crop-title">
        <div className="author-image-crop-heading">
          <div>
            <p className="author-login-eyebrow">Wgrane zdjęcia</p>
            <h2 id="author-image-crop-title">Przytnij zdjęcie</h2>
          </div>
          <button type="button" aria-label="Zamknij przycinanie" disabled={isSaving} onClick={onCancel}>×</button>
        </div>

        <div className="author-image-crop-layout">
          <div className="author-image-crop-main">
            <div className="author-image-crop-aspects" aria-label="Proporcje karty">
              <button
                type="button"
                aria-pressed={cropType === 'large'}
                onClick={() => {
                  setCropType('large')
                  setPosition({ x: 0.5, y: 0.5 })
                }}
              >
                Duża karta · 2,4:1
              </button>
              <button
                type="button"
                aria-pressed={cropType === 'small'}
                onClick={() => {
                  setCropType('small')
                  setPosition({ x: 0.5, y: 0.5 })
                }}
              >
                Mała karta · 2:1
              </button>
            </div>

            <div className="author-image-crop-stage-wrap">
              <div className="author-image-crop-stage">
                <img
                  src={previewUrl}
                  alt="Zdjęcie do przycięcia"
                  onLoad={(event) => {
                    setDimensions({
                      width: event.currentTarget.naturalWidth,
                      height: event.currentTarget.naturalHeight,
                    })
                  }}
                  onError={() => setError('Nie udało się wczytać podglądu zdjęcia.')}
                />
                {cropRect && (
                  <div
                    className="author-image-crop-frame"
                    aria-label="Przeciągnij, aby przesunąć kadr"
                    style={{
                      height: `${cropRect.height * 100}%`,
                      left: `${cropRect.x * 100}%`,
                      top: `${cropRect.y * 100}%`,
                      width: `${cropRect.width * 100}%`,
                    }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                  >
                    <span className="author-image-crop-grid" />
                  </div>
                )}
              </div>
            </div>

            <div className="author-image-crop-controls">
              <label htmlFor="author-image-crop-zoom">Powiększenie kadru: {zoomPercent}%</label>
              <input
                id="author-image-crop-zoom"
                type="range"
                min="100"
                max="300"
                step="1"
                value={zoomPercent}
                disabled={!dimensions || isSaving}
                onChange={(event) => setZoomPercent(Number(event.target.value))}
              />
              <label htmlFor="author-image-crop-horizontal">Pozycja pozioma: {Math.round(position.x * 100)}%</label>
              <input
                id="author-image-crop-horizontal"
                type="range"
                min="0"
                max="100"
                value={Math.round(position.x * 100)}
                disabled={!cropSize || cropSize.width >= 1 || isSaving}
                onChange={(event) => setPosition((current) => ({ ...current, x: Number(event.target.value) / 100 }))}
              />
              <label htmlFor="author-image-crop-vertical">Pozycja pionowa: {Math.round(position.y * 100)}%</label>
              <input
                id="author-image-crop-vertical"
                type="range"
                min="0"
                max="100"
                value={Math.round(position.y * 100)}
                disabled={!cropSize || cropSize.height >= 1 || isSaving}
                onChange={(event) => setPosition((current) => ({ ...current, y: Number(event.target.value) / 100 }))}
              />
            </div>

            {dimensions && cropRect && (
              <p className="author-image-crop-dimensions">
                Kadr: {Math.round(cropRect.width * dimensions.width)} × {Math.round(cropRect.height * dimensions.height)} px
              </p>
            )}
          </div>

          <aside className="author-image-crop-previews" aria-label="Podgląd zdjęcia na kartach postów">
            <h3>Podgląd kart postów</h3>
            {dimensions && largePreviewRect && (
              <div>
                <p>Duża karta</p>
                <div
                  className="author-image-crop-preview is-large"
                  role="img"
                  aria-label="Podgląd kadru na dużej karcie"
                  style={getCardPreviewStyle(previewUrl, largePreviewRect)}
                />
              </div>
            )}
            {dimensions && smallPreviewRect && (
              <div>
                <p>Mała karta</p>
                <div
                  className="author-image-crop-preview is-small"
                  role="img"
                  aria-label="Podgląd kadru na małej karcie"
                  style={getCardPreviewStyle(previewUrl, smallPreviewRect)}
                />
              </div>
            )}
            <p className="author-image-crop-preview-note">
              Siatka pokazuje kadr wybranej proporcji. Przeciągnij kadr lub użyj suwaków, aby zmienić jego położenie.
            </p>
          </aside>
        </div>

        <p className="author-image-crop-hint">Proporcje kart są przybliżone. Przycinanie GIF-ów i animowanych WebP nie jest obsługiwane.</p>
        {error && <p className="author-image-crop-error" role="alert">{error}</p>}
        <div className="author-image-crop-actions">
          <button type="button" disabled={isSaving} onClick={onCancel}>Anuluj</button>
          <button type="button" disabled={!dimensions || isSaving} onClick={handleSave}>
            {isSaving ? 'Zapisywanie...' : 'Zapisz przycięcie'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default AuthorImageCropEditor
