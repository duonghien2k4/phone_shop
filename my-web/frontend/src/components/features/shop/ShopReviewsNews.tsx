'use client';

import { ArrowRight, CheckCircle2, MessageSquareQuote, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { MockProduct } from '@/types/product';

interface ShopReviewsNewsProps {
  products: MockProduct[];
}

const reviews = [
  ['NV', 'Nguyễn Văn Hoàng', 'Đã mua iPhone 16 Pro Max', 'Giao hàng 2H siêu nhanh, nhân viên tận tình hỗ trợ chuyển dữ liệu. 10 điểm cho Sóc Mobile!'],
  ['TL', 'Trần Mai Linh', 'Đã mua Galaxy Z Flip6', 'Máy chuẩn VN/A nguyên seal, giá tốt, thu cũ đổi mới trợ giá cao và thủ tục rất nhanh.'],
];

const news = [
  ['Đánh giá chi tiết', 'iPhone 16 Pro Max: Titan Sa Mạc và Camera Control có đáng tiền?', '2 giờ trước'],
  ['So sánh đối đầu', 'Galaxy S25 Ultra và iPhone 16 Pro Max: Cuộc chiến AI', 'Hôm qua'],
  ['Mẹo công nghệ', '5 điều cần kiểm tra trước khi nhận điện thoại mới', '2 ngày trước'],
];

export default function ShopReviewsNews({ products }: ShopReviewsNewsProps) {
  return (
    <section className="shop-wide-container shop-reviews-news">
      <div className="shop-reviews-column">
        <div className="shop-section-heading"><div><span className="shop-section-icon"><MessageSquareQuote size={19} /></span><div><h2>KHÁCH HÀNG NÓI GÌ?</h2><p>4.9/5 <Star size={12} fill="currentColor" /> (2.4k đánh giá)</p></div></div></div>
        {reviews.map(([initials, name, purchase, quote]) => (
          <Card key={name} className="shop-review-card">
            <div className="shop-review-head"><div><span className="shop-review-avatar">{initials}</span><span><strong>{name}</strong><small><CheckCircle2 size={12} /> {purchase}</small></span></div><span className="shop-review-stars"><Star size={12} fill="currentColor" /> 5.0</span></div>
            <p>“{quote}”</p>
          </Card>
        ))}
      </div>
      <div className="shop-news-column">
        <div className="shop-section-heading"><div><div><h2>TIN TỨC & ĐÁNH GIÁ CÔNG NGHỆ</h2><p>Cập nhật xu hướng và kinh nghiệm chọn máy</p></div></div><a href="/products">Xem tất cả <ArrowRight size={15} /></a></div>
        <div className="shop-news-grid">
          {news.map(([tag, title, time], index) => (
            <Card key={title} className="shop-news-card">
              <div className="shop-news-image">{products[index]?.image ? <img src={products[index].image} alt="" /> : null}</div>
              <div><span>{tag}</span><h3>{title}</h3></div>
              <small>TechLab · {time}</small>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
