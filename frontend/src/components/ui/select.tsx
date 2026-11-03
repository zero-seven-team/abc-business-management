import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, hasError, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            'flex h-10 w-full appearance-none rounded-lg border bg-white pl-3.5 pr-9 py-2 text-sm text-slate-900 transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
            hasError
              ? 'border-[#DC2626] focus-visible:border-[#DC2626] focus-visible:ring-2 focus-visible:ring-[#DC2626]/15'
              : 'border-[#E2E8F0] focus-visible:border-[#1D4ED8] focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/15',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
