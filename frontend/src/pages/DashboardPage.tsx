import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  ClipboardList,
  CalendarClock,
  PenTool,
  FileEdit,
  Calendar,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge, CONTRACT_STATUS_LABELS } from '@/components/ui/badge';
import { formatCurrencyVND } from '@/lib/utils';
import type { ContractStatus } from '@/types/contract';

interface RecentRecordItem {
  code: string;
  title: string;
  customerName: string;
  value: number;
  status: ContractStatus;
  updatedAt: string;
}

const RECENT_RECORDS: RecentRecordItem[] = [
  {
    code: 'HD-2026-092',
    title: 'Dịch vụ xếp dỡ và lưu kho container năm 2026',
    customerName: 'Công ty TNHH Vận tải Nam Việt',
    value: 125000000,
    status: 'Draft',
    updatedAt: '03/11/2026',
  },
  {
    code: 'HD-2026-091',
    title: 'Vận chuyển hàng hóa tuyến Bắc – Nam',
    customerName: 'Công ty CP Thương mại Minh Phát',
    value: 280000000,
    status: 'InReview',
    updatedAt: '02/11/2026',
  },
  {
    code: 'HD-2026-090',
    title: 'Dịch vụ kho ngoại quan và phân phối hàng lẻ',
    customerName: 'Công ty TNHH Xuất nhập khẩu An Phú',
    value: 145000000,
    status: 'UnderReview',
    updatedAt: '02/11/2026',
  },
  {
    code: 'HD-2026-089',
    title: 'Hợp đồng dịch vụ khai báo hải quan trọn gói',
    customerName: 'Công ty TNHH Logistics Đông Á',
    value: 195000000,
    status: 'Approved',
    updatedAt: '01/11/2026',
  },
  {
    code: 'HD-2026-088',
    title: 'Dịch vụ vận chuyển container lạnh xuất khẩu',
    customerName: 'Công ty TNHH Thủy sản Phương Nam',
    value: 210000000,
    status: 'ESign',
    updatedAt: '01/11/2026',
  },
  {
    code: 'HD-2026-087',
    title: 'Dịch vụ vận tải container cảng Cát Lái',
    customerName: 'Công ty CP Sản xuất Đại Dương',
    value: 360000000,
    status: 'Active',
    updatedAt: '31/10/2026',
  },
];

interface PriorityTaskItem {
  code: string;
  taskTitle: string;
  deadline: string;
  status: ContractStatus;
}

const PRIORITY_TASKS: PriorityTaskItem[] = [
  {
    code: 'HD-2026-092',
    taskTitle: 'Hoàn thiện hồ sơ hợp đồng và trình gửi duyệt',
    deadline: 'Hôm nay, 11:30',
    status: 'Draft',
  },
  {
    code: 'HD-2026-086',
    taskTitle: 'Bổ sung điều khoản dịch vụ theo ý kiến thẩm định',
    deadline: 'Hôm nay, 15:00',
    status: 'NeedsRevision',
  },
  {
    code: 'HD-2026-088',
    taskTitle: 'Rà soát điều khoản thanh toán trước khi ký số',
    deadline: 'Ngày mai, 10:00',
    status: 'ESign',
  },
];

interface ExpiringContractReminder {
  code: string;
  customerName: string;
  expiryDate: string;
  remainingLabel: string;
}

const EXPIRING_REMINDERS: ExpiringContractReminder[] = [
  {
    code: 'HD-2025-112',
    customerName: 'Công ty TNHH Vận tải Nam Việt — Lưu kho bãi container',
    expiryDate: '10/11/2026',
    remainingLabel: 'Còn 5 ngày',
  },
  {
    code: 'HD-2025-118',
    customerName: 'Công ty CP Thương mại Minh Phát — Vận tải đường bộ',
    expiryDate: '14/11/2026',
    remainingLabel: 'Còn 9 ngày',
  },
  {
    code: 'HD-2025-124',
    customerName: 'Công ty TNHH XNK An Phú — Khai báo hải quan định kỳ',
    expiryDate: '19/11/2026',
    remainingLabel: 'Còn 14 ngày',
  },
  {
    code: 'HD-2025-131',
    customerName: 'Công ty TNHH Logistics Đông Á — Xếp dỡ cảng Cát Lái',
    expiryDate: '25/11/2026',
    remainingLabel: 'Còn 20 ngày',
  },
  {
    code: 'HD-2025-139',
    customerName: 'Công ty CP Sản xuất Đại Dương — Vận chuyển nguyên liệu',
    expiryDate: '02/12/2026',
    remainingLabel: 'Còn 27 ngày',
  },
];

type QuickStatusFilter = 'ALL' | 'Draft' | 'InReview' | 'Active';

