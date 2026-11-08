"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryInstallmentDto = exports.CancelApplicationDto = exports.RecordDecisionDto = exports.RequestInfoDto = exports.ResubmitInstallmentDto = exports.CreateInstallmentApplicationDto = exports.VerifyInstallmentOtpDto = exports.RequestInstallmentOtpDto = void 0;
const class_validator_1 = require("class-validator");
class RequestInstallmentOtpDto {
    email;
}
exports.RequestInstallmentOtpDto = RequestInstallmentOtpDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RequestInstallmentOtpDto.prototype, "email", void 0);
class VerifyInstallmentOtpDto {
    challengeId;
    email;
    code;
}
exports.VerifyInstallmentOtpDto = VerifyInstallmentOtpDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], VerifyInstallmentOtpDto.prototype, "challengeId", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], VerifyInstallmentOtpDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.Matches)(/^\d{6}$/),
    __metadata("design:type", String)
], VerifyInstallmentOtpDto.prototype, "code", void 0);
class CreateInstallmentApplicationDto {
    otpChallengeId;
    financePartnerId;
    productId;
    productVariantId;
    productName;
    productPrice;
    prepaidPercent;
    downPayment;
    financedAmount;
    termMonths;
    monthlyPayment;
    fullName;
    citizenId;
    dateOfBirth;
    gender;
    phoneNumber;
    email;
    permanentAddress;
    currentAddress;
    jobTitle;
    monthlyIncome;
    companyName;
    refRelation;
    refName;
    refPhone;
    deliveryMethod;
    pickupStoreId;
    idCardFrontUrl;
    idCardBackUrl;
    signatureUrl;
    orderId;
}
exports.CreateInstallmentApplicationDto = CreateInstallmentApplicationDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "otpChallengeId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "financePartnerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateInstallmentApplicationDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateInstallmentApplicationDto.prototype, "productVariantId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "productName", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateInstallmentApplicationDto.prototype, "productPrice", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateInstallmentApplicationDto.prototype, "prepaidPercent", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateInstallmentApplicationDto.prototype, "downPayment", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateInstallmentApplicationDto.prototype, "financedAmount", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateInstallmentApplicationDto.prototype, "termMonths", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateInstallmentApplicationDto.prototype, "monthlyPayment", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "citizenId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "permanentAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "currentAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "jobTitle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "monthlyIncome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "companyName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "refRelation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "refName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "refPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "deliveryMethod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "pickupStoreId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "idCardFrontUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "idCardBackUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInstallmentApplicationDto.prototype, "signatureUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateInstallmentApplicationDto.prototype, "orderId", void 0);
class ResubmitInstallmentDto {
    notes;
    idCardFrontUrl;
    idCardBackUrl;
    signatureUrl;
    permanentAddress;
    currentAddress;
    monthlyIncome;
    companyName;
    refPhone;
}
exports.ResubmitInstallmentDto = ResubmitInstallmentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResubmitInstallmentDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResubmitInstallmentDto.prototype, "idCardFrontUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResubmitInstallmentDto.prototype, "idCardBackUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResubmitInstallmentDto.prototype, "signatureUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResubmitInstallmentDto.prototype, "permanentAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResubmitInstallmentDto.prototype, "currentAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResubmitInstallmentDto.prototype, "monthlyIncome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResubmitInstallmentDto.prototype, "companyName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResubmitInstallmentDto.prototype, "refPhone", void 0);
class RequestInfoDto {
    reason;
    notes;
    checklist;
}
exports.RequestInfoDto = RequestInfoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RequestInfoDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestInfoDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], RequestInfoDto.prototype, "checklist", void 0);
class RecordDecisionDto {
    decision;
    decisionSource;
    reason;
    referenceCode;
}
exports.RecordDecisionDto = RecordDecisionDto;
__decorate([
    (0, class_validator_1.IsEnum)(['APPROVED', 'REJECTED']),
    __metadata("design:type", String)
], RecordDecisionDto.prototype, "decision", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['INTERNAL', 'PARTNER']),
    __metadata("design:type", String)
], RecordDecisionDto.prototype, "decisionSource", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RecordDecisionDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordDecisionDto.prototype, "referenceCode", void 0);
class CancelApplicationDto {
    reason;
}
exports.CancelApplicationDto = CancelApplicationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CancelApplicationDto.prototype, "reason", void 0);
class QueryInstallmentDto {
    page;
    limit;
    status;
    partnerId;
    search;
}
exports.QueryInstallmentDto = QueryInstallmentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryInstallmentDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryInstallmentDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryInstallmentDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryInstallmentDto.prototype, "partnerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryInstallmentDto.prototype, "search", void 0);
//# sourceMappingURL=installment-application.dto.js.map