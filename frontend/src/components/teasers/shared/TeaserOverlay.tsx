import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import "./TeaserOverlay.css";

type TeaserOverlayProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

function TeaserOverlay({
  eyebrow,
  title,
  children,
  onClose,
}: TeaserOverlayProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const content = contentRef.current;
    const dialog = dialogRef.current;
    if (!content || !dialog) return;

    const updateHeight = () => {
      const styles = window.getComputedStyle(dialog);

      const paddingTop = parseFloat(styles.paddingTop);
      const paddingBottom = parseFloat(styles.paddingBottom);
      setHeight(content.scrollHeight + paddingTop + paddingBottom);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(content);

    return () => {
      resizeObserver.disconnect();
    };
  }, [children]);

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled), a[href], input:not(:disabled), [tabindex]:not([tabindex="-1"])',
      );

      const firstElement = focusableElements.item(0);
      const lastElement = focusableElements.item(focusableElements.length - 1);

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus();
      }
    };
  }, [onClose]);

  return (
    <div
      className="teaser-overlay-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="teaser-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="teaser-overlay-title"
        tabIndex={-1}
        style={height !== null ? { height: `${height}px` } : undefined}
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

        <div ref={contentRef} className="teaser-overlay-content">
          <p className="teaser-overlay-eyebrow">{eyebrow}</p>

          <h2 className="teaser-overlay-title" id="teaser-overlay-title">
            {title}
          </h2>

          {children}
        </div>
      </section>
    </div>
  );
}

export default TeaserOverlay;
