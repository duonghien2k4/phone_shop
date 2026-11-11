import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { CloudinaryUploadService } from './cloudinary-upload.service';
import type { UploadedImageFile } from './cloudinary-upload.service';

@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly cloudinaryUploadService: CloudinaryUploadService,
  ) {}

  // A. TỔNG QUAN - Dashboard
  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // B. KINH DOANH
  // 1. Sản phẩm & Biến thể
  @Post('products/images/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_request, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(new BadRequestException('Chỉ chấp nhận tệp hình ảnh'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  uploadProductImage(@UploadedFile() file?: UploadedImageFile) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn ảnh để tải lên');
    }
    return this.cloudinaryUploadService.uploadProductImage(file);
  }

  @Post('inventory/receipts/images/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_request, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(new BadRequestException('Chỉ chấp nhận tệp hình ảnh'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  uploadReceiptImage(@UploadedFile() file?: UploadedImageFile) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn ảnh bill để tải lên');
    }
    return this.cloudinaryUploadService.uploadReceiptImage(file);
  }

  @Get('products')
  @Roles('ADMIN', 'STAFF')
  getProducts(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
  ) {
    return this.adminService.getProducts(+page, +limit, search, categoryId ? +categoryId : undefined, brandId ? +brandId : undefined);
  }

  @Post('products')
  createProduct(@Body() data: any) {
    return this.adminService.createProduct(data);
  }

  @Patch('products/:id')
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.adminService.updateProduct(id, data);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteProduct(id);
  }

  // Variants
  @Post('products/:id/variants')
  createVariant(@Param('id', ParseIntPipe) productId: number, @Body() data: any) {
    return this.adminService.createVariant(productId, data);
  }

  @Patch('variants/:id')
  updateVariant(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.adminService.updateVariant(id, data);
  }

  @Delete('variants/:id')
  deleteVariant(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteVariant(id);
  }

  // 2. Thương hiệu & Danh mục
  @Get('brands')
  @Roles('ADMIN', 'STAFF')
  getBrands() {
    return this.adminService.getBrands();
  }

  @Post('brands')
  createBrand(@Body() data: any) {
    return this.adminService.createBrand(data);
  }

  @Patch('brands/:id')
  updateBrand(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.adminService.updateBrand(id, data);
  }

  @Delete('brands/:id')
  deleteBrand(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteBrand(id);
  }

  @Get('categories')
  @Roles('ADMIN', 'STAFF')
  getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  createCategory(@Body() data: any) {
    return this.adminService.createCategory(data);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.adminService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCategory(id);
  }

  // 3. Kho hàng & Tồn kho
  @Get('inventory')
  getInventory(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
    @Query('status') status = '',
  ) {
    return this.adminService.getInventory(+page, +limit, search, status);
  }

  @Patch('inventory/:id')
  updateInventoryStock(@Param('id', ParseIntPipe) id: number, @Body() data: { stock: number }) {
    return this.adminService.updateInventoryStock(id, data.stock);
  }

  @Post('inventory/receipts')
  createStockReceipt(@Body() data: any) {
    return this.adminService.createStockReceipt(data);
  }

  // 4. Đơn hàng
  @Get('orders')
  getOrders(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
    @Query('status') status = '',
  ) {
    return this.adminService.getOrders(+page, +limit, search, status);
  }

  @Get('orders/:id')
  getOrderById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getOrderById(id);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id', ParseIntPipe) id: number, @Body() data: { status: string; paymentStatus?: string }) {
    return this.adminService.updateOrderStatus(id, data.status, data.paymentStatus);
  }

  // 5. Thanh toán
  @Get('payments')
  getPayments(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('method') method = '',
    @Query('status') status = '',
  ) {
    return this.adminService.getPayments(+page, +limit, method, status);
  }

  @Patch('payments/:id/status')
  updatePaymentStatus(@Param('id', ParseIntPipe) id: number, @Body() data: { status: string }) {
    return this.adminService.updatePaymentStatus(id, data.status);
  }

  // C. MARKETING
  // 1. Voucher & Mã giảm giá
  @Get('vouchers')
  getVouchers(@Query('page') page = '1', @Query('limit') limit = '10', @Query('search') search = '') {
    return this.adminService.getVouchers(+page, +limit, search);
  }

  @Post('vouchers')
  createVoucher(@Body() data: any) {
    return this.adminService.createVoucher(data);
  }

  @Patch('vouchers/:id')
  updateVoucher(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.adminService.updateVoucher(id, data);
  }

  @Delete('vouchers/:id')
  deleteVoucher(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteVoucher(id);
  }

  // 2. Đánh giá sản phẩm
  @Get('reviews')
  @Roles('ADMIN', 'STAFF')
  getReviews(@Query('page') page = '1', @Query('limit') limit = '10', @Query('rating') rating = '') {
    return this.adminService.getReviews(+page, +limit, rating ? +rating : undefined);
  }

  @Patch('reviews/:id/visibility')
  @Roles('ADMIN', 'STAFF')
  toggleReviewVisibility(@Param('id', ParseIntPipe) id: number, @Body() data: { isVisible: boolean }) {
    return this.adminService.toggleReviewVisibility(id, data.isVisible);
  }

  @Delete('reviews/:id')
  @Roles('ADMIN', 'STAFF')
  deleteReview(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteReview(id);
  }

  // D. DỊCH VỤ ĐIỆN THOẠI
  // 1. Đối tác trả góp
  @Get('installment/partners')
  getFinancePartners() {
    return this.adminService.getFinancePartners();
  }

  @Post('installment/partners')
  createFinancePartner(@Body() data: any) {
    return this.adminService.createFinancePartner(data);
  }

  @Patch('installment/partners/:id')
  updateFinancePartner(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateFinancePartner(id, data);
  }

  @Delete('installment/partners/:id')
  deleteFinancePartner(@Param('id') id: string) {
    return this.adminService.deleteFinancePartner(id);
  }

  // 3. Thu cũ đổi mới
  @Get('trade-in/requests')
  getTradeInRequests(@Query('status') status = '') {
    return this.adminService.getTradeInRequests(status);
  }

  @Patch('trade-in/requests/:id')
  updateTradeInRequest(@Param('id') id: string, @Body() data: { status: string; estimatedPrice?: number; note?: string }) {
    return this.adminService.updateTradeInRequest(id, data.status, data.estimatedPrice, data.note);
  }

  // 4. Bảo hành & Đổi trả
  @Get('warranty/records')
  getWarrantyRecords(@Query('search') search = '') {
    return this.adminService.getWarrantyRecords(search);
  }

  @Post('warranty/records')
  createWarrantyRecord(@Body() data: any) {
    return this.adminService.createWarrantyRecord(data);
  }

  @Patch('warranty/records/:id')
  updateWarrantyRecord(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateWarrantyRecord(id, data);
  }

  // E. VẬN HÀNH
  // 1. Giám sát trợ lý AI
  @Get('ai/monitoring')
  getAiMonitoringStats() {
    return this.adminService.getAiMonitoringStats();
  }

  @Get('ai/feedbacks')
  getAiFeedbacks(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.adminService.getAiFeedbacks(+page, +limit);
  }
}
