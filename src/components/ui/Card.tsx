import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

/**
 * The base panel every dashboard section sits in — rounded, light,
 * quiet border. This is the visual foundation of the whole SmartPark UI.
 */
export function Card({ padded = true, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-neutral-200 bg-white ${padded ? "p-6" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      {action}
    </div>
  );
}
