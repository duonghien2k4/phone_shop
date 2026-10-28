'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Heart,
  Loader2,
  MessageCircleQuestion,
  Minus,
  Plus,
  RotateCcw,
  Send,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SafeImage from '@/components/base/SafeImage';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { formatVND } from '@/utils/format';
import { productService, ProductReview } from '@/services/product.service';
import type { MockProduct, ProductVariant } from '@/types/product';

interface ProductDetailContentProps {
  product: MockProduct;
  allProducts: MockProduct[];
}

const tabs = [
  ['highlights', 'Đặc điểm nổi bật'],
  ['specs', 'Thông số kỹ thuật'],
  ['reviews', 'Đánh giá khách hàng'],
  ['qa', 'Hỏi đáp & Tư vấn'],
] as const;

const faqItems = [
  ['Sản phẩm này có phải hàng chính hãng không?', 'Tất cả sản phẩm tại Sóc Mobile đều là hàng chính hãng, có nguồn gốc rõ ràng và được hưởng đầy đủ chính sách bảo hành của nhà sản xuất.'],
  ['Sản phẩm có được kiểm tra trước khi nhận không?', 'Bạn có thể kiểm tra ngoại quan và phụ kiện trước khi nhận hàng. Nếu phát hiện lỗi do nhà sản xuất, shop hỗ trợ đổi mới theo chính sách.'],
  ['Có hỗ trợ trả góp 0% không?', 'Shop hỗ trợ trả góp qua thẻ tín dụng và các đối tác tài chính. Vui lòng liên hệ tư vấn để được kiểm tra điều kiện và ưu đãi hiện tại.'],
  ['Thời gian giao hàng dự kiến là bao lâu?', 'Đơn nội thành thường được giao trong 2 giờ. Các tỉnh thành khác dự kiến từ 1 đến 3 ngày tùy khu vực và đơn vị vận chuyển.'],
  ['Thu cũ đổi mới có áp dụng cho sản phẩm này không?', 'Có. Bạn có thể gửi thông tin máy cũ để shop định giá online và nhận báo giá trợ thu trước khi quyết định nâng cấp.'],
] as const;

const POLL_INTERVAL_MS = 10_000;

