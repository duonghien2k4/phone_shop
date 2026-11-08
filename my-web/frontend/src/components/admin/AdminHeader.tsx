'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { AdminTab } from './AdminSidebar';

interface AdminHeaderProps {
  currentTab: AdminTab;
  tabLabel: string;
  groupLabel: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  user?: { email?: string; fullName?: string; role?: string } | null;
  onLogout?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentTab,
  tabLabel,
  groupLabel,
  searchQuery,
  onSearchChange,
  user,
  onLogout,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const initial = user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A';

  return (
    <header className="h-16 shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Left: Breadcrumbs & Page title context */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/admin" className="hover:text-blue-600 transition font-semibold text-slate-700">
          Quản trị
        </Link>
        <ChevronRight size={13} className="text-slate-400" />
        <span className="text-slate-400">{groupLabel}</span>
        <ChevronRight size={13} className="text-slate-400" />
        <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
          {tabLabel}
        </span>
      </div>

      {/* Center: Global Search Entry Point */}
      {/* <div className="flex-1 max-w-md relative hidden md:block">
        <div className="relative flex items-center">
          <Search size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Tìm kiếm nhanh trong ${tabLabel.toLowerCase()}...`}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 text-xs text-slate-400 hover:text-slate-600 px-1 py-0.5"
            >
              ×
            </button>
          )}
        </div>
      </div> */}

      {/* Right: Actions, Notifications & Avatar Dropdown */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            aria-label="Thông báo hệ thống"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-slate-800">
                <span>Thông báo mới</span>
                <span className="text-[10px] text-blue-600 font-medium cursor-pointer">Đánh dấu đã đọc</span>
              </div>
              <div className="divide-y divide-slate-50 py-2 space-y-2">
                <div className="pt-2 text-slate-600">
                  <p className="font-semibold text-slate-900">Đơn hàng mới #SOC-9921</p>
                  <p className="text-[11px] text-slate-400">Khách hàng Nguyễn Văn An vừa đặt iPhone 17 Pro Max</p>
                  <span className="text-[10px] text-slate-400">10 phút trước</span>
                </div>
                <div className="pt-2 text-slate-600">
                  <p className="font-semibold text-slate-900">Cảnh báo tồn kho</p>
                  <p className="text-[11px] text-slate-400">Galaxy S24 Ultra 256GB còn dưới 5 sản phẩm trong kho</p>
                  <span className="text-[10px] text-slate-400">1 giờ trước</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-slate-200" />

        {/* User Profile Avatar with dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50 transition"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {initial}
            </div>
            <div className="hidden lg:block text-left text-xs leading-tight">
              <p className="font-bold text-slate-800 truncate max-w-[120px]">
                {user?.fullName || user?.email?.split('@')[0] || 'Admin'}
              </p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">
                {user?.role || 'ADMIN'}
              </p>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-900 truncate">{user?.fullName || 'Administrator'}</p>
                <p className="text-slate-400 text-[11px] truncate">{user?.email || 'admin@phoneshop.vn'}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                  Quyền {user?.role || 'ADMIN'}
                </span>
              </div>

              <div className="py-1">
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition text-left"
                  >
                    <LogOut size={14} className="text-red-500" />
                    <span>Đăng xuất hệ thống</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

