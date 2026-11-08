'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth as useClerkAuth, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import {
  ShoppingBag,
  Search,
  MapPin,
  Phone,
  FileText,
  User,
  ChevronDown,
  X,
  Smartphone,
  Heart,
  CreditCard,
  Bot,
  ShieldCheck,
  Navigation,
  RefreshCw,
  Loader2,
  LogOut,
  History
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/useAuthStore';
import { LABELS } from '@/constants/labels';
import { APP_CONFIG } from '@/constants/config';
import { CITY_COORDINATES, getNearestCity } from '@/utils/locationUtils';
import { toast } from '@/store/useToastStore';

const POPULAR_SEARCHES = [
  'iPhone 17 Pro Max',
  'Galaxy S26 Ultra',
  'Xiaomi 17T Pro',
  'OPPO Find X9',
  'Dien thoai duoi 10 trieu'
];
const SEARCH_HISTORY_KEY = 'phoneshop-search-history';
const MAX_SEARCH_HISTORY = 8;

function loadSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!savedHistory) return [];

    const parsedHistory: unknown = JSON.parse(savedHistory);
    return Array.isArray(parsedHistory)
      ? parsedHistory
          .filter(
            (item): item is string =>
              typeof item === 'string' && Boolean(item.trim()),
          )
          .slice(0, MAX_SEARCH_HISTORY)
      : [];
  } catch (error) {
    console.error('Không thể tải lịch sử tìm kiếm:', error);
    return [];
  }
}

