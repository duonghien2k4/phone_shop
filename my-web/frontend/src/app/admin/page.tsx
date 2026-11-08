'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/useAuthStore';
import { adminService, DashboardData } from '@/services/admin.service';

// Admin layout & tabs
import { AdminSidebar, AdminTab } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { DashboardTab } from '@/components/admin/DashboardTab';
import { ProductsTab } from '@/components/admin/ProductsTab';
import { BrandsCategoriesTab } from '@/components/admin/BrandsCategoriesTab';
import { InventoryTab } from '@/components/admin/InventoryTab';
import { OrdersTab } from '@/components/admin/OrdersTab';
import { PaymentsTab } from '@/components/admin/PaymentsTab';
import { VouchersTab } from '@/components/admin/VouchersTab';
import { ReviewsTab } from '@/components/admin/ReviewsTab';
import {
  FinancePartnersTab,
  InstallmentAppsTab,
  TradeInTab,
  WarrantyTab,
} from '@/components/admin/PhoneServicesTab';
import { AiMonitoringTab } from '@/components/admin/AiMonitoringTab';

export default function AdminPage() {
  const router = useRouter();
  const { user, isInitialized, isAdmin, isStaff } = useAuth();
  const clearAuth = useAuthStore((state) => state.logout);
  const [isPreview] = useState(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === '1'
  );

  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  // Load initial dashboard metrics for badges and summary
  const loadDashboard = async () => {
    setIsLoadingDashboard(true);
    try {
      const data = await adminService.getDashboardStats();
      setDashboardData(data);
    } catch (err) {
      console.error('Lỗi tải dashboard stats:', err);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;

    if (isPreview) {
      void loadDashboard();
      return;
    }

    if (!user || (!isAdmin && !isStaff)) {
      router.replace('/admin/login');
      return;
    }

    void loadDashboard();
  }, [isInitialized, user, isAdmin, isStaff, isPreview, router]);

  const handleLogout = () => {
    clearAuth();
    router.replace('/admin/login');
  };

  const isAuthorized = isPreview || (user && (isAdmin || isStaff));

  if (!isInitialized || !isAuthorized) {
    return (
      <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-3">
        <ShieldCheck size={36} className="text-blue-500 animate-pulse" />
        <p className="text-sm font-semibold tracking-wide">Đang chuyển hướng tới Đăng nhập Quản trị viên...</p>
      </main>
    );
  }

  // Map tab labels
  const tabMetadata: Record<AdminTab, { label: string; group: string }> = {
    dashboard: { label: 'Dashboard', group: 'A. TỔNG QUAN' },
    products: { label: 'Sản phẩm & Biến thể', group: 'B. KINH DOANH' },
    brands_categories: { label: 'Thương hiệu & Danh mục', group: 'B. KINH DOANH' },
    inventory: { label: 'Kho hàng & Tồn kho', group: 'B. KINH DOANH' },
    orders: { label: 'Đơn hàng', group: 'B. KINH DOANH' },
    payments: { label: 'Thanh toán', group: 'B. KINH DOANH' },
    vouchers: { label: 'Voucher & Mã giảm giá', group: 'C. MARKETING' },
    reviews: { label: 'Đánh giá sản phẩm', group: 'C. MARKETING' },
    finance_partners: { label: 'Đối tác trả góp', group: 'D. DỊCH VỤ ĐIỆN THOẠI' },
    installment_apps: { label: 'Hồ sơ trả góp', group: 'D. DỊCH VỤ ĐIỆN THOẠI' },
    trade_in: { label: 'Thu cũ đổi mới', group: 'D. DỊCH VỤ ĐIỆN THOẠI' },
    warranty: { label: 'Bảo hành & Đổi trả', group: 'D. DỊCH VỤ ĐIỆN THOẠI' },
    ai_monitoring: { label: 'Giám sát trợ lý AI', group: 'E. VẬN HÀNH' },
  };

  const currentMeta = tabMetadata[currentTab];

  return (
    <div className="flex h-screen bg-slate-100 font-sans antialiased overflow-hidden text-slate-800">
      {/* Sidebar with 5 Main Categories & 13 Distinct Tabs */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setSearchQuery('');
        }}
        badgeCounts={{
          orders: dashboardData?.overview?.pendingOrders ? `${dashboardData.overview.pendingOrders} mới` : undefined,
          inventory: dashboardData?.overview?.lowStockVariants ? `${dashboardData.overview.lowStockVariants} thiếu` : undefined,
          installment_apps: 3,
          trade_in: 3,
        }}
        onLogout={handleLogout}
      />

      {/* Main Area: Top Header + Tab Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <AdminHeader
          currentTab={currentTab}
          tabLabel={currentMeta.label}
          groupLabel={currentMeta.group}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        {/* Content Area with Max Width Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {/* A. TỔNG QUAN */}
            {currentTab === 'dashboard' && (
              <DashboardTab
                data={dashboardData}
                onNavigateTab={(t) => setCurrentTab(t)}
              />
            )}

            {/* B. KINH DOANH */}
            {currentTab === 'products' && (
              <ProductsTab searchQuery={searchQuery} />
            )}

            {currentTab === 'brands_categories' && (
              <BrandsCategoriesTab />
            )}

            {currentTab === 'inventory' && (
              <InventoryTab searchQuery={searchQuery} />
            )}

            {currentTab === 'orders' && (
              <OrdersTab searchQuery={searchQuery} />
            )}

            {currentTab === 'payments' && (
              <PaymentsTab />
            )}

            {/* C. MARKETING */}
            {currentTab === 'vouchers' && (
              <VouchersTab searchQuery={searchQuery} />
            )}

            {currentTab === 'reviews' && (
              <ReviewsTab />
            )}

            {/* D. DỊCH VỤ ĐIỆN THOẠI */}
            {currentTab === 'finance_partners' && (
              <FinancePartnersTab />
            )}

            {currentTab === 'installment_apps' && (
              <InstallmentAppsTab />
            )}

            {currentTab === 'trade_in' && (
              <TradeInTab />
            )}

            {currentTab === 'warranty' && (
              <WarrantyTab searchQuery={searchQuery} />
            )}

            {/* E. VẬN HÀNH */}
            {currentTab === 'ai_monitoring' && (
              <AiMonitoringTab />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
