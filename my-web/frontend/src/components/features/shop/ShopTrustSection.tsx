'use client';

import { BadgeCheck, Headphones, ShieldCheck, Truck } from 'lucide-react';

const benefits = [
  [BadgeCheck, '100% chính hãng', 'Đầy đủ hóa đơn VAT và bảo hành hãng.'],
  [Truck, 'Giao nhanh 2H', 'Miễn phí giao hàng toàn quốc đơn đủ điều kiện.'],
  [ShieldCheck, 'Bảo hành tận tâm', 'Đổi mới rõ ràng, hỗ trợ kỹ thuật trọn vòng đời.'],
  [Headphones, 'Tư vấn chuyên sâu', 'Đội ngũ am hiểu công nghệ hỗ trợ mỗi ngày.'],
] as const;

export default function ShopTrustSection() {
  return (
    <section className="shop-wide-container shop-trust-section">
      <div className="shop-section-heading centered">
        <div><h2>VÌ SAO BẠN NÊN CHỌN SÓC MOBILE?</h2><p>Cam kết dịch vụ vượt trội cho mỗi đơn hàng</p></div>
      </div>
      <div className="shop-trust-grid">
        {benefits.map(([Icon, title, description]) => (
          <article key={title} className="shop-trust-card"><span><Icon size={27} /></span><h3>{title}</h3><p>{description}</p></article>
        ))}
      </div>
    </section>
  );
}
