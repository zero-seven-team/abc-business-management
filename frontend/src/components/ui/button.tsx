import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/30 disabled:pointer-events-none disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[#1D4ED8] text-white hover:bg-[#1E40AF] shadow-xs',
        secondary:
          'border border-[#E2E8F0] bg-white text-slate-800 hover:bg-slate-50',
        outline:
          'border border-[#E2E8F0] bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900',
        danger: 'bg-[#DC2626] text-white hover:bg-red-700 shadow-xs',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        link: 'text-[#1D4ED8] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => {
    return (
      <button
        type={type}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
