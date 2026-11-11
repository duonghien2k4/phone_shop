'use client';

import React from 'react';
import {
  CreditCard,
  Eye,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AdminTab } from '@/components/admin/AdminSidebar';
import type { DashboardData } from '@/services/admin.service';

interface DashboardTabProps {
  data: DashboardData | null;
  onNavigateTab: (tab: AdminTab) => void;
}

const paymentMethodLabels: Record<string, string> = {
  COD: 'Tiền mặt khi nhận',
  VNPAY: 'VNPAY',
  MOMO: 'MoMo',
  BANK_TRANSFER: 'Chuyển khoản',
  INSTALLMENT: 'Trả góp',
};
const paymentColors = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e'];
const currency = (amount: number) => `${amount.toLocaleString('vi-VN')}đ`;

export const DashboardTab: React.FC<DashboardTabProps> = ({ data, onNavigateTab }) => {
  const overview = data?.overview;
  const monthlyData = data?.monthlyData ?? [];
  const recentOrders = data?.recentOrders ?? [];
  const popularItems = data?.popularItems ?? [];
  const paymentMethodData = data?.paymentMethodData ?? [];
  const paidOrdersMissingCost = overview?.yearToDatePaidOrdersMissingCost ?? 0;
  const bestSellingData = popularItems.map((item) => ({
    productName: item.productName,
    quantity: Number(item._sum.quantity ?? 0),
  }));
  const monthlyOrderData = monthlyData.map((item) => ({
    ...item,
    averageOrderValue: item.orders > 0 ? item.revenue / item.orders : 0,
  }));
  const paymentRevenue = paymentMethodData.reduce((sum, item) => sum + item.revenue, 0);
  const paymentRadarData = paymentMethodData.map((item) => ({
    paymentMethod: paymentMethodLabels[item.paymentMethod] ?? item.paymentMethod,
    revenue: item.revenue,
    orders: item.orders,
  }));
  const orderCompletionRate = overview && overview.totalOrders > 0
    ? (overview.completedOrders / overview.totalOrders) * 100
    : 0;
  const inventoryHealthRate = overview && overview.inventoryTotalVariants > 0
    ? (overview.inventoryHealthyVariants / overview.inventoryTotalVariants) * 100
    : 0;
  const radialData = [
    { name: 'Đơn hoàn tất', value: Number(orderCompletionRate.toFixed(1)), fill: '#10b981' },
    { name: 'Tồn kho ổn định', value: Number(inventoryHealthRate.toFixed(1)), fill: '#6366f1' },
  ];
  const year = data?.year ?? new Date().getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Tổng quan tài chính & kinh doanh</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Theo dõi doanh thu đã thu, lãi gộp, kênh thanh toán và sản phẩm bán chạy.
          </p>
        </div>
        <Badge variant="outline" className="w-fit border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          Dữ liệu năm {year}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Doanh thu đã thu năm nay</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{currency(overview?.yearToDateRevenue ?? 0)}</p>
              <p className="mt-1 text-[11px] text-slate-500">Tổng mọi thời điểm: {currency(overview?.totalRevenue ?? 0)}</p>
            </div>
            <TrendingUp size={18} className="text-blue-600" />
          </div>
        </Card>
        <Card className="border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng đơn hàng</p>
              <p className="mt-2 text-2xl font-extrabold text-emerald-700">{overview?.totalOrders ?? 0}</p>
              <p className="mt-1 text-[11px] text-slate-500">Tất cả đơn hàng trong hệ thống</p>
            </div>
            <ShoppingCart size={18} className="text-emerald-600" />
          </div>
        </Card>
        <Card className="border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng khách hàng</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{overview?.totalCustomers ?? 0}</p>
              <p className="mt-1 text-[11px] text-slate-500">Tài khoản khách hàng đã đăng ký</p>
            </div>
            <Users size={18} className="text-indigo-600" />
          </div>
        </Card>
        <Card className="border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng sản phẩm hiện có</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{overview?.totalProducts ?? 0}</p>
              <p className="mt-1 text-[11px] text-slate-500">Sản phẩm đang được kinh doanh</p>
            </div>
            <Package size={18} className="text-amber-600" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-5 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900">Số đơn hàng theo tháng</h2>
            <p className="text-xs text-slate-500">Số đơn phát sinh trong năm {year}</p>
          </div>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyOrderData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${Number(value ?? 0)} đơn`, 'Số đơn']} />
                <Bar dataKey="orders" name="Số đơn" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900">Giá trị đơn trung bình</h2>
            <p className="text-xs text-slate-500">Doanh thu trung bình trên mỗi đơn đã thanh toán</p>
          </div>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyOrderData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(value) => `${(Number(value) / 1000000).toFixed(0)}tr`}
                />
                <Tooltip formatter={(value) => [currency(Number(value ?? 0)), 'Trung bình/đơn']} />
                <Bar dataKey="averageOrderValue" name="Trung bình/đơn" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-5 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900">Hiệu quả phương thức thanh toán</h2>
            <p className="text-xs text-slate-500">So sánh doanh thu và số đơn đã thanh toán</p>
          </div>
          {paymentRadarData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-xs text-slate-400">Chưa có dữ liệu thanh toán.</div>
          ) : (
            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={paymentRadarData} outerRadius="72%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="paymentMethod" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <PolarRadiusAxis tick={false} axisLine={false} />
                  <Radar name="Doanh thu" dataKey="revenue" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} />
                  <Radar name="Số đơn" dataKey="orders" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  <Tooltip formatter={(value, name) => [name === 'Doanh thu' ? currency(Number(value ?? 0)) : `${Number(value ?? 0)} đơn`, name]} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-5 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900">Tình trạng vận hành</h2>
            <p className="text-xs text-slate-500">Tỷ lệ đơn hoàn tất và SKU đang có tồn kho ổn định</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {radialData.map((item) => (
              <div key={item.name} className="relative h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="58%" outerRadius="88%" barSize={16} data={[item]} startAngle={90} endAngle={-270}>
                    <RadialBar background dataKey="value" cornerRadius={10} />
                    <PolarRadiusAxis tick={false} axisLine={false} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-slate-900">{item.value}%</span>
                  <span className="px-2 text-center text-[10px] text-slate-500">{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="p-5 shadow-xs xl:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Doanh thu & lãi gộp theo tháng</h2>
              <p className="text-xs text-slate-500">Doanh thu đã thu và lãi gộp từ các đơn đủ giá vốn</p>
            </div>
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-xs font-bold text-blue-700">Năm {year}</Badge>
          </div>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData} margin={{ top: 10, right: 12, left: 2, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(value) => `${(Number(value) / 1000000).toFixed(0)}tr`}
                />
                <Legend verticalAlign="top" height={28} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Tooltip
                  formatter={(value) => currency(Number(value ?? 0))}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#2563eb" strokeWidth={2.5} fill="url(#revenueGradient)" />
                <Line type="monotone" dataKey="grossProfit" name="Lãi gộp" stroke="#10b981" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 shadow-xs xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Cơ cấu thanh toán</h2>
              <p className="text-xs text-slate-500">Doanh thu đã thu theo phương thức · năm {year}</p>
            </div>
            <CreditCard size={18} className="text-indigo-600" />
          </div>
          {paymentMethodData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-xs text-slate-400">
              Chưa có giao dịch đã thanh toán trong năm.
            </div>
          ) : (
            <>
              <div className="relative h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      dataKey="revenue"
                      nameKey="paymentMethod"
                      innerRadius="62%"
                      outerRadius="88%"
                      paddingAngle={3}
                      stroke="none"
                    >
                      {paymentMethodData.map((item, index) => (
                        <Cell key={item.paymentMethod} fill={paymentColors[index % paymentColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => currency(Number(value ?? 0))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-slate-500">Tổng đã thu</span>
                  <span className="text-sm font-extrabold text-slate-900">{currency(paymentRevenue)}</span>
                </div>
              </div>
              <div className="space-y-2">
                {paymentMethodData.map((item, index) => (
                  <div key={item.paymentMethod} className="flex items-center justify-between gap-3 text-xs">
                    <span className="flex min-w-0 items-center gap-2 text-slate-600">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: paymentColors[index % paymentColors.length] }} />
                      <span className="truncate">{paymentMethodLabels[item.paymentMethod] ?? item.paymentMethod}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-slate-800">{currency(item.revenue)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="p-5 shadow-xs xl:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Sản phẩm bán chạy</h2>
              <p className="text-xs text-slate-500">Xếp theo số lượng đơn đã thanh toán trong năm {year}</p>
            </div>
            <button type="button" onClick={() => onNavigateTab('products')} className="text-xs font-bold text-blue-600 hover:underline">
              Quản lý sản phẩm →
            </button>
          </div>
          {bestSellingData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-xs text-slate-400">
              Chưa có sản phẩm bán ra trong đơn đã thanh toán.
            </div>
          ) : (
            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bestSellingData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                  <YAxis type="category" dataKey="productName" width={140} stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip formatter={(value) => [`${Number(value ?? 0)} máy`, 'Đã bán']} />
                  <Bar dataKey="quantity" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-5 shadow-xs xl:col-span-2">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Việc cần theo dõi</h2>
            <p className="text-xs text-slate-500">Gợi ý cho lần nhập hàng và kiểm tra số liệu</p>
          </div>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-bold text-amber-900">{overview?.lowStockVariants ?? 0} SKU sắp hết hoặc đã hết</p>
              <p className="mt-1 text-[11px] text-amber-800">Đối chiếu với danh sách bán chạy trước khi lên kế hoạch nhập.</p>
              <button type="button" onClick={() => onNavigateTab('inventory')} className="mt-2 text-xs font-bold text-amber-900 underline">
                Xem tồn kho →
              </button>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold text-slate-800">Đơn chưa có snapshot giá vốn: {paidOrdersMissingCost}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                Lãi gộp chỉ tính đơn có đủ giá vốn. Không hồi tố đơn cũ; nhập giá vốn tại phần quản lý biến thể để số liệu đơn mới chính xác.
              </p>
              <button type="button" onClick={() => onNavigateTab('products')} className="mt-2 text-xs font-bold text-blue-700 hover:underline">
                Cập nhật giá vốn biến thể →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Đơn hàng</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{overview?.totalOrders ?? 0}</p>
                <p className="text-[11px] text-amber-700">{overview?.pendingOrders ?? 0} đang chờ</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Sản phẩm hoạt động</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{overview?.totalProducts ?? 0}</p>
                <p className="text-[11px] text-slate-500">{overview?.totalCustomers ?? 0} khách hàng</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Đơn hàng mới nhất</h2>
            <p className="text-xs text-slate-500">Các giao dịch phát sinh gần đây trên hệ thống</p>
          </div>
          <button type="button" onClick={() => onNavigateTab('orders')} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
            Xem tất cả đơn hàng →
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="pb-3">Mã đơn</th>
                <th className="pb-3">Khách hàng</th>
                <th className="pb-3">Sản phẩm</th>
                <th className="pb-3">Tổng tiền</th>
                <th className="pb-3">Phương thức</th>
                <th className="pb-3">Trạng thái</th>
                <th className="pb-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr><td colSpan={7} className="py-6 text-center italic text-slate-400">Chưa có đơn hàng nào</td></tr>
              ) : recentOrders.map((order) => (
                <tr key={order.id} className="transition hover:bg-slate-50/60">
                  <td className="py-3 font-mono font-bold text-blue-600">#SOC-{order.id.toString().padStart(4, '0')}</td>
                  <td className="py-3">
                    <p className="font-bold text-slate-800">{order.shippingAddress?.name || order.user?.profile?.fullName || 'Khách vãng lai'}</p>
                    <p className="text-[11px] text-slate-400">{order.shippingAddress?.phone || order.user?.email}</p>
                  </td>
                  <td className="max-w-[200px] truncate py-3 text-slate-700">{order.items?.map((item) => item.productName).join(', ') || 'N/A'}</td>
                  <td className="py-3 font-extrabold text-slate-900">{currency(Number(order.total))}</td>
                  <td className="py-3"><Badge variant="outline" className="text-[10px] font-semibold">{order.paymentMethod}</Badge></td>
                  <td className="py-3">
                    <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                      order.status === 'DELIVERED'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : order.status === 'PENDING'
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : order.status === 'SHIPPING'
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                    }`}>{order.status}</span>
                  </td>
                  <td className="py-3 text-right">
                    <button type="button" onClick={() => onNavigateTab('orders')} className="rounded p-1 text-slate-600 transition hover:bg-slate-200" title="Xem chi tiết đơn hàng">
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
