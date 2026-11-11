'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  RefreshCw,
  ImagePlus,
  X,
  Search,
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

interface ProductVariantCost {
  id: number;
  storage: string;
  color: string;
  sku?: string;
  price: number | string;
  purchasePrice?: number | string | null;
  inventory?: { stock?: number | null } | null;
}

interface AdminProduct {
  id: number;
  name: string;
  basePrice: number | string;
  salePrice?: number | string | null;
  variants?: ProductVariantCost[];
}

export const ProductsTab: React.FC<{
  searchQuery: string;
  onSearchChange: (query: string) => void;
}> = ({ searchQuery, onSearchChange }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<number | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();

  // Modal Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [secondaryImageFiles, setSecondaryImageFiles] = useState<File[]>([]);
  const [existingSecondaryImages, setExistingSecondaryImages] = useState<string[]>([]);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: '',
    basePrice: 0,
    salePrice: 0,
    purchasePrice: '',
    brandId: 0,
    categoryId: 0,
    image: '',
    description: '',
    badge: 'Mới',
  });

  // Modal Variant Management
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [activeProductForVariants, setActiveProductForVariants] = useState<AdminProduct | null>(null);
  const [variantForm, setVariantForm] = useState({
    storage: '256GB',
    color: 'Titan Tự Nhiên',
    ram: '12GB',
    price: 35000000,
    purchasePrice: '',
    oldPrice: 38000000,
    stock: 50,
  });
  const [purchaseCostDrafts, setPurchaseCostDrafts] = useState<Record<number, string>>({});
  const [savingPurchaseCostFor, setSavingPurchaseCostFor] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
    };
  }, [mainImagePreview]);

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
    setMainImageFile(null);
    setMainImagePreview('');
    setSecondaryImageFiles([]);
    setExistingSecondaryImages([]);
    setFormData({
      name: '',
      basePrice: 20000000,
      salePrice: 18500000,
      purchasePrice: '',
      brandId: brands[0]?.id || 1,
      categoryId: categories[0]?.id || 1,
      image: '',
      description: 'Sản phẩm chính hãng Sóc Mobile bảo hành 12 tháng.',
      badge: 'Giảm -5%',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingProduct(p);
    setMainImageFile(null);
    setMainImagePreview('');
    setSecondaryImageFiles([]);
    setExistingSecondaryImages((p.images || []).map((image: { url: string }) => image.url));
    setFormData({
      name: p.name,
      basePrice: Number(p.basePrice),
      salePrice: p.salePrice ? Number(p.salePrice) : Number(p.basePrice),
      purchasePrice: '',
      brandId: p.brandId,
      categoryId: p.categoryId,
      image: p.image,
      description: p.description || '',
      badge: p.badge || 'Mới',
    });
    setIsModalOpen(true);
  };

  const handleOpenDetails = (product: any) => {
    setSelectedProduct(product);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct && !mainImageFile) {
      alert('Vui lòng tải ảnh chính của sản phẩm lên.');
      return;
    }
    if (
      !editingProduct &&
      (formData.purchasePrice.trim() === '' ||
        !Number.isFinite(Number(formData.purchasePrice)) ||
        Number(formData.purchasePrice) < 0)
    ) {
      alert('Vui lòng nhập giá vốn hợp lệ cho biến thể mặc định.');
      return;
    }

    setIsSavingProduct(true);
    try {
      const mainImage = mainImageFile
        ? (await adminService.uploadProductImage(mainImageFile)).url
        : formData.image;
      const secondaryImageUrls = secondaryImageFiles.length
        ? await Promise.all(
            secondaryImageFiles.map(async (file) =>
              (await adminService.uploadProductImage(file)).url,
            ),
          )
        : [];
      const productData = {
        ...formData,
        purchasePrice: editingProduct ? undefined : Number(formData.purchasePrice),
        image: mainImage,
        images: [...existingSecondaryImages, ...secondaryImageUrls],
      };

      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, productData);
      } else {
        await adminService.createProduct(productData);
      }
      setIsModalOpen(false);
      void loadData(pagination.page);
    } catch (err) {
      alert('Lỗi lưu sản phẩm: ' + (err as Error).message);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Xác nhận ẩn sản phẩm "${name}" khỏi gian hàng?`)) return;
    try {
      await adminService.deleteProduct(id);
      void loadData(pagination.page);
    } catch {
      alert('Không thể ẩn sản phẩm');
    }
  };

  // Manage variants
  const handleOpenVariants = (p: AdminProduct) => {
    setActiveProductForVariants(p);
    setPurchaseCostDrafts({});
    setVariantForm({
      storage: '256GB',
      color: 'Titan Tự Nhiên',
      ram: '12GB',
      price: Number(p.salePrice || p.basePrice),
      purchasePrice: '',
      oldPrice: Number(p.basePrice),
      stock: 50,
    });
    setIsVariantModalOpen(true);
  };

  const handleSavePurchaseCost = async (variant: ProductVariantCost) => {
    if (!activeProductForVariants) return;
    const value = purchaseCostDrafts[variant.id] ??
      (variant.purchasePrice == null ? '' : String(Number(variant.purchasePrice)));
    const purchasePrice = Number(value);
    if (value.trim() === '' || !Number.isFinite(purchasePrice) || purchasePrice < 0) {
      alert('Vui lòng nhập giá vốn hợp lệ, lớn hơn hoặc bằng 0.');
      return;
    }

    setSavingPurchaseCostFor(variant.id);
    try {
      await adminService.updateVariant(variant.id, { purchasePrice });
      const updated = await adminService.getProducts({ page: pagination.page, limit: 10 });
      const current = updated.items.find((product: AdminProduct) => product.id === activeProductForVariants.id);
      setActiveProductForVariants(current ?? null);
      setPurchaseCostDrafts((drafts) => {
        const nextDrafts = { ...drafts };
        delete nextDrafts[variant.id];
        return nextDrafts;
      });
      void loadData(pagination.page);
    } catch (err) {
      alert('Lỗi cập nhật giá vốn: ' + (err as Error).message);
    } finally {
      setSavingPurchaseCostFor(null);
    }
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProductForVariants) return;
    if (
      variantForm.purchasePrice.trim() === '' ||
      !Number.isFinite(Number(variantForm.purchasePrice)) ||
      Number(variantForm.purchasePrice) < 0
    ) {
      alert('Vui lòng nhập giá vốn hợp lệ, lớn hơn hoặc bằng 0.');
      return;
    }

    try {
      await adminService.createVariant(activeProductForVariants.id, {
        ...variantForm,
        purchasePrice: Number(variantForm.purchasePrice),
      });
      // Reload product data
      const updated = await adminService.getProducts({ page: pagination.page, limit: 10 });
      const current = updated.items.find((product: AdminProduct) => product.id === activeProductForVariants.id);
      setActiveProductForVariants(current ?? null);
      void loadData(pagination.page);
    } catch (err) {
      alert('Lỗi tạo biến thể: ' + (err as Error).message);
    }
  };

  const handleDeleteVariant = async (varId: number) => {
    if (!activeProductForVariants) return;
    if (!window.confirm('Xác nhận xóa biến thể này?')) return;
    try {
      await adminService.deleteVariant(varId);
      const updated = await adminService.getProducts({ page: pagination.page, limit: 10 });
      const current = updated.items.find((product: AdminProduct) => product.id === activeProductForVariants.id);
      setActiveProductForVariants(current ?? null);
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
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm tên sản phẩm..."
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
                    <tr
                      key={p.id}
                      tabIndex={0}
                      aria-label={`Xem chi tiết sản phẩm ${p.name}`}
                      onClick={() => handleOpenDetails(p)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleOpenDetails(p);
                        }
                      }}
                      className="cursor-pointer hover:bg-blue-50/60 focus-visible:bg-blue-50/60 focus-visible:outline-hidden transition"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image || '/placeholder-phone.svg'}
                            alt={p.name}
                            referrerPolicy="no-referrer"
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
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpenVariants(p);
                            }}
                            className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition"
                            title="Quản lý biến thể dung lượng / màu"
                          >
                            <Layers size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpenEdit(p);
                            }}
                            className="p-1.5 rounded text-slate-600 hover:bg-slate-100 transition"
                            title="Chỉnh sửa sản phẩm"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(p.id, p.name);
                            }}
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

      <Dialog
        open={Boolean(selectedProduct)}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null);
        }}
      >
        {selectedProduct && (
          <div>
            <DialogHeader>
              <DialogTitle>Chi tiết sản phẩm</DialogTitle>
              <DialogDescription>
                Thông tin sản phẩm, hình ảnh, giá bán và các biến thể.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
              <img
                src={selectedProduct.image || '/placeholder-phone.svg'}
                alt={selectedProduct.name}
                referrerPolicy="no-referrer"
                className="h-44 w-full rounded-xl border border-slate-200 bg-slate-50 object-contain p-3"
              />
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="font-bold text-slate-900">{selectedProduct.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedProduct.brand?.name || 'Chưa có thương hiệu'} ·{' '}
                    {selectedProduct.category?.name || 'Chưa có danh mục'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant={selectedProduct.isActive ? 'default' : 'secondary'}>
                    {selectedProduct.isActive ? 'Đang bán' : 'Tạm ẩn'}
                  </Badge>
                  {selectedProduct.badge && <Badge variant="outline">{selectedProduct.badge}</Badge>}
                </div>
                <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-xs">
                  <div>
                    <p className="text-slate-500">Giá bán</p>
                    <p className="mt-1 font-bold text-slate-900">
                      {Number(selectedProduct.salePrice || selectedProduct.basePrice).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Giá niêm yết</p>
                    <p className="mt-1 font-semibold text-slate-700">
                      {Number(selectedProduct.basePrice).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-slate-600">
                  {selectedProduct.description || 'Chưa có mô tả sản phẩm.'}
                </p>
              </div>
            </div>

            {selectedProduct.images?.length > 0 && (
              <section className="mt-5">
                <h3 className="mb-2 text-xs font-bold text-slate-800">Ảnh phụ</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.images.map((image: { id?: number; url: string }, index: number) => (
                    <img
                      key={image.id ?? image.url}
                      src={image.url}
                      alt={`Ảnh phụ ${index + 1} của ${selectedProduct.name}`}
                      referrerPolicy="no-referrer"
                      className="h-16 w-16 rounded-lg border border-slate-200 bg-white object-contain p-1"
                    />
                  ))}
                </div>
              </section>
            )}

            {selectedProduct.specs && Object.keys(selectedProduct.specs).length > 0 && (
              <section className="mt-5">
                <h3 className="mb-2 text-xs font-bold text-slate-800">Thông số kỹ thuật</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-slate-200 p-3 text-xs sm:grid-cols-3">
                  {Object.entries(selectedProduct.specs)
                    .filter(([, value]) => ['string', 'number'].includes(typeof value))
                    .map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-slate-500">{key}</dt>
                        <dd className="mt-0.5 font-semibold text-slate-800">{String(value)}</dd>
                      </div>
                    ))}
                </dl>
              </section>
            )}

            <section className="mt-5">
              <h3 className="mb-2 text-xs font-bold text-slate-800">
                Biến thể ({selectedProduct.variants?.length || 0})
              </h3>
              <div className="max-h-48 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                {selectedProduct.variants?.length ? (
                  selectedProduct.variants.map((variant: any) => (
                    <div
                      key={variant.id}
                      className="flex flex-wrap items-center justify-between gap-2 p-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{variant.storage}</span>
                        {variant.color && <span className="ml-2 text-slate-600">{variant.color}</span>}
                        {variant.ram && <span className="ml-2 text-slate-500">RAM {variant.ram}</span>}
                        {variant.sku && <p className="mt-1 text-[11px] text-slate-400">SKU: {variant.sku}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          {Number(variant.price).toLocaleString('vi-VN')}đ
                        </p>
                        <p className="text-slate-500">
                          Giá vốn: {variant.purchasePrice == null
                            ? 'chưa nhập'
                            : `${Number(variant.purchasePrice).toLocaleString('vi-VN')}đ`}
                        </p>
                        <p className="text-slate-500">Tồn kho: {variant.inventory?.stock ?? 0}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-3 text-xs text-slate-500">Sản phẩm chưa có biến thể.</p>
                )}
              </div>
            </section>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedProduct(null)}
                className="text-xs"
              >
                Đóng
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const product = selectedProduct;
                  setSelectedProduct(null);
                  handleOpenEdit(product);
                }}
                className="gap-1.5 bg-blue-600 text-xs font-bold text-white hover:bg-blue-700"
              >
                <Edit2 size={14} /> Chỉnh sửa
              </Button>
            </DialogFooter>
          </div>
        )}
      </Dialog>

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

            {!editingProduct && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">Giá vốn biến thể mặc định (128GB) *</label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  className="text-xs"
                />
                <p className="mt-1 text-[11px] text-slate-500">Các biến thể khác cần nhập giá vốn riêng trong phần quản lý biến thể.</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ảnh chính {!editingProduct && '*'}
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 hover:border-blue-400">
                  <ImagePlus size={18} className="shrink-0 text-blue-600" />
                  <span className="min-w-0 flex-1 truncate text-xs text-slate-600">
                    {mainImageFile?.name || (formData.image ? 'Đổi ảnh chính' : 'Chọn ảnh chính để tải lên')}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setMainImageFile(file);
                      setMainImagePreview(file ? URL.createObjectURL(file) : '');
                    }}
                  />
                </label>
                {(mainImagePreview || formData.image) && (
                  <img
                    src={mainImagePreview || formData.image}
                    alt="Ảnh chính sản phẩm"
                    referrerPolicy="no-referrer"
                    className="mt-2 h-20 w-20 rounded-lg border border-slate-200 bg-white object-contain p-1"
                  />
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ảnh phụ <span className="font-normal text-slate-400">(không bắt buộc)</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 hover:border-blue-400">
                  <ImagePlus size={18} className="shrink-0 text-slate-500" />
                  <span className="min-w-0 flex-1 truncate text-xs text-slate-600">
                    {secondaryImageFiles.length
                      ? `Đã chọn ${secondaryImageFiles.length} ảnh`
                      : 'Chọn một hoặc nhiều ảnh phụ'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(event) =>
                      setSecondaryImageFiles(Array.from(event.target.files || []))
                    }
                  />
                </label>
                {existingSecondaryImages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {existingSecondaryImages.map((url, index) => (
                      <div key={`${url}-${index}`} className="relative">
                        <img
                          src={url}
                          alt={`Ảnh phụ ${index + 1}`}
                          referrerPolicy="no-referrer"
                          className="h-16 w-16 rounded border border-slate-200 object-cover"
                        />
                        <button
                          type="button"
                          aria-label={`Xóa ảnh phụ ${index + 1}`}
                          onClick={() =>
                            setExistingSecondaryImages((images) =>
                              images.filter((_, imageIndex) => imageIndex !== index),
                            )
                          }
                          className="absolute -right-1.5 -top-1.5 rounded-full bg-white p-0.5 text-rose-600 shadow"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {secondaryImageFiles.length > 0 && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    {secondaryImageFiles.map((file) => file.name).join(', ')}
                  </p>
                )}
              </div>
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
            <Button type="submit" disabled={isSavingProduct} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
              {isSavingProduct ? 'Đang tải ảnh và lưu...' : 'Lưu sản phẩm'}
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
              {activeProductForVariants?.variants?.map((v) => (
                <div key={v.id} className="p-2.5 flex flex-wrap items-center justify-between gap-2 hover:bg-slate-50">
                  <div>
                    <span className="font-extrabold text-blue-600 mr-2">{v.storage}</span>
                    <span className="font-medium text-slate-700">{v.color}</span>
                    <span className="text-slate-400 text-[11px] ml-2">SKU: {v.sku}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{Number(v.price).toLocaleString('vi-VN')}đ</span>
                    <span className="text-slate-500 font-semibold">{v.inventory?.stock ?? 0} máy</span>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        required
                        aria-label={`Giá vốn ${v.storage} ${v.color}`}
                        placeholder="Giá vốn"
                        value={purchaseCostDrafts[v.id] ?? (v.purchasePrice == null ? '' : String(Number(v.purchasePrice)))}
                        onChange={(event) => setPurchaseCostDrafts({
                          ...purchaseCostDrafts,
                          [v.id]: event.target.value,
                        })}
                        className="h-7 w-28 text-[11px]"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={savingPurchaseCostFor === v.id}
                        onClick={() => void handleSavePurchaseCost(v)}
                        className="h-7 px-2 text-[10px]"
                      >
                        {savingPurchaseCostFor === v.id ? 'Lưu...' : 'Lưu giá vốn'}
                      </Button>
                    </div>
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

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                <label className="font-semibold text-slate-600 block mb-0.5">Giá nhập / giá vốn (VND)</label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={variantForm.purchasePrice}
                  onChange={(e) => setVariantForm({ ...variantForm, purchasePrice: e.target.value })}
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
