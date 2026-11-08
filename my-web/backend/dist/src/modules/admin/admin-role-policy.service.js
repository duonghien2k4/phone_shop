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
var AdminRolePolicyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRolePolicyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const admin_constants_1 = require("../../common/constants/admin.constants");
let AdminRolePolicyService = AdminRolePolicyService_1 = class AdminRolePolicyService {
    prisma;
    logger = new common_1.Logger(AdminRolePolicyService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        const result = await this.prisma.user.updateMany({
            where: {
                role: 'ADMIN',
                NOT: {
                    email: { equals: admin_constants_1.SOLE_ADMIN_EMAIL, mode: 'insensitive' },
                },
            },
            data: {
                role: 'CUSTOMER',
                refreshToken: null,
            },
        });
        if (result.count > 0) {
            this.logger.warn(`Demoted ${result.count} non-authorized admin account(s) to CUSTOMER`);
        }
    }
};
exports.AdminRolePolicyService = AdminRolePolicyService;
exports.AdminRolePolicyService = AdminRolePolicyService = AdminRolePolicyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminRolePolicyService);
//# sourceMappingURL=admin-role-policy.service.js.map