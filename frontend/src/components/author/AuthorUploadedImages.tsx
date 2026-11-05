import { useEffect, useState, type ChangeEvent } from 'react'
import { deleteAuthorImage, fetchAuthorImages, uploadAuthorImage } from '../../api/authorMedia'
import './AuthorUploadedImages.css'

const IMAGE_TYPES = 'image/jpeg,image/png,image/gif,image/webp'

function AuthorUploadedImages() {
  const [images, setImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

  const handleCopyImageUrl = async (imageUrl: string) => {
    setError('')
    try {
      await navigator.clipboard.writeText(imageUrl)
      setCopiedImage(imageUrl)
    } catch {
      setError('Nie udało się skopiować adresu zdjęcia. Możesz otworzyć zdjęcie i skopiować jego adres ręcznie.')
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

      {isLoading ? (
        <p className="author-dashboard-empty" role="status">Pobieram zdjęcia...</p>
      ) : images.length === 0 ? (
        <p className="author-dashboard-empty">Nie ma jeszcze wgranych zdjęć.</p>
      ) : (
        <div className="author-uploaded-images-grid">
          {images.map((imageUrl, index) => (
            <article className="author-uploaded-image" key={imageUrl}>
              <a href={imageUrl} target="_blank" rel="noreferrer" aria-label={`Otwórz zdjęcie ${index + 1} w nowej karcie`}>
                <img src={imageUrl} alt={`Wgrane zdjęcie ${index + 1}`} loading="lazy" />
              </a>
              <div className="author-uploaded-image-actions">
                <code title={imageUrl}>{imageUrl.split('/').pop()}</code>
                <button type="button" onClick={() => handleCopyImageUrl(imageUrl)}>
                  {copiedImage === imageUrl ? 'Skopiowano' : 'Kopiuj adres'}
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
          ))}
        </div>
      )}
    </section>
  )
}

export default AuthorUploadedImages
