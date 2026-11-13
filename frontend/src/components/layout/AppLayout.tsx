import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Đóng thanh điều hướng"
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col md:pl-[240px]">
        <Header onOpenMenu={() => setSidebarOpen(true)} />
        <main className="min-w-0 flex-1 px-6 py-4">
          <div className="mx-auto max-w-[1360px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
