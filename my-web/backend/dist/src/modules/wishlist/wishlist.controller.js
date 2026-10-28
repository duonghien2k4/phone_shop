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
exports.WishlistController = void 0;
const common_1 = require("@nestjs/common");
const get_user_decorator_1 = require("../../common/decorators/get-user.decorator");
const clerk_auth_guard_1 = require("../../common/guards/clerk-auth.guard");
const wishlist_service_1 = require("./wishlist.service");
let WishlistController = class WishlistController {
    wishlistService;
    constructor(wishlistService) {
        this.wishlistService = wishlistService;
    }
    getWishlist(user) {
        return this.wishlistService.getWishlist(user.sub);
    }
    toggleWishlist(user, productId) {
        return this.wishlistService.toggleWishlist(user.sub, productId);
    }
    addToWishlist(user, productId) {
        return this.wishlistService.addToWishlist(user.sub, productId);
    }
    removeFromWishlist(user, productId) {
        return this.wishlistService.removeFromWishlist(user.sub, productId);
    }
};
exports.WishlistController = WishlistController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WishlistController.prototype, "getWishlist", null);
__decorate([
    (0, common_1.Post)('toggle/:productId'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('productId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], WishlistController.prototype, "toggleWishlist", null);
__decorate([
    (0, common_1.Post)(':productId'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('productId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], WishlistController.prototype, "addToWishlist", null);
__decorate([
    (0, common_1.Delete)(':productId'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('productId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], WishlistController.prototype, "removeFromWishlist", null);
exports.WishlistController = WishlistController = __decorate([
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard),
    (0, common_1.Controller)('wishlist'),
    __metadata("design:paramtypes", [wishlist_service_1.WishlistService])
], WishlistController);
//# sourceMappingURL=wishlist.controller.js.map