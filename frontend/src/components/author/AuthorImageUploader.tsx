import { useState, type ChangeEvent } from 'react'
import { uploadAuthorImage } from '../../api/authorMedia'
import './AuthorImageUploader.css'

type AuthorImageUploaderProps = {
  imageUrl: string
  disabled: boolean
  onUploaded: (url: string) => void
  onUploadingChange: (isUploading: boolean) => void
}

function AuthorImageUploader({ imageUrl, disabled, onUploaded, onUploadingChange }: AuthorImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return

    setError('')
    setIsUploading(true)
    onUploadingChange(true)

    try {
      const uploadedUrl = await uploadAuthorImage(file)
      onUploaded(uploadedUrl)
    } catch (uploadError: unknown) {
      setError(uploadError instanceof Error ? uploadError.message : 'Nie udało się wysłać obrazu.')
    } finally {
      setIsUploading(false)
      onUploadingChange(false)
    }
  }

  return (
    <div className="author-image-uploader">
      <div className="author-image-uploader-controls">
        <label className={`author-image-picker ${disabled || isUploading ? 'is-disabled' : ''}`}>
          <span>{isUploading ? 'Wgrywanie obrazu...' : 'Wybierz zdjęcie z urządzenia'}</span>
          <input
            accept="image/jpeg,image/png,image/gif,image/webp"
            aria-label="Wybierz zdjęcie do wpisu"
            disabled={disabled || isUploading}
            type="file"
            onChange={handleFileChange}
          />
        </label>
        <span className="author-image-uploader-hint">JPEG, PNG, GIF lub WebP · maks. 5 MB</span>
      </div>
      {imageUrl && (
        <img className="author-image-preview" src={imageUrl} alt="Podgląd zdjęcia wpisu" />
      )}
      {error && <p className="author-image-upload-error" role="alert">{error}</p>}
    </div>
  )
}

export default AuthorImageUploader