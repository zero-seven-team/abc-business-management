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
  Building2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const location = useLocation();
  const isContractSection = location.pathname.startsWith('/contracts');
  const [contractsOpen, setContractsOpen] = useState<boolean>(true);
  const [adminOpen, setAdminOpen] = useState<boolean>(false);

  return (
    <aside
      id="main-sidebar"
      className={cn(
        'fixed inset-y-0 left-0 z-40 w-[240px] shrink-0 flex-col bg-[#0F172A] text-slate-300 select-none lg:flex',
        open ? 'flex' : 'hidden'
      )}
      aria-label="Thanh điều hướng chính"
    >
      {/* Brand Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 px-4 border-b border-slate-800/80">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1D4ED8] text-white shadow-xs">
          <Box className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold tracking-tight text-white">
            ABC LOGISTICS
          </div>
          <div className="truncate text-[11px] font-medium text-slate-400">
            Quản trị Kinh doanh
          </div>
        </div>
        <button
          type="button"
          aria-label="Đóng menu"
          className="rounded-md p-1 text-slate-300 hover:bg-slate-800 lg:hidden"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <div className="sidebar-scroll flex-1 overflow-y-auto px-3 py-2.5">
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Không gian làm việc
          </div>

          <nav
            className="sidebar-scroll space-y-0.5"
            onClick={(event) => {
              if ((event.target as HTMLElement).closest('a')) onClose();
            }}
          >
            {/* Trang chủ - Tổng quan công việc */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
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
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setContractsOpen((prev) => !prev)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                  isContractSection
                    ? 'bg-slate-800/90 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                )}
              >
                <span className="flex items-center gap-2.5">
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
                <div className="ml-4 space-y-0.5 border-l border-slate-800 pl-2.5 pt-0.5">
                  <NavLink
                    to="/contracts"
                    end
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors',
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
                        'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors',
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
                  'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
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
                  'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
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
                  'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
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
                  'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-[#1D4ED8] text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                )
              }
            >
              <CheckSquare className="h-4 w-4 shrink-0" />
              <span>Phê duyệt</span>
            </NavLink>

            {/* Ký điện tử */}
            <NavLink
              to="/e-sign"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
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
                  'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
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
                  'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
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
            <div>
              <button
                type="button"
                onClick={() => setAdminOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
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
                <div className="ml-4 space-y-0.5 border-l border-slate-800 pl-2.5 pt-0.5 text-xs text-slate-400">
                  <div className="px-2.5 py-1 hover:text-white cursor-pointer">
                    Người dùng
                  </div>
                  <div className="px-2.5 py-1 hover:text-white cursor-pointer">
                    Phân quyền
                  </div>
                  <div className="px-2.5 py-1 hover:text-white cursor-pointer">
                    Quy trình
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Department Info */}
      <div className="shrink-0 border-t border-slate-800/80 p-2.5">
        <div className="flex items-center justify-between rounded-lg bg-slate-800/80 px-2.5 py-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-200 whitespace-nowrap">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            <span>Phòng Kinh doanh - B2B</span>
          </div>
          <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-300">
            KD
          </span>
        </div>
      </div>
    </aside>
  );
};
