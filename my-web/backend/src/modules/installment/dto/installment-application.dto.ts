import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateInstallmentApplicationDto {
  @IsString()
  @IsNotEmpty()
  financePartnerId: string;

  @IsOptional()
  @IsInt()
  productId?: number;

  @IsOptional()
  @IsInt()
  productVariantId?: number;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsNumber()
  @Min(0)
  productPrice: number;

  @IsInt()
  @Min(0)
  prepaidPercent: number;

  @IsNumber()
  @Min(0)
  downPayment: number;

  @IsNumber()
  @Min(0)
  financedAmount: number;

  @IsInt()
  @Min(1)
  termMonths: number;

  @IsNumber()
  @Min(0)
  monthlyPayment: number;

  // KYC
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  citizenId: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  permanentAddress?: string;

  @IsOptional()
  @IsString()
  currentAddress?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  monthlyIncome?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  refRelation?: string;

  @IsOptional()
  @IsString()
  refName?: string;

  @IsOptional()
  @IsString()
  refPhone?: string;

  @IsOptional()
  @IsString()
  deliveryMethod?: string;

  @IsOptional()
  @IsString()
  pickupStoreId?: string;

  @IsOptional()
  @IsString()
  idCardFrontUrl?: string;

  @IsOptional()
  @IsString()
  idCardBackUrl?: string;

  @IsOptional()
  @IsString()
  signatureUrl?: string;

  @IsOptional()
  @IsInt()
  orderId?: number;
}

export class ResubmitInstallmentDto {
  @IsString()
  @IsNotEmpty()
  notes: string;

  @IsOptional()
  @IsString()
  idCardFrontUrl?: string;

  @IsOptional()
  @IsString()
  idCardBackUrl?: string;

  @IsOptional()
  @IsString()
  signatureUrl?: string;

  @IsOptional()
  @IsString()
  permanentAddress?: string;

  @IsOptional()
  @IsString()
  currentAddress?: string;

  @IsOptional()
  @IsString()
  monthlyIncome?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  refPhone?: string;
}

export class RequestInfoDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  checklist?: string[];
}

export class RecordDecisionDto {
  @IsEnum(['APPROVED', 'REJECTED'])
  decision: 'APPROVED' | 'REJECTED';

  @IsEnum(['INTERNAL', 'PARTNER'])
  decisionSource: 'INTERNAL' | 'PARTNER';

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsString()
  referenceCode?: string;
}

export class CancelApplicationDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class QueryInstallmentDto {
  @IsOptional()
  page?: string;

  @IsOptional()
  limit?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  partnerId?: string;

  @IsOptional()
  search?: string;
}

