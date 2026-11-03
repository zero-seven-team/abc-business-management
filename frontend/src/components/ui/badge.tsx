import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { ContractStatus } from '@/types/contract';

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-blue-50 text-[#1D4ED8]',
        Draft: 'bg-slate-100 text-slate-600',
        InReview: 'bg-amber-50 text-[#D97706]',
        UnderReview: 'bg-sky-50 text-[#0284C7]',
        Approved: 'bg-emerald-50 text-[#16A34A]',
        Active: 'bg-green-50 text-[#16A34A]',
        NeedsRevision: 'bg-amber-50 text-[#D97706]',
        Rejected: 'bg-red-50 text-[#DC2626]',
        ESign: 'bg-violet-50 text-[#7C3AED]',
        Issued: 'bg-sky-50 text-[#0284C7]',
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
