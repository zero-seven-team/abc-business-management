import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  FileText,
  FilePlus2,
  Files,
  Tag,
  Receipt,
  CheckSquare,
  PenTool,
  Bell,
  History,
  Settings,
  ChevronDown,
  Box,
  Sparkles,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const isContractSection = location.pathname.startsWith('/contracts');
  const [contractsOpen, setContractsOpen] = useState<boolean>(true);
  const [adminOpen, setAdminOpen] = useState<boolean>(false);

  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 flex w-[240px] shrink-0 flex-col bg-[#0F172A] text-slate-300 select-none"
      aria-label="Thanh điều hướng chính"
    >
      {/* Brand Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-slate-800/80">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1D4ED8] text-white shadow-xs">
          <Box className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold tracking-tight text-white">
            ABC LOGISTICS
          </div>
          <div className="truncate text-[11px] font-medium text-slate-400">
            Quản trị Kinh doanh
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Không gian làm việc
          </div>

          <nav className="space-y-1">
            {/* Trang chủ - Tổng quan công việc */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-[#1D4ED8] text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                )
              }
            >
              <Home className="h-4 w-4 shrink-0" />
              <span>Tổng quan công việc</span>
            </NavLink>

            {/* Quản lý hợp đồng */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setContractsOpen((prev) => !prev)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer',
                  isContractSection
                    ? 'bg-slate-800/90 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                )}
              >
                <span className="flex items-center gap-3">
                  <FileText className="h-4 w-4 shrink-0" />
                  <span>Quản lý hợp đồng</span>
                </span>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 text-slate-400 transition-transform',
                    contractsOpen && 'rotate-180'
                  )}
                />
              </button>

              {contractsOpen && (
                <div className="ml-4 space-y-0.5 border-l border-slate-800 pl-3 pt-0.5">
                  <NavLink
                    to="/contracts"
                    end
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors',
                        isActive
                          ? 'bg-[#1D4ED8] text-white font-semibold'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                      )
                    }
                  >
                    <Files className="h-3.5 w-3.5 shrink-0" />
                    <span>Danh sách hợp đồng</span>
                  </NavLink>

                  <NavLink
                    to="/contracts/new"
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors',
                        isActive
                          ? 'bg-[#1D4ED8] text-white font-semibold'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                      )
                    }
                  >
                    <FilePlus2 className="h-3.5 w-3.5 shrink-0" />
                    <span>Tạo hợp đồng mới</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Khách hàng & Đối tác */}
            <NavLink
              to="/customers"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-[#1D4ED8] text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                )
              }
            >
              <Users className="h-4 w-4 shrink-0" />
              <span>Khách hàng & Đối tác</span>
            </NavLink>

            {/* Báo giá & Phụ lục */}
            <NavLink
              to="/quotations"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-[#1D4ED8] text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                )
              }
            >
              <Tag className="h-4 w-4 shrink-0" />
              <span>Báo giá & Phụ lục</span>
            </NavLink>

            {/* Đề nghị thanh toán */}
            <NavLink
              to="/payment-requests"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-[#1D4ED8] text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                )
              }
            >
              <Receipt className="h-4 w-4 shrink-0" />
              <span>Đề nghị thanh toán</span>
            </NavLink>

            {/* Phê duyệt */}
            <NavLink
              to="/approvals"
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-[#1D4ED8] text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                )
              }
            >
              <span className="flex items-center gap-3">
                <CheckSquare className="h-4 w-4 shrink-0" />
                <span>Phê duyệt</span>
              </span>
              <span className="inline-flex h-5 min-w-[22px] items-center justify-center rounded-md bg-[#DC2626] px-1.5 text-[11px] font-bold text-white">
                8
              </span>
            </NavLink>

            {/* Ký điện tử */}
            <NavLink
              to="/e-sign"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-[#1D4ED8] text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                )
              }
            >
              <PenTool className="h-4 w-4 shrink-0" />
              <span>Ký điện tử</span>
            </NavLink>

            {/* Thông báo */}
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-[#1D4ED8] text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                )
              }
            >
              <Bell className="h-4 w-4 shrink-0" />
              <span>Thông báo</span>
            </NavLink>

            {/* Nhật ký */}
            <NavLink
              to="/audit-logs"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-[#1D4ED8] text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                )
              }
            >
              <History className="h-4 w-4 shrink-0" />
              <span>Nhật ký</span>
            </NavLink>

            {/* Quản trị */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setAdminOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <Settings className="h-4 w-4 shrink-0" />
                  <span>Quản trị</span>
                </span>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 text-slate-400 transition-transform',
                    adminOpen && 'rotate-180'
                  )}
                />
              </button>
              {adminOpen && (
                <div className="ml-4 space-y-0.5 border-l border-slate-800 pl-3 pt-0.5 text-xs text-slate-400">
                  <div className="px-2.5 py-1.5 hover:text-white cursor-pointer">
                    Người dùng
                  </div>
                  <div className="px-2.5 py-1.5 hover:text-white cursor-pointer">
                    Phân quyền
                  </div>
                  <div className="px-2.5 py-1.5 hover:text-white cursor-pointer">
                    Quy trình
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Department & Footer Info */}
      <div className="border-t border-slate-800/80 p-3 space-y-2.5">
        <div className="flex items-center justify-between rounded-lg bg-slate-800/80 px-3 py-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span>Phòng Kinh doanh - B2B</span>
          </div>
          <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-bold text-violet-300">
            KD
          </span>
        </div>

        <div className="flex items-center gap-2 px-1">
          <Building2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <div className="min-w-0">
            <div className="truncate text-[11px] font-medium text-slate-300">
              Công ty ABC Logistics
            </div>
            <div className="truncate text-[10px] text-slate-500">
              Hệ thống nghiệp vụ • v2.6.0
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
