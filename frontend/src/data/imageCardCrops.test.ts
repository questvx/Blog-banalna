import { describe, expect, it } from 'vitest'
import {
  getCardCropRect,
  getCropImageElementStyle,
  POST_CARD_CROP_ASPECT_RATIOS,
} from './imageCardCrops'

describe('image card crop settings', () => {
  it('uses separate aspect ratios and focal positions for both card sizes', () => {
    const large = getCardCropRect(1600, 900, 'large', {
      zoomPercent: 150,
      positionX: 20,
      positionY: 30,
    })
    const small = getCardCropRect(1600, 900, 'small', {
      zoomPercent: 200,
      positionX: 80,
      positionY: 70,
    })

    expect(POST_CARD_CROP_ASPECT_RATIOS).toEqual({ large: 2.4, small: 1.7 })
    expect(large.width).not.toBe(small.width)
    expect(large.height).not.toBe(small.height)
    expect(large.y).not.toBe(small.y)
    expect(small.x).not.toBe(large.x)
  })

  it('maps normalized crop bounds to a positioned, non-distorted image element', () => {
    expect(getCropImageElementStyle({
      x: 0.1,
      y: 0.2,
      width: 0.5,
      height: 0.25,
    })).toEqual({
      height: '400%',
      left: '-20%',
      maxWidth: 'none',
      objectFit: 'fill',
      position: 'absolute',
      top: '-80%',
      width: '200%',
    })
  })
})
