'use client';

import React, { useState, useEffect } from 'react';
import { TicketPercent, Plus, Edit2, Trash2, CheckCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { adminService } from '@/services/admin.service';

interface VoucherFormData {
  code: string;
  description: string;
  discountType: string;
  discountValue: string;
  minOrderValue: string;
  maxDiscount: string;
  usageLimit: string;
  isActive: boolean;
}

export const VouchersTab: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);
  const [formData, setFormData] = useState<VoucherFormData>({
    code: '',
    description: '',
    discountType: 'FIXED',
    discountValue: '50000',
    minOrderValue: '200000',
    maxDiscount: '50000',
    usageLimit: '100',
    isActive: true,
  });

  const loadVouchers = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await adminService.getVouchers({
        page,
        limit: 10,
        search: searchQuery,
      });
      setVouchers(res.items || []);
      setPagination(res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadVouchers(1);
  }, [searchQuery]);

  const handleOpenCreate = () => {
    setEditingVoucher(null);
    setFormData({
      code: '',
      description: 'Giảm giá ưu đãi đơn hàng',
      discountType: 'FIXED',
      discountValue: '50000',
      minOrderValue: '200000',
      maxDiscount: '50000',
      usageLimit: '200',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: any) => {
    setEditingVoucher(v);
    setFormData({
      code: v.code,
      description: v.description || '',
      discountType: v.discountType,
      discountValue: String(v.discountValue ?? ''),
      minOrderValue: String(v.minOrderValue ?? ''),
      maxDiscount: String(v.maxDiscount ?? ''),
      usageLimit: String(v.usageLimit ?? ''),
      isActive: v.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue),
        maxDiscount: Number(formData.maxDiscount),
        usageLimit: Number(formData.usageLimit),
      };

      if (editingVoucher) {
        await adminService.updateVoucher(editingVoucher.id, payload);
      } else {
        await adminService.createVoucher(payload);
      }
      setIsModalOpen(false);
      void loadVouchers(pagination.page);
    } catch (err) {
      alert('Lỗi lưu voucher: ' + (err as Error).message);
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!window.confirm(`Xác nhận xóa mã giảm giá "${code}"?`)) return;
    try {
      await adminService.deleteVoucher(id);
      void loadVouchers(pagination.page);
    } catch (err) {
      alert('Không thể xóa mã voucher');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Voucher & Mã Giảm Giá</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tạo và cấu hình mã coupon chiết khấu (%) hoặc trừ thẳng (VND) cho các sự kiện khuyến mãi.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-sm"
        >
          <Plus size={15} /> Tạo mã voucher mới
        </Button>
      </div>

      {/* Vouchers Table */}
      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">MÃ VOUCHER</th>
                <th className="py-3 px-4">MÔ TẢ CHI TIẾT</th>
                <th className="py-3 px-4">LOẠI & GIÁ TRỊ GIẢM</th>
                <th className="py-3 px-4">ĐƠN TỐI THIỂU</th>
                <th className="py-3 px-4">ĐÃ DÙNG / GIỚI HẠN</th>
                <th className="py-3 px-4">TRẠNG THÁI</th>
                <th className="py-3 px-4 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Đang tải danh sách voucher...
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                    Chưa có mã giảm giá nào.
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-black text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                        {v.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 max-w-[220px]">
                      {v.description || 'Ưu đãi mua hàng'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {v.discountType === 'PERCENT'
                        ? `Giảm ${v.discountValue}%`
                        : `Giảm ${Number(v.discountValue).toLocaleString('vi-VN')}đ`}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-semibold">
                      {Number(v.minOrderValue).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">{v.usedCount}</span>
                      <span className="text-slate-400"> / {v.usageLimit || '∞'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          v.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {v.isActive ? 'Đang kích hoạt' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(v)}
                          className="p-1.5 rounded text-slate-600 hover:bg-slate-100 transition"
                          title="Chỉnh sửa voucher"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(v.id, v.code)}
                          className="p-1.5 rounded text-rose-600 hover:bg-rose-50 transition"
                          title="Xóa voucher"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <form onSubmit={handleSave} className="text-xs space-y-4">
          <DialogHeader>
            <DialogTitle>{editingVoucher ? 'Chỉnh Sửa Mã Giảm Giá' : 'Tạo Mã Giảm Giá Mới'}</DialogTitle>
            <DialogDescription>
              Thiết lập mã coupon và quy tắc áp dụng cho giỏ hàng khách hàng Sóc Mobile.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mã Voucher (Code) *</label>
              <Input
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="VD: GIAM50, TET2026..."
                className="text-xs font-mono font-bold uppercase"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Kiểu giảm giá</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 font-semibold"
              >
                <option value="FIXED">Số tiền cố định (VND)</option>
                <option value="PERCENT">Phần trăm (%)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Giá trị giảm *</label>
              <Input
                type="number"
                required
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                className="text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Đơn hàng tối thiểu (VND)</label>
              <Input
                type="number"
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Giới hạn lượt dùng</label>
              <Input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                className="text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Trạng thái kích hoạt</label>
              <select
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 font-semibold"
              >
                <option value="true">Đang kích hoạt (Cho phép dùng)</option>
                <option value="false">Tạm dừng (Vô hiệu hóa)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Mô tả hiển thị</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ưu đãi giảm giá 50k cho đơn từ 200k"
              className="text-xs"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
              Lưu mã voucher
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
};

