'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye, CheckCircle2, Clock, Truck, XCircle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { adminService } from '@/services/admin.service';

export const OrdersTab: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');

  const loadOrders = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await adminService.getOrders({
        page,
        limit: 10,
        search: searchQuery,
        status: statusFilter,
      });
      setOrders(res.items || []);
      setPagination(res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders(1);
  }, [searchQuery, statusFilter]);

  const handleOpenDetail = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNewPaymentStatus(order.paymentStatus || 'PENDING');
    setDetailModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      await adminService.updateOrderStatus(selectedOrder.id, newStatus, newPaymentStatus);
      setDetailModalOpen(false);
      void loadOrders(pagination.page);
    } catch (err) {
      alert('Lỗi cập nhật đơn hàng: ' + (err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Đơn Hàng</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Duyệt đơn, thay đổi trạng thái giao hàng và xử lý thanh toán cho khách hàng Sóc Mobile.
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold">Lọc theo trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận (PENDING)</option>
            <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
            <option value="SHIPPING">Đang giao hàng (SHIPPING)</option>
            <option value="DELIVERED">Đã giao hàng (DELIVERED)</option>
            <option value="CANCELLED">Đã hủy (CANCELLED)</option>
          </select>
        </div>

        <span className="text-slate-500 font-semibold">
          Tổng đơn hàng: <strong className="text-slate-800">{pagination.total}</strong>
        </span>
      </div>

      {/* Orders Table */}
      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">MÃ ĐƠN</th>
                <th className="py-3 px-4">NGÀY ĐẶT</th>
                <th className="py-3 px-4">KHÁCH HÀNG & LIÊN HỆ</th>
                <th className="py-3 px-4">TỔNG TIỀN</th>
                <th className="py-3 px-4">HÌNH THỨC TT</th>
                <th className="py-3 px-4">THANH TOÁN</th>
                <th className="py-3 px-4">TIẾN ĐỘ ĐƠN</th>
                <th className="py-3 px-4 text-right">CHI TIẾT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Đang tải danh sách đơn hàng...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 italic">
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      #SOC-{o.id.toString().padStart(4, '0')}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(o.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">
                        {o.shippingAddress?.name || o.user?.profile?.fullName || 'Khách hàng'}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {o.shippingAddress?.phone || o.user?.email}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">
                      {Number(o.total).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[10px] uppercase text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          o.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : o.paymentStatus === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          o.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : o.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : o.status === 'SHIPPING'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : o.status === 'CONFIRMED'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDetail(o)}
                        className="h-7 text-xs px-2 gap-1 font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <Eye size={13} /> Xử lý
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <span>
            Trang {pagination.page} / {pagination.totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => void loadOrders(pagination.page - 1)}
              className="h-7 text-xs px-2.5"
            >
              Trang trước
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => void loadOrders(pagination.page + 1)}
              className="h-7 text-xs px-2.5"
            >
              Trang tiếp
            </Button>
          </div>
        </div>
      </Card>

      {/* Order Detail & Status Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <div className="text-xs space-y-4">
          <DialogHeader>
            <DialogTitle>
              Chi Tiết Đơn Hàng #SOC-{selectedOrder?.id?.toString().padStart(4, '0')}
            </DialogTitle>
            <DialogDescription>
              Kiểm tra danh sách máy đặt mua, địa chỉ nhận hàng và cập nhật quy trình giao hàng.
            </DialogDescription>
          </DialogHeader>

          {/* Customer & Shipping info */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <p className="font-bold text-slate-800">Thông tin người nhận:</p>
              <p className="text-slate-700">{selectedOrder?.shippingAddress?.name}</p>
              <p className="text-slate-500">SĐT: {selectedOrder?.shippingAddress?.phone}</p>
              <p className="text-slate-500">
                Địa chỉ: {selectedOrder?.shippingAddress?.address}, {selectedOrder?.shippingAddress?.city}
              </p>
            </div>
            <div>
              <p className="font-bold text-slate-800">Chi tiết thanh toán:</p>
              <p className="text-slate-700">Phương thức: <strong>{selectedOrder?.paymentMethod}</strong></p>
              <p className="text-slate-500">Tạm tính: {Number(selectedOrder?.subtotal || 0).toLocaleString('vi-VN')}đ</p>
              <p className="text-slate-500">Giảm giá voucher: -{Number(selectedOrder?.discount || 0).toLocaleString('vi-VN')}đ</p>
              <p className="font-extrabold text-blue-600 text-sm mt-1">
                Tổng thanh toán: {Number(selectedOrder?.total || 0).toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2">Sản phẩm trong đơn:</h4>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-40 overflow-y-auto">
              {selectedOrder?.items?.map((it: any) => (
                <div key={it.id} className="p-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{it.productName}</p>
                    <p className="text-[11px] text-slate-400">
                      {it.storage} - {it.color} | SL: {it.quantity}
                    </p>
                  </div>
                  <strong className="font-bold text-slate-800">
                    {Number(it.total).toLocaleString('vi-VN')}đ
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* Status Change Controls */}
          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Cập nhật tiến độ đơn:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800"
              >
                <option value="PENDING">Chờ xác nhận (PENDING)</option>
                <option value="CONFIRMED">Đã xác nhận & Đóng gói (CONFIRMED)</option>
                <option value="SHIPPING">Đang giao vận (SHIPPING)</option>
                <option value="DELIVERED">Đã giao thành công (DELIVERED)</option>
                <option value="CANCELLED">Hủy đơn hàng (CANCELLED)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">Trạng thái thanh toán:</label>
              <select
                value={newPaymentStatus}
                onChange={(e) => setNewPaymentStatus(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800"
              >
                <option value="PENDING">Chưa thanh toán (PENDING)</option>
                <option value="PAID">Đã thanh toán đủ (PAID)</option>
                <option value="FAILED">Thất bại / Lỗi (FAILED)</option>
                <option value="REFUNDED">Đã hoàn tiền (REFUNDED)</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDetailModalOpen(false)}>
              Đóng
            </Button>
            <Button
              type="button"
              onClick={handleUpdateStatus}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Lưu thay đổi đơn hàng
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
};

