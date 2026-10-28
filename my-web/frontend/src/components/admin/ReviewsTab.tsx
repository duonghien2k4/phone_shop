'use client';

import React, { useState, useEffect } from 'react';
import { Star, Eye, EyeOff, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminService } from '@/services/admin.service';

export const ReviewsTab: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [ratingFilter, setRatingFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadReviews = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await adminService.getReviews({
        page,
        limit: 10,
        rating: ratingFilter ? Number(ratingFilter) : undefined,
      });
      let items = res.items || [];
      if (visibilityFilter === 'visible') items = items.filter((r: any) => r.isVisible);
      if (visibilityFilter === 'hidden') items = items.filter((r: any) => !r.isVisible);
      setReviews(items);
      setPagination(res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews(1);
  }, [ratingFilter, visibilityFilter]);

  const handleToggleVisibility = async (id: number, currentVisibility: boolean) => {
    try {
      await adminService.toggleReviewVisibility(id, !currentVisibility);
      void loadReviews(pagination.page);
    } catch {
      alert('Lỗi cập nhật hiển thị đánh giá');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xác nhận xoá đánh giá này? Hành động không thể hoàn tác.')) return;
    setDeletingId(id);
    try {
      await adminService.deleteReview(id);
      void loadReviews(pagination.page);
    } catch {
      alert('Lỗi xoá đánh giá');
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (count: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        fill={i < count ? 'currentColor' : 'none'}
        className={i < count ? 'text-amber-500' : 'text-slate-300'}
      />
    ));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Đánh Giá Sản Phẩm & Kiểm Duyệt</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Duyệt bình luận thực tế của khách hàng, ẩn phản hồi spam hoặc ngôn từ tiêu cực trên trang chi tiết máy.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-lg">
            Tổng: <strong>{pagination.total}</strong> đánh giá
          </span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold">Số sao:</span>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
          >
            <option value="">Tất cả</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold">Trạng thái:</span>
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
          >
            <option value="">Tất cả</option>
            <option value="visible">Đang hiển thị</option>
            <option value="hidden">Đã ẩn</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">SẢN PHẨM</th>
                <th className="py-3 px-4">KHÁCH HÀNG</th>
                <th className="py-3 px-4">SAO</th>
                <th className="py-3 px-4">NỘI DUNG</th>
                <th className="py-3 px-4">THỜI GIAN</th>
                <th className="py-3 px-4">TRẠNG THÁI</th>
                <th className="py-3 px-4 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Đang tải danh sách đánh giá...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                    Chưa có đánh giá nào phù hợp.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 max-w-[160px]">
                      <p className="truncate">{r.product?.name || 'Sản phẩm'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {r.user?.profile?.avatarUrl ? (
                          <img
                            src={r.user.profile.avatarUrl}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {(r.user?.profile?.fullName || r.user?.email || 'U').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate max-w-[120px]">
                            {r.user?.profile?.fullName || r.user?.email || 'Người dùng'}
                          </p>
                          {r.user?.profile?.fullName && (
                            <p className="text-slate-400 text-[10px] truncate max-w-[120px]">{r.user.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-0.5">{renderStars(r.rating)}</div>
                      <span className="text-amber-600 font-bold text-[11px]">{r.rating}/5</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs">
                      <p className="line-clamp-2">&ldquo;{r.comment || 'Không có bình luận chữ'}&rdquo;</p>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                      <br />
                      <span>{new Date(r.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          r.isVisible
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {r.isVisible ? 'Đang hiển thị' : 'Đã ẩn'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleVisibility(r.id, r.isVisible)}
                          className={`h-7 text-xs px-2 gap-1 font-semibold ${
                            r.isVisible ? 'text-rose-600 hover:text-rose-700' : 'text-emerald-600 hover:text-emerald-700'
                          }`}
                          title={r.isVisible ? 'Ẩn đánh giá' : 'Hiển thị đánh giá'}
                        >
                          {r.isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="h-7 text-xs px-2 gap-1 font-semibold text-slate-500 hover:text-red-600 hover:border-red-300"
                          title="Xoá đánh giá"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            <span>Trang {pagination.page} / {pagination.totalPages}</span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2"
                disabled={pagination.page <= 1 || isLoading}
                onClick={() => void loadReviews(pagination.page - 1)}
              >
                <ChevronLeft size={14} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2"
                disabled={pagination.page >= pagination.totalPages || isLoading}
                onClick={() => void loadReviews(pagination.page + 1)}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
