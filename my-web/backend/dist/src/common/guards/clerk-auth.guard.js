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
exports.ClerkAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const backend_1 = require("@clerk/backend");
const jwt = __importStar(require("jsonwebtoken"));
const prisma_service_1 = require("../../database/prisma.service");
const admin_constants_1 = require("../constants/admin.constants");
let ClerkAuthGuard = class ClerkAuthGuard {
    configService;
    prisma;
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context
            .switchToHttp()
            .getRequest();
        const authorization = request.headers.authorization;
        const token = authorization?.startsWith('Bearer ')
            ? authorization.slice('Bearer '.length)
            : null;
        const secretKey = this.configService.get('clerk.secretKey');
        const jwtKey = this.configService.get('clerk.jwtKey');
        const localJwtSecret = this.configService.get('jwt.accessSecret');
        if (!token) {
            throw new common_1.UnauthorizedException('Yêu cầu đăng nhập');
        }
        if (localJwtSecret) {
            try {
                const payload = jwt.verify(token, localJwtSecret);
                if (payload?.sub) {
                    const user = await this.prisma.user.findUnique({
                        where: { id: payload.sub },
                        include: { profile: true },
                    });
                    if (user) {
                        if (user.status === 'BANNED') {
                            throw new common_1.UnauthorizedException('Tài khoản của bạn đã bị khóa');
                        }
                        const role = (0, admin_constants_1.getEffectiveRole)(user.email, user.role);
                        if (role !== user.role) {
                            await this.prisma.user.update({
                                where: { id: user.id },
                                data: { role: 'CUSTOMER', refreshToken: null },
                            });
                        }
                        request.user = {
                            sub: user.id,
                            email: user.email,
                            role,
                        };
                        return true;
                    }
                }
            }
            catch {
            }
        }
        if (!secretKey) {
            throw new common_1.UnauthorizedException('Yêu cầu đăng nhập bằng Clerk');
        }
        let clerkUserId = null;
        try {
            const verifyOptions = {
                ...(secretKey ? { secretKey } : {}),
                ...(jwtKey ? { jwtKey } : {}),
                clockSkewInMs: 300000,
            };
            let claims;
            try {
                claims = (await (0, backend_1.verifyToken)(token, verifyOptions));
            }
            catch (error) {
                const reason = typeof error === 'object' && error !== null && 'reason' in error
                    ? String(error.reason)
                    : '';
                if (reason !== 'jwk-kid-mismatch' || jwtKey) {
                    throw error;
                }
                claims = (await (0, backend_1.verifyToken)(token, {
                    ...verifyOptions,
                    skipJwksCache: true,
                }));
            }
            clerkUserId = claims?.sub ?? null;
        }
        catch (error) {
            const reason = error?.reason || error?.message || 'unknown';
            if (reason === 'token-not-active-yet' ||
                reason === 'token-iat-in-the-future' ||
                reason === 'token-expired' ||
                String(reason).includes('not before')) {
                const decoded = jwt.decode(token);
                if (decoded?.sub) {
                    console.warn(`[ClerkAuthGuard] Clock skew tolerated (${reason}) for Clerk sub: ${decoded.sub}`);
                    clerkUserId = decoded.sub;
                }
            }
            if (!clerkUserId) {
                console.warn(`[ClerkAuthGuard] Token verification failed: ${reason}`);
                const message = reason === 'jwk-kid-mismatch'
                    ? 'Khóa Clerk của frontend và backend không cùng instance. Hãy đồng bộ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY với CLERK_SECRET_KEY, hoặc cấu hình CLERK_JWT_KEY từ cùng Clerk instance.'
                    : `Token Clerk không hợp lệ hoặc đã hết hạn (${reason})`;
                throw new common_1.UnauthorizedException(message);
            }
        }
        if (!clerkUserId) {
            throw new common_1.UnauthorizedException('Token Clerk không hợp lệ');
        }
        let user = await this.prisma.user.findFirst({
            where: { passwordHash: `clerk:${clerkUserId}` },
            include: { profile: true },
        });
        if (!user) {
            const clerkUser = await this.getClerkUser(clerkUserId, secretKey);
            const email = clerkUser.email;
            if (!email) {
                throw new common_1.UnauthorizedException('Tài khoản Clerk chưa có email');
            }
            user = await this.prisma.user.upsert({
                where: { email },
                update: {
                    passwordHash: `clerk:${clerkUserId}`,
                    profile: {
                        upsert: {
                            create: {
                                fullName: clerkUser.fullName,
                                avatarUrl: clerkUser.avatarUrl,
                            },
                            update: {
                                ...(clerkUser.fullName ? { fullName: clerkUser.fullName } : {}),
                                ...(clerkUser.avatarUrl ? { avatarUrl: clerkUser.avatarUrl } : {}),
                            },
                        },
                    },
                },
                create: {
                    email,
                    passwordHash: `clerk:${clerkUserId}`,
                    role: 'CUSTOMER',
                    status: 'ACTIVE',
                    profile: {
                        create: {
                            fullName: clerkUser.fullName,
                            avatarUrl: clerkUser.avatarUrl,
                        },
                    },
                },
                include: { profile: true },
            });
        }
        else if (!user.profile?.avatarUrl) {
            try {
                const clerkUser = await this.getClerkUser(clerkUserId, secretKey);
                if (clerkUser.avatarUrl || clerkUser.fullName) {
                    await this.prisma.userProfile.upsert({
                        where: { userId: user.id },
                        create: {
                            userId: user.id,
                            fullName: clerkUser.fullName,
                            avatarUrl: clerkUser.avatarUrl,
                        },
                        update: {
                            ...(clerkUser.fullName ? { fullName: clerkUser.fullName } : {}),
                            ...(clerkUser.avatarUrl ? { avatarUrl: clerkUser.avatarUrl } : {}),
                        },
                    });
                    user = (await this.prisma.user.findUnique({
                        where: { id: user.id },
                        include: { profile: true },
                    }));
                }
            }
            catch (e) {
                console.warn('[ClerkAuthGuard] Failed to sync latest avatar from Clerk:', e);
            }
        }
        if (user.status === 'BANNED') {
            throw new common_1.UnauthorizedException('Tài khoản của bạn đã bị khóa');
        }
        const role = (0, admin_constants_1.getEffectiveRole)(user.email, user.role);
        if (role !== user.role) {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: { role: 'CUSTOMER', refreshToken: null },
                include: { profile: true },
            });
        }
        request.user = {
            sub: user.id,
            email: user.email,
            role,
            clerkUserId,
        };
        return true;
    }
    async getClerkUser(userId, secretKey) {
        const response = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`, {
            headers: {
                Authorization: `Bearer ${secretKey}`,
            },
        });
        if (!response.ok) {
            throw new common_1.UnauthorizedException('Không thể đồng bộ tài khoản Clerk');
        }
        const data = (await response.json());
        const primaryEmail = data.email_addresses?.find((item) => item.id === data.primary_email_address_id);
        const email = primaryEmail?.email_address ?? data.email_addresses?.[0]?.email_address;
        return {
            email: email?.toLowerCase().trim() ?? null,
            fullName: [data.first_name, data.last_name].filter(Boolean).join(' ') || null,
            avatarUrl: data.image_url ?? null,
        };
    }
};
exports.ClerkAuthGuard = ClerkAuthGuard;
exports.ClerkAuthGuard = ClerkAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], ClerkAuthGuard);
//# sourceMappingURL=clerk-auth.guard.js.map