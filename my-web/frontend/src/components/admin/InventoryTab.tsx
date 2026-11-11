'use client';

import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, CheckCircle, Edit3, Plus, ScanLine, Search, Trash2, Upload } from 'lucide-react';
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
import { createWorker } from 'tesseract.js';

type ReceiptItem = {
  variantId: number;
  quantity: number;
  unitCost: number;
  inventory: InventoryRow;
};

type BillMatch = {
  line: string;
  lineIndex: number;
  quantity: number;
  unitCost: number | null;
};

type InventoryRow = {
  id: number;
  stock: number;
  reserved?: number;
  status: string;
  variant: {
    id: number;
    sku?: string;
    storage?: string;
    color?: string;
    purchasePrice?: number | string | null;
    price?: number | string;
    product?: { id?: number; name?: string; image?: string | null };
  };
};

export const InventoryTab: React.FC<{
  searchQuery: string;
  onSearchChange: (query: string) => void;
}> = ({ searchQuery, onSearchChange }) => {
  const [items, setItems] = useState<InventoryRow[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Edit stock modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [newStock, setNewStock] = useState(0);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [receiptInventory, setReceiptInventory] = useState<InventoryRow[]>([]);
  const [supplier, setSupplier] = useState('');
  const [billImage, setBillImage] = useState<File | null>(null);
  const [billImageUrl, setBillImageUrl] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isSavingReceipt, setIsSavingReceipt] = useState(false);

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
    setIsModalOpen(true);
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      await adminService.updateInventoryStock(selectedItem.id, newStock);
      setIsModalOpen(false);
      void loadInventory(pagination.page);
    } catch (err) {
      alert('Lỗi cập nhật tồn kho: ' + (err as Error).message);
    }
  };

  const handleOpenReceipt = async () => {
    try {
      const result = await adminService.getInventory({ page: 1, limit: 1000 });
      setReceiptInventory(result.items || []);
      setReceiptItems([]);
      setSupplier('');
      setBillImage(null);
      setBillImageUrl('');
      setOcrText('');
      setIsReceiptOpen(true);
    } catch (err) {
      alert('Không thể tải danh sách variant để nhập hàng: ' + (err as Error).message);
    }
  };

  const normalizeOcrText = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]/g, '');

  const findOcrMatch = (item: InventoryRow, lines: string[]): BillMatch | null => {
    const sku = normalizeOcrText(item.variant.sku || '');
    // SKU is the only reliable identity when several variants share the same
    // product name. Never infer a variant from generic model words.
    const lineIndex = sku.length >= 6
      ? lines.findIndex((line) => normalizeOcrText(line).includes(sku))
      : -1;
    if (lineIndex < 0) return null;

    const line = lines[lineIndex];
    const priceMatch = line.match(
      /(?:gia\s*(?:von|nhap|mua)|don\s*gia|unit\s*cost|price)\s*[:.]?\s*([\d.,\s]{3,})/i,
    );
    const lineNumbers = line.match(/\b\d[\d.,]*\b/g) || [];
    const slMatch = line.match(/\b(?:sl|qty|quantity)\s*[:.]?\s*(\d{1,4})\b/i);
    const priceFromRow = lineNumbers
      .map((value) => Number(value.replace(/[.,\s]/g, '')))
      .filter((value) => Number.isFinite(value) && value >= 1000)
      .at(-1);
    const parsedUnitCost = priceMatch
      ? Number(priceMatch[1].replace(/[.,\s]/g, ''))
      : priceFromRow ?? null;
    const unitCost =
      parsedUnitCost !== null && Number.isFinite(parsedUnitCost) && parsedUnitCost > 0
        ? parsedUnitCost
        : null;
    return {
      line,
      lineIndex,
      quantity: slMatch ? Number(slMatch[1]) : extractOcrQuantity(line),
      unitCost,
    };
  };

  const extractOcrQuantity = (line: string) => {
    const quantityMatch = line.match(/\b(?:sl|qty|quantity)\s*[:.]?\s*(\d{1,4})\b/i);
    if (quantityMatch) return Number(quantityMatch[1]);
    const numbers = line.match(/\b\d{1,4}\b/g) || [];
    return Number(numbers.at(-1)) || 1;
  };

  const getBillMatch = (item: ReceiptItem, text = ocrText) => {
    if (!text.trim()) return null;
    return findOcrMatch(item.inventory, text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
  };

  const validateReceiptItem = (item: ReceiptItem) => {
    const match = getBillMatch(item);
    if (!match) {
      return `${item.inventory.variant.sku}: không tìm thấy sản phẩm/variant tương ứng trong bill`;
    }
    if (item.quantity !== match.quantity) {
      return `${item.inventory.variant.sku}: số lượng nhập ${item.quantity} khác bill ${match.quantity}`;
    }
    if (match.unitCost === null) {
      return `${item.inventory.variant.sku}: bill chưa đọc được giá vốn để đối chiếu`;
    }
    if (item.unitCost !== match.unitCost) {
      return `${item.inventory.variant.sku}: giá vốn nhập ${item.unitCost.toLocaleString('vi-VN')} khác bill ${match.unitCost.toLocaleString('vi-VN')}`;
    }
    return null;
  };

  const prepareOcrImage = async (file: File): Promise<File | Blob> => {
    if (file.type !== 'image/svg+xml' && !file.name.toLowerCase().endsWith('.svg')) {
      return file;
    }

    const svg = await file.text();
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    const image = new Image();
    image.src = dataUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Không thể chuyển ảnh SVG sang định dạng OCR'));
    });

    const scale = Math.max(1, 1800 / image.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Trình duyệt không hỗ trợ xử lý ảnh OCR');
    }
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Không thể tạo ảnh OCR'));
      }, 'image/png');
    });
  };

  const handleBillFile = async (file: File) => {
    setBillImage(file);
    setIsOcrLoading(true);
    let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
    try {
      const upload = await adminService.uploadReceiptImage(file);
      setBillImageUrl(upload.url);
      const ocrImage = await prepareOcrImage(file);
      worker = await createWorker('vie+eng');
      const result = await worker.recognize(ocrImage);
      const text = result.data.text;
      setOcrText(text);
      const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const suggestions = receiptInventory
        .map((item) => ({ item, matchingLine: findOcrMatch(item, lines) }))
        .filter(({ matchingLine }) => matchingLine)
        .map(({ item, matchingLine }) => {
          return {
            variantId: item.variant.id,
            quantity: matchingLine?.quantity || 1,
            unitCost: matchingLine?.unitCost || 0,
            inventory: item,
          };
        });
        setReceiptItems(suggestions);
    } catch (err) {
      alert('Đã tải bill nhưng không thể tự đọc OCR: ' + (err as Error).message + '. Vui lòng đối chiếu và nhập thủ công.');
    } finally {
      await worker?.terminate();
      setIsOcrLoading(false);
    }
  };

  const handleAddReceiptItem = (variantId: number) => {
    if (!ocrText.trim()) {
      alert('Phải tải và đọc bill trước khi thêm sản phẩm.');
      return;
    }
    const inventory = receiptInventory.find((item) => item.variant?.id === variantId);
    if (!inventory) return;
    const match = findOcrMatch(
      inventory,
      ocrText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
    );
    if (!match) {
      alert(`Không thể thêm ${inventory.variant.sku}: sản phẩm/variant này không có trong bill.`);
      return;
    }
    if (receiptItems.some((item) => item.variantId === variantId)) return;
    setReceiptItems((items) => [
      ...items,
      {
        variantId,
        quantity: match.quantity,
        unitCost: match.unitCost || 0,
        inventory,
      },
    ]);
  };

  const handleSaveReceipt = async (event: React.FormEvent) => {
    event.preventDefault();
    if (receiptItems.length === 0) {
      alert('Vui lòng thêm ít nhất một variant vào phiếu nhập.');
      return;
    }
    const validationErrors = receiptItems
      .map(validateReceiptItem)
      .filter((error): error is string => Boolean(error));
    if (validationErrors.length > 0) {
      alert(`Dữ liệu nhập không khớp bill:\n\n${validationErrors.join('\n')}`);
      return;
    }
    if (receiptItems.some((item) => !Number.isInteger(item.quantity) || item.quantity <= 0 || item.unitCost < 0)) {
      alert('Số lượng phải là số nguyên dương và giá vốn không được âm.');
      return;
    }
    setIsSavingReceipt(true);
    try {
      await adminService.createStockReceipt({
        supplier,
        billImageUrl,
        ocrText,
        items: receiptItems.map(({ variantId, quantity, unitCost }) => ({ variantId, quantity, unitCost })),
      });
      setIsReceiptOpen(false);
      await loadInventory(pagination.page);
      alert('Đã nhập hàng và cập nhật tồn kho thành công.');
    } catch (err) {
      alert('Lỗi xác nhận nhập hàng: ' + (err as Error).message);
    } finally {
      setIsSavingReceipt(false);
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
        <Button onClick={() => void handleOpenReceipt()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5">
          <Plus size={15} /> Nhập hàng
        </Button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-xs">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm tên sản phẩm hoặc SKU..."
              className="h-9 pl-9 pr-8 text-xs bg-slate-50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label="Xóa tìm kiếm"
              >
                ×
              </button>
            )}
          </div>
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
                <th className="py-3 px-4">CÓ THỂ BÁN</th>
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
                        <strong className={`text-sm ${it.stock - (it.reserved || 0) <= 5 ? 'text-rose-600' : 'text-slate-900'}`}>
                          {Math.max(0, it.stock - (it.reserved || 0))}
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
          </div>
          <p className="text-slate-500">
            Số lượng đang giữ được cập nhật tự động theo trạng thái đơn hàng.
          </p>

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

      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <form onSubmit={handleSaveReceipt} className="text-xs space-y-4 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nhập hàng vào kho</DialogTitle>
            <DialogDescription>
              Tải bill để OCR gợi ý sản phẩm, sau đó đối chiếu và chỉnh lại trước khi xác nhận.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nhà cung cấp</label>
              <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Tên nhà cung cấp (không bắt buộc)" />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Ảnh bill</label>
              <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 p-2.5 cursor-pointer hover:bg-slate-50">
                <Upload size={15} />
                <span>{billImage?.name || 'Chọn ảnh bill'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleBillFile(file);
                }} />
              </label>
            </div>
          </div>

          {isOcrLoading && <p className="flex items-center gap-2 text-blue-600"><ScanLine size={15} className="animate-pulse" /> Đang đọc bill, vui lòng chờ...</p>}
          {ocrText && !isOcrLoading && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-amber-800">
              <p>OCR đã hoàn tất. Các dòng bên dưới là gợi ý, cần kiểm tra lại với bill.</p>
              {receiptItems.length === 0 && (
                <p className="mt-1 font-semibold">Không nhận diện được variant tự động; hãy chọn SKU thủ công.</p>
              )}
              <details className="mt-2">
                <summary className="cursor-pointer font-semibold">Xem nội dung OCR</summary>
                <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap text-[11px]">{ocrText}</pre>
              </details>
            </div>
          )}

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="font-bold text-slate-700 block mb-1">Thêm variant thủ công</label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) handleAddReceiptItem(Number(e.target.value));
                  e.target.value = '';
                }}
              >
                <option value="">Chọn SKU / variant...</option>
                {receiptInventory.filter((item) => !receiptItems.some((row) => row.variantId === item.variant?.id)).map((item) => (
                  <option key={item.variant.id} value={item.variant.id}>
                    {item.variant.sku} - {item.variant.product?.name} ({item.variant.storage}, {item.variant.color})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {receiptItems.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-slate-500">Chưa có sản phẩm trong phiếu nhập.</p>
            ) : receiptItems.map((item, index) => (
              <div key={item.variantId} className="grid grid-cols-[1fr_90px_130px_32px] gap-2 items-end rounded-lg border border-slate-200 p-2">
                <div>
                  <p className="font-bold text-slate-800">{item.inventory.variant?.product?.name}</p>
                  <p className="text-slate-500">{item.inventory.variant?.sku} · {item.inventory.variant?.storage} · {item.inventory.variant?.color}</p>
                </div>
                <label className="font-bold text-slate-600">SL
                  <Input type="number" min={1} step={1} required value={item.quantity} onChange={(e) => setReceiptItems((items) => items.map((row, i) => i === index ? { ...row, quantity: Number(e.target.value) } : row))} />
                </label>
                <label className="font-bold text-slate-600">Giá vốn
                  <Input type="number" min={0} step={1000} required value={item.unitCost} onChange={(e) => setReceiptItems((items) => items.map((row, i) => i === index ? { ...row, unitCost: Number(e.target.value) } : row))} />
                </label>
                <Button type="button" variant="outline" aria-label="Xóa variant" onClick={() => setReceiptItems((items) => items.filter((_, i) => i !== index))} className="h-9 w-8 p-0 text-rose-600">
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsReceiptOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={isOcrLoading || isSavingReceipt} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
              {isSavingReceipt ? 'Đang lưu...' : 'Xác nhận nhập hàng'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
};
