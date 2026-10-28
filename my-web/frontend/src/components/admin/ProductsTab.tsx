'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ChevronDown,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { adminService } from '@/services/admin.service';

export const ProductsTab: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<number | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();

  // Modal Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    name: '',
    basePrice: 0,
    salePrice: 0,
    brandId: 0,
    categoryId: 0,
    image: '',
    description: '',
    badge: 'Mới',
  });

  // Modal Variant Management
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [activeProductForVariants, setActiveProductForVariants] = useState<any>(null);
  const [variantForm, setVariantForm] = useState({
    storage: '256GB',
    color: 'Titan Tự Nhiên',
    ram: '12GB',
    price: 35000000,
    oldPrice: 38000000,
    stock: 50,
  });

  const loadData = async (page = 1) => {
    setIsLoading(true);
    try {
      const [res, bList, cList] = await Promise.all([
        adminService.getProducts({
          page,
          limit: 10,
          search: searchQuery,
          brandId: selectedBrand,
          categoryId: selectedCategory,
        }),
        adminService.getBrands(),
        adminService.getCategories(),
      ]);
      setProducts(res.items || []);
      setPagination(res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      setBrands(bList || []);
      setCategories(cList || []);
    } catch (err) {
      console.error('Lỗi tải sản phẩm:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData(1);
  }, [searchQuery, selectedBrand, selectedCategory]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      basePrice: 20000000,
      salePrice: 18500000,
      brandId: brands[0]?.id || 1,
      categoryId: categories[0]?.id || 1,
      image: 'https://cdn.tgdd.vn/Products/Images/42/342679/iphone-17-pro-max-cam-thumb-600x600.jpg',
      description: 'Sản phẩm chính hãng Sóc Mobile bảo hành 12 tháng.',
      badge: 'Giảm -5%',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      basePrice: Number(p.basePrice),
      salePrice: p.salePrice ? Number(p.salePrice) : Number(p.basePrice),
      brandId: p.brandId,
      categoryId: p.categoryId,
      image: p.image,
      description: p.description || '',
      badge: p.badge || 'Mới',
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, formData);
      } else {
        await adminService.createProduct(formData);
      }
      setIsModalOpen(false);
      void loadData(pagination.page);
    } catch (err) {
      alert('Lỗi lưu sản phẩm: ' + (err as Error).message);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Xác nhận ẩn sản phẩm "${name}" khỏi gian hàng?`)) return;
    try {
      await adminService.deleteProduct(id);
      void loadData(pagination.page);
    } catch (err) {
      alert('Không thể ẩn sản phẩm');
    }
  };

  // Manage variants
  const handleOpenVariants = (p: any) => {
    setActiveProductForVariants(p);
    setVariantForm({
      storage: '256GB',
      color: 'Titan Tự Nhiên',
      ram: '12GB',
      price: Number(p.salePrice || p.basePrice),
      oldPrice: Number(p.basePrice),
      stock: 50,
    });
    setIsVariantModalOpen(true);
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProductForVariants) return;
    try {
      await adminService.createVariant(activeProductForVariants.id, variantForm);
      // Reload product data
      const updated = await adminService.getProducts({ page: pagination.page, limit: 10 });
      const current = updated.items.find((x: any) => x.id === activeProductForVariants.id);
      setActiveProductForVariants(current);
      void loadData(pagination.page);
    } catch (err) {
      alert('Lỗi tạo biến thể: ' + (err as Error).message);
    }
  };

  const handleDeleteVariant = async (varId: number) => {
    if (!window.confirm('Xác nhận xóa biến thể này?')) return;
    try {
      await adminService.deleteVariant(varId);
      const updated = await adminService.getProducts({ page: pagination.page, limit: 10 });
      const current = updated.items.find((x: any) => x.id === activeProductForVariants.id);
      setActiveProductForVariants(current);
      void loadData(pagination.page);
    } catch (err) {
      alert('Lỗi xóa biến thể');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sản Phẩm & Biến Thể</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý danh sách điện thoại, cấu hình các tùy chọn bộ nhớ, màu sắc và giá bán.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-sm"
          >
            <Plus size={15} /> Thêm sản phẩm mới
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <select
            value={selectedBrand || ''}
            onChange={(e) => setSelectedBrand(e.target.value ? Number(e.target.value) : undefined)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 font-semibold">
          Tổng cộng: <strong className="text-slate-800">{pagination.total}</strong> sản phẩm
        </span>
      </div>

      {/* Product Table */}
      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">SẢN PHẨM</th>
                <th className="py-3 px-4">THƯƠNG HIỆU</th>
                <th className="py-3 px-4">GIÁ NIÊM YẾT / BÁN</th>
                <th className="py-3 px-4">CÁC BIẾN THỂ (STORAGE)</th>
                <th className="py-3 px-4">TỒN KHO TỔNG</th>
                <th className="py-3 px-4">TRẠNG THÁI</th>
                <th className="py-3 px-4 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Đang tải dữ liệu sản phẩm từ cơ sở dữ liệu...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                    Không tìm thấy sản phẩm phù hợp.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const totalStock = p.variants?.reduce(
                    (sum: number, v: any) => sum + (v.inventory?.stock || 0),
                    0
                  );
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image || '/images/default-phone.png'}
                            alt={p.name}
                            className="w-10 h-10 object-contain rounded-md bg-slate-50 border border-slate-100 p-0.5 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                            <p className="text-[11px] text-slate-400">{p.category?.name || 'Điện thoại'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {p.brand?.name}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-extrabold text-slate-900">
                          {Number(p.salePrice || p.basePrice).toLocaleString('vi-VN')}đ
                        </p>
                        {p.salePrice && Number(p.salePrice) < Number(p.basePrice) && (
                          <del className="text-[11px] text-slate-400">
                            {Number(p.basePrice).toLocaleString('vi-VN')}đ
                          </del>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {p.variants?.map((v: any) => (
                            <span
                              key={v.id}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                              title={`${v.color} - ${Number(v.price).toLocaleString('vi-VN')}đ`}
                            >
                              {v.storage}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold ${
                            totalStock <= 5 ? 'text-rose-600' : 'text-slate-700'
                          }`}
                        >
                          {totalStock} máy
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            p.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {p.isActive ? 'Đang bán' : 'Tạm ẩn'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenVariants(p)}
                            className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition"
                            title="Quản lý biến thể dung lượng / màu"
                          >
                            <Layers size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded text-slate-600 hover:bg-slate-100 transition"
                            title="Chỉnh sửa sản phẩm"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 rounded text-rose-600 hover:bg-rose-50 transition"
                            title="Ẩn sản phẩm"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
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
              onClick={() => void loadData(pagination.page - 1)}
              className="h-7 text-xs px-2.5"
            >
              Trang trước
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => void loadData(pagination.page + 1)}
              className="h-7 text-xs px-2.5"
            >
              Trang tiếp
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal: Thêm / Sửa sản phẩm */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <form onSubmit={handleSaveProduct}>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</DialogTitle>
            <DialogDescription>
              Cấu hình các thông số cơ bản cho dòng điện thoại trên website.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tên dòng máy *</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ví dụ: iPhone 17 Pro Max 256GB"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Thương hiệu</label>
                <select
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: Number(e.target.value) })}
                  className="w-full text-xs bg-white border border-slate-200 rounded-md p-2"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Danh mục</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                  className="w-full text-xs bg-white border border-slate-200 rounded-md p-2"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Giá niêm yết (gốc)</label>
                <Input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Giá bán khuyến mãi</label>
                <Input
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">URL Hình ảnh</label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
                className="text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Mô tả sản phẩm</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full text-xs border border-slate-200 rounded-md p-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="text-xs">
              Hủy
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
              Lưu sản phẩm
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Modal: Quản lý Biến thể (Variants) */}
      <Dialog open={isVariantModalOpen} onOpenChange={setIsVariantModalOpen}>
        <div>
          <DialogHeader>
            <DialogTitle>Quản Lý Biến Thể: {activeProductForVariants?.name}</DialogTitle>
            <DialogDescription>
              Xem và thêm các phiên bản dung lượng (128GB, 256GB, 512GB, 1TB) hoặc màu sắc cho sản phẩm này.
            </DialogDescription>
          </DialogHeader>

          {/* Existing Variants List */}
          <div className="space-y-2 mb-6">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Danh sách biến thể hiện tại:</h4>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto text-xs">
              {activeProductForVariants?.variants?.map((v: any) => (
                <div key={v.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <span className="font-extrabold text-blue-600 mr-2">{v.storage}</span>
                    <span className="font-medium text-slate-700">{v.color}</span>
                    <span className="text-slate-400 text-[11px] ml-2">SKU: {v.sku}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{Number(v.price).toLocaleString('vi-VN')}đ</span>
                    <span className="text-slate-500 font-semibold">{v.inventory?.stock ?? 0} máy</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteVariant(v.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Variant Form */}
          <form onSubmit={handleAddVariant} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
            <h4 className="font-bold text-slate-800">Thêm biến thể mới:</h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="font-semibold text-slate-600 block mb-0.5">Dung lượng</label>
                <Input
                  required
                  value={variantForm.storage}
                  onChange={(e) => setVariantForm({ ...variantForm, storage: e.target.value })}
                  placeholder="512GB"
                  className="text-xs h-8"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-0.5">Màu sắc</label>
                <Input
                  required
                  value={variantForm.color}
                  onChange={(e) => setVariantForm({ ...variantForm, color: e.target.value })}
                  placeholder="Titan Sa Mạc"
                  className="text-xs h-8"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-0.5">RAM</label>
                <Input
                  value={variantForm.ram}
                  onChange={(e) => setVariantForm({ ...variantForm, ram: e.target.value })}
                  placeholder="12GB"
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="font-semibold text-slate-600 block mb-0.5">Giá bán (VND)</label>
                <Input
                  type="number"
                  value={variantForm.price}
                  onChange={(e) => setVariantForm({ ...variantForm, price: Number(e.target.value) })}
                  className="text-xs h-8"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-0.5">Giá cũ (VND)</label>
                <Input
                  type="number"
                  value={variantForm.oldPrice}
                  onChange={(e) => setVariantForm({ ...variantForm, oldPrice: Number(e.target.value) })}
                  className="text-xs h-8"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-0.5">Tồn kho ban đầu</label>
                <Input
                  type="number"
                  value={variantForm.stock}
                  onChange={(e) => setVariantForm({ ...variantForm, stock: Number(e.target.value) })}
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div className="text-right pt-2">
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8">
                + Thêm biến thể này
              </Button>
            </div>
          </form>

          <DialogFooter>
            <Button type="button" onClick={() => setIsVariantModalOpen(false)} className="text-xs">
              Đóng
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
};

