import * as React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-semibold text-[#c9d1d9] block">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-8 w-full rounded-md border border-border bg-[#0d1117] px-3 py-1 text-sm transition-all placeholder:text-[#484f58] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-danger focus-visible:ring-danger',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-[#f85149]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
