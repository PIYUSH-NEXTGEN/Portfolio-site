import { useEffect, useRef, useState, type ReactNode } from 'react';

/* Shared modal plumbing for the portal dialogs (ProjectModal, ResumeModal):
   fade-in on mount, a 240ms delayed close so the exit animation can play,
   Escape handling, and body scroll locking. */
const MODAL_CLOSE_MS = 240;

export function useModalClose(onClose: () => void) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const closingRef = useRef(false);
  const previouslyFocusedRef = useRef<Element | null>(null);

  const handleClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    window.setTimeout(() => closeRef.current(), MODAL_CLOSE_MS);
  };

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement;
    const raf = requestAnimationFrame(() => setVisible(true));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      const prev = previouslyFocusedRef.current as HTMLElement | null;
      if (prev && typeof prev.focus === 'function' && document.contains(prev)) {
        prev.focus();
      }
      previouslyFocusedRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { visible, closing, handleClose };
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const candidates = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return candidates.filter((el) => {
    if (el.hasAttribute('disabled')) return false;
    if (el.getAttribute('aria-hidden') === 'true') return false;
    // offsetParent is null for fixed-position elements in some browsers,
    // so use layout rects to detect hidden elements instead.
    if (el.getClientRects().length === 0) return false;
    return true;
  });
}

export function ModalBackdrop({ visible, closing, onClose, label, panelTestId, panelClassName = 'project-modal-panel', children }: {
  visible: boolean;
  closing: boolean;
  onClose: () => void;
  label: string;
  panelTestId: string;
  panelClassName?: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    // Move focus inside the dialog on open so keyboard users start within it.
    const initial = getFocusableElements(panel)[0] ?? panel;
    // requestAnimationFrame: panel children may still be mounting on first paint.
    const raf = requestAnimationFrame(() => initial.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleTabKey = (event: React.KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    // Query on every Tab press: children render dynamically (e.g. images/links).
    const focusable = getFocusableElements(panel);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey) {
      if (active === first || !panel.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last || !panel.contains(active)) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className={`project-modal-backdrop ${visible ? 'project-modal-backdrop-open' : ''} ${closing ? 'project-modal-closing' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div
        ref={panelRef}
        className={panelClassName}
        data-testid={panelTestId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleTabKey}
      >
        {children}
      </div>
    </div>
  );
}
