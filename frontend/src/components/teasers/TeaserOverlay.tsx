import { useEffect, useRef, type ReactNode } from 'react'
import './TeaserOverlay.css'

type TeaserOverlayProps = {
  eyebrow: string
  title: string
  children: ReactNode
  onClose: () => void
}

function TeaserOverlay({ eyebrow, title, children, onClose }: TeaserOverlayProps) {
  const dialogRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled), a[href], input:not(:disabled), [tabindex]:not([tabindex="-1"])',
      )
      const firstElement = focusableElements.item(0)
      const lastElement = focusableElements.item(focusableElements.length - 1)

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      if (previouslyFocusedElement instanceof HTMLElement) previouslyFocusedElement.focus()
    }
  }, [onClose])

  return (
    <div
      className="teaser-overlay-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        className="teaser-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="teaser-overlay-title"
        tabIndex={-1}
      >
        <button
          ref={closeButtonRef}
          className="teaser-overlay-close"
          type="button"
          onClick={onClose}
          aria-label="Zamknij"
        >
          ×
        </button>
        <p className="teaser-overlay-eyebrow">{eyebrow}</p>
        <h2 className="teaser-overlay-title" id="teaser-overlay-title">{title}</h2>
        {children}
      </section>
    </div>
  )
}

export default TeaserOverlay
