import * as React from 'react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-[var(--github-green)] text-white hover:bg-[#2c974b] border border-[rgba(31,35,40,0.15)] shadow-sm',
      secondary: 'bg-[var(--github-subtle)] text-[var(--github-fg)] hover:bg-slate-200 border border-[var(--github-border)] shadow-sm',
      outline: 'bg-transparent border border-[var(--github-border)] text-[var(--github-blue)] hover:bg-[var(--github-subtle)]',
      ghost: 'bg-transparent hover:bg-[var(--github-subtle)] text-[var(--github-fg)]',
      danger: 'bg-[var(--github-subtle)] text-[var(--github-red)] hover:bg-[var(--github-red)] hover:text-white border border-[var(--github-border)]',
    };

    const sizes = {
      sm: 'h-7 px-2.5 text-xs',
      md: 'h-8 px-4 text-sm',
      lg: 'h-10 px-5 text-base',
      icon: 'h-8 w-8 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-[6px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
