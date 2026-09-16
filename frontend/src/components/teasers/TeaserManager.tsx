import { useEffect, useState } from 'react'
import { teaserSettings } from './teaserConfig'
import type { TeaserId } from './TeaserTypes'

function TeaserManager() {
  const [visibleTeasers, setVisibleTeasers] = useState<Record<TeaserId, boolean>>({} as Record<TeaserId, boolean>)
  const [dismissedTeasers, setDismissedTeasers] = useState<Record<TeaserId, boolean>>({} as Record<TeaserId, boolean>)

  useEffect(() => {
    const revealTimers = new Map<TeaserId, number>()

    const revealTeasers = () => {
      if (window.scrollY <= teaserSettings.scrollThreshold) return

      teaserSettings.definitions.forEach(({ id, revealDelayMs }) => {
        if (revealTimers.has(id)) return

        const timer = window.setTimeout(() => {
          setVisibleTeasers((current) => ({ ...current, [id]: true }))
        }, revealDelayMs)
        revealTimers.set(id, timer)
      })
    }

    revealTeasers()
    window.addEventListener('scroll', revealTeasers, { passive: true })

    return () => {
      window.removeEventListener('scroll', revealTeasers)
      revealTimers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  return (
    <>
      {teaserSettings.definitions.map(({ id, component: Teaser }) => (
        <Teaser
          key={id}
          isVisible={Boolean(visibleTeasers[id])}
          isDismissed={Boolean(dismissedTeasers[id])}
          onToggle={() => setDismissedTeasers((current) => ({ ...current, [id]: !current[id] }))}
        />
      ))}
    </>
  )
}

export default TeaserManager
