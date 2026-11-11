/**
 * HomeBanners Component
 * Renders the top hero slider and promotional sidebar blocks.
 * Encapsulates slide state management and auto-play interval effects.
 *
 * Related: src/app/page.tsx, src/constants/labels.ts
 * Pattern: Self-Contained UI Component
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { LABELS } from '@/constants/labels';

// Mock banners
const HERO_BANNERS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
    title: "Điện thoại Samsung Galaxy S25 Ultra - Sản Phẩm Của Tương Lai",
    sub: 'Đăng ký sớm nhận voucher 500k',
    link: '/products/dien-thoai-samsung-galaxy-s25-ultra-5g-12gb256gb-333347'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1757710436034-f1d7372ec1be?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
    title: 'iPhone 17 Pro Max - Titanium',
    sub: 'Sở hữu ngay với trả góp 0%',
    link: '/products/dien-thoai-iphone-17-pro-max-256gb-342679'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1710023038502-ba80a70a9f53?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
    title: 'Iphone 15 Plus - Vua Hiệu Năng',
    sub: 'Sạc nhanh 120W, đầy pin trong 19 phút',
    link: '/products/dien-thoai-iphone-15-plus-128gb-303891'
  }
];


const PROMO_SIDE_BANNERS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1772182092777-6b1bf0a362fe?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
    title: 'Samsung Galaxy Z Flip7',
    sub: 'Nay chỉ từ 23.990.000đ - Trả góp 0%',
    link: '/products/dien-thoai-samsung-galaxy-z-flip7-5g-12gb256gb-338736'
  },
  {
    id: 2,
    image: 'https://cdn.tgdd.vn/Products/Images/42/342670/iphone-air-vang-thumb-600x600.jpg',
    title: 'iPhone Air',
    sub: 'Giảm đến 30% khi mua kèm',
    link: '/products/dien-thoai-iphone-air-256gb-342670'
  }
];

export default function HomeBanners() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slide Auto Play Effect
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_BANNERS.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_BANNERS.length);
  };

  return (
    <section className="banner-grid-section">
      <div className="banner-grid-container">
        
        {/* Main Carousel Slider */}
        <div className="main-carousel">
          {HERO_BANNERS.map((banner, index) => (
            <div 
              key={banner.id} 
              className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.7) 30%, transparent), url(${banner.image})` }}
            >
              <div className="slide-content text-white">
                <span className="text-white font-bold">{LABELS.HOMEPAGE.EXCLUSIVE_TAG}</span>
                <h2 className="text-white font-bold">{banner.title}</h2>
                <p className="text-white font-medium">{banner.sub}</p>
                <Link href={banner.link} className="btn btn-primary btn-sm text-white">
                  {LABELS.HOMEPAGE.SEE_DETAILS} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
          
          {/* Slider Controls */}
          <button type="button" className="carousel-control prev" onClick={handlePrevSlide}>
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="carousel-control next" onClick={handleNextSlide}>
            <ChevronRight size={20} />
          </button>
          
          {/* Slider Indicators */}
          <div className="carousel-indicators">
            {HERO_BANNERS.map((_, index) => (
              <button 
                key={index} 
                type="button" 
                className={`indicator-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>

        {/* Side Static Banners */}
        <div className="side-banners">
          {PROMO_SIDE_BANNERS.map((banner) => (
            <div 
              key={banner.id} 
              className="side-banner-card"
              style={{ backgroundImage: `linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85)), url(${banner.image})` }}
            >
              <div className="side-banner-content text-white">
                <h3 className="text-white font-bold">{banner.title}</h3>
                <p className="text-white font-medium">{banner.sub}</p>
                <Link href={banner.link} className="side-banner-link text-white font-semibold">{LABELS.HOMEPAGE.BUY_NOW_PROMO} &rarr;</Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
