import * as React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'error';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-border bg-[#21262d] text-[#c9d1d9]',
    secondary: 'border-border bg-[#161b22] text-[#8b949e]',
    outline: 'text-[#c9d1d9] border-border bg-transparent',
    success: 'border-[#238636] bg-[#238636] text-white',
    warning: 'border-[#d29922] bg-[rgba(210,153,34,0.15)] text-[#d29922]',
    error: 'border-[#f85149] bg-[rgba(248,81,73,0.15)] text-[#f85149]',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0 text-[10px] font-medium transition-colors focus:outline-none',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
