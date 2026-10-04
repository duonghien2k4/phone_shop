import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'PHONE_SHOP API is running';
  }

  getHealth() {
    return {
      status: 'ok',
      app: 'PHONE_SHOP',
      environment: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
    };
  }
}