export default function ProductDetailContent({ product, allProducts }: ProductDetailContentProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] ?? { storage: 'Mặc định', price: product.price },
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number][0]>('highlights');
  const [liked, setLiked] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const oldPrice = selectedVariant.oldPrice ?? Math.round(selectedVariant.price * 1.08);
  const discount = Math.max(0, Math.round(((oldPrice - selectedVariant.price) / oldPrice) * 100));

  const addProductToCart = () => {
    const variantIndex = product.variants.findIndex((variant) => variant.storage === selectedVariant.storage);
      addToCart({
        variantId: selectedVariant.id ?? (product.id * 10 + Math.max(variantIndex, 0)),
        productId: product.id,
        productName: product.name,
        color: selectedVariant.color || 'Mặc định',
        storage: selectedVariant.storage,
        imageUrl: selectedVariant.imageUrl || product.image,
        price: selectedVariant.price,
        quantity,
      });
  };

  const handleBuyNow = () => {
    addProductToCart();
    router.push('/checkout');
  };

  const fetchReviews = useCallback(async () => {
    try {
      const res = await productService.getProductReviews(product.slug);
      setReviews(res.reviews);
      setReviewTotal(res.total);
      setAvgRating(res.avgRating);
    } catch {
      // ignore fetch errors silently
    }
  }, [product.slug]);

  // Initial load
  useEffect(() => {
    setReviewsLoading(true);
    void fetchReviews().finally(() => setReviewsLoading(false));
  }, [fetchReviews]);

  // Real-time polling every 10s
  useEffect(() => {
    const timer = setInterval(() => void fetchReviews(), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchReviews]);

  return (
    <main className="product-detail-content">
      <div className="product-detail-container">
        <nav className="product-breadcrumb" aria-label="Breadcrumb">
          <Link href="/shop">Cửa hàng</Link><ChevronRight size={14} /><Link href="/products">Điện thoại</Link><ChevronRight size={14} /><span>{product.name}</span>
        </nav>

        <section className="product-hero-detail">
          <div className="product-gallery-panel">
            <div className="product-gallery-badges">
              {product.badge && <Badge variant="destructive" className='px-1! py-0.5! text-white!'>{product.badge}</Badge>}
              {product.fastDelivery && <Badge className="product-fast-badge px-1! py-0.5! text-white!"><Zap size={12} fill="currentColor" /> Giao nhanh 2H</Badge>}
            </div>
            <div className="product-gallery-image">
              <SafeImage src={product.image} alt={product.name} fill style={{ objectFit: 'contain', padding: '28px' }} />
            </div>
            <div className="product-gallery-thumbs"><button type="button" className="active"><SafeImage src={product.image} alt="" fill style={{ objectFit: 'contain', padding: '4px' }} /></button></div>
          </div>

          <div className="product-buy-panel">
            <div className="product-brand-label">{product.brand} chính hãng</div>
            <h1>{product.name}</h1>
            <div className="product-rating-row">
              <span className="product-stars"><Star size={15} fill="currentColor" /> {avgRating > 0 ? avgRating.toFixed(1) : product.rating.toFixed(1)}</span>
              <span>{reviewTotal > 0 ? reviewTotal : product.reviewCount} đánh giá</span><span>Đã bán {product.soldCount}</span>
            </div>
            <div className="product-price-block">
              <strong>{formatVND(selectedVariant.price)}</strong>
              <del>{formatVND(oldPrice)}</del>
              {discount > 0 && <Badge className='px-1! py-0.5! text-white' variant="destructive">-{discount}%</Badge>}
            </div>
            <div className="product-promotion"><GiftIcon /> <span>{product.promotionText}</span></div>

            <div className="product-option-section">
              <h3>Dung lượng <span>{selectedVariant.storage}</span></h3>
              <div className="product-variant-list">
                {product.variants.map((variant, idx) => (
                  <Button className="px-4! py-2!" key={variant.id || `${variant.storage}-${idx}`} type="button" variant={selectedVariant.storage === variant.storage ? 'default' : 'outline'} onClick={() => setSelectedVariant(variant)}>
                    {variant.storage}<small>{formatVND(variant.price)}</small>
                  </Button>
                ))}
              </div>
            </div>

            <div className="product-quantity-row">
              <span>Số lượng</span>
              <div><Button variant="outline" size="icon-sm" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={14} /></Button><strong>{quantity}</strong><Button variant="outline" size="icon-sm" onClick={() => setQuantity((value) => value + 1)}><Plus size={14} /></Button></div>
            </div>

            <div className="product-cta-row">
              <Button size="lg" className="product-cart-button" onClick={addProductToCart}><ShoppingCart size={19} /> Thêm vào giỏ</Button>
              <Button size="lg" variant="outline" className="product-buy-button" onClick={handleBuyNow}>Mua ngay</Button>
              <Button variant="outline" size="icon-lg" aria-label="Yêu thích" onClick={() => setLiked((value) => !value)}><Heart size={20} fill={liked ? 'currentColor' : 'none'} /></Button>
            </div>

            <div className="product-trust-grid">
              <TrustItem icon={BadgeCheck} title="Chính hãng 100%" description="Bảo hành Apple/Samsung" />
              <TrustItem icon={RotateCcw} title="1 đổi 1 trong 30 ngày" description="Nếu lỗi nhà sản xuất" />
              <TrustItem icon={Truck} title="Giao 2H miễn phí" description="Nội thành HN & TP.HCM" />
              <TrustItem icon={ShieldCheck} title="Hỗ trợ kỹ thuật" description="Trọn đời máy tại shop" />
            </div>
          </div>
        </section>

        <nav className="product-detail-tabs" aria-label="Nội dung sản phẩm">
          {tabs.map(([id, label]) => <button key={id} type="button" className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setActiveTab(id); }}>{label}{id === 'reviews' && <span>{reviewTotal > 0 ? reviewTotal : product.reviewCount}</span>}</button>)}
        </nav>

        <section className="product-detail-lower">
          <article className="product-editorial-card">
            {activeTab === 'highlights' && <Highlights product={product} />}
            {activeTab === 'specs' && <Specs product={product} />}
            {activeTab === 'reviews' && (
              <Reviews
                product={product}
                reviews={reviews}
                total={reviewTotal}
                avgRating={avgRating}
                loading={reviewsLoading}
                onReviewSubmitted={fetchReviews}
              />
            )}
            {activeTab === 'qa' && <Questions openFaq={openFaq} setOpenFaq={setOpenFaq} />}
          </article>
          <aside className="product-sidebar-card">
            <h2>Thông tin sản phẩm</h2>
            <p>{product.description}</p>
            <div><CreditCard size={17} /><span>Trả góp 0% qua thẻ tín dụng</span></div>
            <div><Truck size={17} /><span>Miễn phí giao hàng đơn từ 500.000đ</span></div>
            <div><MessageCircleQuestion size={17} /><span>Tư vấn miễn phí: 1800.2097</span></div>
          </aside>
        </section>
        <RelatedProducts product={product} allProducts={allProducts} />
      </div>
    </main>
  );
}

