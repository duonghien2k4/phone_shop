"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstallmentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_crypto_1 = require("node:crypto");
const prisma_service_1 = require("../../database/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let InstallmentService = class InstallmentService {
    prisma;
    configService;
    uploadDir = path.join(process.cwd(), 'uploads', 'installment');
    otpHashKey = (0, node_crypto_1.randomBytes)(32);
    otpChallenges = new Map();
    latestOtpByEmail = new Map();
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    async sendOtp(email) {
        const normalizedEmail = email.trim().toLowerCase();
        const now = Date.now();
        this.pruneOtpChallenges(now);
        const previous = this.latestOtpByEmail.get(normalizedEmail);
        if (previous && now - previous.sentAt < 60_000) {
            throw new common_1.HttpException('Vui lòng đợi 60 giây trước khi gửi lại mã OTP', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const serviceId = this.configService.get('emailjs.serviceId');
        const templateId = this.configService.get('emailjs.templateId');
        const publicKey = this.configService.get('emailjs.publicKey');
        const privateKey = this.configService.get('emailjs.privateKey');
        if (!serviceId || !templateId || !publicKey || !privateKey) {
            throw new common_1.ServiceUnavailableException('Chưa cấu hình EmailJS. Vui lòng thiết lập EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY và EMAILJS_PRIVATE_KEY.');
        }
        const code = String((0, node_crypto_1.randomInt)(100_000, 1_000_000));
        const challengeId = (0, node_crypto_1.randomUUID)();
        const expiresAt = now + 5 * 60_000;
        try {
            const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(10_000),
                body: JSON.stringify({
                    service_id: serviceId,
                    template_id: templateId,
                    user_id: publicKey,
                    accessToken: privateKey,
                    template_params: {
                        email: normalizedEmail,
                        passcode: code,
                        expiry_minutes: 5,
                    },
                }),
            });
            if (!response.ok) {
                const providerMessage = (await response.text())
                    .replaceAll(privateKey, '[redacted]')
                    .replaceAll(publicKey, '[redacted]')
                    .replace(/[\r\n\t]+/g, ' ')
                    .slice(0, 500);
                throw new common_1.ServiceUnavailableException(`EmailJS từ chối gửi email OTP (HTTP ${response.status})${providerMessage ? `: ${providerMessage}` : ''}`);
            }
        }
        catch (error) {
            if (error instanceof common_1.ServiceUnavailableException) {
                throw error;
            }
            throw new common_1.ServiceUnavailableException('Không kết nối được EmailJS để gửi OTP. Vui lòng thử lại sau.');
        }
        if (previous) {
            this.otpChallenges.delete(previous.challengeId);
        }
        this.otpChallenges.set(challengeId, {
            email: normalizedEmail,
            codeHash: this.hashOtp(challengeId, code),
            expiresAt,
            attempts: 0,
            verifiedAt: null,
            consumedAt: null,
        });
        this.latestOtpByEmail.set(normalizedEmail, { sentAt: now, challengeId });
        return { challengeId, expiresInSeconds: 300, resendAfterSeconds: 60 };
    }
    verifyOtp(dto) {
        const email = dto.email.trim().toLowerCase();
        const challenge = this.otpChallenges.get(dto.challengeId);
        if (!challenge || challenge.email !== email || challenge.consumedAt) {
            throw new common_1.BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn');
        }
        if (challenge.expiresAt <= Date.now()) {
            this.otpChallenges.delete(dto.challengeId);
            throw new common_1.BadRequestException('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới');
        }
        if (challenge.attempts >= 5) {
            this.otpChallenges.delete(dto.challengeId);
            throw new common_1.HttpException('Bạn đã nhập sai OTP quá số lần cho phép', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        challenge.attempts += 1;
        const expectedHash = Buffer.from(challenge.codeHash, 'hex');
        const providedHash = Buffer.from(this.hashOtp(dto.challengeId, dto.code), 'hex');
        if (!(0, node_crypto_1.timingSafeEqual)(expectedHash, providedHash)) {
            throw new common_1.BadRequestException('Mã OTP không chính xác');
        }
        challenge.verifiedAt = Date.now();
        return { verified: true };
    }
    hashOtp(challengeId, code) {
        return (0, node_crypto_1.createHmac)('sha256', this.otpHashKey)
            .update(`${challengeId}:${code}`)
            .digest('hex');
    }
    pruneOtpChallenges(now) {
        for (const [challengeId, challenge] of this.otpChallenges) {
            if (challenge.expiresAt <= now || challenge.consumedAt) {
                this.otpChallenges.delete(challengeId);
            }
        }
        for (const [email, latest] of this.latestOtpByEmail) {
            if (now - latest.sentAt >= 60_000) {
                this.latestOtpByEmail.delete(email);
            }
        }
    }
    reserveVerifiedOtp(dto) {
        const challenge = this.assertVerifiedOtp(dto);
        challenge.consumedAt = Date.now();
        return challenge;
    }
    assertVerifiedOtp(dto) {
        const challenge = this.otpChallenges.get(dto.otpChallengeId);
        if (!challenge ||
            challenge.email !== dto.email.trim().toLowerCase() ||
            !challenge.verifiedAt ||
            challenge.expiresAt <= Date.now() ||
            challenge.consumedAt) {
            throw new common_1.BadRequestException('Vui lòng xác thực OTP qua email trước khi gửi hồ sơ');
        }
        return challenge;
    }
    async getPartners() {
        return this.prisma.financePartner.findMany({
            orderBy: [{ recommended: 'desc' }, { createdAt: 'asc' }],
        });
    }
    async getShowrooms() {
        return this.prisma.showroomStore.findMany({
            orderBy: [{ isFlagship: 'desc' }, { createdAt: 'asc' }],
        });
    }
    async getDevices() {
        return this.prisma.product.findMany({
            where: { installment: true, isActive: true },
            include: {
                brand: true,
                category: true,
                variants: true,
                images: true,
            },
            orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
            take: 20,
        });
    }
    async saveBase64File(base64Data, prefix = 'doc') {
        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let buffer;
        let ext = '.png';
        if (matches && matches.length === 3) {
            const mime = matches[1];
            if (mime.includes('jpeg') || mime.includes('jpg'))
                ext = '.jpg';
            else if (mime.includes('webp'))
                ext = '.webp';
            else if (mime.includes('pdf'))
                ext = '.pdf';
            buffer = Buffer.from(matches[2], 'base64');
        }
        else {
            buffer = Buffer.from(base64Data, 'base64');
        }
        const filename = `${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}${ext}`;
        const filePath = path.join(this.uploadDir, filename);
        await fs.promises.writeFile(filePath, buffer);
        return `/uploads/installment/${filename}`;
    }
    async handleMulterUpload(file) {
        if (!file) {
            throw new common_1.BadRequestException('Không tìm thấy tệp tải lên');
        }
        const ext = path.extname(file.originalname) || '.png';
        const filename = `upload-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}${ext}`;
        const filePath = path.join(this.uploadDir, filename);
        await fs.promises.writeFile(filePath, file.buffer);
        return { url: `/uploads/installment/${filename}` };
    }
    async createApplication(dto, userId) {
        const partner = await this.prisma.financePartner.findUnique({
            where: { id: dto.financePartnerId },
        });
        if (!partner) {
            throw new common_1.NotFoundException(`Đối tác tài chính không hợp lệ: ${dto.financePartnerId}`);
        }
        this.assertVerifiedOtp(dto);
        let frontUrl = dto.idCardFrontUrl;
        let backUrl = dto.idCardBackUrl;
        let sigUrl = dto.signatureUrl;
        if (frontUrl && frontUrl.startsWith('data:')) {
            frontUrl = await this.saveBase64File(frontUrl, 'cccd-front');
        }
        if (backUrl && backUrl.startsWith('data:')) {
            backUrl = await this.saveBase64File(backUrl, 'cccd-back');
        }
        if (sigUrl && sigUrl.startsWith('data:')) {
            sigUrl = await this.saveBase64File(sigUrl, 'signature');
        }
        const otpChallenge = this.reserveVerifiedOtp(dto);
        const applicationCode = `INS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        try {
            const application = await this.prisma.$transaction(async (tx) => {
                const app = await tx.installmentApplication.create({
                    data: {
                        applicationCode,
                        userId: userId || null,
                        financePartnerId: dto.financePartnerId,
                        orderId: dto.orderId || null,
                        productId: dto.productId || null,
                        productVariantId: dto.productVariantId || null,
                        productName: dto.productName,
                        productPrice: dto.productPrice,
                        prepaidPercent: dto.prepaidPercent,
                        downPayment: dto.downPayment,
                        financedAmount: dto.financedAmount,
                        termMonths: dto.termMonths,
                        monthlyPayment: dto.monthlyPayment,
                        status: 'SUBMITTED',
                        isSimulated: true,
                        fullName: dto.fullName,
                        citizenId: dto.citizenId,
                        dateOfBirth: dto.dateOfBirth,
                        gender: dto.gender,
                        phoneNumber: dto.phoneNumber,
                        email: dto.email,
                        permanentAddress: dto.permanentAddress,
                        currentAddress: dto.currentAddress,
                        jobTitle: dto.jobTitle,
                        monthlyIncome: dto.monthlyIncome,
                        companyName: dto.companyName,
                        refRelation: dto.refRelation,
                        refName: dto.refName,
                        refPhone: dto.refPhone,
                        deliveryMethod: dto.deliveryMethod || 'shop',
                        pickupStoreId: dto.pickupStoreId,
                        idCardFrontUrl: frontUrl,
                        idCardBackUrl: backUrl,
                        signatureUrl: sigUrl,
                    },
                    include: {
                        financePartner: true,
                    },
                });
                await tx.applicationStatusHistory.create({
                    data: {
                        applicationId: app.id,
                        fromStatus: null,
                        toStatus: 'SUBMITTED',
                        action: 'CUSTOMER_SUBMIT',
                        reason: 'Khách hàng hoàn tất và gửi hồ sơ đăng ký trả góp',
                        actorId: userId || null,
                        actorType: 'CUSTOMER',
                    },
                });
                return app;
            });
            this.otpChallenges.delete(dto.otpChallengeId);
            return application;
        }
        catch (error) {
            otpChallenge.consumedAt = null;
            throw error;
        }
    }
    async getMyApplications(userId) {
        return this.prisma.installmentApplication.findMany({
            where: { userId },
            include: {
                financePartner: true,
                statusHistory: {
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async trackApplication(codeOrId) {
        const isId = /^\d+$/.test(codeOrId);
        const app = await this.prisma.installmentApplication.findFirst({
            where: isId ? { id: parseInt(codeOrId, 10) } : { applicationCode: codeOrId },
            include: {
                financePartner: true,
                order: true,
                reviewer: {
                    select: {
                        id: true,
                        email: true,
                        profile: { select: { fullName: true } },
                    },
                },
                statusHistory: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!app) {
            throw new common_1.NotFoundException(`Không tìm thấy hồ sơ trả góp: ${codeOrId}`);
        }
        return app;
    }
    async resubmitApplication(id, dto, userId) {
        return this.prisma.$transaction(async (tx) => {
            const app = await tx.installmentApplication.findUnique({
                where: { id },
            });
            if (!app) {
                throw new common_1.NotFoundException(`Không tìm thấy hồ sơ ID ${id}`);
            }
            if (app.status !== 'NEED_MORE_INFO') {
                throw new common_1.ConflictException(`Hồ sơ đang ở trạng thái "${app.status}", chỉ có thể bổ sung thông tin khi hồ sơ ở trạng thái "NEED_MORE_INFO" (Cần bổ sung).`);
            }
            let frontUrl = dto.idCardFrontUrl;
            let backUrl = dto.idCardBackUrl;
            let sigUrl = dto.signatureUrl;
            if (frontUrl && frontUrl.startsWith('data:')) {
                frontUrl = await this.saveBase64File(frontUrl, 'cccd-front');
            }
            if (backUrl && backUrl.startsWith('data:')) {
                backUrl = await this.saveBase64File(backUrl, 'cccd-back');
            }
            if (sigUrl && sigUrl.startsWith('data:')) {
                sigUrl = await this.saveBase64File(sigUrl, 'signature');
            }
            const updateData = {
                status: 'UNDER_REVIEW',
                customerResponseNotes: dto.notes,
                reviewedAt: new Date(),
            };
            if (frontUrl)
                updateData.idCardFrontUrl = frontUrl;
            if (backUrl)
                updateData.idCardBackUrl = backUrl;
            if (sigUrl)
                updateData.signatureUrl = sigUrl;
            if (dto.permanentAddress)
                updateData.permanentAddress = dto.permanentAddress;
            if (dto.currentAddress)
                updateData.currentAddress = dto.currentAddress;
            if (dto.monthlyIncome)
                updateData.monthlyIncome = dto.monthlyIncome;
            if (dto.companyName)
                updateData.companyName = dto.companyName;
            if (dto.refPhone)
                updateData.refPhone = dto.refPhone;
            const updated = await tx.installmentApplication.update({
                where: { id },
                data: updateData,
                include: { financePartner: true },
            });
            await tx.applicationStatusHistory.create({
                data: {
                    applicationId: id,
                    fromStatus: 'NEED_MORE_INFO',
                    toStatus: 'UNDER_REVIEW',
                    action: 'CUSTOMER_RESUBMIT',
                    reason: dto.notes || 'Khách hàng đã cập nhật thông tin bổ sung',
                    actorId: userId || null,
                    actorType: 'CUSTOMER',
                },
            });
            return updated;
        });
    }
    async cancelApplication(id, dto, userId, actorType = 'CUSTOMER') {
        return this.prisma.$transaction(async (tx) => {
            const app = await tx.installmentApplication.findUnique({
                where: { id },
            });
            if (!app) {
                throw new common_1.NotFoundException(`Không tìm thấy hồ sơ ID ${id}`);
            }
            const terminalStatuses = ['APPROVED', 'REJECTED', 'CANCELLED'];
            if (terminalStatuses.includes(app.status)) {
                throw new common_1.ConflictException(`Không thể hủy hồ sơ đã ở trạng thái kết thúc: "${app.status}".`);
            }
            const updated = await tx.installmentApplication.update({
                where: { id },
                data: { status: 'CANCELLED' },
                include: { financePartner: true },
            });
            await tx.applicationStatusHistory.create({
                data: {
                    applicationId: id,
                    fromStatus: app.status,
                    toStatus: 'CANCELLED',
                    action: actorType === 'CUSTOMER' ? 'CUSTOMER_CANCEL' : 'STAFF_CANCEL',
                    reason: dto.reason || (actorType === 'CUSTOMER' ? 'Khách hàng yêu cầu hủy hồ sơ' : 'Nhân viên hủy hồ sơ theo yêu cầu'),
                    actorId: userId || null,
                    actorType,
                },
            });
            return updated;
        });
    }
    async getAdminApplications(query) {
        const page = Math.max(1, parseInt(query.page || '1', 10));
        const limit = Math.max(1, parseInt(query.limit || '10', 10));
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status && query.status !== 'ALL') {
            where.status = query.status;
        }
        if (query.partnerId && query.partnerId !== 'ALL') {
            where.financePartnerId = query.partnerId;
        }
        if (query.search && query.search.trim()) {
            const search = query.search.trim();
            where.OR = [
                { applicationCode: { contains: search, mode: 'insensitive' } },
                { fullName: { contains: search, mode: 'insensitive' } },
                { phoneNumber: { contains: search, mode: 'insensitive' } },
                { citizenId: { contains: search, mode: 'insensitive' } },
                { productName: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [items, total, countsRaw] = await Promise.all([
            this.prisma.installmentApplication.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    financePartner: true,
                    reviewer: {
                        select: {
                            id: true,
                            email: true,
                            profile: { select: { fullName: true } },
                        },
                    },
                    statusHistory: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                },
            }),
            this.prisma.installmentApplication.count({ where }),
            this.prisma.installmentApplication.groupBy({
                by: ['status'],
                _count: { status: true },
            }),
        ]);
        const statusCounts = {
            ALL: 0,
            SUBMITTED: 0,
            UNDER_REVIEW: 0,
            NEED_MORE_INFO: 0,
            PARTNER_REVIEW: 0,
            APPROVED: 0,
            REJECTED: 0,
            CANCELLED: 0,
        };
        let totalAll = 0;
        countsRaw.forEach((row) => {
            statusCounts[row.status] = row._count.status;
            totalAll += row._count.status;
        });
        statusCounts.ALL = totalAll;
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
            statusCounts,
        };
    }
    async getAdminApplicationById(id) {
        const app = await this.prisma.installmentApplication.findUnique({
            where: { id },
            include: {
                financePartner: true,
                order: {
                    include: {
                        items: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        profile: true,
                    },
                },
                reviewer: {
                    select: {
                        id: true,
                        email: true,
                        profile: { select: { fullName: true } },
                    },
                },
                statusHistory: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!app) {
            throw new common_1.NotFoundException(`Không tìm thấy hồ sơ ID ${id}`);
        }
        return app;
    }
    async claimApplication(id, staffId) {
        return this.prisma.$transaction(async (tx) => {
            const app = await tx.installmentApplication.findUnique({ where: { id } });
            if (!app) {
                throw new common_1.NotFoundException(`Không tìm thấy hồ sơ ID ${id}`);
            }
            if (app.status !== 'SUBMITTED') {
                throw new common_1.ConflictException(`Chỉ có thể tiếp nhận hồ sơ đang ở trạng thái "SUBMITTED" (Đã gửi hồ sơ). Trạng thái hiện tại: "${app.status}".`);
            }
            const updated = await tx.installmentApplication.update({
                where: { id },
                data: {
                    status: 'UNDER_REVIEW',
                    reviewerId: staffId || app.reviewerId || null,
                    reviewedAt: new Date(),
                },
                include: {
                    financePartner: true,
                    reviewer: {
                        select: {
                            id: true,
                            email: true,
                            profile: { select: { fullName: true } },
                        },
                    },
                },
            });
            await tx.applicationStatusHistory.create({
                data: {
                    applicationId: id,
                    fromStatus: 'SUBMITTED',
                    toStatus: 'UNDER_REVIEW',
                    action: 'STAFF_CLAIM',
                    reason: 'Nhân viên thẩm định đã tiếp nhận và đang kiểm tra tính hợp lệ của hồ sơ',
                    actorId: staffId || null,
                    actorType: 'STAFF',
                },
            });
            return updated;
        });
    }
    async requestInfo(id, dto, staffId) {
        return this.prisma.$transaction(async (tx) => {
            const app = await tx.installmentApplication.findUnique({ where: { id } });
            if (!app) {
                throw new common_1.NotFoundException(`Không tìm thấy hồ sơ ID ${id}`);
            }
            if (app.status !== 'UNDER_REVIEW' && app.status !== 'PARTNER_REVIEW') {
                throw new common_1.ConflictException(`Chỉ có thể yêu cầu bổ sung thông tin khi hồ sơ đang kiểm tra (UNDER_REVIEW) hoặc chờ đối tác (PARTNER_REVIEW). Trạng thái hiện tại: "${app.status}".`);
            }
            const checklistStr = dto.checklist && dto.checklist.length > 0 ? `\n- Hạng mục cần bổ sung: ${dto.checklist.join(', ')}` : '';
            const fullNotes = `${dto.reason}${checklistStr}${dto.notes ? `\n- Ghi chú: ${dto.notes}` : ''}`;
            const updated = await tx.installmentApplication.update({
                where: { id },
                data: {
                    status: 'NEED_MORE_INFO',
                    additionalInfoNotes: fullNotes,
                    reviewedAt: new Date(),
                    reviewerId: staffId || app.reviewerId || null,
                },
                include: {
                    financePartner: true,
                    reviewer: {
                        select: {
                            id: true,
                            email: true,
                            profile: { select: { fullName: true } },
                        },
                    },
                },
            });
            await tx.applicationStatusHistory.create({
                data: {
                    applicationId: id,
                    fromStatus: app.status,
                    toStatus: 'NEED_MORE_INFO',
                    action: 'STAFF_REQUEST_INFO',
                    reason: dto.reason,
                    metadata: {
                        checklist: dto.checklist,
                        notes: dto.notes,
                    },
                    actorId: staffId || null,
                    actorType: 'STAFF',
                },
            });
            return updated;
        });
    }
    async submitToPartner(id, staffId) {
        return this.prisma.$transaction(async (tx) => {
            const app = await tx.installmentApplication.findUnique({
                where: { id },
                include: { financePartner: true },
            });
            if (!app) {
                throw new common_1.NotFoundException(`Không tìm thấy hồ sơ ID ${id}`);
            }
            if (app.status !== 'UNDER_REVIEW') {
                throw new common_1.ConflictException(`Hồ sơ phải ở trạng thái "UNDER_REVIEW" (Đang kiểm tra) trước khi chuyển đối tác. Trạng thái hiện tại: "${app.status}".`);
            }
            const updated = await tx.installmentApplication.update({
                where: { id },
                data: {
                    status: 'PARTNER_REVIEW',
                    reviewedAt: new Date(),
                    reviewerId: staffId || app.reviewerId || null,
                },
                include: {
                    financePartner: true,
                    reviewer: {
                        select: {
                            id: true,
                            email: true,
                            profile: { select: { fullName: true } },
                        },
                    },
                },
            });
            await tx.applicationStatusHistory.create({
                data: {
                    applicationId: id,
                    fromStatus: 'UNDER_REVIEW',
                    toStatus: 'PARTNER_REVIEW',
                    action: 'SUBMIT_TO_PARTNER',
                    reason: `Đã thẩm định hồ sơ nội bộ hợp lệ, chuyển hồ sơ sang đối tác ${app.financePartner?.name || ''} để xét duyệt tín dụng.`,
                    actorId: staffId || null,
                    actorType: 'STAFF',
                },
            });
            return updated;
        });
    }
    async recordDecision(id, dto, staffId) {
        return this.prisma.$transaction(async (tx) => {
            const app = await tx.installmentApplication.findUnique({
                where: { id },
                include: { financePartner: true },
            });
            if (!app) {
                throw new common_1.NotFoundException(`Không tìm thấy hồ sơ ID ${id}`);
            }
            if (dto.decision === 'APPROVED') {
                if (app.status !== 'PARTNER_REVIEW') {
                    throw new common_1.ConflictException(`Chỉ có thể ghi nhận DUYỆT (APPROVED) khi hồ sơ đang ở trạng thái Chờ kết quả đối tác (PARTNER_REVIEW). Trạng thái hiện tại: "${app.status}".`);
                }
            }
            else if (dto.decision === 'REJECTED') {
                if (dto.decisionSource === 'INTERNAL' && app.status !== 'UNDER_REVIEW') {
                    throw new common_1.ConflictException(`Từ chối nội bộ chỉ được thực hiện khi hồ sơ đang kiểm tra (UNDER_REVIEW). Trạng thái hiện tại: "${app.status}".`);
                }
                if (dto.decisionSource === 'PARTNER' && app.status !== 'PARTNER_REVIEW') {
                    throw new common_1.ConflictException(`Ghi nhận từ chối từ đối tác chỉ được thực hiện khi hồ sơ đang chờ đối tác (PARTNER_REVIEW). Trạng thái hiện tại: "${app.status}".`);
                }
            }
            const refCode = dto.referenceCode || `${dto.decisionSource === 'PARTNER' ? 'PART' : 'INT'}-${Date.now().toString().slice(-6)}`;
            const updated = await tx.installmentApplication.update({
                where: { id },
                data: {
                    status: dto.decision,
                    decisionSource: dto.decisionSource,
                    decisionReason: dto.reason,
                    referenceCode: refCode,
                    decidedAt: new Date(),
                    reviewerId: staffId || app.reviewerId || null,
                },
                include: {
                    financePartner: true,
                    reviewer: {
                        select: {
                            id: true,
                            email: true,
                            profile: { select: { fullName: true } },
                        },
                    },
                },
            });
            await tx.applicationStatusHistory.create({
                data: {
                    applicationId: id,
                    fromStatus: app.status,
                    toStatus: dto.decision,
                    action: dto.decision === 'APPROVED' ? 'RECORD_APPROVAL' : 'RECORD_REJECTION',
                    reason: dto.reason,
                    metadata: {
                        decisionSource: dto.decisionSource,
                        referenceCode: refCode,
                        simulated: true,
                    },
                    actorId: staffId || null,
                    actorType: 'STAFF',
                },
            });
            return updated;
        });
    }
    async linkOrder(id, orderId, staffId) {
        return this.prisma.$transaction(async (tx) => {
            const app = await tx.installmentApplication.findUnique({ where: { id } });
            if (!app) {
                throw new common_1.NotFoundException(`Không tìm thấy hồ sơ ID ${id}`);
            }
            if (app.status !== 'APPROVED') {
                throw new common_1.ConflictException(`Chỉ có thể liên kết đơn hàng khi hồ sơ trả góp đã được duyệt (APPROVED). Trạng thái hiện tại: "${app.status}".`);
            }
            const order = await tx.order.findUnique({ where: { id: orderId } });
            if (!order) {
                throw new common_1.NotFoundException(`Không tìm thấy đơn hàng ID ${orderId}`);
            }
            const updated = await tx.installmentApplication.update({
                where: { id },
                data: { orderId },
                include: {
                    order: true,
                    financePartner: true,
                },
            });
            await tx.applicationStatusHistory.create({
                data: {
                    applicationId: id,
                    fromStatus: app.status,
                    toStatus: app.status,
                    action: 'LINK_ORDER',
                    reason: `Đã liên kết hồ sơ trả góp với đơn hàng #${orderId}`,
                    metadata: { orderId },
                    actorId: staffId || null,
                    actorType: 'STAFF',
                },
            });
            return updated;
        });
    }
};
exports.InstallmentService = InstallmentService;
exports.InstallmentService = InstallmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], InstallmentService);
//# sourceMappingURL=installment.service.js.map