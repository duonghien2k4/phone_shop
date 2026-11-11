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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const clerk_auth_guard_1 = require("../../common/guards/clerk-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const admin_service_1 = require("./admin.service");
const cloudinary_upload_service_1 = require("./cloudinary-upload.service");
let AdminController = class AdminController {
    adminService;
    cloudinaryUploadService;
    constructor(adminService, cloudinaryUploadService) {
        this.adminService = adminService;
        this.cloudinaryUploadService = cloudinaryUploadService;
    }
    getDashboardStats() {
        return this.adminService.getDashboardStats();
    }
    uploadProductImage(file) {
        if (!file) {
            throw new common_1.BadRequestException('Vui lòng chọn ảnh để tải lên');
        }
        return this.cloudinaryUploadService.uploadProductImage(file);
    }
    uploadReceiptImage(file) {
        if (!file) {
            throw new common_1.BadRequestException('Vui lòng chọn ảnh bill để tải lên');
        }
        return this.cloudinaryUploadService.uploadReceiptImage(file);
    }
    getProducts(page = '1', limit = '10', search = '', categoryId, brandId) {
        return this.adminService.getProducts(+page, +limit, search, categoryId ? +categoryId : undefined, brandId ? +brandId : undefined);
    }
    createProduct(data) {
        return this.adminService.createProduct(data);
    }
    updateProduct(id, data) {
        return this.adminService.updateProduct(id, data);
    }
    deleteProduct(id) {
        return this.adminService.deleteProduct(id);
    }
    createVariant(productId, data) {
        return this.adminService.createVariant(productId, data);
    }
    updateVariant(id, data) {
        return this.adminService.updateVariant(id, data);
    }
    deleteVariant(id) {
        return this.adminService.deleteVariant(id);
    }
    getBrands() {
        return this.adminService.getBrands();
    }
    createBrand(data) {
        return this.adminService.createBrand(data);
    }
    updateBrand(id, data) {
        return this.adminService.updateBrand(id, data);
    }
    deleteBrand(id) {
        return this.adminService.deleteBrand(id);
    }
    getCategories() {
        return this.adminService.getCategories();
    }
    createCategory(data) {
        return this.adminService.createCategory(data);
    }
    updateCategory(id, data) {
        return this.adminService.updateCategory(id, data);
    }
    deleteCategory(id) {
        return this.adminService.deleteCategory(id);
    }
    getInventory(page = '1', limit = '10', search = '', status = '') {
        return this.adminService.getInventory(+page, +limit, search, status);
    }
    updateInventoryStock(id, data) {
        return this.adminService.updateInventoryStock(id, data.stock);
    }
    createStockReceipt(data) {
        return this.adminService.createStockReceipt(data);
    }
    getOrders(page = '1', limit = '10', search = '', status = '') {
        return this.adminService.getOrders(+page, +limit, search, status);
    }
    getOrderById(id) {
        return this.adminService.getOrderById(id);
    }
    updateOrderStatus(id, data) {
        return this.adminService.updateOrderStatus(id, data.status, data.paymentStatus);
    }
    getPayments(page = '1', limit = '10', method = '', status = '') {
        return this.adminService.getPayments(+page, +limit, method, status);
    }
    updatePaymentStatus(id, data) {
        return this.adminService.updatePaymentStatus(id, data.status);
    }
    getVouchers(page = '1', limit = '10', search = '') {
        return this.adminService.getVouchers(+page, +limit, search);
    }
    createVoucher(data) {
        return this.adminService.createVoucher(data);
    }
    updateVoucher(id, data) {
        return this.adminService.updateVoucher(id, data);
    }
    deleteVoucher(id) {
        return this.adminService.deleteVoucher(id);
    }
    getReviews(page = '1', limit = '10', rating = '') {
        return this.adminService.getReviews(+page, +limit, rating ? +rating : undefined);
    }
    toggleReviewVisibility(id, data) {
        return this.adminService.toggleReviewVisibility(id, data.isVisible);
    }
    deleteReview(id) {
        return this.adminService.deleteReview(id);
    }
    getFinancePartners() {
        return this.adminService.getFinancePartners();
    }
    createFinancePartner(data) {
        return this.adminService.createFinancePartner(data);
    }
    updateFinancePartner(id, data) {
        return this.adminService.updateFinancePartner(id, data);
    }
    deleteFinancePartner(id) {
        return this.adminService.deleteFinancePartner(id);
    }
    getTradeInRequests(status = '') {
        return this.adminService.getTradeInRequests(status);
    }
    updateTradeInRequest(id, data) {
        return this.adminService.updateTradeInRequest(id, data.status, data.estimatedPrice, data.note);
    }
    getWarrantyRecords(search = '') {
        return this.adminService.getWarrantyRecords(search);
    }
    createWarrantyRecord(data) {
        return this.adminService.createWarrantyRecord(data);
    }
    updateWarrantyRecord(id, data) {
        return this.adminService.updateWarrantyRecord(id, data);
    }
    getAiMonitoringStats() {
        return this.adminService.getAiMonitoringStats();
    }
    getAiFeedbacks(page = '1', limit = '10') {
        return this.adminService.getAiFeedbacks(+page, +limit);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Post)('products/images/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (_request, file, callback) => {
            if (!file.mimetype.startsWith('image/')) {
                callback(new common_1.BadRequestException('Chỉ chấp nhận tệp hình ảnh'), false);
                return;
            }
            callback(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "uploadProductImage", null);
__decorate([
    (0, common_1.Post)('inventory/receipts/images/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (_request, file, callback) => {
            if (!file.mimetype.startsWith('image/')) {
                callback(new common_1.BadRequestException('Chỉ chấp nhận tệp hình ảnh'), false);
                return;
            }
            callback(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "uploadReceiptImage", null);
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('categoryId')),
    __param(4, (0, common_1.Query)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Post)('products'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Patch)('products/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)('products/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Post)('products/:id/variants'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createVariant", null);
__decorate([
    (0, common_1.Patch)('variants/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateVariant", null);
__decorate([
    (0, common_1.Delete)('variants/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteVariant", null);
__decorate([
    (0, common_1.Get)('brands'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getBrands", null);
__decorate([
    (0, common_1.Post)('brands'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createBrand", null);
__decorate([
    (0, common_1.Patch)('brands/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateBrand", null);
__decorate([
    (0, common_1.Delete)('brands/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteBrand", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)('categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Patch)('categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Get)('inventory'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getInventory", null);
__decorate([
    (0, common_1.Patch)('inventory/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateInventoryStock", null);
__decorate([
    (0, common_1.Post)('inventory/receipts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createStockReceipt", null);
__decorate([
    (0, common_1.Get)('orders'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)('orders/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Patch)('orders/:id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Get)('payments'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('method')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Patch)('payments/:id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updatePaymentStatus", null);
__decorate([
    (0, common_1.Get)('vouchers'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getVouchers", null);
__decorate([
    (0, common_1.Post)('vouchers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createVoucher", null);
__decorate([
    (0, common_1.Patch)('vouchers/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateVoucher", null);
__decorate([
    (0, common_1.Delete)('vouchers/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteVoucher", null);
__decorate([
    (0, common_1.Get)('reviews'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('rating')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getReviews", null);
__decorate([
    (0, common_1.Patch)('reviews/:id/visibility'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleReviewVisibility", null);
__decorate([
    (0, common_1.Delete)('reviews/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteReview", null);
__decorate([
    (0, common_1.Get)('installment/partners'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getFinancePartners", null);
__decorate([
    (0, common_1.Post)('installment/partners'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createFinancePartner", null);
__decorate([
    (0, common_1.Patch)('installment/partners/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateFinancePartner", null);
__decorate([
    (0, common_1.Delete)('installment/partners/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteFinancePartner", null);
__decorate([
    (0, common_1.Get)('trade-in/requests'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getTradeInRequests", null);
__decorate([
    (0, common_1.Patch)('trade-in/requests/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateTradeInRequest", null);
__decorate([
    (0, common_1.Get)('warranty/records'),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getWarrantyRecords", null);
__decorate([
    (0, common_1.Post)('warranty/records'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createWarrantyRecord", null);
__decorate([
    (0, common_1.Patch)('warranty/records/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateWarrantyRecord", null);
__decorate([
    (0, common_1.Get)('ai/monitoring'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAiMonitoringStats", null);
__decorate([
    (0, common_1.Get)('ai/feedbacks'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAiFeedbacks", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        cloudinary_upload_service_1.CloudinaryUploadService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map