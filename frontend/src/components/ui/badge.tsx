import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { ContractStatus } from '@/types/contract';

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-blue-50 text-blue-700',
        Draft: 'bg-slate-100 text-slate-700',
        InReview: 'bg-amber-50 text-amber-800',
        UnderReview: 'bg-sky-50 text-sky-800',
        Approved: 'bg-emerald-50 text-emerald-800',
        Active: 'bg-green-50 text-green-800',
        NeedsRevision: 'bg-rose-50 text-rose-700',
        Rejected: 'bg-red-50 text-red-700',
        ESign: 'bg-violet-50 text-violet-800',
        Issued: 'bg-sky-50 text-sky-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  Draft: 'Bản nháp',
  InReview: 'Chờ duyệt',
  UnderReview: 'Đang thẩm định',
  Approved: 'Đã duyệt',
  Active: 'Hiệu lực',
  NeedsRevision: 'Yêu cầu sửa',
  Rejected: 'Từ chối',
  ESign: 'Đang ký',
  Issued: 'Đã phát hành',
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
