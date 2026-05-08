import * as React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-semibold text-[var(--github-fg)]">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-8 w-full rounded-[6px] border border-[var(--github-border)] bg-[var(--github-bg)] px-3 py-1 text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--github-blue)] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[var(--github-red)] focus-visible:ring-[var(--github-red)]',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
