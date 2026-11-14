import { useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react'
import {
  getCardCropRect,
  getCropPreviewStyle,
  type ImageCardCrops,
  type NormalizedCropRect,
  type PostCardCropType,
} from '../../../data/imageCardCrops'
import {
  createCroppedImage,
  type ProcessedImage,
} from './authorImageProcessing'
import './AuthorImageCropEditor.css'

type AuthorImageCropEditorProps = {
  imageUrl: string
  previewUrl: string
  initialCardCrops: ImageCardCrops
  onCancel: () => void
  onSaveCroppedImage: (image: ProcessedImage) => Promise<void>
  onSaveCardCrops: (crops: Omit<ImageCardCrops, 'fileName'>) => Promise<void>
}

type ImageDimensions = {
  width: number
  height: number
}

type CropDrag = {
  pointerX: number
  pointerY: number
  positionX: number
  positionY: number
}

const initialFreeCrop: NormalizedCropRect = {
  x: 0.1,
  y: 0.1,
  width: 0.8,
  height: 0.8,
}

function getCropPosition(rect: NormalizedCropRect) {
  return {
    x: Math.max(0, Math.min(1, rect.x / Math.max(0.0001, 1 - rect.width))),
    y: Math.max(0, Math.min(1, rect.y / Math.max(0.0001, 1 - rect.height))),
  }
}

function AuthorImageCropEditor({
  imageUrl,
  previewUrl,
  initialCardCrops,
  onCancel,
  onSaveCroppedImage,
  onSaveCardCrops,
}: AuthorImageCropEditorProps) {
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null)
  const [mode, setMode] = useState<'free' | 'post-card'>('free')
  const [activeCropType, setActiveCropType] = useState<PostCardCropType>('large')
  const [freeCrop, setFreeCrop] = useState<NormalizedCropRect>(initialFreeCrop)
  const [cardCrops, setCardCrops] = useState<Omit<ImageCardCrops, 'fileName'>>({
    large: { ...initialCardCrops.large },
    small: { ...initialCardCrops.small },
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const dragRef = useRef<CropDrag | null>(null)

  const activeSettings = cardCrops[activeCropType]
  const cropRect = dimensions
    ? mode === 'free'
      ? freeCrop
      : getCardCropRect(dimensions.width, dimensions.height, activeCropType, activeSettings)
    : null
  const largePreviewRect = dimensions
    ? getCardCropRect(dimensions.width, dimensions.height, 'large', cardCrops.large)
    : null
  const smallPreviewRect = dimensions
    ? getCardCropRect(dimensions.width, dimensions.height, 'small', cardCrops.small)
    : null
  const cropPosition = cropRect ? getCropPosition(cropRect) : { x: 0.5, y: 0.5 }

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isSaving) onCancel()
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!cropRect || isSaving) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      positionX: cropPosition.x,
      positionY: cropPosition.y,
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const stage = event.currentTarget.parentElement
    if (!drag || !stage || !cropRect) return

    const stageBounds = stage.getBoundingClientRect()
    const maxX = Math.max(0, 1 - cropRect.width)
    const maxY = Math.max(0, 1 - cropRect.height)
    const deltaX = maxX > 0 ? (event.clientX - drag.pointerX) / (stageBounds.width * maxX) : 0
    const deltaY = maxY > 0 ? (event.clientY - drag.pointerY) / (stageBounds.height * maxY) : 0
    const position = {
      x: Math.max(0, Math.min(1, drag.positionX + deltaX)),
      y: Math.max(0, Math.min(1, drag.positionY + deltaY)),
    }

    if (mode === 'free') {
      setFreeCrop((current) => ({
        ...current,
        x: position.x * (1 - current.width),
        y: position.y * (1 - current.height),
      }))
    } else {
      setCardCrops((current) => ({
        ...current,
        [activeCropType]: {
          ...current[activeCropType],
          positionX: Math.round(position.x * 100),
          positionY: Math.round(position.y * 100),
        },
      }))
    }
  }

  const handlePointerUp = () => {
    dragRef.current = null
  }

  const updateCardCrop = (key: 'zoomPercent' | 'positionX' | 'positionY', value: number) => {
    setCardCrops((current) => ({
      ...current,
      [activeCropType]: { ...current[activeCropType], [key]: value },
    }))
  }

  const updateFreeCrop = (key: 'width' | 'height', value: number) => {
    const size = value / 100
    setFreeCrop((current) => ({
      ...current,
      x: key === 'width' ? Math.min(current.x, 1 - size) : current.x,
      y: key === 'height' ? Math.min(current.y, 1 - size) : current.y,
      [key]: size,
    }))
  }

  const handleSave = async () => {
    if (!dimensions || !cropRect) {
      setError('Poczekaj, aż zdjęcie zostanie wczytane.')
      return
    }

    setError('')
    setIsSaving(true)
    try {
      if (mode === 'post-card') {
        await onSaveCardCrops(cardCrops)
      } else {
        const croppedImage = await createCroppedImage(imageUrl, cropRect)
        await onSaveCroppedImage(croppedImage)
      }
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Nie udało się zapisać kadru zdjęcia.')
    } finally {
      setIsSaving(false)
    }
  }

  const activeFrameStyle: CSSProperties | undefined = cropRect ? {
    height: `${cropRect.height * 100}%`,
    left: `${cropRect.x * 100}%`,
    top: `${cropRect.y * 100}%`,
    width: `${cropRect.width * 100}%`,
  } : undefined

  return (
    <div className="author-image-crop-backdrop" role="presentation" onMouseDown={handleBackdropMouseDown}>
      <section className="author-image-crop-dialog" role="dialog" aria-modal="true" aria-labelledby="author-image-crop-title">
        <div className="author-image-crop-heading">
          <div>
            <p className="author-login-eyebrow">Wgrane zdjęcia</p>
            <h2 id="author-image-crop-title">Kadruj zdjęcie</h2>
          </div>
          <button type="button" aria-label="Zamknij przycinanie" disabled={isSaving} onClick={onCancel}>×</button>
        </div>

        <div className="author-image-crop-modes" aria-label="Sposób kadrowania">
          <button
            type="button"
            aria-pressed={mode === 'free'}
            onClick={() => setMode('free')}
          >
            Przytnij zdjęcie
          </button>
          <button
            type="button"
            aria-pressed={mode === 'post-card'}
            onClick={() => setMode('post-card')}
          >
            Kadruj na karcie wpisu
          </button>
        </div>

        {mode === 'post-card' && (
          <div className="author-image-crop-aspects" aria-label="Rozmiar karty">
            <button
              type="button"
              aria-pressed={activeCropType === 'large'}
              onClick={() => setActiveCropType('large')}
            >
              Duża karta
            </button>
            <button
              type="button"
              aria-pressed={activeCropType === 'small'}
              onClick={() => setActiveCropType('small')}
            >
              Mała karta
            </button>
          </div>
        )}

        <div className="author-image-crop-layout">
          <div className="author-image-crop-main">
            <div className="author-image-crop-stage-wrap">
              <div className="author-image-crop-stage">
                <img
                  src={previewUrl}
                  alt="Zdjęcie do kadrowania"
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
                    style={activeFrameStyle}
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

            {mode === 'free' ? (
              <div className="author-image-crop-controls">
                <label htmlFor="author-image-crop-width">Szerokość kadru: {Math.round(freeCrop.width * 100)}%</label>
                <input
                  id="author-image-crop-width"
                  type="range"
                  min="10"
                  max="100"
                  value={Math.round(freeCrop.width * 100)}
                  disabled={!dimensions || isSaving}
                  onChange={(event) => updateFreeCrop('width', Number(event.target.value))}
                />
                <label htmlFor="author-image-crop-height">Wysokość kadru: {Math.round(freeCrop.height * 100)}%</label>
                <input
                  id="author-image-crop-height"
                  type="range"
                  min="10"
                  max="100"
                  value={Math.round(freeCrop.height * 100)}
                  disabled={!dimensions || isSaving}
                  onChange={(event) => updateFreeCrop('height', Number(event.target.value))}
                />
                <label htmlFor="author-image-crop-horizontal">Pozycja pozioma: {Math.round(cropPosition.x * 100)}%</label>
                <input
                  id="author-image-crop-horizontal"
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(cropPosition.x * 100)}
                  disabled={!cropRect || cropRect.width >= 1 || isSaving}
                  onChange={(event) => setFreeCrop((current) => ({
                    ...current,
                    x: Number(event.target.value) / 100 * (1 - current.width),
                  }))}
                />
                <label htmlFor="author-image-crop-vertical">Pozycja pionowa: {Math.round(cropPosition.y * 100)}%</label>
                <input
                  id="author-image-crop-vertical"
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(cropPosition.y * 100)}
                  disabled={!cropRect || cropRect.height >= 1 || isSaving}
                  onChange={(event) => setFreeCrop((current) => ({
                    ...current,
                    y: Number(event.target.value) / 100 * (1 - current.height),
                  }))}
                />
              </div>
            ) : (
              <div className="author-image-crop-controls">
                <label htmlFor="author-image-crop-zoom">Powiększenie kadru: {activeSettings.zoomPercent}%</label>
                <input
                  id="author-image-crop-zoom"
                  type="range"
                  min="100"
                  max="300"
                  step="1"
                  value={activeSettings.zoomPercent}
                  disabled={!dimensions || isSaving}
                  onChange={(event) => updateCardCrop('zoomPercent', Number(event.target.value))}
                />
                <label htmlFor="author-image-crop-horizontal">Pozycja pozioma: {activeSettings.positionX}%</label>
                <input
                  id="author-image-crop-horizontal"
                  type="range"
                  min="0"
                  max="100"
                  value={activeSettings.positionX}
                  disabled={!cropRect || cropRect.width >= 1 || isSaving}
                  onChange={(event) => updateCardCrop('positionX', Number(event.target.value))}
                />
                <label htmlFor="author-image-crop-vertical">Pozycja pionowa: {activeSettings.positionY}%</label>
                <input
                  id="author-image-crop-vertical"
                  type="range"
                  min="0"
                  max="100"
                  value={activeSettings.positionY}
                  disabled={!cropRect || cropRect.height >= 1 || isSaving}
                  onChange={(event) => updateCardCrop('positionY', Number(event.target.value))}
                />
              </div>
            )}

            {dimensions && cropRect && (
              <p className="author-image-crop-dimensions">
                Kadr: {Math.round(cropRect.width * dimensions.width)} × {Math.round(cropRect.height * dimensions.height)} px
                {mode === 'post-card' && ' · zapis nie zmienia oryginalnego zdjęcia'}
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
                  style={getCropPreviewStyle(previewUrl, largePreviewRect)}
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
                  style={getCropPreviewStyle(previewUrl, smallPreviewRect)}
                />
              </div>
            )}
            <p className="author-image-crop-preview-note">
              {mode === 'free'
                ? 'Ustaw dowolną szerokość i wysokość kadru. Zapis zastąpi oryginalne zdjęcie.'
                : 'Ustawienia dużej i małej karty są niezależne. Zdjęcie w treści wpisu pozostanie w całości.'}
            </p>
          </aside>
        </div>

        <p className="author-image-crop-hint">
          {mode === 'free'
            ? 'Przeciągnij kadr, aby go przesunąć. Użyj suwaków, by niezależnie zmienić jego szerokość i wysokość.'
            : 'Przeciągnij kadr albo użyj suwaków. Przycięcie służy wyłącznie do wyświetlania na karcie wpisu.'}
        </p>
        {error && <p className="author-image-crop-error" role="alert">{error}</p>}
        <div className="author-image-crop-actions">
          <button type="button" disabled={isSaving} onClick={onCancel}>Anuluj</button>
          <button type="button" disabled={!dimensions || isSaving} onClick={handleSave}>
            {isSaving ? 'Zapisywanie...' : mode === 'free' ? 'Zapisz przycięte zdjęcie' : 'Zapisz kadry kart'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default AuthorImageCropEditor
