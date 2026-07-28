import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Minimal accessible dialog: traps Escape-to-close, labels itself via
 * aria-labelledby, and returns focus to the trigger on close is left to the
 * caller (store a ref to the trigger element before opening).
 */
export function Dialog({ open, onClose, title, children }: DialogProps) {
  const titleId = useRef(`dialog-title-${Math.random().toString(36).slice(2)}`).current;
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-900/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl focus:outline-none"
      >
        <h2 id={titleId} className="text-base font-semibold text-neutral-900">
          {title}
        </h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
