import { api } from '@/lib/api-client';
import { FEATURED_PRODUCTS } from '@/data/mock-products';
import { MockProduct } from '@/types/product';

export interface ProductReview {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  isVisible: boolean;
  user: {
    id: number;
    email: string;
    profile: {
      fullName: string | null;
      avatarUrl: string | null;
    } | null;
  };
}

export interface ProductReviewsResponse {
  reviews: ProductReview[];
  total: number;
  avgRating: number;
}

interface ProductQuery {
  search?: string;
  brand?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface ProductApiItem {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  basePrice?: number | string | null;
  salePrice?: number | string | null;
  image?: string | null;
  badge?: string | null;
  badgeType?: 'success' | 'warning' | 'danger' | 'info' | string | null;
  soldCount?: string | null;
  promotionText?: string | null;
  installment?: boolean | null;
  fastDelivery?: boolean | null;
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
    id?: number | null;
    productId?: number | null;
    storage?: string | null;
    color?: string | null;
    price?: number | string | null;
    oldPrice?: number | string | null;
    imageUrl?: string | null;
    sku?: string | null;
    ram?: string | null;
    stock?: number | null;
    inventory?: {
      stock?: number | null;
      reserved?: number | null;
      status?: string | null;
    } | null;
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

export const normalizeProduct = (item: ProductApiItem): MockProduct => {
  const brandName = item.brand?.name || 'Khác';
  const categoryName = item.category?.name || 'Điện thoại';
  const firstVariant = item.variants?.[0];
  const price = toNumber(item.salePrice ?? firstVariant?.price ?? item.basePrice, 0);
  const image = item.image || item.images?.[0]?.url || firstVariant?.imageUrl || FEATURED_PRODUCTS[0]?.image || '';
  const discount = item.salePrice && item.basePrice
    ? Math.max(0, Math.round(((toNumber(item.basePrice) - toNumber(item.salePrice)) / toNumber(item.basePrice)) * 100))
    : 0;

  return {
    id: Number(item.id),
    name: item.name,
    slug: item.slug,
    description: item.description || 'Sản phẩm điện thoại chính hãng',
    price,
    badge: item.badge || (discount > 0 ? `Giảm -${discount}%` : 'Mới'),
    badgeType:
      item.badgeType === 'success' ||
      item.badgeType === 'warning' ||
      item.badgeType === 'danger' ||
      item.badgeType === 'info'
        ? item.badgeType
        : discount > 0
          ? 'danger'
          : 'success',
    image,
    images: (item.images ?? [])
      .map((productImage) => productImage.url)
      .filter((url): url is string => Boolean(url && url !== image)),
    brand: brandName,
    category: categoryName,
    tags: item.tags?.length ? item.tags : [brandName.toLowerCase(), categoryName.toLowerCase()],
    rating: Number(item.rating ?? 5),
    reviewCount: Number(item.reviewCount ?? 0),
    soldCount: item.soldCount || '1,5k',
    promotionText: item.promotionText || 'Ưu đãi thanh toán quét mã QR & Miễn phí giao hàng hỏa tốc trong 2 giờ',
    installment: item.installment ?? true,
    fastDelivery: item.fastDelivery ?? true,
    specs: {
      screen: item.specs?.screen || '',
      chip: item.specs?.chip || '',
      ram: item.specs?.ram || '',
    },
    variants: (item.variants && item.variants.length > 0
      ? item.variants
      : [{ storage: '128GB', price, oldPrice: price }]
    ).map((variant, idx) => {
      const variantStock =
        variant.inventory?.stock !== undefined && variant.inventory?.stock !== null
          ? Math.max(
              0,
              Number(variant.inventory.stock) -
                Number(variant.inventory.reserved ?? 0),
            )
          : variant.stock !== undefined && variant.stock !== null
            ? Number(variant.stock)
            : 10;
      return {
        id: variant.id ? Number(variant.id) : (Number(item.id) * 10 + idx),
        productId: Number(item.id),
        storage: variant.storage || '128GB',
        color: variant.color || undefined,
        sku: variant.sku || undefined,
        imageUrl: variant.imageUrl || undefined,
        ram: variant.ram || undefined,
        price: toNumber(variant.price, price),
        oldPrice: variant.oldPrice ? toNumber(variant.oldPrice, price) : (variant.price ? toNumber(variant.price, price) : price),
        stock: variantStock,
        inventory: variant.inventory
          ? {
              stock: variantStock,
              reserved: Number(variant.inventory.reserved ?? 0),
              status: variant.inventory.status || (variantStock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK'),
            }
          : {
              stock: variantStock,
              status: variantStock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
            },
      };
    }),
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

  getProductReviews: async (slug: string): Promise<ProductReviewsResponse> => {
    return api.get<ProductReviewsResponse>(`/products/${encodeURIComponent(slug)}/reviews`, {
      skipAuth: true,
    });
  },

  submitReview: async (slug: string, data: { rating: number; comment: string }): Promise<ProductReview> => {
    return api.post<ProductReview>(`/products/${encodeURIComponent(slug)}/reviews`, data);
  },

  canReview: async (slug: string): Promise<{ canReview: boolean; reason?: string }> => {
    return api.get<{ canReview: boolean; reason?: string }>(
      `/products/${encodeURIComponent(slug)}/can-review`,
    );
  },
};
