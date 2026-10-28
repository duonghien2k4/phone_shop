'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/services/admin.service';

export const PaymentsTab: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadPayments = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await adminService.getPayments({
        page,
        limit: 10,
        method: methodFilter,
        status: statusFilter,
      });
      setPayments(res.items || []);
      setPagination(res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPayments(1);
  }, [methodFilter, statusFilter]);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await adminService.updatePaymentStatus(id, status);
      void loadPayments(pagination.page);
    } catch (err) {
      alert('Lỗi cập nhật giao dịch');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Giao Dịch & Thanh Toán</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lịch sử giao dịch qua cổng VNPay, MoMo, Chuyển khoản VietQR và thanh toán khi nhận hàng (COD).
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-xs">
        <div className="flex items-center gap-3">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
          >
            <option value="">Tất cả cổng thanh toán</option>
            <option value="VNPAY">VNPay Gateway</option>
            <option value="MOMO">Ví MoMo</option>
            <option value="BANK_TRANSFER">Chuyển khoản VietQR</option>
            <option value="COD">Tiền mặt (COD)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PAID">Thành công (PAID)</option>
            <option value="PENDING">Đang chờ (PENDING)</option>
            <option value="FAILED">Thất bại (FAILED)</option>
            <option value="REFUNDED">Hoàn tiền (REFUNDED)</option>
          </select>
        </div>

        <span className="text-slate-500 font-semibold">
          Tổng số giao dịch: <strong className="text-slate-800">{pagination.total}</strong>
        </span>
      </div>

      {/* Payment Table */}
      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">MÃ GIAO DỊCH</th>
                <th className="py-3 px-4">ĐƠN HÀNG</th>
                <th className="py-3 px-4">KHÁCH HÀNG</th>
                <th className="py-3 px-4">SỐ TIỀN</th>
                <th className="py-3 px-4">CỔNG THANH TOÁN</th>
                <th className="py-3 px-4">TRẠNG THÁI</th>
                <th className="py-3 px-4">THỜI GIAN GIAO DỊCH</th>
                <th className="py-3 px-4 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Đang tải dữ liệu giao dịch...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 italic">
                    Chưa có giao dịch nào phù hợp.
                  </td>
                </tr>
              ) : (
                payments.map((pm) => (
                  <tr key={pm.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {pm.transactionId || `PAY-${pm.id}`}
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-600 font-bold">
                      #SOC-{pm.orderId.toString().padStart(4, '0')}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">
                        {pm.order?.shippingAddress?.name || pm.order?.user?.profile?.fullName || 'Khách hàng'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {pm.order?.shippingAddress?.phone || pm.order?.user?.email}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">
                      {Number(pm.amount).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="font-bold text-[10px]">
                        {pm.method}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          pm.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : pm.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {pm.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(pm.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {pm.status !== 'PAID' ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(pm.id, 'PAID')}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200"
                        >
                          Xác nhận đã nhận tiền
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Đã quyết toán</span>
                      )}
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
              onClick={() => void loadPayments(pagination.page - 1)}
              className="h-7 text-xs px-2.5"
            >
              Trang trước
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => void loadPayments(pagination.page + 1)}
              className="h-7 text-xs px-2.5"
            >
              Trang tiếp
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

