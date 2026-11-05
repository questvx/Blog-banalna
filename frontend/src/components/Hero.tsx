import { useEffect, useState } from 'react'
import { fetchHeroMessage } from '../api/heroMessage'
import './Hero.css'

const DEFAULT_HERO_MESSAGE = '„Dziś jestem zmotywowana tak samo jak moje kapcie;\ndo siedzenia i dumnego patrzenia na świat.”'

function Hero() {
  const [message, setMessage] = useState(DEFAULT_HERO_MESSAGE)
  const [hasLoadError, setHasLoadError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    fetchHeroMessage(controller.signal)
      .then(({ message: savedMessage }) => setMessage(savedMessage || DEFAULT_HERO_MESSAGE))
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Nie udało się pobrać wiadomości powitalnej.', loadError)
          setHasLoadError(true)
        }
      })

    return () => controller.abort()
  }, [])

  return (
    <section className="welcome-banner">
      <span className="welcome-sun" aria-hidden="true">☼</span>
      <div>
        <h1>Dzień dobry! Miło Cię widzieć!</h1>
        <p aria-live="polite"><em>{message}</em></p>
        {hasLoadError && <span className="welcome-message-error" role="status">Zapraszam Cię na mój blog.</span>}
      </div>
      <span className="welcome-sparkle" aria-hidden="true">✧</span>
    </section>
  )
}

export default Hero