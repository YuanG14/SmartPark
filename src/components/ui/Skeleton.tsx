interface SkeletonProps {
  className?: string;
}

/**
 * Loading placeholder. Respects reduced-motion — the pulse animation
 * is disabled automatically via Tailwind's motion-reduce variant.
 */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-pulse motion-reduce:animate-none rounded-lg bg-neutral-200 ${className}`}
    />
  );
}
