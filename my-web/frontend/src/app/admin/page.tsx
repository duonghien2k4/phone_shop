'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Box,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './page.module.css';

type Inventory = { stock: number; status: string } | null;
type Product = {
  id: number;
  name: string;
  slug: string;
  basePrice: number | string;
  salePrice: number | string | null;
  isFeatured: boolean;
  brand: { name: string };
  category: { name: string };
  variants: Array<{ inventory: Inventory }>;
};

type ProductResponse = {
  items: Product[];
  pagination: { total: number };
};

function formatPrice(value: number | string | null) {
  if (value === null) return '-';
  return `${Number(value).toLocaleString('vi-VN')}đ`;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isInitialized, isAdmin, isStaff } = useAuth();
  const clearAuth = useAuthStore((state) => state.logout);
  const [isPreview] = useState(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === '1',
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);

  const loadProducts = async (query = '') => {
    setIsLoading(true);
    setError('');
    try {
      const result = await api.get<ProductResponse>(
        `/products?limit=8${query ? `&search=${encodeURIComponent(query)}` : ''}`,
      );
      setProducts(result.items);
      setTotalProducts(result.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isPreview && isInitialized && !isAdmin && !isStaff) {
      router.replace('/login');
      return;
    }
    if (isPreview || (isInitialized && (isAdmin || isStaff))) {
      void (async () => {
        await loadProducts();
      })();
    }
  }, [isInitialized, isAdmin, isStaff, isPreview, router]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadProducts(search.trim());
  };

  const handleDeactivate = async (product: Product) => {
    if (!window.confirm(`Ẩn sản phẩm "${product.name}" khỏi cửa hàng?`)) return;
    setActionId(product.id);
    try {
      await api.delete(`/products/${product.id}`);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setTotalProducts((current) => Math.max(0, current - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật sản phẩm');
    } finally {
      setActionId(null);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.replace('/login');
  };

  if (!isPreview && (!isInitialized || (!isAdmin && !isStaff))) {
    return (
      <main className={styles.loadingScreen}>
        <ShieldCheck size={28} />
        <p>Đang xác thực quyền truy cập...</p>
      </main>
    );
  }

  const stockCount = products.reduce(
    (total, product) =>
      total + product.variants.reduce((variantTotal, variant) => variantTotal + (variant.inventory?.stock ?? 0), 0),
    0,
  );

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brandMark}>
          <span className={styles.brandIcon}>S</span>
          <div>
            <strong>Sóc Mobile</strong>
            <small>Control room</small>
          </div>
        </div>

        <nav className={styles.navigation} aria-label="Điều hướng quản trị">
          <span className={styles.navLabel}>TỔNG QUAN</span>
          <button className={`${styles.navItem} ${styles.navItemActive}`} type="button">
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className={styles.navItem} type="button">
            <Package size={18} /> Sản phẩm <span>Đang dùng</span>
          </button>
          <button className={styles.navItem} type="button">
            <ShoppingCart size={18} /> Đơn hàng <span>0</span>
          </button>
          <button className={styles.navItem} type="button">
            <Users size={18} /> Khách hàng <span>0</span>
          </button>
        </nav>

        <div className={styles.sidebarBottom}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} /> Về cửa hàng
          </Link>
          <button className={styles.logoutButton} type="button" onClick={handleLogout}>
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      <section className={styles.content}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.eyebrow}>THỨ BA, 22 THÁNG 9, 2026</p>
            <h1>Xin chào, {user?.fullName || user?.email}</h1>
          </div>
          <div className={styles.profileBadge}>
            <span>{user?.fullName?.slice(0, 1).toUpperCase() || 'A'}</span>
            <div>
              <strong>{user?.role}</strong>
              <small>Đang hoạt động</small>
            </div>
            <ChevronRight size={16} />
          </div>
        </header>

        <div className={styles.pageHeading}>
          <div>
            <p className={styles.eyebrow}>OPERATIONS / CATALOG</p>
            <h2>Trung tâm quản trị</h2>
            <p className={styles.muted}>Theo dõi danh mục và tồn kho từ một nơi.</p>
          </div>
          <button className={styles.refreshButton} type="button" onClick={() => void loadProducts(search)} disabled={isLoading}>
            <RefreshCw size={16} className={isLoading ? styles.spinning : ''} /> Làm mới
          </button>
        </div>
        {isPreview && <div className={styles.previewNotice}>Chế độ xem thử: thao tác dữ liệu cần đăng nhập Admin và backend có database.</div>}

        <section className={styles.statsGrid} aria-label="Tổng quan số liệu">
          <article className={styles.statCard}>
            <span className={styles.statIconBlue}><Package size={18} /></span>
            <div><small>TỔNG SẢN PHẨM</small><strong>{totalProducts}</strong><p>Đang kinh doanh</p></div>
          </article>
          <article className={styles.statCard}>
            <span className={styles.statIconGreen}><Box size={18} /></span>
            <div><small>TỒN KHO ĐANG TẢI</small><strong>{stockCount.toLocaleString('vi-VN')}</strong><p>Trong 8 sản phẩm gần nhất</p></div>
          </article>
          <article className={styles.statCard}>
            <span className={styles.statIconOrange}><ShoppingCart size={18} /></span>
            <div><small>ĐƠN HÀNG HÔM NAY</small><strong>0</strong><p>Chưa kết nối Order API</p></div>
          </article>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><h3>Danh mục sản phẩm</h3><p>Danh sách hiện tại từ backend</p></div>
            <form className={styles.searchForm} onSubmit={handleSearch}>
              <Search size={17} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên sản phẩm..." aria-label="Tìm sản phẩm" />
            </form>
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}
          {isLoading ? (
            <div className={styles.emptyState}>Đang tải dữ liệu sản phẩm...</div>
          ) : products.length === 0 ? (
            <div className={styles.emptyState}>Chưa có sản phẩm phù hợp.</div>
          ) : (
            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th>SẢN PHẨM</th><th>THƯƠNG HIỆU</th><th>GIÁ BÁN</th><th>TỒN KHO</th><th>TRẠNG THÁI</th><th /></tr></thead>
                <tbody>
                  {products.map((product) => {
                    const stock = product.variants.reduce((total, variant) => total + (variant.inventory?.stock ?? 0), 0);
                    return <tr key={product.id}>
                      <td><strong>{product.name}</strong><small>{product.category.name}</small></td>
                      <td>{product.brand.name}</td>
                      <td><strong>{formatPrice(product.salePrice ?? product.basePrice)}</strong></td>
                      <td>{stock}</td>
                      <td><span className={stock > 0 ? styles.statusActive : styles.statusWarning}>{stock > 0 ? 'Đang bán' : 'Hết hàng'}</span></td>
                      <td><button className={styles.deleteButton} type="button" onClick={() => void handleDeactivate(product)} disabled={actionId === product.id}>Ẩn</button></td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
