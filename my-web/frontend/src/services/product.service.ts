import { api } from '@/lib/api-client';
import { FEATURED_PRODUCTS } from '@/data/mock-products';
import { MockProduct } from '@/types/product';

interface ProductQuery {
  search?: string;
  brand?: string;
  category?: string;
  page?: number;
  limit?: number;
}

interface ProductApiItem {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  basePrice?: number | string | null;
  salePrice?: number | string | null;
  rating?: number | string | null;
  reviewCount?: number | string | null;
  tags?: string[] | null;
  brand?: {
    name?: string | null;
  } | null;
  category?: {
    name?: string | null;
  } | null;
  images?: Array<{ url?: string | null }> | null;
  variants?: Array<{
    storage?: string | null;
    price?: number | string | null;
    imageUrl?: string | null;
  }> | null;
  specs?: {
    screen?: string | null;
    chip?: string | null;
    ram?: string | null;
  } | null;
}

const toNumber = (value: number | string | null | undefined, fallback = 0): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const normalizeProduct = (item: ProductApiItem): MockProduct => {
  const brandName = item.brand?.name || 'Khác';
  const categoryName = item.category?.name || 'Điện thoại';
  const firstVariant = item.variants?.[0];
  const price = toNumber(item.salePrice ?? firstVariant?.price ?? item.basePrice, 0);
  const image = item.images?.[0]?.url || firstVariant?.imageUrl || FEATURED_PRODUCTS[0]?.image || '';
  const discount = item.salePrice && item.basePrice
    ? Math.max(0, Math.round(((toNumber(item.basePrice) - toNumber(item.salePrice)) / toNumber(item.basePrice)) * 100))
    : 0;

  return {
    id: Number(item.id),
    name: item.name,
    slug: item.slug,
    description: item.description || 'Sản phẩm điện thoại chính hãng',
    price,
    badge: discount > 0 ? `Giảm -${discount}%` : 'Mới',
    badgeType: discount > 0 ? 'danger' : 'success',
    image,
    brand: brandName,
    category: categoryName,
    tags: item.tags?.length ? item.tags : [brandName.toLowerCase(), categoryName.toLowerCase()],
    rating: Number(item.rating ?? 5),
    reviewCount: Number(item.reviewCount ?? 0),
    soldCount: '1,5k',
    promotionText: 'Ưu đãi thanh toán quét mã QR & Miễn phí giao hàng hỏa tốc trong 2 giờ',
    installment: false,
    fastDelivery: true,
    specs: {
      screen: item.specs?.screen || '',
      chip: item.specs?.chip || '',
      ram: item.specs?.ram || '',
    },
    variants: (item.variants || [{ storage: '128GB', price, oldPrice: price }]).map((variant) => ({
      storage: variant.storage || '128GB',
      price: toNumber(variant.price, price),
      oldPrice: variant.price ? toNumber(variant.price, price) : price,
    })),
  };
};

const fallbackProducts = (): MockProduct[] => FEATURED_PRODUCTS;

export const productService = {
  getProducts: async (query: ProductQuery = {}): Promise<MockProduct[]> => {
    try {
      const params = new URLSearchParams();
      if (query.search) params.set('search', query.search);
      if (query.brand) params.set('brand', query.brand);
      if (query.category) params.set('category', query.category);
      if (query.page) params.set('page', String(query.page));
      if (query.limit) params.set('limit', String(query.limit));

      const response = await api.get<{ items?: ProductApiItem[]; data?: ProductApiItem[] }>(`/products${params.toString() ? `?${params.toString()}` : ''}`, {
        skipAuth: true,
      });

      const list = Array.isArray(response?.items)
        ? response.items
        : Array.isArray(response?.data)
          ? response.data
          : [];

      if (!list.length) return fallbackProducts();
      return list.map(normalizeProduct);
    } catch {
      return fallbackProducts();
    }
  },

  getProductBySlug: async (slug: string): Promise<MockProduct | null> => {
    try {
      const response = await api.get<ProductApiItem>(`/products/${encodeURIComponent(slug)}`, {
        skipAuth: true,
      });
      return normalizeProduct(response);
    } catch {
      const product = FEATURED_PRODUCTS.find((item) => item.slug === slug || item.name.toLowerCase().includes(slug.toLowerCase()));
      return product ?? null;
    }
  },
};
