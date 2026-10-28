import React, { useEffect, useState } from "react";
import { APP_CONFIG } from '@/constants/config';
import Link from 'next/link';
import {
  ShoppingBag,
  User,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "iPhone", href: "/products?brand=Apple" },
  { label: "Samsung", href: "/products?brand=Samsung" },
  { label: "Xiaomi", href: "/products?brand=Xiaomi" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar-inner">
        <Link href={APP_CONFIG.ROUTES.HOME} className="header-logo">
          <img
            src="/remove_background_logo_phone_shop.png"
            alt="Sóc Mobile Logo"
            className="logo-img"
          />
          <span className="logo-text">
            Sóc <span className="logo-highlight">Mobile</span>
          </span>
        </Link>

        <nav className="navbar-links">
          {LINKS.map((link) => (
            <a key={link.label} href={link.href} className="navbar-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="navbar-actions">
          <button className="icon-btn" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
              <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <button className="icon-btn" aria-label="Wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 20s-7-4.4-9.3-9C1 7.8 2.9 4.5 6.3 4.5c2 0 3.6 1.4 5.7 4 2.1-2.6 3.7-4 5.7-4 3.4 0 5.3 3.3 3.6 6.5C19 15.6 12 20 12 20z" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
          <Link href={APP_CONFIG.ROUTES.CART} className="icon-btn" aria-label="cart">
              <div className="cart-icon-wrapper">
                <ShoppingBag size={18} />
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </div>
            </Link>
          {/* User Account / Login */}
          <div className="header-user-account">
            <Show when="signed-in">
              <UserButton />
            </Show>
            <Show when="signed-out">
              <div className="header-auth-actions">
                <SignInButton mode="modal">
                  <button type="button" className="header-login-btn">
                    <User className = "text-white" size={18}  />
                    <span className="text-white">Đăng nhập</span>
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button type="button" className="header-login-btn header-signup-btn">
                    <User className="text-white" size={18} />
                    <span className="text-white">Đăng ký</span>
                  </button>
                </SignUpButton>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </header>
  );
}