'use client';

import React from 'react';
import { Check, ArrowRight, RefreshCw, PenLine } from 'lucide-react';

interface InstallmentStepperProps {
  currentStep: 1 | 2 | 3 | 4;
}

const STEPS = [
  {
    step: 1 as const,
    title: 'Chọn gói & Đối tác',
    subtitle: 'Bước 1',
  },
  {
    step: 2 as const,
    title: 'Xác thực CCCD & Hồ sơ',
    subtitle: 'Bước 2',
  },
  {
    step: 3 as const,
    title: 'Xét duyệt tự động AI',
    subtitle: 'Bước 3',
  },
  {
    step: 4 as const,
    title: 'Ký hợp đồng & Nhận máy',
    subtitle: 'Bước 4',
  },
];

export default function InstallmentStepper({
  currentStep,
}: InstallmentStepperProps) {
  return (
    <section className="bg-white rounded-2xl p-4 sm:p-5 border border-[#c4c5d9]/40 shadow-xs mb-6 select-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
        {STEPS.map((item) => {
          const isDone = item.step < currentStep;
          const isActive = item.step === currentStep;

          return (
            <div
              key={item.step}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-default ${
                isActive
                  ? 'bg-[#143de7]/10 border border-[#143de7]/30 shadow-xs'
                  : isDone
                  ? 'bg-[#006347]/5 border border-[#006347]/20'
                  : 'bg-[#f2f3ff]/60 border border-transparent opacity-75'
              }`}
            >
              {/* Step indicator icon/number */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                  isActive
                    ? 'bg-[#143de7] text-white shadow-md shadow-[#143de7]/30'
                    : isDone
                    ? 'bg-[#006347] text-white shadow-xs'
                    : 'bg-[#dae2fd] text-[#444656]'
                }`}
              >
                {isDone ? (
                  <Check className="size-5" />
                ) : isActive ? (
                  item.step === 3 ? (
                    <RefreshCw className="size-5 animate-spin" />
                  ) : item.step === 4 ? (
                    <PenLine className="size-5" />
                  ) : (
                    item.step
                  )
                ) : (
                  item.step
                )}
              </div>

              {/* Title & subtitle */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[11px] uppercase tracking-wider block font-semibold ${
                      isActive
                        ? 'text-[#143de7]'
                        : isDone
                        ? 'text-[#006347]'
                        : 'text-[#747688]'
                    }`}
                  >
                    {item.subtitle}
                  </span>
                  {isDone && (
                    <span className="text-[10px] bg-[#60fcc5]/30 text-[#006347] font-bold px-1.5 py-0.2 rounded-full">
                      Hoàn tất
                    </span>
                  )}
                  {isActive && item.step === 3 && (
                    <span className="text-[10px] bg-[#3b5bff]/15 text-[#143de7] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#143de7] animate-ping" />
                      Đang xử lý
                    </span>
                  )}
                </div>
                <span
                  className={`text-sm block truncate ${
                    isActive
                      ? 'font-bold text-[#131b2e]'
                      : isDone
                      ? 'font-semibold text-[#131b2e]'
                      : 'font-medium text-[#444656]'
                  }`}
                >
                  {item.title}
                </span>
              </div>

              {isActive && (
                <ArrowRight className="size-4 text-[#143de7] hidden xl:block shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
