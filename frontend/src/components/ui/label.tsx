import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  requiredMarker?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, requiredMarker, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'block text-xs font-semibold text-slate-800 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1.5',
        className
      )}
      {...props}
    >
      {children}
      {requiredMarker && <span className="ml-1 text-[#DC2626]">*</span>}
    </label>
  )
);
Label.displayName = 'Label';

export { Label };
