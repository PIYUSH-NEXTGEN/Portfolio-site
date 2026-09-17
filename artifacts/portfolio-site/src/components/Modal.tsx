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

  const handleClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    window.setTimeout(() => closeRef.current(), MODAL_CLOSE_MS);
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { visible, closing, handleClose };
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
  return (
    <div
      className={`project-modal-backdrop ${visible ? 'project-modal-backdrop-open' : ''} ${closing ? 'project-modal-closing' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div className={panelClassName} data-testid={panelTestId} onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
