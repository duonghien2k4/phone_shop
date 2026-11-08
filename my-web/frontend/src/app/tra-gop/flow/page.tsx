'use client';

import React, { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Home, ChevronRight } from 'lucide-react';
import ShopAnnouncementBar from '@/components/features/shop/ShopAnnouncementBar';
import Header from '@/components/base/Header';
import Footer from '@/components/base/Footer';
import InstallmentStepper from '@/components/features/tra-gop/InstallmentStepper';
import Step1ChoosePackage from '@/components/features/tra-gop/Step1ChoosePackage';
import Step2KycVerification from '@/components/features/tra-gop/Step2KycVerification';
import Step3AiApproval from '@/components/features/tra-gop/Step3AiApproval';
import Step4ContractSuccess from '@/components/features/tra-gop/Step4ContractSuccess';
import { useInstallmentFlowStore } from '@/store/useInstallmentFlowStore';
import { useCart } from '@/hooks/useCart';
import type { InstallmentDevice } from '@/types/installment-flow';

function FlowContent() {
  const searchParams = useSearchParams();
  const { items } = useCart();
  const { currentStep, initFromQuery, setSelectedDevice } = useInstallmentFlowStore();
  const cartVariantId = searchParams.get('cartVariantId');
  const cartItem = cartVariantId
    ? items.find((item) => item.variantId === Number(cartVariantId))
    : undefined;

  useEffect(() => {
    initFromQuery({
      deviceId: searchParams.get('deviceId'),
      prepaid: searchParams.get('prepaid'),
      tenure: searchParams.get('tenure'),
      method: searchParams.get('method'),
      partnerId: searchParams.get('partnerId'),
    });

    if (cartItem) {
      const device: InstallmentDevice = {
        id: `cart-${cartItem.variantId}`,
        name: cartItem.productName,
        subname: cartItem.storage,
        version: 'Sản phẩm trong giỏ hàng',
        color: cartItem.color || 'Mặc định',
        colorName: cartItem.color || 'Mặc định',
        storage: cartItem.storage || 'Mặc định',
        originalPrice: cartItem.price,
        price: cartItem.price,
        image: cartItem.imageUrl || '',
        tag: 'Sản phẩm đã chọn',
        badge: 'Trả góp 0%',
      };
      setSelectedDevice(device);
    }
  }, [cartItem, initFromQuery, searchParams, setSelectedDevice]);

  return (
    <main className="grow w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs sm:text-sm text-[#747688] mb-4"
      >
        <Link
          href="/"
          className="hover:text-[#143de7] transition-colors flex items-center gap-1"
        >
          <Home className="size-4" />
          Trang chủ
        </Link>
        <ChevronRight className="size-3.5 text-[#c4c5d9]" />
        <Link
          href="/tra-gop"
          className="hover:text-[#143de7] transition-colors"
        >
          Trả góp 0%
        </Link>
        <ChevronRight className="size-3.5 text-[#c4c5d9]" />
        <span className="text-[#131b2e] font-semibold">
          Quy trình đăng ký hồ sơ
        </span>
      </nav>

      {/* Stepper (Read-only progress display, cannot skip steps by clicking) */}
      <InstallmentStepper currentStep={currentStep} />

      {/* Active Step Content */}
      <div className="transition-all duration-300">
        {currentStep === 1 && <Step1ChoosePackage />}
        {currentStep === 2 && <Step2KycVerification />}
        {currentStep === 3 && <Step3AiApproval />}
        {currentStep === 4 && <Step4ContractSuccess />}
      </div>
    </main>
  );
}

export default function InstallmentFlowPage() {
  return (
    <div className="bg-[#faf8ff] text-[#131b2e] font-sans antialiased min-h-screen flex flex-col selection:bg-[#bac3ff] selection:text-[#00105b]">
      {/* Mandatory Base Elements */}
      <ShopAnnouncementBar />
      <Header />

      {/* Flow Body wrapped in Suspense for search params */}
      <Suspense
        fallback={
          <div className="grow w-full max-w-[1320px] mx-auto px-4 py-16 flex items-center justify-center">
            <div className="animate-pulse text-[#143de7] font-semibold text-sm">
              Đang tải quy trình trả góp...
            </div>
          </div>
        }
      >
        <FlowContent />
      </Suspense>

      {/* Mandatory Base Footer */}
      <Footer />
    </div>
  );
}
