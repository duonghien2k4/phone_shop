'use client';

import React, { useEffect, use } from 'react';
import ShopAnnouncementBar from '@/components/features/shop/ShopAnnouncementBar';
import Header from '@/components/base/Header';
import Footer from '@/components/base/Footer';
import InstallmentStepper from '@/components/features/tra-gop/InstallmentStepper';
import Step1ChoosePackage from '@/components/features/tra-gop/Step1ChoosePackage';
import Step2KycVerification from '@/components/features/tra-gop/Step2KycVerification';
import Step3AiApproval from '@/components/features/tra-gop/Step3AiApproval';
import Step4ContractSuccess from '@/components/features/tra-gop/Step4ContractSuccess';
import { useInstallmentFlowStore } from '@/store/useInstallmentFlowStore';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';

interface PageProps {
  params: Promise<{ step: string }>;
}

export default function StepSubroutePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { currentStep, setStep } = useInstallmentFlowStore();

  useEffect(() => {
    const raw = resolvedParams.step.replace('step-', '').replace('step', '');
    const num = parseInt(raw, 10);
    if (num >= 1 && num <= 4) {
      setStep(num as 1 | 2 | 3 | 4);
    }
  }, [resolvedParams.step, setStep]);

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] font-sans antialiased min-h-screen flex flex-col selection:bg-[#bac3ff] selection:text-[#00105b]">
      <ShopAnnouncementBar />
      <Header />

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

      <Footer />
    </div>
  );
}
