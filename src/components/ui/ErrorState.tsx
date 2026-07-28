import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

/**
 * Generic error display. Never surfaces raw error objects or database
 * messages — always a plain-language explanation plus a way forward.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "Please try again. If the problem continues, refresh the page.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-2 py-12 text-center">
      <p className="font-medium text-neutral-900">{title}</p>
      <p className="max-w-xs text-sm text-neutral-500">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-2" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
