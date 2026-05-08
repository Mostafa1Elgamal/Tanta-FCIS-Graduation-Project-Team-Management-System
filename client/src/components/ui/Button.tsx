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
      primary: 'bg-primary text-white hover:bg-[#2ea043] border border-[#238636] shadow-sm',
      secondary: 'bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d] hover:border-[#8b949e] border border-border shadow-sm',
      outline: 'bg-transparent border border-border text-[#2f81f7] hover:bg-[#161b22]',
      ghost: 'bg-transparent hover:bg-[#161b22] text-[#c9d1d9]',
      danger: 'bg-[#21262d] text-[#f85149] hover:bg-[#da3633] hover:text-white border border-border',
    };

    const sizes = {
      sm: 'h-7 px-3 text-xs',
      md: 'h-8 px-4 text-sm',
      lg: 'h-10 px-6 text-base font-semibold',
      icon: 'h-8 w-8 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
