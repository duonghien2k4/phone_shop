/**
 * Checkout Page Component
 * Allows user to input shipping/pickup details, choose payment method (COD / VietQR 100% / 5% Deposit / Pay at Store).
 * Generates dynamic VietQR code image for bank transfers using APP_CONFIG.BANK, simulates transaction completion,
 * and clears the cart on successful checkout.
 *
 * Related: src/hooks/useCart.ts, src/constants/labels.ts, src/constants/config.ts, src/types/order.ts
 * Pattern: Clean Modular Checkout Workflow Architecture
 */

'use client';

import React, { useState, useCallback, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, QrCode, Banknote, Loader2, Store, Truck } from 'lucide-react';
import Header from '@/components/base/Header';
import Footer from '@/components/base/Footer';
import SafeImage from '@/components/base/SafeImage';
import { useCart } from '@/hooks/useCart';
import { ordersService, toOrderPaymentMethod } from '@/services/orders.service';
import { formatVND } from '@/utils/format';
import { LABELS } from '@/constants/labels';
import { APP_CONFIG } from '@/constants/config';
import { toast } from '@/store/useToastStore';
import { CITY_COORDINATES } from '@/utils/locationUtils';
import { Order, FulfillmentMode, PaymentMethodType } from '@/types/order';
import VietQrModal from '@/components/features/checkout/VietQrModal';
import { useRequireClerkAuth } from '@/hooks/useRequireClerkAuth';
import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { useAuthStore } from '@/store/useAuthStore';

const CITIES = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];

/* ============================================================================
 * Main Form Handler Component
 * ============================================================================ */
