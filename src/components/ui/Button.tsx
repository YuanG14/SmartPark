import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-700 disabled:bg-neutral-200 disabled:text-neutral-400",
  secondary:
    "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 disabled:text-neutral-300",
  ghost:
    "bg-transparent text-neutral-600 hover:bg-neutral-100 disabled:text-neutral-300",
  danger:
    "bg-red-600 text-white hover:bg-red-700 disabled:bg-neutral-200 disabled:text-neutral-400",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

/**
 * Base button primitive. Every interactive action in SmartPark should route
 * through this (or Button-based components) so focus states, disabled
 * states, and loading states stay consistent everywhere.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", isLoading, disabled, className = "", children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
