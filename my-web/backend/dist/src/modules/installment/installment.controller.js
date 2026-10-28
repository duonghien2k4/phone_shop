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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstallmentController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const installment_application_dto_1 = require("./dto/installment-application.dto");
const installment_service_1 = require("./installment.service");
const jwt = __importStar(require("jsonwebtoken"));
let InstallmentController = class InstallmentController {
    installmentService;
    constructor(installmentService) {
        this.installmentService = installmentService;
    }
    getPartners() {
        return this.installmentService.getPartners();
    }
    getShowrooms() {
        return this.installmentService.getShowrooms();
    }
    getDevices() {
        return this.installmentService.getDevices();
    }
    async uploadFile(file, body) {
        if (file) {
            return this.installmentService.handleMulterUpload(file);
        }
        if (body?.base64) {
            const url = await this.installmentService.saveBase64File(body.base64, body.prefix || 'upload');
            return { url };
        }
        throw new common_1.BadRequestException('Vui lòng tải lên tệp ảnh hoặc chuỗi dữ liệu ảnh base64');
    }
    async createApplication(dto, req) {
        const userId = this.extractUserIdFromReq(req);
        return this.installmentService.createApplication(dto, userId);
    }
    async getMyApplications(req) {
        const userId = this.extractUserIdFromReq(req);
        if (!userId) {
            return [];
        }
        return this.installmentService.getMyApplications(userId);
    }
    async trackApplication(code) {
        return this.installmentService.trackApplication(code);
    }
    async resubmitApplication(id, dto, req) {
        const userId = this.extractUserIdFromReq(req);
        return this.installmentService.resubmitApplication(id, dto, userId);
    }
    async cancelApplication(id, dto, req) {
        const userId = this.extractUserIdFromReq(req);
        return this.installmentService.cancelApplication(id, dto, userId, 'CUSTOMER');
    }
    extractUserIdFromReq(req) {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer '))
            return undefined;
        const token = authHeader.slice(7);
        try {
            const decoded = jwt.decode(token);
            if (decoded && decoded.sub) {
                const parsed = parseInt(decoded.sub, 10);
                return isNaN(parsed) ? undefined : parsed;
            }
        }
        catch {
        }
        return undefined;
    }
};
exports.InstallmentController = InstallmentController;
__decorate([
    (0, common_1.Get)('partners'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InstallmentController.prototype, "getPartners", null);
__decorate([
    (0, common_1.Get)('showrooms'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InstallmentController.prototype, "getShowrooms", null);
__decorate([
    (0, common_1.Get)('devices'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InstallmentController.prototype, "getDevices", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InstallmentController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('applications'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [installment_application_dto_1.CreateInstallmentApplicationDto, Object]),
    __metadata("design:returntype", Promise)
], InstallmentController.prototype, "createApplication", null);
__decorate([
    (0, common_1.Get)('applications/my'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InstallmentController.prototype, "getMyApplications", null);
__decorate([
    (0, common_1.Get)('applications/track/:code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InstallmentController.prototype, "trackApplication", null);
__decorate([
    (0, common_1.Post)('applications/:id/resubmit'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, installment_application_dto_1.ResubmitInstallmentDto, Object]),
    __metadata("design:returntype", Promise)
], InstallmentController.prototype, "resubmitApplication", null);
__decorate([
    (0, common_1.Post)('applications/:id/cancel'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, installment_application_dto_1.CancelApplicationDto, Object]),
    __metadata("design:returntype", Promise)
], InstallmentController.prototype, "cancelApplication", null);
exports.InstallmentController = InstallmentController = __decorate([
    (0, common_1.Controller)('installment'),
    __metadata("design:paramtypes", [installment_service_1.InstallmentService])
], InstallmentController);
//# sourceMappingURL=installment.controller.js.map