function CheckoutForm() {
  const canRender = useRequireClerkAuth();
  const { isSignedIn: isClerkSignedIn, getToken } = useClerkAuth();
  const internalUser = useAuthStore((state) => state.user);
  const searchParams = useSearchParams();
  const { items, removeFromCart, clearCart } = useCart();

  const fulfillmentFromUrl = searchParams.get('fulfillment') === 'STORE_PICKUP' ? 'STORE_PICKUP' : 'HOME_DELIVERY';
  const voucherCode = searchParams.get('voucher') || '';
  const discount = Number(searchParams.get('discount')) || 0;

  // Selected items filtering from query parameters
  const itemsParam = searchParams.get('items');
  const selectedVariantIds = useMemo(() => {
    if (!itemsParam) return null;
    return itemsParam
      .split(',')
      .map((id) => Number(id.trim()))
      .filter((id) => Number.isFinite(id) && id > 0);
  }, [itemsParam]);

  const checkoutItems = useMemo(() => {
    if (!selectedVariantIds || selectedVariantIds.length === 0) {
      return items;
    }
    return items.filter((item) => selectedVariantIds.includes(item.variantId));
  }, [items, selectedVariantIds]);

  const itemsSubtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [checkoutItems],
  );

  // Fulfillment & Pickup states
  const [fulfillmentMode, setFulfillmentMode] = useState<FulfillmentMode>(fulfillmentFromUrl);
  const [selectedStore, setSelectedStore] = useState(CITY_COORDINATES[0].nearestStoreAddress);
  const [appointmentTime, setAppointmentTime] = useState('Hôm nay (15:00 - 18:00)');

  // Customer Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Hồ Chí Minh');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    fulfillmentFromUrl === 'STORE_PICKUP' ? 'DEPOSIT_5' : 'COD'
  );
  
  // Workflow states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedOrderCode] = useState(() => Math.floor(10000 + Math.random() * 90000).toString());

  const shippingFee =
    fulfillmentMode === 'STORE_PICKUP' || itemsSubtotal >= 15000000 || itemsSubtotal === 0 ? 0 : 30000;
  const finalTotal = Math.max(0, itemsSubtotal + shippingFee - discount);
  
  // Deposit = exactly 5% of final order total
  const depositAmount = Math.round(finalTotal * 0.05);
  const remainingAmount = finalTotal - depositAmount;

  const isDepositMode = paymentMethod === 'DEPOSIT_5';
  const qrTransferAmount = isDepositMode ? depositAmount : finalTotal;

  const handleCompleteOrder = useCallback(async () => {
    setIsSubmitting(true);
    const isDeposit = paymentMethod === 'DEPOSIT_5';
    const isPayAtStore = paymentMethod === 'PAY_AT_STORE';

    let methodText = 'COD (Thanh toán khi nhận hàng)';
    if (paymentMethod === 'VIETQR') methodText = 'VietQR (Chuyển khoản Ngân hàng 100%)';
    if (paymentMethod === 'DEPOSIT_5') methodText = 'Đặt cọc 5% giữ máy (VietQR)';
    if (paymentMethod === 'PAY_AT_STORE') methodText = 'Thanh toán 100% tại Cửa hàng (Showroom)';

    const newOrder: Order = {
      id: `SOC-${generatedOrderCode}`,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      customerName: fullName || 'Khách hàng',
      phone: phone || '0987654321',
      address: fulfillmentMode === 'STORE_PICKUP' ? `[Nhận tại cửa hàng] ${selectedStore}` : `${address}, ${city}`,
      fulfillmentMode: fulfillmentMode,
      storeAddress: selectedStore,
      appointmentTime: appointmentTime,
      paymentMethod: methodText,
      paymentStatus: 'PENDING',
      isDeposit: isDeposit,
      depositAmount: isDeposit ? depositAmount : 0,
      remainingAmount: isDeposit ? remainingAmount : (isPayAtStore ? finalTotal : 0),
      shippingFee: shippingFee,
      discount: discount,
      voucherCode: voucherCode || null,
      note: fulfillmentMode === 'STORE_PICKUP' ? `Hẹn đến Showroom: ${appointmentTime}` : 'Đơn hàng mới từ website',
      items: checkoutItems.map(item => ({
        id: item.productId || item.variantId,
        name: item.productName,
        image: item.imageUrl || APP_CONFIG.DEFAULT_PRODUCT_IMAGE,
        variant: `${item.color || ''} - ${item.storage || ''}`.trim(),
        quantity: item.quantity,
        price: item.price
      })),
      logs: [
        {
          id: 'LOG-1',
          timestamp: new Date().toISOString(),
          title: 'Đơn hàng được khởi tạo',
          description: `Đơn hàng SOC-${generatedOrderCode} đã ghi nhận thành công trên hệ thống Sóc Mobile.`,
          type: 'CREATE'
        },
        ...(isDeposit ? [{
          id: 'LOG-2',
          timestamp: new Date().toISOString(),
          title: 'Chờ xác nhận Đặt cọc 5% VietQR',
          description: `Đang chờ xác nhận khoản cọc ${depositAmount.toLocaleString('vi-VN')}đ qua MB Bank.`,
          type: 'SYSTEM' as const
        }] : []),
        ...(paymentMethod === 'VIETQR' ? [{
          id: 'LOG-2',
          timestamp: new Date().toISOString(),
          title: 'Chờ xác nhận thanh toán VietQR',
          description: `Đang chờ xác nhận khoản thanh toán ${finalTotal.toLocaleString('vi-VN')}đ qua VietQR MB Bank.`,
          type: 'SYSTEM' as const
        }] : [])
      ]
    };

    try {
      const accessToken = isClerkSignedIn
        ? await getToken()
        : internalUser?.role === 'CUSTOMER'
          ? window.localStorage.getItem('phoneshop-access-token')
          : null;

      if (!accessToken) {
        throw new Error('Không tìm thấy phiên đăng nhập khách hàng. Vui lòng đăng nhập lại.');
      }

      const createdOrder = await ordersService.create({
        variantIds: checkoutItems.map((item) => item.variantId),
        shippingFee,
        discount,
        voucherCode: voucherCode || null,
        note: fulfillmentMode === 'STORE_PICKUP'
          ? `Hẹn đến Showroom: ${appointmentTime}`
          : 'Đơn hàng mới từ website',
        paymentMethod: toOrderPaymentMethod(paymentMethod),
        shippingAddress: {
          name: fullName,
          phone,
          address: fulfillmentMode === 'STORE_PICKUP'
            ? selectedStore
            : address,
          city,
          fulfillmentMode,
          storeAddress: fulfillmentMode === 'STORE_PICKUP' ? selectedStore : undefined,
          appointmentTime: fulfillmentMode === 'STORE_PICKUP' ? appointmentTime : undefined,
        },
      }, accessToken);
      if (paymentMethod === 'STRIPE') {
        const checkout = await ordersService.createStripeCheckout(createdOrder.id, accessToken);
        if (!checkout.checkoutUrl) throw new Error('Stripe không trả về đường dẫn thanh toán');
        window.location.assign(checkout.checkoutUrl);
        return;
      }
    } catch (e) {
      console.error('Failed to create order:', e);
      const message = e instanceof Error ? e.message : 'Không thể tạo đơn hàng';
      toast.error(message);
      setIsSubmitting(false);
      setShowQrModal(false);
      return;
    }

    try {
      const existing = localStorage.getItem(APP_CONFIG.STORAGE.ORDERS_KEY);
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newOrder);
      localStorage.setItem(APP_CONFIG.STORAGE.ORDERS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Could not cache order in localStorage:', e);
    }

    setIsSubmitting(false);
    setShowQrModal(false);
    setIsSuccess(true);
    if (selectedVariantIds && selectedVariantIds.length > 0) {
      selectedVariantIds.forEach((id) => void removeFromCart(id));
    } else {
      clearCart();
    }
    toast.success(isDeposit ? 'Đã ghi nhận đơn hàng, đang chờ xác nhận thanh toán.' : 'Đơn hàng đã được đặt thành công!');
  }, [clearCart, removeFromCart, selectedVariantIds, generatedOrderCode, fullName, phone, address, city, paymentMethod, fulfillmentMode, selectedStore, appointmentTime, depositAmount, remainingAmount, finalTotal, shippingFee, discount, voucherCode, checkoutItems, isClerkSignedIn, getToken, internalUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      toast.error(LABELS.AUTH.ERROR_FILL_REQUIRED);
      return;
    }

    if (fulfillmentMode === 'HOME_DELIVERY' && (!address || !city)) {
      toast.error(LABELS.CHECKOUT.ERROR_MISSING_ADDRESS);
      return;
    }

    if (paymentMethod === 'VIETQR' || paymentMethod === 'DEPOSIT_5') {
      setShowQrModal(true);
    } else {
      setIsSubmitting(true);
      setTimeout(() => {
        handleCompleteOrder();
      }, 800);
    }
  };

  // Construct VietQR URL using APP_CONFIG.BANK
  const vietQrUrl = `https://img.vietqr.io/image/${APP_CONFIG.BANK.BANK_ID}-${APP_CONFIG.BANK.ACCOUNT_NO}-compact2.png?amount=${qrTransferAmount}&addInfo=${isDepositMode ? 'COC5' : 'SOC'}${generatedOrderCode}&accountName=${encodeURIComponent(APP_CONFIG.BANK.ACCOUNT_NAME)}`;

  if (checkoutItems.length === 0 && !isSuccess) {
    if (!canRender) return null;

    return (
      <div className="empty-cart-view">
        <CheckCircle2 size={64} className="empty-cart-icon" style={{ color: 'var(--color-primary)' }} />
        <h2>Giỏ hàng của bạn đang trống</h2>
        <p>Quay lại trang chủ để tìm kiếm và đặt hàng.</p>
        <Link href="/shop" className="btn btn-primary" style={{ textDecoration: 'none', padding: '12px 24px', borderRadius: '12px' }}>
          Quay lại mua sắm
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="checkout-success-view">
        <div className="success-badge">
          <CheckCircle2 size={36} />
        </div>
        <h1 className="cart-header-title" style={{ margin: 0 }}>
          {paymentMethod === 'DEPOSIT_5' ? 'ĐÃ GHI NHẬN YÊU CẦU ĐẶT CỌC' : LABELS.CHECKOUT.ORDER_SUCCESS_TITLE}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
          {paymentMethod === 'DEPOSIT_5' 
            ? 'Đơn hàng đang chờ xác nhận thanh toán. Showroom sẽ giữ máy và hướng dẫn thanh toán sau khi khoản cọc được xác nhận.'
            : LABELS.CHECKOUT.ORDER_SUCCESS_DESC}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '400px', margin: '12px 0' }}>
          <div className="summary-row" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <span>{LABELS.CHECKOUT.ORDER_CODE}</span>
            <span className="success-order-code">SOC-{generatedOrderCode}</span>
          </div>
          <div className="summary-row">
            <span>Người đặt</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{fullName} ({phone})</span>
          </div>
          <div className="summary-row">
            <span>Hình thức nhận</span>
            <span style={{ fontWeight: 700, color: '#6d28d9' }}>
              {fulfillmentMode === 'STORE_PICKUP' ? `Đến Showroom (${selectedStore})` : `Giao tận nơi (${address})`}
            </span>
          </div>
          
          {paymentMethod === 'DEPOSIT_5' && (
            <>
              <div className="summary-row" style={{ color: '#10b981' }}>
                <span>Số tiền đã đặt cọc (5%)</span>
                <span style={{ fontWeight: 800 }}>{formatVND(depositAmount)}</span>
              </div>
              <div className="summary-row" style={{ color: '#ef4444' }}>
                <span>Còn lại thanh toán tại cửa hàng</span>
                <span style={{ fontWeight: 900 }}>{formatVND(remainingAmount)}</span>
              </div>
            </>
          )}

          <div className="summary-row" style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
            <span>Tổng giá trị đơn máy</span>
            <span style={{ fontWeight: 900, color: 'var(--color-danger)' }}>{formatVND(finalTotal)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href={`/orders?code=SOC-${generatedOrderCode}`} className="btn btn-primary" style={{ textDecoration: 'none', padding: '12px 20px', borderRadius: '12px' }}>
            Tra cứu đơn hàng này
          </Link>
          <Link href="/shop" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '12px 20px', borderRadius: '12px' }}>
            {LABELS.CHECKOUT.BACK_TO_HOME}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-layout">
      {/* Left: Input Form */}
      <form onSubmit={handleSubmit} className="checkout-form-panel">
        
        {/* Fulfillment Mode Selection Tabs */}
        <div style={{ marginBottom: '24px' }}>
          <h2 className="checkout-section-title">1. Chọn hình thức nhận hàng</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => {
                setFulfillmentMode('HOME_DELIVERY');
                setPaymentMethod('COD');
              }}
              style={{
                padding: '14px',
                borderRadius: '14px',
                border: '2px solid',
                borderColor: fulfillmentMode === 'HOME_DELIVERY' ? '#6d28d9' : 'var(--border-color)',
                background: fulfillmentMode === 'HOME_DELIVERY' ? 'rgba(109, 40, 217, 0.06)' : 'var(--bg-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.15s ease'
              }}
            >
              <Truck size={24} style={{ color: fulfillmentMode === 'HOME_DELIVERY' ? '#6d28d9' : 'var(--text-muted)' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{LABELS.CHECKOUT.FULFILLMENT_HOME}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{LABELS.CHECKOUT.FULFILLMENT_HOME_SUB}</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setFulfillmentMode('STORE_PICKUP');
                setPaymentMethod('DEPOSIT_5');
              }}
              style={{
                padding: '14px',
                borderRadius: '14px',
                border: '2px solid',
                borderColor: fulfillmentMode === 'STORE_PICKUP' ? '#6d28d9' : 'var(--border-color)',
                background: fulfillmentMode === 'STORE_PICKUP' ? 'rgba(109, 40, 217, 0.06)' : 'var(--bg-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.15s ease'
              }}
            >
              <Store size={24} style={{ color: fulfillmentMode === 'STORE_PICKUP' ? '#6d28d9' : 'var(--text-muted)' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{LABELS.CHECKOUT.FULFILLMENT_STORE}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{LABELS.CHECKOUT.FULFILLMENT_STORE_SUB}</div>
              </div>
            </button>
          </div>
        </div>

        <h2 className="checkout-section-title">
          {fulfillmentMode === 'STORE_PICKUP' ? '2. Thông tin người nhận & Lịch hẹn Showroom' : '2. Thông tin giao hàng'}
        </h2>
        
        <div className="checkout-grid-form">
          <div className="checkout-field-group">
            <label className="checkout-field-label" htmlFor="fullName">{LABELS.CHECKOUT.FULL_NAME}</label>
            <input 
              id="fullName"
              type="text" 
              className="checkout-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder={LABELS.AUTH.FULL_NAME.replace(' *', '')}
            />
          </div>

          <div className="checkout-field-group">
            <label className="checkout-field-label" htmlFor="phone">{LABELS.CHECKOUT.PHONE_NUMBER}</label>
            <input 
              id="phone"
              type="tel" 
              className="checkout-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder={LABELS.CHECKOUT.DEFAULT_PHONE}
            />
          </div>

          {fulfillmentMode === 'HOME_DELIVERY' ? (
            <>
              <div className="checkout-field-group">
                <label className="checkout-field-label" htmlFor="address">{LABELS.CHECKOUT.ADDRESS}</label>
                <input 
                  id="address"
                  type="text" 
                  className="checkout-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="123 Đường số 4, Phường 5"
                />
              </div>

              <div className="checkout-field-group">
                <label className="checkout-field-label" htmlFor="city">{LABELS.CHECKOUT.CITY_SELECT}</label>
                <select 
                  id="city"
                  className="checkout-select"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="checkout-field-group" style={{ gridColumn: 'span 2' }}>
                <label className="checkout-field-label" htmlFor="showroomSelect">{LABELS.CHECKOUT.SELECT_SHOWROOM}</label>
                <select 
                  id="showroomSelect"
                  className="checkout-select"
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                >
                  {CITY_COORDINATES.map(c => (
                    <option key={c.name} value={`${c.name} - ${c.nearestStoreAddress}`}>
                      [{c.name}] {c.nearestStoreAddress}
                    </option>
                  ))}
                </select>
              </div>

              <div className="checkout-field-group" style={{ gridColumn: 'span 2' }}>
                <label className="checkout-field-label" htmlFor="appointmentTime">{LABELS.CHECKOUT.SELECT_APPOINTMENT_TIME}</label>
                <select 
                  id="appointmentTime"
                  className="checkout-select"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                >
                  {APP_CONFIG.APPOINTMENT_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <h2 className="checkout-section-title" style={{ marginTop: '28px' }}>3. Phương thức thanh toán</h2>
        <div className="payment-methods-list">
          
          {fulfillmentMode === 'STORE_PICKUP' ? (
            <>
              {/* Option 1: Deposit 5% */}
              <div 
                className={`payment-method-option ${paymentMethod === 'DEPOSIT_5' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('DEPOSIT_5')}
                style={{ borderLeft: '4px solid #6d28d9' }}
              >
                <input 
                  type="radio" 
                  className="payment-method-radio"
                  checked={paymentMethod === 'DEPOSIT_5'}
                  onChange={() => setPaymentMethod('DEPOSIT_5')}
                />
                <div className="payment-method-info">
                  <span className="payment-method-name" style={{ color: '#6d28d9', fontWeight: 800 }}>
                    <QrCode size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> 
                    Đặt cọc 5% giữ máy trước ({formatVND(depositAmount)})
                  </span>
                  <span className="payment-method-desc">
                    Quét mã VietQR cọc 5%. Showroom đảm bảo giữ đúng màu/dung lượng cho bạn trong 48h. Số tiền còn lại ({formatVND(remainingAmount)}) thanh toán tại quầy.
                  </span>
                </div>
              </div>

              {/* Option 2: Pay at Store */}
              <div 
                className={`payment-method-option ${paymentMethod === 'PAY_AT_STORE' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('PAY_AT_STORE')}
              >
                <input 
                  type="radio" 
                  className="payment-method-radio"
                  checked={paymentMethod === 'PAY_AT_STORE'}
                  onChange={() => setPaymentMethod('PAY_AT_STORE')}
                />
                <div className="payment-method-info">
                  <span className="payment-method-name">
                    <Banknote size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> 
                    Thanh toán 100% tại Cửa hàng (Showroom)
                  </span>
                  <span className="payment-method-desc">
                    Không cần cọc trước. Bạn đến xem máy trải nghiệm trực tiếp rồi quẹt thẻ POS hoặc trả tiền mặt ({formatVND(finalTotal)}).
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Option COD */}
              <div 
                className={`payment-method-option ${paymentMethod === 'COD' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('COD')}
              >
                <input 
                  type="radio" 
                  className="payment-method-radio"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                />
                <div className="payment-method-info">
                  <span className="payment-method-name">
                    <Banknote size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> 
                    {LABELS.CHECKOUT.PAYMENT_COD}
                  </span>
                  <span className="payment-method-desc">Thanh toán bằng tiền mặt khi nhận hàng.</span>
                </div>
              </div>

              {/* Option VietQR 100% */}
              <div 
                className={`payment-method-option ${paymentMethod === 'VIETQR' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('VIETQR')}
              >
                <input 
                  type="radio" 
                  className="payment-method-radio"
                  checked={paymentMethod === 'VIETQR'}
                  onChange={() => setPaymentMethod('VIETQR')}
                />
                <div className="payment-method-info">
                  <span className="payment-method-name">
                    <QrCode size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> 
                    {LABELS.CHECKOUT.PAYMENT_QR} (Thanh toán 100%)
                  </span>
                  <span className="payment-method-desc">Quét mã chuyển khoản nhanh MB Bank siêu tiện lợi.</span>
                </div>
              </div>

              <div
                className={`payment-method-option ${paymentMethod === 'STRIPE' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('STRIPE')}
              >
                <input
                  type="radio"
                  className="payment-method-radio"
                  checked={paymentMethod === 'STRIPE'}
                  onChange={() => setPaymentMethod('STRIPE')}
                />
                <div className="payment-method-info">
                  <span className="payment-method-name">Thanh toán bằng thẻ qua Stripe</span>
                  <span className="payment-method-desc">Chuyển tới Stripe Checkout để thanh toán bằng thẻ test.</span>
                </div>
              </div>
            </>
          )}

        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="btn btn-primary checkout-btn"
          style={{ marginTop: '28px', padding: '14px', fontSize: '15px', fontWeight: 800 }}
        >
          {isSubmitting ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Loader2 className="animate-spin" size={16} /> Đang xử lý...
            </span>
          ) : paymentMethod === 'DEPOSIT_5' ? (
            `Xác nhận Đặt cọc 5% (${formatVND(depositAmount)})`
          ) : paymentMethod === 'STRIPE' ? (
            'Thanh toán qua Stripe'
          ) : (
            LABELS.CHECKOUT.PLACE_ORDER_BTN
          )}
        </button>

      </form>

      {/* Right: Cart Summary */}
      <div className="checkout-summary-panel">
        <h2 className="checkout-section-title" style={{ borderLeftColor: 'var(--color-warning)' }}>
          {LABELS.CHECKOUT.ORDER_SUMMARY}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
          {checkoutItems.map((item) => (
            <div key={item.variantId} className="checkout-summary-item">
              <div className="checkout-summary-img-wrapper">
                <SafeImage
                  src={item.imageUrl || ''}
                  alt={item.productName}
                  fill
                  style={{ objectFit: 'contain', padding: '4px' }}
                />
              </div>
              <div className="checkout-summary-details">
                <span className="checkout-summary-name">{item.productName}</span>
                <span className="checkout-summary-meta">Số lượng: {item.quantity} | {item.storage}</span>
              </div>
              <span className="checkout-summary-price">{formatVND(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          <div className="summary-row">
            <span>{LABELS.CART.TEMP_PRICE}</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatVND(itemsSubtotal)}</span>
          </div>

          <div className="summary-row">
            <span>{LABELS.CART.SHIPPING_FEE}</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {shippingFee === 0 ? LABELS.CART.SHIPPING_FREE : formatVND(shippingFee)}
            </span>
          </div>

          {discount > 0 && (
            <div className="summary-row" style={{ color: 'var(--color-success)' }}>
              <span>{LABELS.CART.DISCOUNT} ({voucherCode})</span>
              <span style={{ fontWeight: 700 }}>-{formatVND(discount)}</span>
            </div>
          )}

          <div className="summary-row total-row">
            <span>Tổng giá trị đơn</span>
            <span className="total-val" style={{ fontSize: '18px' }}>{formatVND(finalTotal)}</span>
          </div>

          {paymentMethod === 'DEPOSIT_5' && (
            <div style={{ background: 'rgba(109, 40, 217, 0.08)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(109, 40, 217, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800, color: '#6d28d9' }}>
                <span>Đặt cọc 5% VietQR:</span>
                <span>{formatVND(depositAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <span>Còn lại trả tại Showroom:</span>
                <span style={{ fontWeight: 700 }}>{formatVND(remainingAmount)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VietQR Dialog Pop-up Component */}
      {showQrModal && (
        <VietQrModal
          isDepositMode={isDepositMode}
          depositAmount={depositAmount}
          remainingAmount={remainingAmount}
          finalTotal={finalTotal}
          qrTransferAmount={qrTransferAmount}
          generatedOrderCode={generatedOrderCode}
          vietQrUrl={vietQrUrl}
          onConfirm={handleCompleteOrder}
          onClose={() => setShowQrModal(false)}
        />
      )}

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)' }}>
      <Header />
      <main style={{ flexGrow: 1, padding: '24px 0' }}>
        <Suspense fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        }>
          <CheckoutForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
