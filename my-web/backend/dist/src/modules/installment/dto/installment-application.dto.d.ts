export declare class RequestInstallmentOtpDto {
    email: string;
}
export declare class VerifyInstallmentOtpDto {
    challengeId: string;
    email: string;
    code: string;
}
export declare class CreateInstallmentApplicationDto {
    otpChallengeId: string;
    financePartnerId: string;
    productId?: number;
    productVariantId?: number;
    productName: string;
    productPrice: number;
    prepaidPercent: number;
    downPayment: number;
    financedAmount: number;
    termMonths: number;
    monthlyPayment: number;
    fullName: string;
    citizenId: string;
    dateOfBirth?: string;
    gender?: string;
    phoneNumber: string;
    email: string;
    permanentAddress?: string;
    currentAddress?: string;
    jobTitle?: string;
    monthlyIncome?: string;
    companyName?: string;
    refRelation?: string;
    refName?: string;
    refPhone?: string;
    deliveryMethod?: string;
    pickupStoreId?: string;
    idCardFrontUrl?: string;
    idCardBackUrl?: string;
    signatureUrl?: string;
    orderId?: number;
}
export declare class ResubmitInstallmentDto {
    notes: string;
    idCardFrontUrl?: string;
    idCardBackUrl?: string;
    signatureUrl?: string;
    permanentAddress?: string;
    currentAddress?: string;
    monthlyIncome?: string;
    companyName?: string;
    refPhone?: string;
}
export declare class RequestInfoDto {
    reason: string;
    notes?: string;
    checklist?: string[];
}
export declare class RecordDecisionDto {
    decision: 'APPROVED' | 'REJECTED';
    decisionSource: 'INTERNAL' | 'PARTNER';
    reason: string;
    referenceCode?: string;
}
export declare class CancelApplicationDto {
    reason?: string;
}
export declare class QueryInstallmentDto {
    page?: string;
    limit?: string;
    status?: string;
    partnerId?: string;
    search?: string;
}