export default function Header() {
  const router = useRouter();
  const { totalItems } = useCart();
  const { logout } = useAuth();
  const { isLoaded: isClerkLoaded, isSignedIn } = useClerkAuth();
  const user = useAuthStore((state) => state.user);
  const isAdminUser = Boolean(user && (user.role === 'ADMIN' || user.role === 'STAFF'));

  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>(loadSearchHistory);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Ho Chi Minh');
  const [nearestStore, setNearestStore] = useState('123 Nguyen Trai, Q.1');
  const [isLocating, setIsLocating] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const detectGPSLocation = useCallback((showToast = true) => {
    if (!navigator.geolocation) {
      if (showToast) toast.error('Trình duyệt của bạn không hỗ trợ GPS.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearest = getNearestCity(latitude, longitude);

        setSelectedLocation(nearest.name);
        setNearestStore(nearest.nearestStoreAddress);
        localStorage.setItem('user-location', nearest.name);
        localStorage.setItem('user-nearest-store', nearest.nearestStoreAddress);

        setIsLocating(false);
        if (showToast) {
          toast.success(`Đã định vị vị trí gần nhất: ${nearest.name} (${nearest.nearestStoreAddress})`);
        }
      },
      (error) => {
        setIsLocating(false);
        if (showToast) {
          if (error.code === error.PERMISSION_DENIED) {
            toast.warning('ạn đã từ chối quyền truy cập GPS. Vui lòng chọn vị trí thủ công.');
          } else {
            toast.error('Không thể định vị vị trí của bạn. Vui lòng chọn vị trí thủ công.');
          }
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  // Enforce light theme mode across the application
  useEffect(() => {
    document.documentElement.dataset.theme = 'light';
    localStorage.setItem('theme', 'light');
  }, []);

  // Location tracking
  useEffect(() => {
    const savedLoc = localStorage.getItem('user-location');
    const savedStore = localStorage.getItem('user-nearest-store');

    if (savedLoc && savedStore) {
      setSelectedLocation(savedLoc);
      setNearestStore(savedStore);
    } else {
      detectGPSLocation(false);
    }
  }, [detectGPSLocation]);

  const handleSelectLocationManually = (cityName: string) => {
    const cityObj = CITY_COORDINATES.find(c => c.name === cityName);
    const storeAddr = cityObj ? cityObj.nearestStoreAddress : 'Showroom Soc Mobile';

    setSelectedLocation(cityName);
    setNearestStore(storeAddr);
    localStorage.setItem('user-location', cityName);
    localStorage.setItem('user-nearest-store', storeAddr);
    setShowLocationDropdown(false);
    toast.info(`Đã đổi khu vực xem giá: ${cityName}`);
  };

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveSearch = (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const updatedHistory = [
      trimmedQuery,
      ...searchHistory.filter(
        (item) => item.toLocaleLowerCase() !== trimmedQuery.toLocaleLowerCase(),
      ),
    ].slice(0, MAX_SEARCH_HISTORY);

    setSearchHistory(updatedHistory);
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Không thể lưu lịch sử tìm kiếm:', error);
    }
  };

  const handleSearch = (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;

    saveSearch(trimmedKeyword);
    setSearchQuery(trimmedKeyword);
    router.push(`${APP_CONFIG.ROUTES.PRODUCTS}?search=${encodeURIComponent(trimmedKeyword)}`);
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handleSuggestionClick = (keyword: string) => {
    setSearchQuery(keyword);
    handleSearch(keyword);
  };

  const removeSearchHistoryItem = (query: string) => {
    const updatedHistory = searchHistory.filter((item) => item !== query);
    setSearchHistory(updatedHistory);
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Không thể cập nhật lịch sử tìm kiếm:', error);
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Không thể xóa lịch sử tìm kiếm:', error);
    }
  };

  return (
    <header className="site-header">
      {/* Top Main Bar */}
      <div className="header-main-bar">
        <div className="header-container">

          {/* Logo */}
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

          {/* Location Selector with GPS & Nearest Store */}
          <div className="location-selector-wrapper" ref={locationRef}>
            <button
              type="button"
              className="header-location-btn"
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              title={`Cua hang gan nhat: ${nearestStore}`}
            >
              <MapPin size={14} className="loc-icon" />
              <div className="loc-text">
                <span className="loc-title">Giá tại <strong>{selectedLocation}</strong></span>
                <span className="loc-value">{nearestStore}</span>
              </div>
              <ChevronDown size={12} className="chevron-icon" />
            </button>

            {showLocationDropdown && (
              <div className="location-dropdown-menu">
                {/* Auto GPS Trigger Button */}
                <button
                  type="button"
                  className="gps-detect-btn"
                  onClick={() => detectGPSLocation(true)}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Đang quét vị trí GPS...</span>
                    </>
                  ) : (
                    <>
                      <Navigation size={13} style={{ color: '#00f2fe' }} />
                      <span>Tự động định vị GPS gần bạn</span>
                    </>
                  )}
                </button>

                <div className="dropdown-divider" style={{ margin: '4px 0' }}></div>

                <div style={{ padding: '4px 12px 2px', fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Chọn Tỉnh/Thành phố
                </div>

                {CITY_COORDINATES.map(city => (
                  <button
                    key={city.name}
                    type="button"
                    className={selectedLocation === city.name ? 'active' : ''}
                    onClick={() => handleSelectLocationManually(city.name)}
                  >
                    <span>{city.name}</span>
                    <span className="store-sub">{city.nearestStoreAddress}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="header-search-container" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="header-search-form">
              <input
                type="text"
                placeholder="Tim kiem..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="header-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={14} />
                </button>
              )}
              <button type="submit" className="header-search-btn">
                <Search size={15} />
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="search-suggestions-panel">
                {!searchQuery && searchHistory.length > 0 && (
                  <div className="suggestion-section">
                    <div className="flex items-center justify-between gap-3">
                      <span className="suggestion-title">Lịch sử tìm kiếm</span>
                      <button
                        type="button"
                        onClick={clearSearchHistory}
                        className="text-xs text-slate-500 hover:text-red-600"
                      >
                        Xóa lịch sử
                      </button>
                    </div>
                    <div className="flex flex-col gap-1">
                      {searchHistory.map((query) => (
                        <div key={query} className="flex items-center gap-1">
                          <button
                            type="button"
                            className="predictive-item min-w-0 flex-1"
                            onClick={() => handleSuggestionClick(query)}
                          >
                            <History size={14} className="mr-2 shrink-0" />
                            <span className="truncate">{query}</span>
                          </button>
                          <button
                            type="button"
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            aria-label={`Xóa tìm kiếm ${query}`}
                            onClick={() => removeSearchHistoryItem(query)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="suggestion-section">
                  <span className="suggestion-title">Tìm kiếm phổ biến</span>
                  <div className="suggestion-keywords">
                    {POPULAR_SEARCHES.map((keyword) => (
                      <button
                        key={keyword}
                        type="button"
                        className="keyword-chip"
                        onClick={() => handleSuggestionClick(keyword)}
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>

                {searchQuery && (
                  <div className="suggestion-section suggestion-predictive">
                    <span className="suggestion-title">Gợi ý tìm kiếm cho &quot;{searchQuery}&quot;</span>
                    <button
                      type="button"
                      className="predictive-item"
                      onClick={() => handleSuggestionClick(searchQuery)}
                    >
                      <Search size={14} style={{ marginRight: '8px' }} />
                      Tìm kiếm sản phẩm chứa: <strong>{searchQuery}</strong>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contact Hotline */}
          <a href={`tel:${APP_CONFIG.HOTLINE_TEL}`} className="header-hotline">
            <Phone size={15} className="hotline-icon" />
            <div className="hotline-info">
              <span className="hotline-label"> gọi mua hàng</span>
              <span className="hotline-number" style={{ fontSize: '13px' }}>{APP_CONFIG.HOTLINE}</span>
            </div>
          </a>



          {/* wishlist */}
          <Link href="/wishlist" className="header-track-btn">
            <Heart size={16} />
            <span>Sản phẩm yêu thích</span>
          </Link>


          {/* Cart Button */}
          <Link href={APP_CONFIG.ROUTES.CART} className="header-cart-btn">
            <div className="cart-icon-wrapper">
              <ShoppingBag size={18} />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </div>
            <span className="cart-btn-text">{LABELS.COMMON.CART}</span>
          </Link>

          {/* User Account / Login */}
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
                  <span className="user-name-text">{user?.fullName || user?.email}</span>
                  <ChevronDown size={14} className="chevron-icon" />
                </button>

                {showUserDropdown && (
                  <div className="user-dropdown-menu">
                    <div className="dropdown-user-info">
                      <span className="dropdown-user-name" style={{ fontWeight: 'bold', color: '#1e293b' }}>
                        {user?.fullName || 'Quan tri vien'}
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

      {/* Clean Secondary Navigation Bar */}
      <nav className="header-subnav">
        <div className="header-subnav-container">
          <Link href="/products" className="subnav-link">
            <Smartphone size={15} /> <span>Điện thoại</span>
          </Link>
          <Link href="/thu-cu-doi-moi" className="subnav-link highlight" style={{ color: '#f59e0b' }}>
            <RefreshCw size={15} /> <span>Thu cũ đổi mới</span> <span className="nav-tag" style={{ background: '#f59e0b', color: '#000' }}>HOT</span>
          </Link>
          <Link href="/tra-gop" className="subnav-link">
            <CreditCard size={15} /> <span>Trả góp 0%</span>
          </Link>
          <Link href="/compare" className="subnav-link ai-nav">
            <Bot size={15} /> <span>So sánh AI</span> <span className="nav-tag">AI</span>
          </Link>
          <Link href="/bao-hanh" className="subnav-link">
            <ShieldCheck size={15} /> <span>Tra cứu bảo hành</span>
          </Link>
          <Link href="/orders" className="subnav-link">
            <FileText size={15} /> <span>Tra cứu đơn hàng</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
