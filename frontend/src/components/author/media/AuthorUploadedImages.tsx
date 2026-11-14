import { useEffect, useState, type ChangeEvent } from 'react'
import { fetchAdminPosts, type AuthorPost } from '../../../api/adminPosts'
import { fetchAdminImageCardCrops, saveAdminImageCardCrops } from '../../../api/adminImageCardCrops'
import { deleteAuthorImage, fetchAuthorImages, replaceAuthorImage, uploadAuthorImage } from '../../../api/authorMedia'
import AuthorImageCropEditor from './AuthorImageCropEditor'
import type { ImageCardCrops } from '../../../data/imageCardCrops'
import {
  createScaledImage,
  MAX_IMAGE_SCALE_PERCENT,
  MIN_IMAGE_SCALE_PERCENT,
  type ProcessedImage,
} from './authorImageProcessing'
import './AuthorUploadedImages.css'

const IMAGE_TYPES = 'image/jpeg,image/png,image/gif,image/webp'

type ImageUsage = {
  postId: number
  postTitle: string
  isMainImage: boolean
  isInContent: boolean
}

function normalizeImageUrl(imageUrl: string): string {
  try {
    const url = new URL(imageUrl, window.location.origin)
    return `${url.origin}${url.pathname}`
  } catch {
    return imageUrl.trim()
  }
}

function getContentImageUrls(content: string[]): Set<string> {
  const parser = new DOMParser()
  const imageUrls = content.flatMap((paragraph) => {
    const document = parser.parseFromString(paragraph, 'text/html')
    return Array.from(document.querySelectorAll('img')).map((image) => image.getAttribute('src') ?? '')
  })

  return new Set(imageUrls.filter(Boolean).map(normalizeImageUrl))
}

function getImageUsages(posts: AuthorPost[]): Map<string, ImageUsage[]> {
  const usagesByUrl = new Map<string, ImageUsage[]>()

  for (const post of posts) {
    const mainImageUrl = post.image ? normalizeImageUrl(post.image) : ''
    const contentImageUrls = getContentImageUrls(post.content)
    const referencedImageUrls = new Set(contentImageUrls)
    if (mainImageUrl) referencedImageUrls.add(mainImageUrl)

    for (const imageUrl of referencedImageUrls) {
      const usages = usagesByUrl.get(imageUrl) ?? []
      usages.push({
        postId: post.id,
        postTitle: post.title,
        isMainImage: imageUrl === mainImageUrl,
        isInContent: contentImageUrls.has(imageUrl),
      })
      usagesByUrl.set(imageUrl, usages)
    }
  }

  return usagesByUrl
}

function getVersionedImageUrl(imageUrl: string, version: number | undefined): string {
  if (version === undefined) return imageUrl
  const url = new URL(imageUrl)
  url.searchParams.set('scaled', String(version))
  return url.toString()
}

