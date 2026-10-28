'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, Tag, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { adminService } from '@/services/admin.service';

export const BrandsCategoriesTab: React.FC = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Brand modal
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [brandName, setBrandName] = useState('');
  const [brandDesc, setBrandDesc] = useState('');

  // Category modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [b, c] = await Promise.all([
        adminService.getBrands(),
        adminService.getCategories(),
      ]);
      setBrands(b || []);
      setCategories(c || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Brand actions
  const handleOpenBrandModal = (b?: any) => {
    setEditingBrand(b || null);
    setBrandName(b?.name || '');
    setBrandDesc(b?.description || '');
    setBrandModalOpen(true);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await adminService.updateBrand(editingBrand.id, { name: brandName, description: brandDesc });
      } else {
        await adminService.createBrand({ name: brandName, description: brandDesc });
      }
      setBrandModalOpen(false);
      void loadData();
    } catch (err) {
      alert('Lỗi lưu thương hiệu: ' + (err as Error).message);
    }
  };

  const handleDeleteBrand = async (id: number, name: string) => {
    if (!window.confirm(`Xóa thương hiệu "${name}"?`)) return;
    try {
      await adminService.deleteBrand(id);
      void loadData();
    } catch (err) {
      alert('Không thể xóa thương hiệu đang có sản phẩm liên kết');
    }
  };

  // Category actions
  const handleOpenCatModal = (c?: any) => {
    setEditingCat(c || null);
    setCatName(c?.name || '');
    setCatDesc(c?.description || '');
    setCatModalOpen(true);
  };

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await adminService.updateCategory(editingCat.id, { name: catName, description: catDesc });
      } else {
        await adminService.createCategory({ name: catName, description: catDesc });
      }
      setCatModalOpen(false);
      void loadData();
    } catch (err) {
      alert('Lỗi lưu danh mục: ' + (err as Error).message);
    }
  };

  const handleDeleteCat = async (id: number, name: string) => {
    if (!window.confirm(`Xóa danh mục "${name}"?`)) return;
    try {
      await adminService.deleteCategory(id);
      void loadData();
    } catch (err) {
      alert('Không thể xóa danh mục đang có sản phẩm liên kết');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Thương Hiệu & Danh Mục</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý các hãng sản xuất điện thoại (Apple, Samsung...) và phân loại sản phẩm.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bảng Thương hiệu */}
        <Card className="p-5 border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Tag size={15} className="text-blue-600" /> Danh Sách Thương Hiệu
              </h2>
              <p className="text-xs text-slate-500">Các hãng điện tử được phân phối tại Sóc Mobile</p>
            </div>
            <Button
              size="sm"
              onClick={() => handleOpenBrandModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-7 gap-1"
            >
              <Plus size={13} /> Thêm hãng
            </Button>
          </div>

          <div className="divide-y divide-slate-100 mt-3 text-xs">
            {brands.map((b) => (
              <div key={b.id} className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-md transition">
                <div>
                  <p className="font-bold text-slate-800">{b.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {b._count?.products ?? 0} sản phẩm đang kinh doanh
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenBrandModal(b)}
                    className="p-1 text-slate-600 hover:text-blue-600 rounded"
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBrand(b.id, b.name)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                    title="Xóa"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Bảng Danh mục */}
        <Card className="p-5 border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Layers size={15} className="text-indigo-600" /> Danh Mục Sản Phẩm
              </h2>
              <p className="text-xs text-slate-500">Phân loại ngành hàng trên thanh điều hướng</p>
            </div>
            <Button
              size="sm"
              onClick={() => handleOpenCatModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-7 gap-1"
            >
              <Plus size={13} /> Thêm mục
            </Button>
          </div>

          <div className="divide-y divide-slate-100 mt-3 text-xs">
            {categories.map((c) => (
              <div key={c.id} className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-md transition">
                <div>
                  <p className="font-bold text-slate-800">{c.name}</p>
                  <p className="text-[11px] text-slate-400">{c.description || 'Không có mô tả'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-500 mr-2 bg-slate-100 px-2 py-0.5 rounded">
                    {c._count?.products ?? 0} máy
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenCatModal(c)}
                    className="p-1 text-slate-600 hover:text-blue-600 rounded"
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCat(c.id, c.name)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                    title="Xóa"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Brand Modal */}
      <Dialog open={brandModalOpen} onOpenChange={setBrandModalOpen}>
        <form onSubmit={handleSaveBrand} className="text-xs space-y-4">
          <DialogHeader>
            <DialogTitle>{editingBrand ? 'Chỉnh Sửa Thương Hiệu' : 'Thêm Thương Hiệu Mới'}</DialogTitle>
            <DialogDescription>Nhập thông tin hãng sản xuất thiết bị.</DialogDescription>
          </DialogHeader>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Tên thương hiệu *</label>
            <Input
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Apple, Samsung, Xiaomi..."
              className="text-xs"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Mô tả ngắn</label>
            <Input
              value={brandDesc}
              onChange={(e) => setBrandDesc(e.target.value)}
              placeholder="Chính hãng nhập khẩu FPT/Synnex..."
              className="text-xs"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setBrandModalOpen(false)}>Hủy</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">Lưu</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={catModalOpen} onOpenChange={setCatModalOpen}>
        <form onSubmit={handleSaveCat} className="text-xs space-y-4">
          <DialogHeader>
            <DialogTitle>{editingCat ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}</DialogTitle>
            <DialogDescription>Nhập tên và phân loại ngành hàng.</DialogDescription>
          </DialogHeader>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Tên danh mục *</label>
            <Input
              required
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="Điện thoại, Laptop, Tablet..."
              className="text-xs"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Mô tả danh mục</label>
            <Input
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              placeholder="Phân loại các dòng điện thoại thông minh..."
              className="text-xs"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCatModalOpen(false)}>Hủy</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Lưu</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
};

