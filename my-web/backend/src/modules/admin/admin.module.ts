import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DatabaseModule } from '../../database/database.module';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminRolePolicyService } from './admin-role-policy.service';
import { CloudinaryUploadService } from './cloudinary-upload.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    ClerkAuthGuard,
    RolesGuard,
    AdminRolePolicyService,
    CloudinaryUploadService,
  ],
  exports: [AdminService],
})
export class AdminModule {}
