import { ReactNode, useId, useState } from "react";

interface TooltipProps {
  label: string;
  children: ReactNode;
}

/**
 * Simple tooltip: shows on hover AND focus (keyboard users get it too),
 * linked via aria-describedby rather than relying on the native `title`
 * attribute, which screen readers handle inconsistently.
 */
export function Tooltip({ label, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span aria-describedby={visible ? id : undefined}>{children}</span>
      {visible && (
        <span
          id={id}
          role="tooltip"
          className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-900 px-2 py-1 text-xs text-white"
        >
          {label}
        </span>
      )}
    </span>
  );
}
