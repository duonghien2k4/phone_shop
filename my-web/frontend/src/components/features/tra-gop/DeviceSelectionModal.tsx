'use client';

import React from 'react';
import { X, Check, Smartphone } from 'lucide-react';
import { InstallmentDevice } from '@/types/installment-flow';
import { MOCK_DEVICES, formatVND } from '@/data/mock-installment-flow';
import { Button } from '@/components/ui/button';

interface DeviceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDevice: InstallmentDevice;
  onSelectDevice: (device: InstallmentDevice) => void;
}

export default function DeviceSelectionModal({
  isOpen,
  onClose,
  selectedDevice,
  onSelectDevice,
}: DeviceSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl border border-[#c4c5d9]/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#c4c5d9]/30 flex items-center justify-between bg-[#faf8ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#143de7]/10 flex items-center justify-center text-[#143de7]">
              <Smartphone className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#131b2e]">
                Chọn Sản Phẩm & Phiên Bản
              </h3>
              <p className="text-xs text-[#747688]">
                Lựa chọn thiết bị muốn đăng ký trả góp 0%
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#747688] hover:bg-[#eaedff] hover:text-[#131b2e] transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Device List */}
        <div className="p-6 overflow-y-auto space-y-3.5 divide-y divide-[#c4c5d9]/20">
          {MOCK_DEVICES.map((device) => {
            const isSelected = device.id === selectedDevice.id;
            return (
              <div
                key={device.id}
                onClick={() => {
                  onSelectDevice(device);
                  onClose();
                }}
                className={`pt-3.5 first:pt-0 flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'border-2 border-[#143de7] bg-[#143de7]/5'
                    : 'border-[#c4c5d9]/40 hover:border-[#143de7]/50 hover:bg-[#faf8ff]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#f2f3ff] p-1.5 shrink-0 border border-[#c4c5d9]/30 flex items-center justify-center">
                    <img
                      src={device.image}
                      alt={device.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#006347]/10 text-[#006347]">
                        {device.tag}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#fe6a34]/10 text-[#fe6a34]">
                        {device.badge}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-[#131b2e]">
                      {device.name} {device.storage}
                    </h4>
                    <p className="text-xs text-[#747688]">
                      Màu: {device.color}
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-base font-extrabold text-[#143de7]">
                        {formatVND(device.price)}
                      </span>
                      <span className="text-xs text-[#747688] line-through">
                        {formatVND(device.originalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pl-3">
                  {isSelected ? (
                    <div className="w-7 h-7 rounded-full bg-[#143de7] text-white flex items-center justify-center shadow-xs">
                      <Check className="size-4 stroke-[3]" />
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-[#c4c5d9] hover:bg-[#143de7] hover:text-white"
                    >
                      Chọn
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#faf8ff] border-t border-[#c4c5d9]/30 flex justify-end">
          <Button
            onClick={onClose}
            className="rounded-xl bg-[#143de7] text-white hover:bg-[#143de7]/90 px-6"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}

