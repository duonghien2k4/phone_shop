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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
let AdminService = class AdminService {
    static { AdminService_1 = this; }
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        const totalOrders = await this.prisma.order.count();
        const pendingOrders = await this.prisma.order.count({
            where: { status: client_1.OrderStatus.PENDING },
        });
        const totalProducts = await this.prisma.product.count({
            where: { isActive: true },
        });
        const lowStockVariants = await this.prisma.inventory.count({
            where: { stock: { lte: 5 } },
        });
        const totalCustomers = await this.prisma.user.count({
            where: { role: 'CUSTOMER' },
        });
        const paidOrders = await this.prisma.order.findMany({
            where: { paymentStatus: client_1.PaymentStatus.PAID },
            select: { total: true, createdAt: true },
        });
        const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
        const recentOrders = await this.prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { email: true, profile: { select: { fullName: true } } } },
                items: true,
            },
        });
        const popularItems = await this.prisma.orderItem.groupBy({
            by: ['productId', 'productName'],
            _sum: { quantity: true, total: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5,
        });
        const months = ['Th 1', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'Th 8', 'Th 9', 'Th 10', 'Th 11', 'Th 12'];
        const monthlyData = months.map((m, idx) => ({
            month: m,
            revenue: Math.round((totalRevenue / 12) * (0.8 + (idx % 5) * 0.15)),
            orders: Math.round((totalOrders || 10) * (0.7 + (idx % 4) * 0.2)),
        }));
        return {
            overview: {
                totalRevenue,
                totalOrders,
                pendingOrders,
                totalProducts,
                lowStockVariants,
                totalCustomers,
            },
            recentOrders,
            popularItems,
            monthlyData,
        };
    }
    async getProducts(page = 1, limit = 10, search = '', categoryId, brandId) {
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (categoryId)
            where.categoryId = categoryId;
        if (brandId)
            where.brandId = brandId;
        const [items, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { id: 'desc' },
                include: {
                    brand: true,
                    category: true,
                    images: { orderBy: { sortOrder: 'asc' } },
                    variants: {
                        include: { inventory: true },
                    },
                },
            }),
            this.prisma.product.count({ where }),
        ]);
        return {
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async createProduct(data) {
        const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        return this.prisma.product.create({
            data: {
                name: data.name,
                slug: `${slug}-${Date.now().toString().slice(-4)}`,
                brandId: data.brandId,
                categoryId: data.categoryId,
                description: data.description,
                basePrice: data.basePrice,
                salePrice: data.salePrice,
                image: data.image,
                badge: data.badge,
                badgeType: data.badgeType || 'danger',
                installment: data.installment ?? true,
                fastDelivery: data.fastDelivery ?? true,
                isFeatured: data.isFeatured ?? false,
                isActive: data.isActive ?? true,
                specs: data.specs || {},
                images: data.images?.length
                    ? {
                        create: data.images.map((url, index) => ({
                            url,
                            sortOrder: index,
                        })),
                    }
                    : undefined,
                variants: {
                    create: (data.variants || [
                        { storage: '128GB', color: 'Tiêu chuẩn', price: data.salePrice || data.basePrice },
                    ]).map((v) => ({
                        storage: v.storage,
                        color: v.color || 'Tiêu chuẩn',
                        ram: v.ram,
                        price: v.price || data.salePrice || data.basePrice,
                        oldPrice: v.oldPrice || data.basePrice,
                        sku: v.sku || `SOC-${Date.now().toString().slice(-6)}`,
                        imageUrl: v.imageUrl || data.image,
                        inventory: {
                            create: {
                                stock: v.stock ?? 100,
                                status: (v.stock ?? 100) > 0 ? client_1.StockStatus.IN_STOCK : client_1.StockStatus.OUT_OF_STOCK,
                            },
                        },
                    })),
                },
            },
            include: {
                brand: true,
                category: true,
                images: { orderBy: { sortOrder: 'asc' } },
                variants: { include: { inventory: true } },
            },
        });
    }
    async updateProduct(id, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.basePrice !== undefined)
            updateData.basePrice = data.basePrice;
        if (data.salePrice !== undefined)
            updateData.salePrice = data.salePrice;
        if (data.brandId !== undefined)
            updateData.brandId = data.brandId;
        if (data.categoryId !== undefined)
            updateData.categoryId = data.categoryId;
        if (data.image !== undefined)
            updateData.image = data.image;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.badge !== undefined)
            updateData.badge = data.badge;
        if (data.badgeType !== undefined)
            updateData.badgeType = data.badgeType;
        if (data.isFeatured !== undefined)
            updateData.isFeatured = data.isFeatured;
        if (data.isActive !== undefined)
            updateData.isActive = data.isActive;
        if (data.images !== undefined) {
            updateData.images = {
                deleteMany: {},
                create: data.images.map((url, index) => ({
                    url,
                    sortOrder: index,
                })),
            };
        }
        return this.prisma.product.update({
            where: { id },
            data: updateData,
            include: {
                brand: true,
                category: true,
                images: { orderBy: { sortOrder: 'asc' } },
                variants: { include: { inventory: true } },
            },
        });
    }
    async deleteProduct(id) {
        return this.prisma.product.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async createVariant(productId, data) {
        const sku = data.sku || `SOC-${productId}-${data.storage}-${Date.now().toString().slice(-4)}`;
        return this.prisma.productVariant.create({
            data: {
                productId,
                color: data.color || 'Tiêu chuẩn',
                storage: data.storage,
                ram: data.ram,
                price: data.price,
                oldPrice: data.oldPrice,
                sku,
                imageUrl: data.imageUrl,
                inventory: {
                    create: {
                        stock: data.stock || 50,
                        status: (data.stock || 50) > 0 ? client_1.StockStatus.IN_STOCK : client_1.StockStatus.OUT_OF_STOCK,
                    },
                },
            },
            include: { inventory: true },
        });
    }
    async updateVariant(id, data) {
        const updateData = {};
        if (data.storage !== undefined)
            updateData.storage = data.storage;
        if (data.color !== undefined)
            updateData.color = data.color;
        if (data.ram !== undefined)
            updateData.ram = data.ram;
        if (data.price !== undefined)
            updateData.price = data.price;
        if (data.oldPrice !== undefined)
            updateData.oldPrice = data.oldPrice;
        if (data.sku !== undefined)
            updateData.sku = data.sku;
        const variant = await this.prisma.productVariant.update({
            where: { id },
            data: updateData,
        });
        if (data.stock !== undefined) {
            await this.prisma.inventory.upsert({
                where: { variantId: id },
                update: {
                    stock: data.stock,
                    status: data.stock > 0 ? client_1.StockStatus.IN_STOCK : client_1.StockStatus.OUT_OF_STOCK,
                },
                create: {
                    variantId: id,
                    stock: data.stock,
                    status: data.stock > 0 ? client_1.StockStatus.IN_STOCK : client_1.StockStatus.OUT_OF_STOCK,
                },
            });
        }
        return variant;
    }
    async deleteVariant(id) {
        return this.prisma.productVariant.delete({ where: { id } });
    }
    async getBrands() {
        return this.prisma.brand.findMany({
            include: { _count: { select: { products: true } } },
            orderBy: { name: 'asc' },
        });
    }
    async createBrand(data) {
        const slug = data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        return this.prisma.brand.create({
            data: {
                name: data.name,
                slug,
                description: data.description,
                logoUrl: data.logoUrl,
                isActive: data.isActive ?? true,
            },
        });
    }
    async updateBrand(id, data) {
        return this.prisma.brand.update({
            where: { id },
            data,
        });
    }
    async deleteBrand(id) {
        return this.prisma.brand.delete({ where: { id } });
    }
    async getCategories() {
        return this.prisma.category.findMany({
            include: { _count: { select: { products: true } } },
            orderBy: { name: 'asc' },
        });
    }
    async createCategory(data) {
        const slug = data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        return this.prisma.category.create({
            data: {
                name: data.name,
                slug,
                description: data.description,
                isActive: data.isActive ?? true,
            },
        });
    }
    async updateCategory(id, data) {
        return this.prisma.category.update({
            where: { id },
            data,
        });
    }
    async deleteCategory(id) {
        return this.prisma.category.delete({ where: { id } });
    }
    async getInventory(page = 1, limit = 10, search = '', status = '') {
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            where.variant = {
                OR: [
                    { sku: { contains: search, mode: 'insensitive' } },
                    { product: { name: { contains: search, mode: 'insensitive' } } },
                ],
            };
        }
        const [items, total] = await Promise.all([
            this.prisma.inventory.findMany({
                where,
                skip,
                take: limit,
                orderBy: { stock: 'asc' },
                include: {
                    variant: {
                        include: {
                            product: { select: { id: true, name: true, image: true, brand: true } },
                        },
                    },
                },
            }),
            this.prisma.inventory.count({ where }),
        ]);
        return {
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async updateInventoryStock(id, stock, reserved) {
        let status = client_1.StockStatus.IN_STOCK;
        if (stock <= 0)
            status = client_1.StockStatus.OUT_OF_STOCK;
        else if (stock <= 5)
            status = client_1.StockStatus.LOW_STOCK;
        return this.prisma.inventory.update({
            where: { id },
            data: {
                stock,
                reserved: reserved !== undefined ? reserved : undefined,
                status,
            },
            include: { variant: { include: { product: true } } },
        });
    }
    async getOrders(page = 1, limit = 10, search = '', status = '') {
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { voucherCode: { contains: search, mode: 'insensitive' } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, email: true, profile: true } },
                    items: true,
                    payment: true,
                },
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getOrderById(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, email: true, profile: true } },
                items: true,
                payment: true,
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Không tìm thấy đơn hàng');
        return order;
    }
    async updateOrderStatus(id, status, paymentStatus) {
        const order = await this.prisma.order.update({
            where: { id },
            data: {
                status: status,
                paymentStatus: paymentStatus ? paymentStatus : undefined,
            },
            include: { payment: true },
        });
        if (paymentStatus && order.payment) {
            await this.prisma.payment.update({
                where: { orderId: id },
                data: {
                    status: paymentStatus,
                    paidAt: paymentStatus === 'PAID' ? new Date() : undefined,
                },
            });
        }
        return order;
    }
    async getPayments(page = 1, limit = 10, method = '', status = '') {
        const skip = (page - 1) * limit;
        const where = {};
        if (method)
            where.method = method;
        if (status)
            where.status = status;
        const [items, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    order: {
                        include: {
                            user: { select: { email: true, profile: { select: { fullName: true, avatarUrl: true } } } },
                        },
                    },
                },
            }),
            this.prisma.payment.count({ where }),
        ]);
        return {
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async updatePaymentStatus(id, status) {
        const payment = await this.prisma.payment.update({
            where: { id },
            data: {
                status: status,
                paidAt: status === 'PAID' ? new Date() : undefined,
            },
        });
        await this.prisma.order.update({
            where: { id: payment.orderId },
            data: { paymentStatus: status },
        });
        return payment;
    }
    async getVouchers(page = 1, limit = 10, search = '') {
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.voucher.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.voucher.count({ where }),
        ]);
        return {
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async createVoucher(data) {
        return this.prisma.voucher.create({
            data: {
                code: data.code.toUpperCase(),
                description: data.description,
                discountType: data.discountType || 'FIXED',
                discountValue: data.discountValue,
                minOrderValue: data.minOrderValue || 0,
                maxDiscount: data.maxDiscount || null,
                usageLimit: data.usageLimit || 100,
                isActive: data.isActive ?? true,
                startsAt: data.startsAt ? new Date(data.startsAt) : new Date(),
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            },
        });
    }
    async updateVoucher(id, data) {
        const updateData = {};
        if (data.code !== undefined)
            updateData.code = data.code.toUpperCase();
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.discountType !== undefined)
            updateData.discountType = data.discountType;
        if (data.discountValue !== undefined)
            updateData.discountValue = data.discountValue;
        if (data.minOrderValue !== undefined)
            updateData.minOrderValue = data.minOrderValue;
        if (data.maxDiscount !== undefined)
            updateData.maxDiscount = data.maxDiscount;
        if (data.usageLimit !== undefined)
            updateData.usageLimit = data.usageLimit;
        if (data.isActive !== undefined)
            updateData.isActive = data.isActive;
        if (data.expiresAt !== undefined)
            updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
        return this.prisma.voucher.update({
            where: { id },
            data: updateData,
        });
    }
    async deleteVoucher(id) {
        return this.prisma.voucher.delete({ where: { id } });
    }
    async getReviews(page = 1, limit = 10, rating) {
        const skip = (page - 1) * limit;
        const where = {};
        if (rating)
            where.rating = rating;
        const [items, total] = await Promise.all([
            this.prisma.review.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    product: { select: { id: true, name: true, image: true } },
                    user: { select: { email: true, profile: { select: { fullName: true, avatarUrl: true } } } },
                },
            }),
            this.prisma.review.count({ where }),
        ]);
        return {
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async toggleReviewVisibility(id, isVisible) {
        return this.prisma.review.update({
            where: { id },
            data: { isVisible },
        });
    }
    async deleteReview(id) {
        const review = await this.prisma.review.findUnique({ where: { id } });
        if (!review)
            throw new common_1.NotFoundException('Không tìm thấy đánh giá');
        return this.prisma.review.delete({ where: { id } });
    }
    async getFinancePartners() {
        return this.prisma.financePartner.findMany({
            orderBy: { createdAt: 'asc' },
        });
    }
    async createFinancePartner(data) {
        return this.prisma.financePartner.create({
            data: {
                id: data.id || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                name: data.name,
                badge: data.badge,
                badgeType: data.badgeType || 'info',
                recommended: data.recommended ?? false,
                approvalRate: data.approvalRate || '98%',
                interestRate: data.interestRate || 0,
                partnerMonthlyFee: data.partnerMonthlyFee || 0,
                partnerMonthlyFeeLabel: data.partnerMonthlyFeeLabel || '0đ',
                subtext: data.subtext || 'Duyệt nhanh 15 phút qua CCCD gắn chip',
                breakdownNote: data.breakdownNote,
            },
        });
    }
    async updateFinancePartner(id, data) {
        return this.prisma.financePartner.update({
            where: { id },
            data,
        });
    }
    async deleteFinancePartner(id) {
        return this.prisma.financePartner.delete({ where: { id } });
    }
    static installmentApplications = [
        {
            id: 'TG-2026-901',
            customerName: 'Hoàng Văn Thái',
            phone: '0981122334',
            productName: 'iPhone 17 Pro Max 256GB',
            productPrice: 35990000,
            partner: 'HD SAISON',
            prepaidPercent: '30%',
            tenureMonths: 12,
            monthlyPayment: 2350000,
            status: 'PENDING_APPROVAL',
            createdAt: '2026-10-18T10:30:00Z',
            idCardNumber: '001200004918',
            pickupShowroom: '123 Trần Quang Khải, P. Tân Định, Quận 1',
        },
        {
            id: 'TG-2026-884',
            customerName: 'Nguyễn Thị Bích Trâm',
            phone: '0903344556',
            productName: 'Samsung Galaxy S24 Ultra 256GB',
            productPrice: 28990000,
            partner: 'Home Credit',
            prepaidPercent: '20%',
            tenureMonths: 6,
            monthlyPayment: 3950000,
            status: 'APPROVED',
            createdAt: '2026-10-17T14:15:00Z',
            idCardNumber: '079198008819',
            pickupShowroom: '26 Ung Văn Khiêm, P. 25, Bình Thạnh',
        },
        {
            id: 'TG-2026-850',
            customerName: 'Vũ Đức Minh',
            phone: '0918776655',
            productName: 'iPhone 16 128GB',
            productPrice: 20990000,
            partner: 'FE Credit',
            prepaidPercent: '50%',
            tenureMonths: 9,
            monthlyPayment: 1250000,
            status: 'DISBURSED',
            createdAt: '2026-10-15T09:00:00Z',
            idCardNumber: '031095001234',
            pickupShowroom: '215 Giáp Nhất, P. Nhân Chính, Thanh Xuân',
        },
    ];
    getInstallmentApplications(status = '') {
        if (!status)
            return AdminService_1.installmentApplications;
        return AdminService_1.installmentApplications.filter((item) => item.status === status);
    }
    updateInstallmentStatus(id, status, note) {
        const item = AdminService_1.installmentApplications.find((app) => app.id === id);
        if (!item)
            throw new common_1.NotFoundException('Không tìm thấy hồ sơ trả góp');
        item.status = status;
        if (note)
            item.note = note;
        return item;
    }
    static tradeInRequests = [
        {
            id: 'TC-8812',
            customerName: 'Lê Minh Tuấn',
            phone: '0978998877',
            oldDevice: 'iPhone 13 Pro 128GB (Pin 82%, xước nhẹ viền)',
            desiredDevice: 'iPhone 17 Pro Max 256GB',
            estimatedPrice: 9500000,
            bonusSubsidy: 1500000,
            totalDeduction: 11000000,
            status: 'WAITING_INSPECTION',
            createdAt: '2026-10-19T08:20:00Z',
        },
        {
            id: 'TC-8805',
            customerName: 'Bùi Thị Hà',
            phone: '0934112299',
            oldDevice: 'Samsung Galaxy Z Flip4 256GB (Màn hình đẹp, bản lề tốt)',
            desiredDevice: 'Samsung Galaxy S24 Ultra 256GB',
            estimatedPrice: 7200000,
            bonusSubsidy: 1000000,
            totalDeduction: 8200000,
            status: 'INSPECTED',
            createdAt: '2026-10-18T16:45:00Z',
        },
        {
            id: 'TC-8790',
            customerName: 'Trịnh Quốc Bảo',
            phone: '0912998811',
            oldDevice: 'iPhone 12 64GB (Cấn góc, camera nét)',
            desiredDevice: 'iPhone 16e 128GB',
            estimatedPrice: 5000000,
            bonusSubsidy: 800000,
            totalDeduction: 5800000,
            status: 'COMPLETED',
            createdAt: '2026-10-16T11:10:00Z',
        },
    ];
    getTradeInRequests(status = '') {
        if (!status)
            return AdminService_1.tradeInRequests;
        return AdminService_1.tradeInRequests.filter((item) => item.status === status);
    }
    updateTradeInRequest(id, status, estimatedPrice, note) {
        const req = AdminService_1.tradeInRequests.find((r) => r.id === id);
        if (!req)
            throw new common_1.NotFoundException('Không tìm thấy yêu cầu thu cũ');
        req.status = status;
        if (estimatedPrice !== undefined) {
            req.estimatedPrice = estimatedPrice;
            req.totalDeduction = estimatedPrice + (req.bonusSubsidy || 0);
        }
        if (note)
            req.note = note;
        return req;
    }
    static warrantyRecords = [
        {
            id: 'BH-1092',
            serialNumber: 'F2LLM983Q05D',
            customerName: 'Nguyễn Thanh Tùng',
            phone: '0909556677',
            productName: 'iPhone 15 Pro 128GB Titan Tự Nhiên',
            purchaseDate: '2025-11-20',
            warrantyExpiry: '2026-11-20',
            status: 'IN_WARRANTY',
            issueReported: 'Màn hình thỉnh thoảng chớp nháy màu xanh khi tăng độ sáng tối đa',
            technicianNote: 'Đã nhận máy kiểm tra màn hình và gửi hãng thẩm định',
            updatedAt: '2026-10-18T15:00:00Z',
        },
        {
            id: 'BH-1088',
            serialNumber: 'R58N81P002K',
            customerName: 'Đỗ Thị Kim Oanh',
            phone: '0938445511',
            productName: 'Samsung Galaxy A55 5G 128GB',
            purchaseDate: '2026-09-25',
            warrantyExpiry: '2027-09-25',
            status: 'REPLACED_1_TO_1',
            issueReported: 'Lỗi loa ngoài không phát âm thanh sau 5 ngày mua',
            technicianNote: 'Xác nhận lỗi phần cứng của nhà sản xuất trong 30 ngày, đổi mới 100% nguyên seal',
            updatedAt: '2026-10-02T10:30:00Z',
        },
    ];
    getWarrantyRecords(search = '') {
        if (!search)
            return AdminService_1.warrantyRecords;
        const lower = search.toLowerCase();
        return AdminService_1.warrantyRecords.filter((w) => w.serialNumber.toLowerCase().includes(lower) ||
            w.customerName.toLowerCase().includes(lower) ||
            w.phone.includes(lower));
    }
    createWarrantyRecord(data) {
        const newRecord = {
            id: `BH-${Date.now().toString().slice(-4)}`,
            serialNumber: data.serialNumber.toUpperCase(),
            customerName: data.customerName,
            phone: data.phone,
            productName: data.productName,
            purchaseDate: data.purchaseDate || new Date().toISOString().split('T')[0],
            warrantyExpiry: data.warrantyExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: data.status || 'PROCESSING_REPAIR',
            issueReported: data.issueReported,
            technicianNote: data.technicianNote || 'Đã tiếp nhận sản phẩm',
            updatedAt: new Date().toISOString(),
        };
        AdminService_1.warrantyRecords.unshift(newRecord);
        return newRecord;
    }
    updateWarrantyRecord(id, data) {
        const item = AdminService_1.warrantyRecords.find((w) => w.id === id);
        if (!item)
            throw new common_1.NotFoundException('Không tìm thấy hồ sơ bảo hành');
        Object.assign(item, data, { updatedAt: new Date().toISOString() });
        return item;
    }
    async getAiMonitoringStats() {
        const totalFeedbacks = await this.prisma.aiFeedback.count();
        const feedbacks = await this.prisma.aiFeedback.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
        });
        const totalRating = feedbacks.reduce((sum, f) => sum + (f.rating || 5), 0);
        const averageRating = totalFeedbacks > 0 ? (totalRating / feedbacks.length).toFixed(1) : '5.0';
        return {
            totalConversations: totalFeedbacks + 128,
            averageRating: Number(averageRating),
            responseRate: '99.4%',
            feedbacks,
        };
    }
    async getAiFeedbacks(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.aiFeedback.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.aiFeedback.count(),
        ]);
        return {
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map