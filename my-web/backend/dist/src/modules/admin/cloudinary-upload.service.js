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
exports.CloudinaryUploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_crypto_1 = require("node:crypto");
let CloudinaryUploadService = class CloudinaryUploadService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    async uploadProductImage(file) {
        if (!file.mimetype.startsWith('image/')) {
            throw new common_1.UnsupportedMediaTypeException('Chỉ chấp nhận tệp hình ảnh');
        }
        const cloudName = this.configService.get('cloudinary.cloudName');
        const apiKey = this.configService.get('cloudinary.apiKey');
        const apiSecret = this.configService.get('cloudinary.apiSecret');
        if (!cloudName || !apiKey || !apiSecret) {
            throw new common_1.ServiceUnavailableException('Chưa cấu hình Cloudinary. Vui lòng kiểm tra CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET.');
        }
        const timestamp = Math.floor(Date.now() / 1000);
        const folder = 'phoneshop/products';
        const signaturePayload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = (0, node_crypto_1.createHash)('sha1')
            .update(signaturePayload)
            .digest('hex');
        const formData = new FormData();
        const fileBytes = new Uint8Array(file.buffer.length);
        fileBytes.set(file.buffer);
        formData.append('file', new Blob([fileBytes], { type: file.mimetype }), file.originalname);
        formData.append('api_key', apiKey);
        formData.append('timestamp', String(timestamp));
        formData.append('folder', folder);
        formData.append('signature', signature);
        let response;
        try {
            response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(30_000),
            });
        }
        catch {
            throw new common_1.ServiceUnavailableException('Không thể kết nối Cloudinary để tải ảnh lên. Vui lòng thử lại.');
        }
        const result = (await response.json().catch(() => ({})));
        if (!response.ok || !result.secure_url) {
            throw new common_1.ServiceUnavailableException(result.error?.message || 'Cloudinary không thể tải ảnh lên. Vui lòng thử lại.');
        }
        return { url: result.secure_url };
    }
};
exports.CloudinaryUploadService = CloudinaryUploadService;
exports.CloudinaryUploadService = CloudinaryUploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryUploadService);
//# sourceMappingURL=cloudinary-upload.service.js.map