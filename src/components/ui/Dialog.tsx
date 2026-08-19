import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Accessible modal dialog.
 *
 * Important: focus is initialized only when the dialog opens. We keep the
 * latest onClose callback in a ref so parent re-renders (for example while
 * typing into a controlled input) do not re-run the focus effect and steal
 * focus from the active field.
 */
export function Dialog({ open, onClose, title, children }: DialogProps) {
  const titleId = useRef(`dialog-title-${Math.random().toString(36).slice(2)}`).current;
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Always keep the latest callback without making the open/close effect
  // depend on a new inline function from the parent on every render.
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }

    document.addEventListener("keydown", handleKey);

    // Focus once when the modal opens. Prefer the first usable form control;
    // fall back to the dialog panel if there is nothing interactive.
    const frame = window.requestAnimationFrame(() => {
      const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
        'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      );
      (firstFocusable ?? panelRef.current)?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKey);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open]);

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
