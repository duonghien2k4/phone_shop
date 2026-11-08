import React, { useEffect, useState, useRef } from "react";
import { APP_CONFIG } from '@/constants/config';
import Link from 'next/link';
import {
  ShoppingBag,
  User,
  ShieldCheck,
  FileText,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuth as useClerkAuth, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "iPhone", href: "/products?brand=Iphone" },
  { label: "Samsung", href: "/products?brand=Samsung" },
  { label: "Xiaomi", href: "/products?brand=Xiaomi" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userMenuRef = useRef(null);

  const { totalItems } = useCart();
  const { logout } = useAuth();
  const { isLoaded: isClerkLoaded, isSignedIn } = useClerkAuth();
  const user = useAuthStore((state) => state.user);
  const isAdminUser = Boolean(user && (user.role === 'ADMIN' || user.role === 'STAFF'));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar-inner">
        <Link href={APP_CONFIG.ROUTES.HOME} className="header-logo">
          <img
            src="/remove_background_logo_phone_shop.png"
            alt="Soc Mobile Logo"
            className="logo-img"
          />
          <span className="logo-text">
            Soc <span className="logo-highlight">Mobile</span>
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
          <div className="header-user-account" ref={userMenuRef}>
            {isAdminUser ? (
              <>
                <button
                  type="button"
                  className="user-profile-trigger"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  aria-label="Menu quan tri"
                >
                  <div className="avatar-placeholder">
                    {(user?.fullName || user?.email || 'A')[0].toUpperCase()}
                  </div>
                  <span className="user-name-text text-black">{user?.fullName || user?.email}</span>
                  <ChevronDown size={14} className="text-white opacity-80" />
                </button>

                {showUserDropdown && (
                  <div className="user-dropdown-menu">
                    <div className="dropdown-user-info">
                      <span className="dropdown-user-name" style={{ fontWeight: 'bold', color: '#000' }}>
                        {user?.fullName || 'User'}
                      </span>
                      <span className="dropdown-user-email">{user?.email}</span>
                    </div>



                    <Link
                      href="/orders"
                      className="dropdown-item"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <FileText size={16} />
                      <span>Đơn hàng của tôi</span>
                    </Link>

                    <div className="dropdown-divider" />

                    <button
                      type="button"
                      className="dropdown-item logout-btn"
                      onClick={async () => {
                        setShowUserDropdown(false);
                        await logout();
                      }}
                    >
                      <LogOut size={16} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              isClerkLoaded ? (
                isSignedIn ? (
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'w-8 h-8',
                      },
                    }}
                  />
                ) : (
                  <div className="header-auth-actions">
                    <SignInButton mode="modal">
                      <button type="button" className="header-login-btn">
                        <User size={18} />
                        <span>Đăng nhập</span>
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button type="button" className="header-login-btn header-signup-btn">
                        <User size={18} />
                        <span>Đăng ký</span>
                      </button>
                    </SignUpButton>
                  </div>
                )
              ) : null
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
