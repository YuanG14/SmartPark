import { SelectHTMLAttributes, forwardRef, useId } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, id, className = "", ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error || undefined}
          className={`h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 focus:border-brand-500 ${
            error ? "border-red-400" : ""
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
