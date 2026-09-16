import type { ComponentType } from 'react'
import HormoneTeaser from '../HormoneTeaser'
import HoroscopeTeaser from '../HoroscopeTeaser'
import type { TeaserId, TeaserProps } from './TeaserTypes'

export type TeaserDefinition = {
  id: TeaserId
  revealDelayMs: number
  component: ComponentType<TeaserProps>
}

export const teaserSettings = {
  scrollThreshold: 180,
  definitions: [
    {
      id: 'horoscope',
      revealDelayMs: 0,
      component: HoroscopeTeaser,
    },
    {
      id: 'hormone',
      revealDelayMs: 1000,
      component: HormoneTeaser,
    },
  ] satisfies TeaserDefinition[],
}
