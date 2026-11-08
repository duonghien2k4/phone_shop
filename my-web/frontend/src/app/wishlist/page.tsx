'use client';

import Link from 'next/link';
import { Heart, Loader2, ShoppingBag } from 'lucide-react';
import { SignInButton } from '@clerk/nextjs';
import Header from '@/components/base/Header';
import Footer from '@/components/base/Footer';
import CompactProductCard from '@/components/features/product/CompactProductCard';
import { useWishlist } from '@/hooks/useWishlist';
import { normalizeProduct } from '@/services/product.service';

export default function WishlistPage() {
  const { items, isLoading, hasFetched, isLoaded, isSignedIn } = useWishlist();
  const products = items.map((item) => normalizeProduct(item.product));
  const isLoadingWishlist = !isLoaded || (isSignedIn && (isLoading || !hasFetched));

  return (
    <div className="storefront-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, width: '100%', maxWidth: 1200, margin: '0 auto', padding: '32px 16px 48px' }}>
        <nav aria-label="Điều hướng" style={{ marginBottom: 12, color: 'var(--text-muted)', fontSize: 13 }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Trang chủ</Link>
          <span aria-hidden="true"> / </span>
          <span style={{ color: 'var(--text-primary)' }}>Sản phẩm yêu thích</span>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Heart size={26} fill="#e11d48" color="#e11d48" />
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 26, fontWeight: 800 }}>
            Sản phẩm yêu thích
          </h1>
          {!isLoadingWishlist && isSignedIn && (
            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>({products.length})</span>
          )}
        </div>

        {isLoadingWishlist ? (
          <div role="status" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, padding: '72px 16px', color: 'var(--text-secondary)' }}>
            <Loader2 size={20} className="animate-spin" />
            <span>Đang tải danh sách yêu thích...</span>
          </div>
        ) : !isSignedIn ? (
          <section style={{ padding: '56px 24px', textAlign: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 16 }}>
            <Heart size={42} color="#e11d48" style={{ margin: '0 auto 12px' }} />
            <h2 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontSize: 20 }}>Đăng nhập để xem sản phẩm yêu thích</h2>
            <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)' }}>Danh sách yêu thích được lưu theo tài khoản của bạn.</p>
            <SignInButton mode="modal">
              <button type="button" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: 10 }}>
                Đăng nhập
              </button>
            </SignInButton>
          </section>
        ) : products.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
            {products.map((product) => (
              <CompactProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <section style={{ padding: '56px 24px', textAlign: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 16 }}>
            <ShoppingBag size={42} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <h2 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontSize: 20 }}>Bạn chưa có sản phẩm yêu thích</h2>
            <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)' }}>Chạm vào biểu tượng trái tim trên sản phẩm để lưu lại tại đây.</p>
            <Link href="/products" className="btn btn-primary" style={{ display: 'inline-flex', padding: '10px 20px', borderRadius: 10, textDecoration: 'none' }}>
              Khám phá sản phẩm
            </Link>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
