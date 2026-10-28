'use client';

import React from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface DashboardTabProps {
  data: any;
  onNavigateTab: (tab: any) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ data, onNavigateTab }) => {
  const overview = data?.overview || {
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStockVariants: 0,
    totalCustomers: 0,
  };

  const monthlyData = data?.monthlyData || [];
  const recentOrders = data?.recentOrders || [];
  const popularItems = data?.popularItems || [];

  return (
    <div className="space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Bảng Điều Khiển Tổng Quan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng hợp dữ liệu kinh doanh, đơn hàng cần xử lý và cảnh báo hệ thống Sóc Mobile.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold px-2.5 py-1 text-xs">
            Hệ thống ổn định 100%
          </Badge>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu */}
        <Card className="p-4 border-slate-200 bg-white shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">DOANH THU THỰC</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {Number(overview.totalRevenue).toLocaleString('vi-VN')}đ
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-semibold">
            <ArrowUpRight size={14} />
            <span>+14.8% so với tháng trước</span>
          </div>
        </Card>

        {/* Tổng đơn hàng */}
        <Card className="p-4 border-slate-200 bg-white shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">TỔNG ĐƠN HÀNG</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShoppingCart size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {overview.totalOrders}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {overview.pendingOrders} đơn chờ duyệt
            </span>
          </div>
        </Card>

        {/* Sản phẩm kinh doanh */}
        <Card className="p-4 border-slate-200 bg-white shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SẢN PHẨM HOẠT ĐỘNG</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Package size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {overview.totalProducts} dòng máy
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <span>503 biến thể dung lượng/màu</span>
          </div>
        </Card>

        {/* Cảnh báo kho */}
        <Card className="p-4 border-slate-200 bg-white shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CẢNH BÁO TỒN KHO</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-600 mt-2">
            {overview.lowStockVariants} SKU sắp hết
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <button
              type="button"
              onClick={() => onNavigateTab('inventory')}
              className="text-blue-600 hover:underline font-semibold"
            >
              Xem danh sách nhập hàng →
            </button>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doanh thu theo tháng */}
        <Card className="lg:col-span-2 p-5 border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Biểu đồ Doanh Thu & Xu hướng Bán hàng</h2>
              <p className="text-xs text-slate-500">Doanh thu tích lũy qua các tháng trong năm</p>
            </div>
            <Badge variant="outline" className="text-xs font-bold text-blue-700 bg-blue-50 border-blue-200">
              Năm 2026
            </Badge>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Sản phẩm bán chạy */}
        <Card className="p-5 border-slate-200 shadow-xs flex flex-col">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Top Sản Phẩm Doanh Số</h2>
            <p className="text-xs text-slate-500">Các dòng máy được khách hàng đặt nhiều nhất</p>
          </div>

          <div className="flex-1 mt-4 space-y-3">
            {popularItems.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                Chưa có dữ liệu thống kê sản phẩm
              </div>
            ) : (
              popularItems.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50/70 border border-slate-100">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-800 truncate">{item.productName}</p>
                    <p className="text-[11px] text-slate-400">Đã bán {item._sum.quantity} máy</p>
                  </div>
                  <span className="font-bold text-blue-600 shrink-0">
                    {Number(item._sum.total).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('products')}
            className="w-full mt-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition text-center"
          >
            Quản lý toàn bộ danh mục sản phẩm
          </button>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <Card className="p-5 border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Đơn Hàng Mới Nhất</h2>
            <p className="text-xs text-slate-500">Các giao dịch phát sinh gần đây trên hệ thống</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            Xem tất cả đơn hàng →
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="pb-3">MÃ ĐƠN</th>
                <th className="pb-3">KHÁCH HÀNG</th>
                <th className="pb-3">SẢN PHẨM</th>
                <th className="pb-3">TỔNG TIỀN</th>
                <th className="pb-3">PHƯƠNG THỨC</th>
                <th className="pb-3">TRẠNG THÁI</th>
                <th className="pb-3 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              ) : (
                recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 font-mono font-bold text-blue-600">
                      #SOC-{order.id.toString().padStart(4, '0')}
                    </td>
                    <td className="py-3">
                      <p className="font-bold text-slate-800">
                        {order.shippingAddress?.name || order.user?.profile?.fullName || 'Khách vãng lai'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {order.shippingAddress?.phone || order.user?.email}
                      </p>
                    </td>
                    <td className="py-3 max-w-[200px] truncate text-slate-700">
                      {order.items?.map((it: any) => it.productName).join(', ') || 'N/A'}
                    </td>
                    <td className="py-3 font-extrabold text-slate-900">
                      {Number(order.total).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3">
                      <Badge variant="outline" className="font-semibold text-[10px]">
                        {order.paymentMethod}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : order.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : order.status === 'SHIPPING'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onNavigateTab('orders')}
                        className="p-1 rounded hover:bg-slate-200 text-slate-600 transition"
                        title="Xem chi tiết đơn hàng"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

