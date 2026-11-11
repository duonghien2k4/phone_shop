import { api } from '@/lib/api-client';

export interface DashboardData {
  year: number;
  overview: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    totalProducts: number;
    lowStockVariants: number;
    totalCustomers: number;
    completedOrders: number;
    inventoryTotalVariants: number;
    inventoryHealthyVariants: number;
    yearToDateRevenue: number;
    yearToDateGrossProfit: number;
    yearToDateGrossMargin: number;
    yearToDatePaidOrders: number;
    yearToDatePaidOrdersWithCost: number;
    yearToDatePaidOrdersMissingCost: number;
  };
  recentOrders: {
    id: number;
    shippingAddress?: { name?: string; phone?: string } | null;
    user?: {
      profile?: { fullName?: string | null } | null;
      email?: string | null;
    } | null;
    items?: { productName: string }[];
    total: number | string;
    paymentMethod: string;
    status: string;
  }[];
  popularItems: {
    productName: string;
    _sum: { quantity: number | null; total: number | null };
  }[];
  monthlyData: {
    month: string;
    revenue: number;
    grossProfit: number;
    orders: number;
  }[];
  paymentMethodData: {
    paymentMethod: string;
    revenue: number;
    orders: number;
  }[];
}

export const adminService = {
  // A. Dashboard
  getDashboardStats: async (): Promise<DashboardData> => {
    return api.get<DashboardData>('/admin/dashboard', { skipAuth: true });
  },

  // B. Kinh doanh
  // 1. Sản phẩm & Biến thể
  getProducts: async (params: { page?: number; limit?: number; search?: string; categoryId?: number; brandId?: number }) => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.search) q.set('search', params.search);
    if (params.categoryId) q.set('categoryId', String(params.categoryId));
    if (params.brandId) q.set('brandId', String(params.brandId));
    return api.get<any>(`/admin/products?${q.toString()}`);
  },

  createProduct: async (data: any) => {
    return api.post<any>('/admin/products', data);
  },

  uploadProductImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string }>('/admin/products/images/upload', formData);
  },

  updateProduct: async (id: number, data: any) => {
    return api.patch<any>(`/admin/products/${id}`, data);
  },

  deleteProduct: async (id: number) => {
    return api.delete<any>(`/admin/products/${id}`);
  },

  createVariant: async (productId: number, data: any) => {
    return api.post<any>(`/admin/products/${productId}/variants`, data);
  },

  updateVariant: async (id: number, data: any) => {
    return api.patch<any>(`/admin/variants/${id}`, data);
  },

  deleteVariant: async (id: number) => {
    return api.delete<any>(`/admin/variants/${id}`);
  },

  // 2. Thương hiệu & Danh mục
  getBrands: async () => {
    return api.get<any[]>('/admin/brands');
  },

  createBrand: async (data: any) => {
    return api.post<any>('/admin/brands', data);
  },

  updateBrand: async (id: number, data: any) => {
    return api.patch<any>(`/admin/brands/${id}`, data);
  },

  deleteBrand: async (id: number) => {
    return api.delete<any>(`/admin/brands/${id}`);
  },

  getCategories: async () => {
    return api.get<any[]>('/admin/categories');
  },

  createCategory: async (data: any) => {
    return api.post<any>('/admin/categories', data);
  },

  updateCategory: async (id: number, data: any) => {
    return api.patch<any>(`/admin/categories/${id}`, data);
  },

  deleteCategory: async (id: number) => {
    return api.delete<any>(`/admin/categories/${id}`);
  },

  // 3. Kho hàng & Tồn kho
  getInventory: async (params: { page?: number; limit?: number; search?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.search) q.set('search', params.search);
    if (params.status) q.set('status', params.status);
    return api.get<any>(`/admin/inventory?${q.toString()}`, { skipAuth: true });
  },

  updateInventoryStock: async (id: number, stock: number) => {
    return api.patch<any>(`/admin/inventory/${id}`, { stock }, { skipAuth: true });
  },

  uploadReceiptImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string }>('/admin/inventory/receipts/images/upload', formData);
  },

  createStockReceipt: async (data: {
    supplier?: string;
    billImageUrl?: string;
    ocrText?: string;
    items: { variantId: number; quantity: number; unitCost: number }[];
  }) => api.post<any>('/admin/inventory/receipts', data),

  // 4. Đơn hàng
  getOrders: async (params: { page?: number; limit?: number; search?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.search) q.set('search', params.search);
    if (params.status) q.set('status', params.status);
    return api.get<any>(`/admin/orders?${q.toString()}`, { skipAuth: true });
  },

  getOrderById: async (id: number) => {
    return api.get<any>(`/admin/orders/${id}`, { skipAuth: true });
  },

  updateOrderStatus: async (id: number, status: string, paymentStatus?: string) => {
    return api.patch<any>(`/admin/orders/${id}/status`, { status, paymentStatus }, { skipAuth: true });
  },

  // 5. Thanh toán
  getPayments: async (params: { page?: number; limit?: number; method?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.method) q.set('method', params.method);
    if (params.status) q.set('status', params.status);
    return api.get<any>(`/admin/payments?${q.toString()}`, { skipAuth: true });
  },

  updatePaymentStatus: async (id: number, status: string) => {
    return api.patch<any>(`/admin/payments/${id}/status`, { status }, { skipAuth: true });
  },

  // C. Marketing
  // 1. Voucher
  getVouchers: async (params: { page?: number; limit?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.search) q.set('search', params.search);
    return api.get<any>(`/admin/vouchers?${q.toString()}`, { skipAuth: true });
  },

  createVoucher: async (data: any) => {
    return api.post<any>('/admin/vouchers', data, { skipAuth: true });
  },

  updateVoucher: async (id: number, data: any) => {
    return api.patch<any>(`/admin/vouchers/${id}`, data, { skipAuth: true });
  },

  deleteVoucher: async (id: number) => {
    return api.delete<any>(`/admin/vouchers/${id}`, { skipAuth: true });
  },

  // 2. Reviews
  getReviews: async (params: { page?: number; limit?: number; rating?: number }) => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.rating) q.set('rating', String(params.rating));
    return api.get<any>(`/admin/reviews?${q.toString()}`, { skipAuth: true });
  },

  toggleReviewVisibility: async (id: number, isVisible: boolean) => {
    return api.patch<any>(`/admin/reviews/${id}/visibility`, { isVisible }, { skipAuth: true });
  },

  deleteReview: async (id: number) => {
    return api.delete<any>(`/admin/reviews/${id}`, { skipAuth: true });
  },

  // D. Dịch vụ điện thoại
  // 1. Đối tác trả góp
  getFinancePartners: async () => {
    return api.get<any[]>('/admin/installment/partners', { skipAuth: true });
  },

  createFinancePartner: async (data: any) => {
    return api.post<any>('/admin/installment/partners', data, { skipAuth: true });
  },

  updateFinancePartner: async (id: string, data: any) => {
    return api.patch<any>(`/admin/installment/partners/${id}`, data, { skipAuth: true });
  },

  deleteFinancePartner: async (id: string) => {
    return api.delete<any>(`/admin/installment/partners/${id}`, { skipAuth: true });
  },

  // 2. Hồ sơ trả góp
  getInstallmentApplications: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    partnerId?: string;
    search?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.status) q.set('status', params.status);
    if (params?.partnerId) q.set('partnerId', params.partnerId);
    if (params?.search) q.set('search', params.search);
    return api.get<{
      items: any[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      statusCounts: Record<string, number>;
    }>(`/admin/installment/applications?${q.toString()}`, { skipAuth: true });
  },

  getInstallmentApplicationById: async (id: number) => {
    return api.get<any>(`/admin/installment/applications/${id}`, { skipAuth: true });
  },

  claimInstallmentApplication: async (id: number) => {
    return api.post<any>(`/admin/installment/applications/${id}/claim`, {}, { skipAuth: true });
  },

  requestInstallmentInfo: async (
    id: number,
    data: { reason: string; checklist?: string[]; notes?: string },
  ) => {
    return api.post<any>(`/admin/installment/applications/${id}/request-info`, data, { skipAuth: true });
  },

  submitInstallmentToPartner: async (id: number) => {
    return api.post<any>(`/admin/installment/applications/${id}/submit-to-partner`, {}, { skipAuth: true });
  },

  recordInstallmentDecision: async (
    id: number,
    data: {
      decision: 'APPROVED' | 'REJECTED';
      decisionSource: 'INTERNAL' | 'PARTNER';
      reason: string;
      referenceCode?: string;
    },
  ) => {
    return api.post<any>(`/admin/installment/applications/${id}/record-decision`, data, { skipAuth: true });
  },

  linkInstallmentOrder: async (id: number, orderId: number) => {
    return api.post<any>(`/admin/installment/applications/${id}/link-order`, { orderId }, { skipAuth: true });
  },

  cancelInstallmentApplication: async (id: number, reason?: string) => {
    return api.post<any>(`/admin/installment/applications/${id}/cancel`, { reason }, { skipAuth: true });
  },

  updateInstallmentStatus: async (id: string, status: string, note?: string) => {
    return api.patch<any>(`/admin/installment/applications/${id}/status`, { status, note }, { skipAuth: true });
  },

  // 3. Thu cũ đổi mới
  getTradeInRequests: async (status?: string) => {
    const q = status ? `?status=${status}` : '';
    return api.get<any[]>(`/admin/trade-in/requests${q}`, { skipAuth: true });
  },

  updateTradeInRequest: async (id: string, status: string, estimatedPrice?: number, note?: string) => {
    return api.patch<any>(`/admin/trade-in/requests/${id}`, { status, estimatedPrice, note }, { skipAuth: true });
  },

  // 4. Bảo hành & Đổi trả
  getWarrantyRecords: async (search?: string) => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return api.get<any[]>(`/admin/warranty/records${q}`, { skipAuth: true });
  },

  createWarrantyRecord: async (data: any) => {
    return api.post<any>('/admin/warranty/records', data, { skipAuth: true });
  },

  updateWarrantyRecord: async (id: string, data: any) => {
    return api.patch<any>(`/admin/warranty/records/${id}`, data, { skipAuth: true });
  },

  // E. Vận hành - Trợ lý AI
  getAiMonitoringStats: async () => {
    return api.get<any>('/admin/ai/monitoring', { skipAuth: true });
  },

  getAiFeedbacks: async (params: { page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    return api.get<any>(`/admin/ai/feedbacks?${q.toString()}`, { skipAuth: true });
  },
};
