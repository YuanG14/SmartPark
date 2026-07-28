import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

/** An empty screen is an invitation to act, not a dead end. */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      {icon && <div className="text-neutral-300">{icon}</div>}
      <p className="font-medium text-neutral-900">{title}</p>
      {description && <p className="max-w-xs text-sm text-neutral-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
