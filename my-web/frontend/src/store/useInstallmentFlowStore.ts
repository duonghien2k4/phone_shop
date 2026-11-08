import { create } from 'zustand';
import {
  InstallmentDevice,
  FinancePartner,
  CustomerKycInfo,
  LoanCalculation,
} from '@/types/installment-flow';
import {
  MOCK_DEVICES,
  MOCK_FINANCE_PARTNERS,
  MOCK_INITIAL_KYC,
  calculateLoan,
  getInstallmentDeviceById,
  getFinancePartnerById,
} from '@/data/mock-installment-flow';

export interface InstallmentFlowState {
  currentStep: 1 | 2 | 3 | 4;
  maxAllowedStep: number;
  selectedDevice: InstallmentDevice;
  prepaidPercent: number; // 0, 10, 20, 30, 50
  tenureMonths: number; // 3, 6, 9, 12
  financeMethod: 'company' | 'credit_card';
  selectedPartnerId: string;
  includeWarranty: boolean;
  includeLoanInsurance: boolean;
  kycInfo: CustomerKycInfo;
  isSigned: boolean;
  contractCode: string;
  orderCode: string;
  applicationCode?: string;
  createdApplication?: any;

  // Computed helper
  getCalculation: () => LoanCalculation;
  getSelectedPartner: () => FinancePartner;

  // Actions
  setStep: (step: 1 | 2 | 3 | 4) => void;
  nextStep: () => void;
  prevStep: () => void;
  setSelectedDevice: (device: InstallmentDevice) => void;
  setPrepaidPercent: (percent: number) => void;
  setTenureMonths: (months: number) => void;
  setFinanceMethod: (method: 'company' | 'credit_card') => void;
  setSelectedPartnerId: (partnerId: string) => void;
  setIncludeWarranty: (val: boolean) => void;
  setIncludeLoanInsurance: (val: boolean) => void;
  updateKycInfo: (partial: Partial<CustomerKycInfo>) => void;
  setIsSigned: (isSigned: boolean) => void;
  setCreatedApplication: (app: any) => void;
  initFromQuery: (params: {
    deviceId?: string | null;
    prepaid?: string | null;
    tenure?: string | null;
    method?: string | null;
    partnerId?: string | null;
  }) => void;
  reset: () => void;
}

export const useInstallmentFlowStore = create<InstallmentFlowState>((set, get) => ({
  currentStep: 1,
  maxAllowedStep: 1,
  selectedDevice: MOCK_DEVICES[0],
  prepaidPercent: 20,
  tenureMonths: 12,
  financeMethod: 'company',
  selectedPartnerId: 'home-credit',
  includeWarranty: false,
  includeLoanInsurance: true,
  kycInfo: { ...MOCK_INITIAL_KYC },
  isSigned: false,
  contractCode: '#HDTG-2025-88912',
  orderCode: '#PZ-88912',

  getSelectedPartner: () => {
    const { selectedPartnerId } = get();
    return (
      getFinancePartnerById(selectedPartnerId) ||
      MOCK_FINANCE_PARTNERS[0]
    );
  },

  getCalculation: () => {
    const {
      selectedDevice,
      prepaidPercent,
      tenureMonths,
      includeWarranty,
    } = get();
    const partner = get().getSelectedPartner();
    return calculateLoan(
      selectedDevice,
      prepaidPercent,
      tenureMonths,
      partner,
      includeWarranty
    );
  },

  // Strictly enforce: users cannot skip ahead beyond maxAllowedStep
  setStep: (step) =>
    set((state) => {
      const allowed = Math.min(step, state.maxAllowedStep) as 1 | 2 | 3 | 4;
      return { currentStep: allowed };
    }),

  // Confirmed completion moves to next step and unlocks it
  nextStep: () =>
    set((state) => {
      const next = Math.min(4, state.currentStep + 1) as 1 | 2 | 3 | 4;
      return {
        currentStep: next,
        maxAllowedStep: Math.max(state.maxAllowedStep, next),
      };
    }),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(1, state.currentStep - 1) as 1 | 2 | 3 | 4,
    })),

  setSelectedDevice: (device) => set({ selectedDevice: device }),
  setPrepaidPercent: (percent) => set({ prepaidPercent: percent }),
  setTenureMonths: (months) => set({ tenureMonths: months }),
  setFinanceMethod: (method) => set({ financeMethod: method }),
  setSelectedPartnerId: (partnerId) => set({ selectedPartnerId: partnerId }),
  setIncludeWarranty: (val) => set({ includeWarranty: val }),
  setIncludeLoanInsurance: (val) => set({ includeLoanInsurance: val }),
  updateKycInfo: (partial) =>
    set((state) => ({ kycInfo: { ...state.kycInfo, ...partial } })),
  setIsSigned: (isSigned) => set({ isSigned }),
  setCreatedApplication: (app) =>
    set({
      createdApplication: app,
      applicationCode: app?.applicationCode,
      contractCode: app?.applicationCode || '#HDTG-2026',
    }),

  initFromQuery: (params) => {
    set((state) => {
      const updates: Partial<InstallmentFlowState> = {};
      if (params.deviceId) {
        const found = getInstallmentDeviceById(params.deviceId);
        if (found) updates.selectedDevice = found;
      }
      if (params.prepaid) {
        const p = parseInt(params.prepaid, 10);
        if (!isNaN(p)) updates.prepaidPercent = p;
      }
      if (params.tenure) {
        const t = parseInt(params.tenure, 10);
        if (!isNaN(t)) updates.tenureMonths = t;
      }
      if (params.method === 'company' || params.method === 'credit_card') {
        updates.financeMethod = params.method;
      }
      if (params.partnerId) {
        const partnerFound = getFinancePartnerById(params.partnerId);
        if (partnerFound) updates.selectedPartnerId = params.partnerId;
      }
      return { ...state, ...updates };
    });
  },

  reset: () =>
    set({
      currentStep: 1,
      maxAllowedStep: 1,
      selectedDevice: MOCK_DEVICES[0],
      prepaidPercent: 20,
      tenureMonths: 12,
      financeMethod: 'company',
      selectedPartnerId: 'home-credit',
      includeWarranty: false,
      includeLoanInsurance: true,
      kycInfo: { ...MOCK_INITIAL_KYC },
      isSigned: false,
    }),
}));
