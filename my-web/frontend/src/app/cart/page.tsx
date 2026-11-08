'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Check, CheckCircle2, ChevronRight, LockKeyhole, MapPin,
  Minus, Plus, ShieldCheck, ShoppingCart, ShoppingBag, Tag, Trash2,
  Truck, X,
} from 'lucide-react';
import Header from '@/components/base/Header';
import Footer from '@/components/base/Footer';
import SafeImage from '@/components/base/SafeImage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { FEATURED_PRODUCTS } from '@/data/mock-products';
import { formatVND } from '@/utils/format';
import { LABELS } from '@/constants/labels';
import { toast } from '@/store/useToastStore';
import type { MockProduct } from '@/types/product';
import { useRequireClerkAuth } from '@/hooks/useRequireClerkAuth';
import { voucherService, type Voucher } from '@/services/voucher.service';

export default function CartPage() {
  const canRender = useRequireClerkAuth();
  const router = useRouter();
  const { items, totalPrice, updateQuantity, removeFromCart, addToCart } = useCart();
  const [voucher, setVoucher] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(true);
  const [voucherLoadError, setVoucherLoadError] = useState<string | null>(null);
  const [voucherRetryCount, setVoucherRetryCount] = useState(0);
  const allSelected = items.length > 0 && selected.length === items.length;

  useEffect(() => {
    if (!canRender) return;

    let isMounted = true;
    void voucherService.getAvailableVouchers()
      .then((vouchers) => {
        if (isMounted) {
          setAvailableVouchers(vouchers);
          setVoucherLoadError(null);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          const message = error instanceof Error ? error.message : 'Không thể tải voucher';
          setVoucherLoadError(message);
          toast.error(`Không thể tải voucher: ${message}`);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingVouchers(false);
      });

    return () => {
      isMounted = false;
    };
  }, [canRender, voucherRetryCount]);

  useEffect(() => {
    setSelected((current) => {
      if (current.length === 0 && items.length > 0) {
        return items.map((item) => item.variantId);
      }
      return current.filter((id) => items.some((item) => item.variantId === id));
    });
  }, [items]);

  const selectedItems = useMemo(
    () => items.filter((item) => selected.includes(item.variantId)),
    [items, selected],
  );

  const selectedCount = useMemo(
    () => selectedItems.reduce((count, item) => count + item.quantity, 0),
    [selectedItems],
  );

  const selectedSubtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [selectedItems],
  );

  const shipping = selectedSubtotal === 0 || selectedSubtotal >= 15000000 ? 0 : 30000;
  const total = Math.max(0, selectedSubtotal + shipping - discount);

  const recommendations = useMemo(
    () => FEATURED_PRODUCTS.filter((product) => !items.some((item) => item.productId === product.id)).slice(0, 4),
    [items],
  );

  const applyVoucher = () => {
    const code = voucher.trim().toUpperCase();
    if (isLoadingVouchers) {
      toast.info('Đang tải danh sách voucher, vui lòng thử lại sau giây lát');
      return;
    }
    if (selectedSubtotal === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm trước khi áp dụng mã giảm giá');
      return;
    }
    const selectedVoucher = availableVouchers.find((item) => item.code.toUpperCase() === code);
    if (!selectedVoucher) {
      toast.error(LABELS.CART.VOUCHER_INVALID);
      return;
    }

    const minimumOrderValue = Number(selectedVoucher.minOrderValue);
    if (selectedSubtotal < minimumOrderValue) {
      toast.error(`Đơn hàng tối thiểu ${formatVND(minimumOrderValue)} để sử dụng mã này`);
      return;
    }

    let voucherDiscount = selectedVoucher.discountType === 'PERCENT'
      ? Math.round((selectedSubtotal * Number(selectedVoucher.discountValue)) / 100)
      : Number(selectedVoucher.discountValue);
    if (selectedVoucher.maxDiscount !== null) {
      voucherDiscount = Math.min(voucherDiscount, Number(selectedVoucher.maxDiscount));
    }

    setDiscount(Math.min(voucherDiscount, selectedSubtotal));
    setAppliedVoucher(selectedVoucher.code);
    toast.success(LABELS.CART.VOUCHER_SUCCESS);
  };

  const handleProceedCheckout = () => {
    if (selected.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm để tiến hành đặt hàng');
      return;
    }
    const params = new URLSearchParams();
    params.set('items', selected.join(','));
    if (appliedVoucher) {
      params.set('voucher', appliedVoucher);
      params.set('discount', String(discount));
    }
    router.push(`/checkout?${params.toString()}`);
  };

  const handleProceedInstallment = () => {
    if (selected.length > 1) {
      toast.error('Vui lòng chỉ chọn 1 sản phẩm để đăng ký trả góp');
      return;
    }

    const item = items.find((cartItem) => selected.includes(cartItem.variantId));
    if (!item) {
      toast.error('Vui lòng chọn sản phẩm muốn đăng ký trả góp');
      return;
    }

    router.push(`/tra-gop/flow?step=1&cartVariantId=${item.variantId}`);
  };

  const addRecommendation = (product: MockProduct) => {
    const variant = product.variants[0];
    void addToCart({
      variantId: variant?.id ?? product.id * 10,
      productId: product.id,
      productName: product.name,
      color: variant?.color || 'Mặc định',
      storage: variant?.storage ?? 'Mặc định',
      imageUrl: variant?.imageUrl || product.image,
      price: variant?.price ?? product.price,
      quantity: 1,
    });
  };

  return (
    <div className="cart-demo-root">
      <Header />
      <main className="cart-demo-main">{!canRender ? null :
        items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="cart-demo-shell">
            <CartProgress count={items.length} />
            <div className="cart-demo-columns">
              <section className="cart-demo-list">
                <div className="cart-demo-selectbar">
                  <label><input type="checkbox" checked={allSelected} onChange={(event) => setSelected(event.target.checked ? items.map((item) => item.variantId) : [])} /><strong>Chọn tất cả ({items.length} sản phẩm)</strong></label>
                  <button type="button" disabled={!selected.length} onClick={() => { selected.forEach((id) => void removeFromCart(id)); setSelected([]); }}><Trash2 size={17} /> Xóa các mục đã chọn</button>
                </div>
                <div className="cart-demo-items">
                  {items.map((item) => (
                    <article className="cart-demo-item" key={item.variantId}>
                      <input className="cart-demo-check" type="checkbox" checked={selected.includes(item.variantId)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, item.variantId] : current.filter((id) => id !== item.variantId))} aria-label={`Chọn ${item.productName}`} />
                      <div className="cart-demo-image"><SafeImage src={item.imageUrl || ''} alt={item.productName} fill style={{ objectFit: 'contain', padding: '0.6rem' }} /></div>
                      <div className="cart-demo-product">
                        <div className="cart-demo-product-head"><div><Badge variant="outline" className="cart-demo-brand"><Check size={12} /> Chính hãng VN/A</Badge><h2>{item.productName}</h2><div className="cart-demo-attributes"><span>Dung lượng: {item.storage}</span><span>Màu: Mặc định</span></div></div><div className="cart-demo-price"><strong>{formatVND(item.price)}</strong><del>{formatVND(Math.round(item.price * 1.08))}</del><small>Tiết kiệm {formatVND(Math.round(item.price * 0.08))}</small></div></div>
                        <div className="cart-demo-gift"><Tag size={17} /><div><strong>Ưu đãi độc quyền khi mua online</strong><span>Miễn phí giao hàng và hỗ trợ kỹ thuật tận nơi</span></div></div>
                        <div className="cart-demo-item-footer"><div className="cart-demo-quantity"><button type="button" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}><Minus size={15} /></button><span>{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}><Plus size={15} /></button></div><div className="cart-demo-item-actions"><button type="button"><ShoppingBag size={16} /> Lưu lại mua sau</button><i /> <button type="button" onClick={() => void removeFromCart(item.variantId)}><Trash2 size={16} /> Xóa</button></div><strong className="cart-demo-line-total">{formatVND(item.price * item.quantity)}</strong></div>
                      </div>
                    </article>
                  ))}
                </div>
                <Link href="/shop" className="cart-demo-back"><ArrowLeft size={16} /> {LABELS.CART.CONTINUE_SHOPPING}</Link>
              </section>
              <OrderSummary
                itemCount={selectedCount}
                subtotal={selectedSubtotal}
                shipping={shipping}
                discount={discount}
                total={total}
                voucher={voucher}
                appliedVoucher={appliedVoucher}
                setVoucher={setVoucher}
                applyVoucher={applyVoucher}
                availableVouchers={availableVouchers}
                isLoadingVouchers={isLoadingVouchers}
                voucherLoadError={voucherLoadError}
                retryLoadVouchers={() => {
                  setIsLoadingVouchers(true);
                  setVoucherRetryCount((count) => count + 1);
                }}
                removeVoucher={() => {
                  setAppliedVoucher(null);
                  setDiscount(0);
                  setVoucher('');
                }}
                onCheckout={handleProceedCheckout}
                onInstallment={handleProceedInstallment}
              />
            </div>
            <RecommendationSection products={recommendations} onAdd={addRecommendation} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function CartProgress({ count }: { count: number }) {
  return <section className="cart-demo-progress"><ProgressStep active icon={<ShoppingCart size={20} />} title="1. Giỏ hàng" detail={`(${count} sản phẩm)`} /><ChevronRight /><ProgressStep icon={<MapPin size={20} />} title="2. Thông tin đặt hàng" detail="Địa chỉ & Thanh toán" /><ChevronRight /><ProgressStep icon={<CheckCircle2 size={20} />} title="3. Hoàn tất đơn hàng" detail="Xác nhận" /></section>;
}

