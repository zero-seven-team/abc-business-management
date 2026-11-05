import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  ChevronRight,
  Search,
  Bell,
  ChevronDown,
} from 'lucide-react';

interface BreadcrumbMeta {
  section: string;
  current: string;
}

function getBreadcrumbMeta(pathname: string): BreadcrumbMeta {
  if (pathname === '/') {
    return {
      section: 'Trang chủ',
      current: 'Tổng quan công việc',
    };
  }
  if (pathname === '/contracts/new') {
    return {
      section: 'Quản lý hợp đồng',
      current: 'Tạo hợp đồng mới',
    };
  }
  if (pathname.startsWith('/contracts')) {
    return {
      section: 'Quản lý hợp đồng',
      current: 'Danh sách hợp đồng',
    };
  }
  if (pathname.startsWith('/customers')) {
    return {
      section: 'Khách hàng & Đối tác',
      current: 'Danh mục khách hàng',
    };
  }
  if (pathname.startsWith('/quotations')) {
    return {
      section: 'Báo giá & Phụ lục',
      current: 'Danh sách hồ sơ',
    };
  }
  if (pathname.startsWith('/payment-requests')) {
    return {
      section: 'Đề nghị thanh toán',
      current: 'Bảng thanh toán',
    };
  }
  return {
    section: 'Không gian làm việc',
    current: 'Tổng quan nghiệp vụ',
  };
}

export const Header: React.FC = () => {
  const location = useLocation();
  const breadcrumb = getBreadcrumbMeta(location.pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between gap-4 border-b border-[#E2E8F0] bg-[#FFFFFF] px-6">
      {/* Dynamic Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs whitespace-nowrap"
      >
        <Link
          to="/"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title="Về trang chủ"
        >
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
        <span className="font-medium text-slate-500 whitespace-nowrap">
          {breadcrumb.section}
        </span>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-700 whitespace-nowrap">
          {breadcrumb.current}
        </span>
      </nav>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center w-80 lg:w-96">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Tìm kiếm mã hợp đồng, khách hàng..."
            className="h-9 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#1D4ED8] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Right Notification & Demo User Info */}
      <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
        <button
          type="button"
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
          aria-label="Thông báo hệ thống"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#DC2626]" />
        </button>

        <div className="h-6 w-px bg-[#E2E8F0]" />

        <div
          className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 whitespace-nowrap"
          data-testid="header-user-profile"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-[#1D4ED8]">
            AN
          </div>
          <div className="text-left whitespace-nowrap">
            <div className="text-xs font-bold text-slate-900 leading-tight whitespace-nowrap">
              Nguyễn Văn An
            </div>
            <div className="text-[11px] text-slate-500 leading-tight whitespace-nowrap">
              Chuyên viên Kinh doanh (NV-KD-001)
            </div>
          </div>
          <ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0 text-slate-400" />
        </div>
      </div>
    </header>
  );
};