function GiftIcon() {
  return <span className="product-promotion-icon"><Zap size={16} /></span>;
}

function TrustItem({ icon: Icon, title, description }: { icon: typeof BadgeCheck; title: string; description: string }) {
  return <div><Icon size={20} /><span><strong>{title}</strong><small>{description}</small></span></div>;
}

function Highlights({ product }: { product: MockProduct }) {
  return <div className="product-content-stack"><h2>Đánh giá chi tiết {product.name}</h2><p>{product.description} Với thiết kế hiện đại, hiệu năng ổn định và hệ sinh thái chính hãng, đây là lựa chọn phù hợp cho nhu cầu sử dụng dài lâu.</p><div className="product-highlight-box"><div><BadgeCheck size={18} /><h3>Thiết kế và trải nghiệm được tối ưu</h3><p>Sản phẩm được kiểm tra kỹ trước khi giao, đóng gói an toàn và hỗ trợ chuyển dữ liệu tại cửa hàng.</p></div><div className="product-highlight-stat"><strong>{product.rating.toFixed(1)}/5</strong><span>Đánh giá người dùng</span></div></div></div>;
}

function Specs({ product }: { product: MockProduct }) {
  const specs = [['Màn hình', product.specs.screen || 'Đang cập nhật'], ['Chip', product.specs.chip || 'Đang cập nhật'], ['RAM', product.specs.ram || 'Đang cập nhật'], ['Thương hiệu', product.brand], ['Danh mục', product.category]];
  return <div className="product-content-stack"><h2>Thông số kỹ thuật</h2><div className="product-spec-table">{specs.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></div>;
}

function ReviewAvatar({
  name,
  email,
  avatarUrl,
}: {
  name: string;
  email: string;
  avatarUrl?: string | null;
}) {
  const [imgError, setImgError] = useState(false);
  const initials = name
    ? name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : email.slice(0, 2).toUpperCase();

  if (avatarUrl && !imgError) {
    return (
      <span className="product-review-avatar overflow-hidden p-0 relative block">
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover rounded-full"
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
        />
      </span>
    );
  }

  return <span className="product-review-avatar">{initials}</span>;
}

interface ReviewsProps {
  product: MockProduct;
  reviews: ProductReview[];
  total: number;
  avgRating: number;
  loading: boolean;
  onReviewSubmitted: () => Promise<void>;
}

function Reviews({ product, reviews, total, avgRating, loading, onReviewSubmitted }: ReviewsProps) {
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const displayAvg = avgRating > 0 ? avgRating : product.rating;
  const displayTotal = total > 0 ? total : product.reviewCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.trim().length < 5) {
      setSubmitError('Nội dung bình luận tối thiểu 5 ký tự');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await productService.submitReview(product.slug, { rating, comment: comment.trim() });
      setComment('');
      setRating(5);
      setSubmitSuccess(true);
      await onReviewSubmitted();
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể gửi đánh giá. Vui lòng thử lại.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="product-content-stack">
      <div className="product-reviews-heading">
        <div>
          <h2>Đánh giá khách hàng thực tế</h2>
          <p>Những chia sẻ đã được tổng hợp từ khách hàng đã mua sản phẩm.</p>
        </div>
        <Badge variant="outline">{displayTotal} đánh giá</Badge>
      </div>

      <div className="product-review-summary">
        <strong>{displayAvg.toFixed(1)}</strong>
        <span className="product-stars"><Star size={17} fill="currentColor" /> Xuất sắc</span>
        <small>{displayTotal} đánh giá đã xác thực</small>
      </div>

      {/* Review list */}
      <div className="product-review-list">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 size={20} className="animate-spin mr-2" />
            <span>Đang tải đánh giá...</span>
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-slate-400 text-sm italic py-4">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
        ) : (
          reviews.map((r) => {
            const name = r.user.profile?.fullName || r.user.email;
            return (
              <div className="product-review-item" key={r.id}>
                <ReviewAvatar
                  name={name}
                  email={r.user.email}
                  avatarUrl={r.user.profile?.avatarUrl}
                />
                <div>
                  <div className="product-review-meta">
                    <strong>{name}</strong>
                    <span>{formatDate(r.createdAt)}</span>
                  </div>
                  <span className="product-stars">
                    {Array.from({ length: r.rating }, (_, i) => <Star key={i} size={13} fill="currentColor" />)}
                  </span>
                  <p>&ldquo;{r.comment}&rdquo;</p>
                  <small className="product-verified-review"><CheckCircle2 size={12} /> Đã mua tại Sóc Mobile</small>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review form */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <h3 className="text-base font-bold text-slate-800 mb-3">
          {isAuthenticated ? `Chia sẻ trải nghiệm của bạn` : 'Đăng nhập để viết đánh giá'}
        </h3>

        {!isAuthenticated ? (
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <MessageCircleQuestion size={20} className="text-slate-400 shrink-0" />
            <p className="text-sm text-slate-500 flex-1">Bạn cần <Link href="/login" className="text-blue-600 hover:underline font-semibold">đăng nhập</Link> để gửi đánh giá sản phẩm.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Điểm đánh giá</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-amber-400 transition-transform hover:scale-110"
                    aria-label={`${star} sao`}
                  >
                    <Star
                      size={26}
                      fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-slate-500 self-center">
                  {['', 'Kém', 'Chưa tốt', 'Bình thường', 'Hài lòng', 'Xuất sắc'][hoverRating || rating]}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung đánh giá</label>
              <textarea
                ref={textareaRef}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50"
                maxLength={1000}
              />
              <div className="flex justify-between mt-1">
                {submitError && <p className="text-xs text-red-500">{submitError}</p>}
                {submitSuccess && <p className="text-xs text-emerald-600 font-semibold">Đánh giá đã được gửi!</p>}
                <span className="text-xs text-slate-400 ml-auto">{comment.length}/1000</span>
              </div>
            </div>

            <Button type="submit" disabled={submitting || !comment.trim()} className="gap-2">
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

function Questions({ openFaq, setOpenFaq }: { openFaq: number | null; setOpenFaq: (index: number | null) => void }) {
  return <div className="product-content-stack">
    <div><h2>Hỏi đáp & Tư vấn sản phẩm</h2><p className="product-faq-intro">Một số câu hỏi thường gặp về sản phẩm và chính sách mua hàng.</p></div>
    <div className="product-faq-list">{faqItems.map(([question, answer], index) => <div className={`product-faq-item ${openFaq === index ? 'open' : ''}`} key={question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}><span>{question}</span><ChevronDown size={18} /></button>{openFaq === index && <p>{answer}</p>}</div>)}</div>
    <a href="tel:18002097"><Button><MessageCircleQuestion size={17} /> Gọi tư vấn 1800.2097</Button></a>
  </div>;
}

function RelatedProducts({ product, allProducts }: ProductDetailContentProps) {
  const related = allProducts.filter((item) => item.id !== product.id && item.brand === product.brand).slice(0, 4);
  const fallback = allProducts.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 4);
  const products = related.length >= 2 ? related : fallback;
  return <section className="product-related-section"><div className="product-related-heading"><div><h2>Sản phẩm cùng loại</h2><p>Có thể bạn cũng sẽ quan tâm</p></div><Link href="/products">Xem tất cả <ChevronRight size={16} /></Link></div><div className="product-related-grid">{products.map((item) => <Link href={`/products/${item.slug}`} className="product-related-card" key={item.id}><div className="product-related-image"><SafeImage src={item.image} alt={item.name} fill style={{ objectFit: 'contain', padding: '10px' }} /></div><strong>{item.name}</strong><span>{formatVND(item.price)}</span><small><Star size={12} fill="currentColor" /> {item.rating.toFixed(1)} ({item.reviewCount})</small></Link>)}</div></section>;
}
