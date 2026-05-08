import * as React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'error';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-[var(--github-border)] bg-[var(--github-subtle)] text-[var(--github-fg)]',
    secondary: 'border-[var(--github-border)] bg-[var(--github-bg)] text-[var(--github-fg)] opacity-80',
    outline: 'text-[var(--github-fg)] border-[var(--github-border)] bg-transparent',
    success: 'border-[rgba(31,35,40,0.15)] bg-[var(--github-green)] text-white',
    warning: 'border-[#d4a72c] bg-[#fff8c5] text-[#705505]',
    error: 'border-[rgba(207,34,46,0.15)] bg-[#ffebe9] text-[#cf222e]',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
