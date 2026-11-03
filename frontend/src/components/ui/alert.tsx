import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative flex w-full items-start gap-3 rounded-xl border-l-4 p-4 text-sm transition-all',
  {
    variants: {
      variant: {
        success: 'border-l-[#16A34A] bg-emerald-50/80 text-[#16A34A]',
        warning: 'border-l-[#D97706] bg-amber-50/80 text-[#92400E]',
        danger: 'border-l-[#DC2626] bg-red-50/80 text-[#DC2626]',
        info: 'border-l-[#0284C7] bg-sky-50/80 text-[#0284C7]',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, children, ...props }, ref) => {
    const IconComponent =
      variant === 'success'
        ? CheckCircle2
        : variant === 'warning'
          ? AlertTriangle
          : variant === 'danger'
            ? AlertCircle
            : Info;

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <IconComponent className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1 space-y-1">
          {title && <h5 className="font-semibold leading-none">{title}</h5>}
          <div className="text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export { Alert, alertVariants };
