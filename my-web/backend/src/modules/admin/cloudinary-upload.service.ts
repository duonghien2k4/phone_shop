import {
  Injectable,
  ServiceUnavailableException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: { message?: string };
};

export interface UploadedImageFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

@Injectable()
export class CloudinaryUploadService {
  constructor(private readonly configService: ConfigService) {}

  async uploadProductImage(file: UploadedImageFile): Promise<{ url: string }> {
    if (!file.mimetype.startsWith('image/')) {
      throw new UnsupportedMediaTypeException('Chỉ chấp nhận tệp hình ảnh');
    }

    const cloudName = this.configService.get<string>('cloudinary.cloudName');
    const apiKey = this.configService.get<string>('cloudinary.apiKey');
    const apiSecret = this.configService.get<string>('cloudinary.apiSecret');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException(
        'Chưa cấu hình Cloudinary. Vui lòng kiểm tra CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET.',
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'phoneshop/products';
    const signaturePayload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash('sha1')
      .update(signaturePayload)
      .digest('hex');
    const formData = new FormData();
    const fileBytes = new Uint8Array(file.buffer.length);
    fileBytes.set(file.buffer);
    formData.append(
      'file',
      new Blob([fileBytes], { type: file.mimetype }),
      file.originalname,
    );
    formData.append('api_key', apiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('folder', folder);
    formData.append('signature', signature);

    let response: Response;
    try {
      response = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
        {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(30_000),
        },
      );
    } catch {
      throw new ServiceUnavailableException(
        'Không thể kết nối Cloudinary để tải ảnh lên. Vui lòng thử lại.',
      );
    }

    const result = (await response.json().catch(() => ({}))) as CloudinaryUploadResponse;
    if (!response.ok || !result.secure_url) {
      throw new ServiceUnavailableException(
        result.error?.message || 'Cloudinary không thể tải ảnh lên. Vui lòng thử lại.',
      );
    }

    return { url: result.secure_url };
  }
}
