import type { ComponentType } from 'react'
import HormoneTeaser from './hormone'
import HoroscopeTeaser from './horoscope'
import type { TeaserId, TeaserProps } from './shared/TeaserTypes'

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