const STATUS_FILTER_OPTIONS: { key: QuickStatusFilter; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'Draft', label: 'Bản nháp' },
  { key: 'InReview', label: 'Chờ duyệt' },
  { key: 'Active', label: 'Hiệu lực' },
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [rightTab, setRightTab] = useState<'priority' | 'reminders'>('priority');
  const [statusFilter, setStatusFilter] = useState<QuickStatusFilter>('ALL');

  const filteredRecords = RECENT_RECORDS.filter((record) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'InReview') {
      return record.status === 'InReview' || record.status === 'UnderReview';
    }
    return record.status === statusFilter;
  });

  return (
    <div className="space-y-4">
      {/* Top Date Row & Primary CTA */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
          <Calendar className="h-4 w-4 text-[#1D4ED8]" />
          <span>Thứ Ba, 03 tháng 11 năm 2026</span>
        </div>

        <Button
          onClick={() => navigate('/contracts/new')}
          data-testid="btn-create-contract-cta"
          className="shrink-0 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Tạo hợp đồng mới</span>
        </Button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Hồ sơ cần xử lý
            </span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1D4ED8]">
              <ClipboardList className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              03
            </span>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              Cần ưu tiên hôm nay
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Hợp đồng bản nháp
            </span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <FileEdit className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              04
            </span>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              Đang soạn thảo
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Hợp đồng sắp hết hạn
            </span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[#D97706]">
              <CalendarClock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              05
            </span>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              Trong 30 ngày tới
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Hợp đồng chờ ký số
            </span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-[#7C3AED]">
              <PenTool className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              03
            </span>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              Chờ hoàn tất ký số
            </span>
          </div>
        </Card>
      </div>

      {/* Main 2-Column Content Grid (Above the fold at 100% zoom) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
        {/* Left Column (8 cols): Recent Contracts Table */}
        <Card className="lg:col-span-8">
          <CardHeader className="flex flex-col gap-3 border-b border-[#E2E8F0] py-3.5 px-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-base whitespace-nowrap">
                Hồ sơ hợp đồng gần đây
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs whitespace-nowrap">
                Danh sách hợp đồng vừa khởi tạo hoặc cập nhật
              </CardDescription>
            </div>
            <div className="inline-flex shrink-0 items-center rounded-lg bg-slate-100 p-0.5">
              {STATUS_FILTER_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setStatusFilter(option.key)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === option.key
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-slate-600">
                    <th className="py-2.5 pl-5 pr-3 whitespace-nowrap">
                      Mã hợp đồng
                    </th>
                    <th className="py-2.5 px-3">
                      Tên hợp đồng &amp; Khách hàng
                    </th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">
                      Giá trị (VND)
                    </th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Trạng thái</th>
                    <th className="py-2.5 pl-3 pr-5 whitespace-nowrap">
                      Cập nhật
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-sm">
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.code}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-2.5 pl-5 pr-3 font-semibold text-[#1D4ED8] whitespace-nowrap text-xs">
                        {record.code}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 text-xs">
                          {record.title}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-500">
                          {record.customerName}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-medium text-slate-900 whitespace-nowrap text-xs">
                        {formatCurrencyVND(record.value)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <Badge variant={record.status}>
                          {CONTRACT_STATUS_LABELS[record.status]}
                        </Badge>
                      </td>
                      <td className="py-2.5 pl-3 pr-5 text-xs text-slate-500 whitespace-nowrap">
                        {record.updatedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right Column (4 cols): Priority Action Items & Expiring Contracts */}
        <Card className="lg:col-span-4 lg:sticky lg:top-6 flex flex-col">
          <div className="border-b border-[#E2E8F0] px-3.5 py-2.5">
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setRightTab('priority')}
                className={`flex items-center justify-center rounded-md px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  rightTab === 'priority'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cần xử lý ({PRIORITY_TASKS.length})
              </button>
              <button
                type="button"
                onClick={() => setRightTab('reminders')}
                className={`flex items-center justify-center rounded-md px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  rightTab === 'reminders'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Nhắc việc ({EXPIRING_REMINDERS.length})
              </button>
            </div>
          </div>

          {rightTab === 'priority' ? (
            <div className="p-3.5 space-y-2.5">
              {PRIORITY_TASKS.map((item) => (
                <div
                  key={item.code}
                  className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]/70 p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#1D4ED8] whitespace-nowrap">
                      {item.code}
                    </span>
                    <Badge variant={item.status} className="shrink-0">
                      {CONTRACT_STATUS_LABELS[item.status]}
                    </Badge>
                  </div>
                  <div className="text-xs font-medium text-slate-800 leading-snug">
                    {item.taskTitle}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock className="h-3 w-3 shrink-0 text-slate-400" />
                    <span>Hạn xử lý: {item.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3.5 space-y-2">
              {EXPIRING_REMINDERS.map((item) => (
                <div
                  key={item.code}
                  className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]/70 p-2.5 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#1D4ED8] whitespace-nowrap">
                      {item.code}
                    </span>
                    <Badge variant="InReview" className="shrink-0">
                      {item.remainingLabel}
                    </Badge>
                  </div>
                  <div className="text-xs font-medium text-slate-800 leading-snug">
                    {item.customerName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Hết hiệu lực: {item.expiryDate} • Liên hệ gia hạn hợp đồng
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