function AuthorUploadedImages() {
  const [images, setImages] = useState<string[]>([])
  const [imageDimensions, setImageDimensions] = useState<Record<string, { width: number; height: number }>>({})
  const [imageVersions, setImageVersions] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingUsage, setIsCheckingUsage] = useState(true)
  const [imageUsages, setImageUsages] = useState<Map<string, ImageUsage[]>>(new Map())
  const [usageError, setUsageError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [copiedImage, setCopiedImage] = useState('')
  const [deletingImage, setDeletingImage] = useState('')
  const [scalingImage, setScalingImage] = useState('')
  const [scalePercent, setScalePercent] = useState('100')
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [scaleError, setScaleError] = useState('')
  const [croppingImage, setCroppingImage] = useState('')
  const [cropSettings, setCropSettings] = useState<ImageCardCrops | null>(null)
  const [loadingCropImage, setLoadingCropImage] = useState('')

  useEffect(() => {
    let isMounted = true

    fetchAuthorImages()
      .then((loadedImages) => {
        if (isMounted) setImages(loadedImages)
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Nie udało się pobrać zdjęć.')
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    fetchAdminPosts()
      .then((posts) => {
        if (isMounted) setImageUsages(getImageUsages(posts))
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setUsageError(loadError instanceof Error ? loadError.message : 'Nie udało się pobrać wpisów.')
        }
      })
      .finally(() => {
        if (isMounted) setIsCheckingUsage(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? [])
    event.currentTarget.value = ''
    if (files.length === 0) return

    setError('')
    setNotice('')
    setIsUploading(true)
    let uploadedCount = 0
    const failures: string[] = []

    try {
      for (const file of files) {
        try {
          const imageUrl = await uploadAuthorImage(file)
          setImages((current) => [imageUrl, ...current.filter((image) => image !== imageUrl)])
          uploadedCount += 1
        } catch (uploadError: unknown) {
          const message = uploadError instanceof Error ? uploadError.message : 'Nie udało się wysłać obrazu.'
          failures.push(`${file.name}: ${message}`)
        }
      }

      if (uploadedCount > 0) {
        setNotice(uploadedCount === 1 ? 'Zdjęcie zostało wgrane.' : `Wgrano zdjęcia: ${uploadedCount}.`)
      }
      if (failures.length > 0) setError(failures.join(' '))
    } finally {
      setIsUploading(false)
    }
  }

  const handleCopyImageTag = async (imageUrl: string) => {
    setError('')
    try {
      await navigator.clipboard.writeText(`<img src="${imageUrl}" alt="nie udało się załadować zdjęcia">`)
      setCopiedImage(imageUrl)
    } catch {
      setError('Nie udało się skopiować znacznika zdjęcia. Możesz otworzyć zdjęcie i skopiować jego adres ręcznie.')
    }
  }

  const handleScaleImage = async (imageUrl: string) => {
    const percentage = Number(scalePercent)
    if (!Number.isInteger(percentage) || percentage < MIN_IMAGE_SCALE_PERCENT || percentage > MAX_IMAGE_SCALE_PERCENT) {
      setScaleError(`Podaj liczbę od ${MIN_IMAGE_SCALE_PERCENT} do ${MAX_IMAGE_SCALE_PERCENT}.`)
      return
    }

    setScaleError('')
    setError('')
    setNotice('')
    setIsProcessingImage(true)
    try {
      const scaledImage = await createScaledImage(imageUrl, percentage)
      await replaceAuthorImage(imageUrl, scaledImage.file)
      setImageVersions((current) => ({ ...current, [imageUrl]: Date.now() }))
      setImageDimensions((current) => ({
        ...current,
        [imageUrl]: { width: scaledImage.width, height: scaledImage.height },
      }))
      setNotice(`Zdjęcie przeskalowano do ${scaledImage.width} × ${scaledImage.height} px.`)
      setScalingImage('')
    } catch (scaleError: unknown) {
      setScaleError(scaleError instanceof Error ? scaleError.message : 'Nie udało się przeskalować zdjęcia.')
    } finally {
      setIsProcessingImage(false)
    }
  }

  const handleOpenCropEditor = async (imageUrl: string) => {
    const fileName = new URL(imageUrl).pathname.split('/').pop()
    if (!fileName) {
      setError('Nie udało się rozpoznać zdjęcia do kadrowania.')
      return
    }

    setError('')
    setNotice('')
    setLoadingCropImage(imageUrl)
    try {
      const settings = await fetchAdminImageCardCrops(decodeURIComponent(fileName))
      setCropSettings(settings)
      setCroppingImage(imageUrl)
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : 'Nie udało się pobrać ustawień kadru.')
    } finally {
      setLoadingCropImage('')
    }
  }

  const handleCropImage = async (croppedImage: ProcessedImage) => {
    if (!croppingImage) return

    setError('')
    setNotice('')
    setIsProcessingImage(true)
    try {
      await replaceAuthorImage(croppingImage, croppedImage.file)
      setImageVersions((current) => ({ ...current, [croppingImage]: Date.now() }))
      setImageDimensions((current) => ({
        ...current,
        [croppingImage]: { width: croppedImage.width, height: croppedImage.height },
      }))
      setNotice(`Oryginalne zdjęcie przycięto do ${croppedImage.width} × ${croppedImage.height} px.`)
      setCroppingImage('')
    } finally {
      setIsProcessingImage(false)
    }
  }

  const handleSaveCardCrops = async (crops: Omit<ImageCardCrops, 'fileName'>) => {
    if (!croppingImage) return

    const fileName = new URL(croppingImage).pathname.split('/').pop()
    if (!fileName) throw new Error('Nie udało się rozpoznać zdjęcia do zapisania kadru.')

    setError('')
    setNotice('')
    setIsProcessingImage(true)
    try {
      const savedCrops = await saveAdminImageCardCrops(decodeURIComponent(fileName), crops)
      setCropSettings(savedCrops)
      setNotice('Zapisano osobne kadry dla dużej i małej karty. Oryginalne zdjęcie nie zostało zmienione.')
      setCroppingImage('')
    } finally {
      setIsProcessingImage(false)
    }
  }

  const handleDeleteImage = async (imageUrl: string) => {
    const fileName = imageUrl.split('/').pop() ?? 'to zdjęcie'
    if (!window.confirm(`Usunąć zdjęcie „${fileName}”? Tej operacji nie można cofnąć.`)) return

    setError('')
    setNotice('')
    setDeletingImage(imageUrl)
    try {
      await deleteAuthorImage(imageUrl)
      setImages((current) => current.filter((image) => image !== imageUrl))
      setScalingImage((current) => current === imageUrl ? '' : current)
      setNotice('Zdjęcie zostało usunięte.')
    } catch (deleteError: unknown) {
      setError(deleteError instanceof Error ? deleteError.message : 'Nie udało się usunąć zdjęcia.')
    } finally {
      setDeletingImage('')
    }
  }

  return (
    <section className="author-uploaded-images" aria-label="Wgrane zdjęcia">
      <div className="author-uploaded-images-toolbar">
        <div>
          <p>Dodaj zdjęcia do biblioteki</p>
          <span>JPEG, PNG, GIF lub WebP · maks. 5 MB na zdjęcie</span>
        </div>
        <label className={`author-uploaded-images-picker ${isLoading || isUploading || isProcessingImage ? 'is-disabled' : ''}`}>
          <span>{isUploading ? 'Wgrywanie zdjęć...' : isProcessingImage ? 'Przetwarzanie zdjęcia...' : 'Wybierz zdjęcia'}</span>
          <input
            accept={IMAGE_TYPES}
            aria-label="Wybierz zdjęcia do wgrania"
            disabled={isLoading || isUploading || isProcessingImage || loadingCropImage !== '' || deletingImage !== ''}
            multiple
            type="file"
            onChange={handleUpload}
          />
        </label>
      </div>

      {error && <p className="author-uploaded-images-message is-error" role="alert">{error}</p>}
      {notice && <p className="author-uploaded-images-message" role="status">{notice}</p>}
      {isCheckingUsage && <p className="author-uploaded-images-message" role="status">Sprawdzam, gdzie zdjęcia są używane...</p>}
      {usageError && (
        <p className="author-uploaded-images-message is-error" role="alert">
          Nie udało się sprawdzić użycia zdjęć we wpisach: {usageError}
        </p>
      )}

      {isLoading ? (
        <p className="author-dashboard-empty" role="status">Pobieram zdjęcia...</p>
      ) : images.length === 0 ? (
        <p className="author-dashboard-empty">Nie ma jeszcze wgranych zdjęć.</p>
      ) : (
        <div className="author-uploaded-images-grid">
          {images.map((imageUrl, index) => {
            const usages = imageUsages.get(normalizeImageUrl(imageUrl)) ?? []
            const imageUsageClass = isCheckingUsage || usageError
              ? ''
              : usages.some((usage) => usage.isMainImage)
                ? 'is-main-image'
                : usages.some((usage) => usage.isInContent)
                  ? 'is-content-image'
                  : 'is-unused'
            const dimensions = imageDimensions[imageUrl]
            const percentage = Number(scalePercent)
            const canPreviewScale = Number.isInteger(percentage)
              && percentage >= MIN_IMAGE_SCALE_PERCENT
              && percentage <= MAX_IMAGE_SCALE_PERCENT
            const previewWidth = dimensions && canPreviewScale ? Math.max(1, Math.round(dimensions.width * percentage / 100)) : null
            const previewHeight = dimensions && canPreviewScale ? Math.max(1, Math.round(dimensions.height * percentage / 100)) : null
            const previewUrl = getVersionedImageUrl(imageUrl, imageVersions[imageUrl])

            return (
              <article className={`author-uploaded-image ${imageUsageClass}`} key={imageUrl}>
                <a href={previewUrl} target="_blank" rel="noreferrer" aria-label={`Otwórz zdjęcie ${index + 1} w nowej karcie`}>
                  <img
                    src={previewUrl}
                    alt={`Wgrane zdjęcie ${index + 1}`}
                    loading="lazy"
                    onLoad={(event) => {
                      const { naturalWidth, naturalHeight } = event.currentTarget
                      setImageDimensions((current) => ({
                        ...current,
                        [imageUrl]: { width: naturalWidth, height: naturalHeight },
                      }))
                    }}
                  />
                </a>
                <div className="author-uploaded-image-usage" aria-label={`Użycie zdjęcia ${index + 1}`}>
                  {isCheckingUsage ? (
                    <span>Sprawdzanie użycia...</span>
                  ) : usageError ? (
                    <span>Nie udało się sprawdzić użycia.</span>
                  ) : usages.length === 0 ? (
                    <span>Nie jest używane w żadnym wpisie.</span>
                  ) : (
                    <>
                      <strong>Używane w:</strong>
                      <ul>
                        {usages.map((usage) => (
                          <li key={usage.postId}>
                            <span>{usage.postTitle}</span>
                            <small>
                              {usage.isMainImage && 'zdjęcie główne'}
                              {usage.isMainImage && usage.isInContent && ' · '}
                              {usage.isInContent && 'treść'}
                            </small>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
                <button
                  className="author-uploaded-image-scale-toggle author-uploaded-image-crop-toggle"
                  type="button"
                  disabled={isUploading || isProcessingImage || loadingCropImage !== '' || deletingImage !== ''}
                  onClick={() => {
                    setScalingImage('')
                    void handleOpenCropEditor(imageUrl)
                  }}
                >
                  {loadingCropImage === imageUrl ? 'Wczytuję ustawienia...' : 'Przytnij zdjęcie'}
                </button>
                <button
                  className="author-uploaded-image-scale-toggle"
                  type="button"
                  aria-expanded={scalingImage === imageUrl}
                  disabled={isUploading || isProcessingImage || loadingCropImage !== '' || deletingImage !== ''}
                  onClick={() => {
                    setScalingImage((current) => current === imageUrl ? '' : imageUrl)
                    setScalePercent('100')
                    setScaleError('')
                  }}
                >
                  {scalingImage === imageUrl ? 'Zamknij skalowanie' : 'Skaluj zdjęcie'}
                </button>
                {scalingImage === imageUrl && (
                  <div className="author-uploaded-image-scale">
                    <label htmlFor={`image-scale-${index}`}>Skala ({MIN_IMAGE_SCALE_PERCENT}–{MAX_IMAGE_SCALE_PERCENT}%)</label>
                    <div className="author-uploaded-image-scale-input">
                      <input
                        id={`image-scale-${index}`}
                        type="number"
                        min={MIN_IMAGE_SCALE_PERCENT}
                        max={MAX_IMAGE_SCALE_PERCENT}
                        step="1"
                        value={scalePercent}
                        disabled={isProcessingImage}
                        onChange={(event) => {
                          setScalePercent(event.target.value)
                          setScaleError('')
                        }}
                      />
                      <span>%</span>
                    </div>
                    <p>
                      {previewWidth !== null && previewHeight !== null
                        ? `Wymiary: ${dimensions.width} × ${dimensions.height} → ${previewWidth} × ${previewHeight} px`
                        : 'Odczytuję wymiary zdjęcia...'}
                    </p>
                    <p className="author-uploaded-image-scale-hint">
                      Szerokość i wysokość zmienią się proporcjonalnie. Skalowanie GIF i animowanego WebP nie jest obsługiwane.
                    </p>
                    {scaleError && <p className="author-uploaded-image-scale-error" role="alert">{scaleError}</p>}
                    <div className="author-uploaded-image-scale-actions">
                      <button
                        type="button"
                        disabled={!canPreviewScale || isUploading || isProcessingImage || deletingImage !== ''}
                        onClick={() => handleScaleImage(imageUrl)}
                      >
                        {isProcessingImage ? 'Przetwarzanie...' : 'Zastosuj rozmiar'}
                      </button>
                      <button type="button" disabled={isProcessingImage} onClick={() => setScalingImage('')}>Anuluj</button>
                    </div>
                  </div>
                )}
                <div className="author-uploaded-image-actions">
                  <code title={imageUrl}>{imageUrl.split('/').pop()}</code>
                  <button type="button" onClick={() => handleCopyImageTag(imageUrl)}>
                    {copiedImage === imageUrl ? 'Skopiowano' : 'Kopiuj znacznik <img>'}
                  </button>
                  <button
                    type="button"
                    className="is-danger"
                    disabled={isUploading || isProcessingImage || loadingCropImage !== '' || deletingImage !== ''}
                    onClick={() => handleDeleteImage(imageUrl)}
                  >
                    {deletingImage === imageUrl ? 'Usuwanie...' : 'Usuń'}
                  </button>
                </div>
                </article>
            )
          })}
        </div>
      )}
      {croppingImage && cropSettings && (
        <AuthorImageCropEditor
          imageUrl={croppingImage}
          previewUrl={getVersionedImageUrl(croppingImage, imageVersions[croppingImage])}
          initialCardCrops={cropSettings}
          onCancel={() => setCroppingImage('')}
          onSaveCroppedImage={handleCropImage}
          onSaveCardCrops={handleSaveCardCrops}
        />
      )}
    </section>
  )
}

export default AuthorUploadedImages