function ProgressStep({ active, icon, title, detail }: { active?: boolean; icon: React.ReactNode; title: string; detail: string }) {
  return <div className={`cart-demo-step ${active ? 'active' : ''}`}><span>{icon}</span><strong>{title}</strong><small>{detail}</small></div>;
}

interface SummaryProps {
  itemCount: number; subtotal: number; shipping: number; discount: number; total: number; voucher: string; appliedVoucher: string | null;
  setVoucher: (value: string) => void; applyVoucher: () => void; removeVoucher: () => void; onCheckout: () => void; onInstallment: () => void;
  availableVouchers: Voucher[]; isLoadingVouchers: boolean; voucherLoadError: string | null; retryLoadVouchers: () => void;
}

function OrderSummary({ itemCount, subtotal, shipping, discount, total, voucher, appliedVoucher, setVoucher, applyVoucher, removeVoucher, onCheckout, onInstallment, availableVouchers, isLoadingVouchers, voucherLoadError, retryLoadVouchers }: SummaryProps) {
  return <aside className="cart-demo-summary">
    <div className="cart-demo-summary-title"><h2>Thông tin thanh toán</h2><Badge variant="secondary">{itemCount} mục</Badge></div>
    <div className="cart-demo-voucher">
      <label>Mã ưu đãi / Khuyến mãi</label>
      {appliedVoucher ?
      <div className="cart-demo-voucher-input cart-demo-voucher-active">
          <Tag size={17} />
          <span>{appliedVoucher}</span>
          <button type="button" onClick={removeVoucher} aria-label="Xóa mã giảm giá">
            <X size={15} />
          </button>
        </div> :
        <div className="cart-demo-voucher-input">
          <Tag size={17} />
            <input value={voucher} onChange={(event) => setVoucher(event.target.value)} placeholder="Nhập mã giảm giá" />
            <Button
              type="button"
              className="!h-auto !px-4 !py-2"
              onClick={applyVoucher}
            >
              Áp dụng
            </Button>
          </div>}
      {appliedVoucher &&
      <div className="cart-demo-applied">
        <CheckCircle2 size={16} /> Đã áp dụng mã <strong>{appliedVoucher}</strong>
        <span>(-{formatVND(discount)})</span>
      </div>}
      <small>Voucher có sẵn cho đơn này:</small>
      {isLoadingVouchers ? (
        <small role="status">Đang tải voucher...</small>
      ) : voucherLoadError ? (
        <div className="cart-demo-voucher-chips">
          <small>Không thể tải danh sách voucher.</small>
          <button type="button" onClick={retryLoadVouchers}>Thử lại</button>
        </div>
      ) : availableVouchers.length > 0 ? (
        <div className="cart-demo-voucher-chips">
          {availableVouchers.map((item) => {
            const minimumOrderValue = Number(item.minOrderValue);
            const isEligible = subtotal >= minimumOrderValue;
            const discountLabel = item.discountType === 'PERCENT'
              ? `Giảm ${Number(item.discountValue)}%`
              : `Giảm ${formatVND(Number(item.discountValue))}`;
            return (
              <button
                type="button"
                key={item.id}
                className={voucher.trim().toUpperCase() === item.code.toUpperCase() ? 'selected' : ''}
                disabled={!isEligible}
                title={isEligible ? item.description || item.code : `Đơn tối thiểu ${formatVND(minimumOrderValue)}`}
                onClick={() => setVoucher(item.code)}
              >
                {item.code} · {discountLabel}
                {!isEligible && ` (Tối thiểu ${formatVND(minimumOrderValue)})`}
                {voucher.trim().toUpperCase() === item.code.toUpperCase() && <Check size={12} />}
              </button>
            );
          })}
        </div>
      ) : (
        <small>Hiện không có voucher khả dụng.</small>
      )}
    </div>
    <div className="cart-demo-summary-lines"><div><span>Tạm tính ({itemCount} sản phẩm)</span><strong>{formatVND(subtotal)}</strong></div>{discount > 0 && <div className="discount"><span>Giảm giá khuyến mãi <span className="cart-demo-info">i</span></span><strong>-{formatVND(discount)}</strong></div>}<div><span>Phí vận chuyển</span><strong className={shipping === 0 ? 'free' : ''}>{shipping ? formatVND(shipping) : 'Miễn phí (0đ)'}</strong></div><div className="cart-demo-points"><span><span className="cart-demo-point-icon">✧</span> Tích lũy ZonePoints:</span><strong>+{Math.floor(subtotal / 100000)} điểm (~{formatVND(Math.floor(subtotal / 100000) * 1000)})</strong></div></div>
    <div className="cart-demo-total"><span>Tổng cộng:</span><strong>{formatVND(total)}</strong><small>(Đã bao gồm VAT và ưu đãi)</small></div>
    <Button type="button" size="lg" className="cart-demo-checkout" onClick={onCheckout}>TIẾN HÀNH ĐẶT HÀNG <ChevronRight size={20} /></Button>
    <Button type="button" variant="outline" className="cart-demo-installment" onClick={onInstallment}>▣ &nbsp; TRẢ GÓP 0% CHO ĐƠN HÀNG NÀY</Button>
    <div className="cart-demo-secure"><div><ShieldCheck size={17} /> Thanh toán an toàn bảo mật SSL 256-bit</div><div><span className="cart-demo-secure-blue">↻</span> Đổi trả trong 30 ngày nếu lỗi phần cứng</div><div><span className="cart-demo-secure-orange">♧</span> Hỗ trợ kỹ thuật & dịch vụ 24/7 toàn quốc</div></div>
  </aside>;
}

