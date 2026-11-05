import { useEffect, useState, type ChangeEvent } from 'react'
import { fetchAdminPosts, type AuthorPost } from '../../api/adminPosts'
import { deleteAuthorImage, fetchAuthorImages, uploadAuthorImage } from '../../api/authorMedia'
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

function AuthorUploadedImages() {
  const [images, setImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingUsage, setIsCheckingUsage] = useState(true)
  const [imageUsages, setImageUsages] = useState<Map<string, ImageUsage[]>>(new Map())
  const [usageError, setUsageError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [copiedImage, setCopiedImage] = useState('')
  const [deletingImage, setDeletingImage] = useState('')

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

  const handleDeleteImage = async (imageUrl: string) => {
    const fileName = imageUrl.split('/').pop() ?? 'to zdjęcie'
    if (!window.confirm(`Usunąć zdjęcie „${fileName}”? Tej operacji nie można cofnąć.`)) return

    setError('')
    setNotice('')
    setDeletingImage(imageUrl)
    try {
      await deleteAuthorImage(imageUrl)
      setImages((current) => current.filter((image) => image !== imageUrl))
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
        <label className={`author-uploaded-images-picker ${isLoading || isUploading ? 'is-disabled' : ''}`}>
          <span>{isUploading ? 'Wgrywanie zdjęć...' : 'Wybierz zdjęcia'}</span>
          <input
            accept={IMAGE_TYPES}
            aria-label="Wybierz zdjęcia do wgrania"
            disabled={isLoading || isUploading || deletingImage !== ''}
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

            return (
              <article className="author-uploaded-image" key={imageUrl}>
                <a href={imageUrl} target="_blank" rel="noreferrer" aria-label={`Otwórz zdjęcie ${index + 1} w nowej karcie`}>
                  <img src={imageUrl} alt={`Wgrane zdjęcie ${index + 1}`} loading="lazy" />
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
                <div className="author-uploaded-image-actions">
                  <code title={imageUrl}>{imageUrl.split('/').pop()}</code>
                  <button type="button" onClick={() => handleCopyImageTag(imageUrl)}>
                    {copiedImage === imageUrl ? 'Skopiowano' : 'Kopiuj znacznik <img>'}
                  </button>
                  <button
                    type="button"
                    className="is-danger"
                    disabled={isUploading || deletingImage !== ''}
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
    </section>
  )
}

export default AuthorUploadedImages
