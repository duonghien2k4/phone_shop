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
exports.InstallmentAdminController = void 0;
const common_1 = require("@nestjs/common");
const installment_application_dto_1 = require("./dto/installment-application.dto");
const installment_service_1 = require("./installment.service");
const jwt = __importStar(require("jsonwebtoken"));
let InstallmentAdminController = class InstallmentAdminController {
    installmentService;
    constructor(installmentService) {
        this.installmentService = installmentService;
    }
    getApplications(query) {
        return this.installmentService.getAdminApplications(query);
    }
    getApplicationById(id) {
        return this.installmentService.getAdminApplicationById(id);
    }
    claimApplication(id, req) {
        const staffId = this.extractStaffIdFromReq(req);
        return this.installmentService.claimApplication(id, staffId);
    }
    requestInfo(id, dto, req) {
        const staffId = this.extractStaffIdFromReq(req);
        return this.installmentService.requestInfo(id, dto, staffId);
    }
    submitToPartner(id, req) {
        const staffId = this.extractStaffIdFromReq(req);
        return this.installmentService.submitToPartner(id, staffId);
    }
    recordDecision(id, dto, req) {
        const staffId = this.extractStaffIdFromReq(req);
        return this.installmentService.recordDecision(id, dto, staffId);
    }
    linkOrder(id, orderId, req) {
        const staffId = this.extractStaffIdFromReq(req);
        return this.installmentService.linkOrder(id, orderId, staffId);
    }
    cancelApplication(id, dto, req) {
        const staffId = this.extractStaffIdFromReq(req);
        return this.installmentService.cancelApplication(id, dto, staffId, 'STAFF');
    }
    extractStaffIdFromReq(req) {
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
exports.InstallmentAdminController = InstallmentAdminController;
__decorate([
    (0, common_1.Get)('applications'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [installment_application_dto_1.QueryInstallmentDto]),
    __metadata("design:returntype", void 0)
], InstallmentAdminController.prototype, "getApplications", null);
__decorate([
    (0, common_1.Get)('applications/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InstallmentAdminController.prototype, "getApplicationById", null);
__decorate([
    (0, common_1.Post)('applications/:id/claim'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], InstallmentAdminController.prototype, "claimApplication", null);
__decorate([
    (0, common_1.Post)('applications/:id/request-info'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, installment_application_dto_1.RequestInfoDto, Object]),
    __metadata("design:returntype", void 0)
], InstallmentAdminController.prototype, "requestInfo", null);
__decorate([
    (0, common_1.Post)('applications/:id/submit-to-partner'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], InstallmentAdminController.prototype, "submitToPartner", null);
__decorate([
    (0, common_1.Post)('applications/:id/record-decision'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, installment_application_dto_1.RecordDecisionDto, Object]),
    __metadata("design:returntype", void 0)
], InstallmentAdminController.prototype, "recordDecision", null);
__decorate([
    (0, common_1.Post)('applications/:id/link-order'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('orderId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", void 0)
], InstallmentAdminController.prototype, "linkOrder", null);
__decorate([
    (0, common_1.Post)('applications/:id/cancel'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, installment_application_dto_1.CancelApplicationDto, Object]),
    __metadata("design:returntype", void 0)
], InstallmentAdminController.prototype, "cancelApplication", null);
exports.InstallmentAdminController = InstallmentAdminController = __decorate([
    (0, common_1.Controller)('admin/installment'),
    __metadata("design:paramtypes", [installment_service_1.InstallmentService])
], InstallmentAdminController);
//# sourceMappingURL=installment-admin.controller.js.map