'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingCart,
  CreditCard,
  TicketPercent,
  Star,
  Handshake,
  FileSpreadsheet,
  Repeat,
  ShieldAlert,
  Bot,
  Store,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type AdminTab =
  // A. TỔNG QUAN
  | 'dashboard'
  // B. KINH DOANH
  | 'products'
  | 'brands_categories'
  | 'inventory'
  | 'orders'
  | 'payments'
  // C. MARKETING
  | 'vouchers'
  | 'reviews'
  // D. DỊCH VỤ ĐIỆN THOẠI
  | 'finance_partners'
  | 'installment_apps'
  | 'trade_in'
  | 'warranty'
  // E. VẬN HÀNH
  | 'ai_monitoring';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  badgeCounts?: Partial<Record<AdminTab, number | string>>;
  onLogout?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  badgeCounts = {},
  onLogout,
}) => {
  const sections = [
    {
      group: 'A. TỔNG QUAN',
      items: [
        { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'B. KINH DOANH',
      items: [
        { id: 'products' as AdminTab, label: 'Sản phẩm & Biến thể', icon: Package },
        { id: 'brands_categories' as AdminTab, label: 'Thương hiệu & Danh mục', icon: Layers },
        { id: 'inventory' as AdminTab, label: 'Kho hàng & Tồn kho', icon: Boxes },
        { id: 'orders' as AdminTab, label: 'Đơn hàng', icon: ShoppingCart },
        { id: 'payments' as AdminTab, label: 'Thanh toán', icon: CreditCard },
      ],
    },
    {
      group: 'C. MARKETING',
      items: [
        { id: 'vouchers' as AdminTab, label: 'Voucher & Mã giảm giá', icon: TicketPercent },
        { id: 'reviews' as AdminTab, label: 'Đánh giá sản phẩm', icon: Star },
      ],
    },
    {
      group: 'D. DỊCH VỤ ĐIỆN THOẠI',
      items: [
        { id: 'finance_partners' as AdminTab, label: 'Đối tác trả góp', icon: Handshake },
        { id: 'installment_apps' as AdminTab, label: 'Hồ sơ trả góp', icon: FileSpreadsheet },
        { id: 'trade_in' as AdminTab, label: 'Thu cũ đổi mới', icon: Repeat },
        { id: 'warranty' as AdminTab, label: 'Bảo hành & Đổi trả', icon: ShieldAlert },
      ],
    },
    {
      group: 'E. VẬN HÀNH',
      items: [
        { id: 'ai_monitoring' as AdminTab, label: 'Giám sát trợ lý AI', icon: Bot },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 select-none">
      {/* Brand logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950/40">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
          S
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
            Sóc Mobile <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">ADMIN</span>
          </h1>
          <p className="text-[11px] text-slate-400">Hệ thống quản trị trung tâm</p>
        </div>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <h2 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              {sec.group}
            </h2>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                const badge = badgeCounts[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        size={16}
                        className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer link to main store & logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/30 space-y-1">
        <Link
          href="/shop"
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
        >
          <Store size={15} />
          <span>Xem cửa hàng Sóc Mobile</span>
          <ChevronRight size={14} className="ml-auto text-slate-500" />
        </Link>
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition text-left"
          >
            <LogOut size={15} />
            <span>Đăng xuất tài trị</span>
          </button>
        )}
      </div>
    </aside>
  );
};

