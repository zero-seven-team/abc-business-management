import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  ClipboardList,
  CalendarClock,
  PenTool,
  FileEdit,
  ArrowRight,
  FileText,
  ShieldCheck,
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
    code: 'HD-2026-001',
    title: 'Dịch vụ xếp dỡ và lưu kho container năm 2026',
    customerName: 'Công ty TNHH Vận tải Nam Việt',
    value: 125000000,
    status: 'Draft',
    updatedAt: '03/11/2026',
  },
  {
    code: 'HD-2026-002',
    title: 'Vận chuyển hàng hóa tuyến Bắc – Nam',
    customerName: 'Công ty CP Thương mại Minh Phát',
    value: 280000000,
    status: 'InReview',
    updatedAt: '02/11/2026',
  },
  {
    code: 'PL-2026-018',
    title: 'Phụ lục điều chỉnh đơn giá lưu kho',
    customerName: 'Công ty TNHH Xuất nhập khẩu An Phú',
    value: 45000000,
    status: 'UnderReview',
    updatedAt: '02/11/2026',
  },
  {
    code: 'HD-2026-075',
    title: 'Hợp đồng dịch vụ khai báo hải quan trọn gói',
    customerName: 'Công ty TNHH Logistics Đông Á',
    value: 195000000,
    status: 'Approved',
    updatedAt: '01/11/2026',
  },
  {
    code: 'BTT-2026-032',
    title: 'Thanh toán dịch vụ logistics tháng 10',
    customerName: 'Công ty TNHH Vận tải Nam Việt',
    value: 82500000,
    status: 'ESign',
    updatedAt: '01/11/2026',
  },
  {
    code: 'HD-2026-089',
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
    code: 'HD-2026-001',
    taskTitle: 'Hoàn thiện hồ sơ và gửi duyệt',
    deadline: 'Hôm nay, 17:00',
    status: 'Draft',
  },
  {
    code: 'HD-2026-076',
    taskTitle: 'Bổ sung điều khoản theo ý kiến thẩm định',
    deadline: 'Hôm nay, 17:00',
    status: 'NeedsRevision',
  },
  {
    code: 'BTT-2026-032',
    taskTitle: 'Kiểm tra bảng thanh toán trước khi ký',
    deadline: 'Hôm nay, 17:00',
    status: 'ESign',
  },
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Top Greeting & Primary CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900">
            Chào buổi sáng, Nguyễn Văn An
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Thứ Ba, 03 tháng 11 năm 2026 • Cùng bắt đầu một ngày làm việc hiệu
            quả.
          </p>
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Hồ sơ cần xử lý
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#1D4ED8]">
              <ClipboardList className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              08
            </span>
            <span className="text-xs text-slate-500">
              3 hồ sơ cần ưu tiên hôm nay
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Hợp đồng bản nháp
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <FileEdit className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              04
            </span>
            <span className="text-xs text-slate-500">
              Đang soạn thảo tại Phòng KD
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Hợp đồng sắp hết hạn
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-[#D97706]">
              <CalendarClock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              05
            </span>
            <span className="text-xs text-slate-500">Trong 30 ngày tới</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Bảng thanh toán chờ ký
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-[#7C3AED]">
              <PenTool className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              03
            </span>
            <span className="text-xs text-slate-500">
              Đang chờ hoàn tất ký điện tử
            </span>
          </div>
        </Card>
      </div>

      {/* Recent Contracts Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div>
            <CardTitle className="text-lg">Hồ sơ gần đây</CardTitle>
            <CardDescription className="mt-0.5">
              Các hợp đồng và hồ sơ bạn vừa tạo hoặc cập nhật
            </CardDescription>
          </div>
          <Link
            to="/contracts"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] hover:underline"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 pl-5 pr-4">Mã hồ sơ</th>
                  <th className="py-3 px-4">Tên hồ sơ / Khách hàng</th>
                  <th className="py-3 px-4">Giá trị</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 pl-4 pr-5">Cập nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-sm">
                {RECENT_RECORDS.map((record) => (
                  <tr
                    key={record.code}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 pl-5 pr-4 font-semibold text-[#1D4ED8] whitespace-nowrap text-xs">
                      {record.code}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 text-xs">
                        {record.title}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {record.customerName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 whitespace-nowrap text-xs">
                      {formatCurrencyVND(record.value)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant={record.status}>
                        {CONTRACT_STATUS_LABELS[record.status]}
                      </Badge>
                    </td>
                    <td className="py-3.5 pl-4 pr-5 text-xs text-slate-500 whitespace-nowrap">
                      {record.updatedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Grid: Priority Tasks & Business Workflow Notes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Priority Action Items */}
        <Card className="lg:col-span-7">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Hồ sơ cần xử lý</CardTitle>
            <CardDescription>
              Ưu tiên theo thời hạn hoàn thành
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {PRIORITY_TASKS.map((item) => (
              <div
                key={item.code}
                className="flex items-center justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]/60 p-3.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1D4ED8]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-slate-900">
                      {item.code} • {item.taskTitle}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      Hạn xử lý: {item.deadline}
                    </div>
                  </div>
                </div>
                <Badge variant={item.status} className="shrink-0">
                  {CONTRACT_STATUS_LABELS[item.status]}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Reminders & Business Rules Summary */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Nhắc việc hôm nay</CardTitle>
              <Badge variant="InReview">05 hợp đồng sắp hết hạn</Badge>
            </div>
            <CardDescription>
              Quy tắc nghiệp vụ khởi tạo hợp đồng (Sprint 01 • PB-01)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
            <p className="text-slate-700">
              Rà soát hiệu lực hợp đồng và chủ động liên hệ khách hàng để gia
              hạn dịch vụ. Khi khởi tạo hợp đồng mới cần lưu ý:
            </p>
            <ul className="space-y-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-slate-600">
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1D4ED8]" />
                <span>
                  Mã hợp đồng được hệ thống tự động cấp duy nhất khi lưu nháp (
                  <strong className="text-slate-800">Draft</strong>).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                <span>
                  Chỉ cho phép gắn khách hàng đang ở trạng thái hoạt động (
                  <strong className="text-slate-800">Active</strong>) và ngày
                  bắt đầu không vượt quá ngày kết thúc.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0284C7]" />
                <span>
                  Hỗ trợ đính kèm tệp <strong className="text-slate-800">PDF, DOCX, XLSX</strong> (tối đa 20 MB/tệp) theo quy trình lưu 2 bước an toàn.
                </span>
              </li>
            </ul>

            <div className="pt-1">
              <Button
                variant="secondary"
                className="w-full justify-center"
                onClick={() => navigate('/contracts/new')}
              >
                <ArrowRight className="h-4 w-4" />
                <span>Khởi tạo hợp đồng nháp ngay</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
