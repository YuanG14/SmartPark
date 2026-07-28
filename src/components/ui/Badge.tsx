import { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-neutral-100 text-neutral-700",
  success: "bg-brand-100 text-brand-700",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
};

interface BadgeProps {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * Status badge. Always pairs an icon + text label with the color, per the
 * accessibility requirement — never rely on color alone to convey state.
 */
export function Badge({ tone = "neutral", icon, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}
