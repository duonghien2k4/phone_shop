import { ConfigService } from '@nestjs/config';
export interface UploadedImageFile {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
}
export declare class CloudinaryUploadService {
    private readonly configService;
    constructor(configService: ConfigService);
    uploadProductImage(file: UploadedImageFile): Promise<{
        url: string;
    }>;
}
