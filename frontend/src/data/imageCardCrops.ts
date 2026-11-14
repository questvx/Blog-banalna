import type { CSSProperties } from 'react'

export const POST_CARD_CROP_ASPECT_RATIOS = {
  large: 2.4,
  small: 1.7,
} as const

export type PostCardCropType = keyof typeof POST_CARD_CROP_ASPECT_RATIOS

export type CardCropSettings = {
  zoomPercent: number
  positionX: number
  positionY: number
}

export type ImageCardCrops = {
  fileName: string
  large: CardCropSettings
  small: CardCropSettings
}

export type NormalizedCropRect = {
  x: number
  y: number
  width: number
  height: number
}

export function createDefaultImageCardCrops(fileName: string): ImageCardCrops {
  const centered = { zoomPercent: 100, positionX: 50, positionY: 50 }
  return { fileName, large: { ...centered }, small: { ...centered } }
}

export function getCardCropRect(
  imageWidth: number,
  imageHeight: number,
  cropType: PostCardCropType,
  settings: CardCropSettings,
): NormalizedCropRect {
  const aspectRatio = POST_CARD_CROP_ASPECT_RATIOS[cropType]
  const sourceAspectRatio = imageWidth / imageHeight
  const zoom = settings.zoomPercent / 100
  const baseWidth = sourceAspectRatio > aspectRatio ? aspectRatio / sourceAspectRatio : 1
  const baseHeight = sourceAspectRatio > aspectRatio ? 1 : sourceAspectRatio / aspectRatio
  const width = baseWidth / zoom
  const height = baseHeight / zoom

  return {
    x: (settings.positionX / 100) * (1 - width),
    y: (settings.positionY / 100) * (1 - height),
    width,
    height,
  }
}

export function getCropImageElementStyle(rect: NormalizedCropRect): CSSProperties {
  return {
    height: `${100 / rect.height}%`,
    left: `${-rect.x * 100 / rect.width}%`,
    maxWidth: 'none',
    objectFit: 'fill',
    position: 'absolute',
    top: `${-rect.y * 100 / rect.height}%`,
    width: `${100 / rect.width}%`,
  }
}

export function getCropPreviewStyle(imageUrl: string, rect: NormalizedCropRect): CSSProperties {
  const horizontalPosition = rect.width >= 1 ? 50 : rect.x / (1 - rect.width) * 100
  const verticalPosition = rect.height >= 1 ? 50 : rect.y / (1 - rect.height) * 100

  return {
    backgroundImage: `url("${imageUrl}")`,
    backgroundPosition: `${horizontalPosition}% ${verticalPosition}%`,
    backgroundSize: `${100 / rect.width}% ${100 / rect.height}%`,
  }
}