function RecommendationSection({ products, onAdd }: { products: MockProduct[]; onAdd: (product: MockProduct) => void }) {
  return <section className="cart-demo-recommendations"><div className="cart-demo-recommend-heading"><div><Badge variant="outline"><Tag size={14} /> Ưu đãi giỏ hàng: Giảm thêm 15%</Badge><h2>Có thể bạn cũng thích & Phụ kiện mua kèm</h2></div><Link href="/products">Xem tất cả phụ kiện <ChevronRight size={17} /></Link></div><div className="cart-demo-recommend-grid">{products.map((product) => <article key={product.id} className="cart-demo-recommend-card"><div className="cart-demo-recommend-image"><Badge variant="destructive">-15%</Badge><SafeImage src={product.image} alt={product.name} fill style={{ objectFit: 'contain', padding: '1rem' }} /></div><h3>{product.name}</h3><p>{product.promotionText}</p><div><strong>{formatVND(product.price)}</strong><Button type="button" size="icon-lg" onClick={() => onAdd(product)} aria-label={`Thêm ${product.name} vào giỏ`}><Plus size={20} /></Button></div></article>)}</div></section>;
}

function EmptyCart() {
  return <div className="cart-demo-empty"><span><ShoppingCart size={34} /></span><div><Badge variant="outline" className='px-2! py-1!'>MẸO MUA SẮM Sóc Mobile</Badge><h1>Giỏ hàng của bạn đang trống sau khi hoàn tất?</h1><p>Khám phá ngay hàng trăm mẫu smartphone thế hệ mới với ưu đãi độc quyền trả góp 0% duyệt 5 phút.</p></div><Link href="/shop"><Button size="lg" className="h-auto! px-4! py-2!">Khám phá điện thoại hot ngay</Button></Link></div>;
}
