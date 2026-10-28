'use client';

import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, CheckCircle, Search, Edit3 } from 'lucide-react';
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

export const InventoryTab: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const [items, setItems] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Edit stock modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [newStock, setNewStock] = useState(0);
  const [newReserved, setNewReserved] = useState(0);

  const loadInventory = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await adminService.getInventory({
        page,
        limit: 10,
        search: searchQuery,
        status: statusFilter,
      });
      setItems(res.items || []);
      setPagination(res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadInventory(1);
  }, [searchQuery, statusFilter]);

  const handleOpenEdit = (it: any) => {
    setSelectedItem(it);
    setNewStock(it.stock);
    setNewReserved(it.reserved || 0);
    setIsModalOpen(true);
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      await adminService.updateInventoryStock(selectedItem.id, newStock, newReserved);
      setIsModalOpen(false);
      void loadInventory(pagination.page);
    } catch (err) {
      alert('Lỗi cập nhật tồn kho: ' + (err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Kho Hàng & Tồn Kho</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi số lượng hàng thực tế, hàng đang giữ đơn (reserved) theo từng biến thể SKU.
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold">Lọc trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
          >
            <option value="">Tất cả trạng thái kho</option>
            <option value="IN_STOCK">Còn hàng (In Stock)</option>
            <option value="LOW_STOCK">Sắp hết hàng (Low Stock ≤ 5)</option>
            <option value="OUT_OF_STOCK">Hết hàng (Out of Stock)</option>
          </select>
        </div>

        <span className="text-slate-500 font-semibold">
          Tổng số biến thể quản lý: <strong className="text-slate-800">{pagination.total}</strong>
        </span>
      </div>

      {/* Inventory Table */}
      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">DÒNG MÁY & BIẾN THỂ</th>
                <th className="py-3 px-4">SKU SẢN PHẨM</th>
                <th className="py-3 px-4">GIÁ BÁN</th>
                <th className="py-3 px-4">SẴN SÀNG (STOCK)</th>
                <th className="py-3 px-4">ĐANG GIỮ (RESERVED)</th>
                <th className="py-3 px-4">TÌNH TRẠNG KHO</th>
                <th className="py-3 px-4 text-right">ĐIỀU CHỈNH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Đang tải dữ liệu kho hàng...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                    Không có SKU nào phù hợp tiêu chí lọc.
                  </td>
                </tr>
              ) : (
                items.map((it) => {
                  const v = it.variant;
                  const p = v?.product;
                  return (
                    <tr key={it.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{p?.name || 'Sản phẩm'}</p>
                        <p className="text-[11px] text-slate-500 font-semibold">
                          Phiên bản: <span className="text-blue-600">{v?.storage}</span> - {v?.color}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-600">
                        {v?.sku || 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">
                        {Number(v?.price || 0).toLocaleString('vi-VN')}đ
                      </td>
                      <td className="py-3 px-4">
                        <strong className={`text-sm ${it.stock <= 5 ? 'text-rose-600' : 'text-slate-900'}`}>
                          {it.stock}
                        </strong>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-semibold">
                        {it.reserved || 0}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            it.status === 'IN_STOCK'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : it.status === 'LOW_STOCK'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {it.status === 'IN_STOCK' ? 'Còn hàng' : it.status === 'LOW_STOCK' ? 'Sắp hết' : 'Hết hàng'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(it)}
                          className="h-7 text-xs px-2 gap-1 font-semibold text-blue-600 hover:text-blue-700"
                        >
                          <Edit3 size={13} /> Nhập kho
                        </Button>
                      </td>
                    </tr>
                  );
                })
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
              onClick={() => void loadInventory(pagination.page - 1)}
              className="h-7 text-xs px-2.5"
            >
              Trang trước
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => void loadInventory(pagination.page + 1)}
              className="h-7 text-xs px-2.5"
            >
              Trang tiếp
            </Button>
          </div>
        </div>
      </Card>

      {/* Edit Stock Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <form onSubmit={handleSaveStock} className="text-xs space-y-4">
          <DialogHeader>
            <DialogTitle>Điều Chỉnh Số Lượng Tồn Kho</DialogTitle>
            <DialogDescription>
              Cập nhật số lượng máy thực tế tại kho Sóc Mobile cho SKU:{' '}
              <strong>{selectedItem?.variant?.sku}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
            <p className="font-bold text-slate-800">{selectedItem?.variant?.product?.name}</p>
            <p className="text-slate-500">
              Dung lượng: <strong>{selectedItem?.variant?.storage}</strong> | Màu: <strong>{selectedItem?.variant?.color}</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Số lượng tồn thực tế *</label>
              <Input
                type="number"
                required
                min={0}
                value={newStock}
                onChange={(e) => setNewStock(Number(e.target.value))}
                className="text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Số lượng đang giữ đơn</label>
              <Input
                type="number"
                min={0}
                value={newReserved}
                onChange={(e) => setNewReserved(Number(e.target.value))}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
              Xác nhận lưu kho
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
};

