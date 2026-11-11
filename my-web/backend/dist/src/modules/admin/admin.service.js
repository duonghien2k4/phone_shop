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
        const year = new Date().getUTCFullYear();
        const yearStart = new Date(Date.UTC(year, 0, 1));
        const nextYearStart = new Date(Date.UTC(year + 1, 0, 1));
        const totalOrders = await this.prisma.order.count();
        const pendingOrders = await this.prisma.order.count({
            where: { status: client_1.OrderStatus.PENDING },
        });
        const totalProducts = await this.prisma.product.count({
            where: { isActive: true },
        });
        const lowStockVariants = await this.prisma.inventory.count({
            where: {
                status: { in: [client_1.StockStatus.LOW_STOCK, client_1.StockStatus.OUT_OF_STOCK] },
            },
        });
        const totalCustomers = await this.prisma.user.count({
            where: { role: 'CUSTOMER' },
        });
        const completedOrders = await this.prisma.order.count({
            where: { status: client_1.OrderStatus.DELIVERED },
        });
        const inventoryTotalVariants = await this.prisma.inventory.count();
        const inventoryHealthyVariants = await this.prisma.inventory.count({
            where: { status: client_1.StockStatus.IN_STOCK },
        });
        const revenueAggregate = await this.prisma.order.aggregate({
            where: { paymentStatus: client_1.PaymentStatus.PAID },
            _sum: { total: true },
        });
        const totalRevenue = Number(revenueAggregate._sum.total ?? 0);
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
            where: {
                order: {
                    is: {
                        paymentStatus: client_1.PaymentStatus.PAID,
                        createdAt: { gte: yearStart, lt: nextYearStart },
                    },
                },
            },
            _sum: { quantity: true, total: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5,
        });
        const yearlyOrders = await this.prisma.order.findMany({
            where: {
                createdAt: { gte: yearStart, lt: nextYearStart },
            },
            select: {
                createdAt: true,
                total: true,
                subtotal: true,
                discount: true,
                paymentStatus: true,
                paymentMethod: true,
                items: {
                    select: {
                        quantity: true,
                        unitCostSnapshot: true,
                        variant: {
                            select: {
                                purchasePrice: true,
                            },
                        },
                    },
                },
            },
        });
        const monthlyData = Array.from({ length: 12 }, (_, monthIndex) => ({
            month: `Th ${monthIndex + 1}`,
            revenue: 0,
            grossProfit: 0,
            orders: 0,
        }));
        const paymentMethods = new Map();
        let yearToDateRevenue = 0;
        let yearToDateGrossProfit = 0;
        let yearToDateCostedProductRevenue = 0;
        let yearToDatePaidOrders = 0;
        let yearToDatePaidOrdersWithCost = 0;
        let yearToDatePaidOrdersMissingCost = 0;
        for (const order of yearlyOrders) {
            const month = monthlyData[order.createdAt.getUTCMonth()];
            month.orders += 1;
            if (order.paymentStatus === client_1.PaymentStatus.PAID) {
                const revenue = Number(order.total);
                month.revenue += revenue;
                yearToDateRevenue += revenue;
                yearToDatePaidOrders += 1;
                const paymentMethod = paymentMethods.get(order.paymentMethod) ?? {
                    revenue: 0,
                    orders: 0,
                };
                paymentMethod.revenue += revenue;
                paymentMethod.orders += 1;
                paymentMethods.set(order.paymentMethod, paymentMethod);
                const hasCurrentCostFallback = order.items.length > 0 &&
                    order.items.every((item) => (item.unitCostSnapshot !== null &&
                        item.unitCostSnapshot !== undefined) ||
                        (item.variant?.purchasePrice !== null &&
                            item.variant?.purchasePrice !== undefined));
                if (!hasCurrentCostFallback) {
                    yearToDatePaidOrdersMissingCost += 1;
                    continue;
                }
                const productRevenue = Number(order.subtotal) - Number(order.discount);
                const cost = order.items.reduce((sum, item) => sum +
                    Number(item.unitCostSnapshot ?? item.variant?.purchasePrice ?? 0) *
                        item.quantity, 0);
                const grossProfit = productRevenue - cost;
                month.grossProfit += grossProfit;
                yearToDateGrossProfit += grossProfit;
                yearToDateCostedProductRevenue += productRevenue;
                yearToDatePaidOrdersWithCost += 1;
            }
        }
        return {
            year,
            overview: {
                totalRevenue,
                totalOrders,
                pendingOrders,
                totalProducts,
                lowStockVariants,
                totalCustomers,
                completedOrders,
                inventoryTotalVariants,
                inventoryHealthyVariants,
                yearToDateRevenue,
                yearToDateGrossProfit,
                yearToDateGrossMargin: yearToDateCostedProductRevenue > 0
                    ? (yearToDateGrossProfit / yearToDateCostedProductRevenue) * 100
                    : 0,
                yearToDatePaidOrders,
                yearToDatePaidOrdersWithCost,
                yearToDatePaidOrdersMissingCost,
            },
            recentOrders,
            popularItems,
            monthlyData,
            paymentMethodData: Array.from(paymentMethods, ([paymentMethod, totals]) => ({ paymentMethod, ...totals })),
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
                        {
                            storage: '128GB',
                            color: 'Tiêu chuẩn',
                            price: data.salePrice || data.basePrice,
                            purchasePrice: data.purchasePrice,
                        },
                    ]).map((v) => ({
                        storage: v.storage,
                        color: v.color || 'Tiêu chuẩn',
                        ram: v.ram,
                        price: v.price || data.salePrice || data.basePrice,
                        purchasePrice: this.parsePurchasePrice(v.purchasePrice),
                        oldPrice: v.oldPrice || data.basePrice,
                        sku: v.sku || `SOC-${Date.now().toString().slice(-6)}`,
                        imageUrl: v.imageUrl || data.image,
                        inventory: {
                            create: {
                                stock: v.stock ?? 100,
                                status: (v.stock ?? 100) <= 0
                                    ? client_1.StockStatus.OUT_OF_STOCK
                                    : (v.stock ?? 100) <= 5
                                        ? client_1.StockStatus.LOW_STOCK
                                        : client_1.StockStatus.IN_STOCK,
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
        const stock = data.stock ?? 50;
        return this.prisma.productVariant.create({
            data: {
                productId,
                color: data.color || 'Tiêu chuẩn',
                storage: data.storage,
                ram: data.ram,
                price: data.price,
                purchasePrice: this.parsePurchasePrice(data.purchasePrice),
                oldPrice: data.oldPrice,
                sku,
                imageUrl: data.imageUrl,
                inventory: {
                    create: {
                        stock,
                        status: stock <= 0
                            ? client_1.StockStatus.OUT_OF_STOCK
                            : stock <= 5
                                ? client_1.StockStatus.LOW_STOCK
                                : client_1.StockStatus.IN_STOCK,
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
        if (data.purchasePrice !== undefined) {
            updateData.purchasePrice = this.parsePurchasePrice(data.purchasePrice);
        }
        if (data.oldPrice !== undefined)
            updateData.oldPrice = data.oldPrice;
        if (data.sku !== undefined)
            updateData.sku = data.sku;
        return this.prisma.$transaction(async (transaction) => {
            const variant = await transaction.productVariant.update({
                where: { id },
                data: updateData,
            });
            if (data.stock !== undefined) {
                if (!Number.isInteger(data.stock) || data.stock < 0) {
                    throw new common_1.BadRequestException('Tồn kho phải là số nguyên không âm');
                }
                const inventory = await transaction.inventory.findUnique({
                    where: { variantId: id },
                });
                const availableStock = data.stock - (inventory?.reserved ?? 0);
                if (availableStock < 0) {
                    throw new common_1.BadRequestException('Tồn kho thực tế không thể thấp hơn số lượng đang giữ đơn');
                }
                const stockStatus = availableStock <= 0
                    ? client_1.StockStatus.OUT_OF_STOCK
                    : availableStock <= 5
                        ? client_1.StockStatus.LOW_STOCK
                        : client_1.StockStatus.IN_STOCK;
                if (!inventory) {
                    await transaction.inventory.create({
                        data: { variantId: id, stock: data.stock, status: stockStatus },
                    });
                }
                else {
                    const updated = await transaction.$executeRaw `
            UPDATE "inventories"
            SET
              "stock" = ${data.stock},
              "status" = CASE
                WHEN ${data.stock} - "reserved" <= 0 THEN 'OUT_OF_STOCK'::"StockStatus"
                WHEN ${data.stock} - "reserved" <= 5 THEN 'LOW_STOCK'::"StockStatus"
                ELSE 'IN_STOCK'::"StockStatus"
              END,
              "updatedAt" = CURRENT_TIMESTAMP
            WHERE "variantId" = ${id}
              AND "reserved" <= ${data.stock}
          `;
                    if (updated === 0) {
                        throw new common_1.BadRequestException('Tồn kho thực tế không thể thấp hơn số lượng đang giữ đơn');
                    }
                }
            }
            return variant;
        });
    }
    parsePurchasePrice(value) {
        if (value === undefined || value === null)
            return null;
        if ((typeof value !== 'number' && typeof value !== 'string') ||
            (typeof value === 'string' && value.trim() === '')) {
            throw new common_1.BadRequestException('Giá vốn phải là số không âm');
        }
        const purchasePrice = Number(value);
        if (!Number.isFinite(purchasePrice) || purchasePrice < 0) {
            throw new common_1.BadRequestException('Giá vốn phải là số không âm');
        }
        return purchasePrice;
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
    async updateInventoryStock(id, stock) {
        if (!Number.isInteger(stock) || stock < 0) {
            throw new common_1.BadRequestException('Tồn kho phải là số nguyên không âm');
        }
        const updated = await this.prisma.$executeRaw `
      UPDATE "inventories"
      SET
        "stock" = ${stock},
        "status" = CASE
          WHEN ${stock} - "reserved" <= 0 THEN 'OUT_OF_STOCK'::"StockStatus"
          WHEN ${stock} - "reserved" <= 5 THEN 'LOW_STOCK'::"StockStatus"
          ELSE 'IN_STOCK'::"StockStatus"
        END,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${id}
        AND "reserved" <= ${stock}
    `;
        if (updated === 0) {
            const inventory = await this.prisma.inventory.findUnique({
                where: { id },
                select: { id: true },
            });
            if (!inventory)
                throw new common_1.NotFoundException('Không tìm thấy SKU trong kho');
            throw new common_1.BadRequestException('Tồn kho thực tế không thể thấp hơn số lượng đang giữ đơn');
        }
        return this.prisma.inventory.findUnique({
            where: { id },
            include: { variant: { include: { product: true } } },
        });
    }
    async createStockReceipt(data) {
        if (!Array.isArray(data.items) || data.items.length === 0) {
            throw new common_1.BadRequestException('Phiếu nhập phải có ít nhất một sản phẩm');
        }
        const itemMap = new Map();
        for (const item of data.items) {
            const variantId = Number(item.variantId);
            const quantity = Number(item.quantity);
            const unitCost = Number(item.unitCost);
            if (!Number.isInteger(variantId) ||
                !Number.isInteger(quantity) ||
                quantity <= 0 ||
                !Number.isFinite(unitCost) ||
                unitCost < 0) {
                throw new common_1.BadRequestException('Variant, số lượng và giá vốn nhập không hợp lệ');
            }
            const current = itemMap.get(variantId);
            itemMap.set(variantId, {
                quantity: (current?.quantity ?? 0) + quantity,
                unitCost,
            });
        }
        return this.prisma.$transaction(async (transaction) => {
            const variants = await transaction.productVariant.findMany({
                where: { id: { in: [...itemMap.keys()] } },
                select: { id: true },
            });
            if (variants.length !== itemMap.size) {
                throw new common_1.BadRequestException('Một hoặc nhiều variant không tồn tại');
            }
            const receipt = await transaction.stockReceipt.create({
                data: {
                    supplier: typeof data.supplier === 'string' ? data.supplier.trim() || null : null,
                    billImageUrl: typeof data.billImageUrl === 'string' ? data.billImageUrl : null,
                    ocrText: typeof data.ocrText === 'string' ? data.ocrText : null,
                    items: {
                        create: [...itemMap.entries()].map(([variantId, item]) => ({
                            variantId,
                            quantity: item.quantity,
                            unitCost: item.unitCost,
                        })),
                    },
                },
                include: { items: true },
            });
            for (const [variantId, item] of itemMap) {
                const inventory = await transaction.inventory.findUnique({
                    where: { variantId },
                    select: { stock: true, reserved: true },
                });
                if (!inventory) {
                    throw new common_1.BadRequestException(`Variant ${variantId} chưa có bản ghi tồn kho`);
                }
                const stock = inventory.stock + item.quantity;
                const availableStock = stock - inventory.reserved;
                await transaction.inventory.update({
                    where: { variantId },
                    data: {
                        stock,
                        status: availableStock <= 0
                            ? client_1.StockStatus.OUT_OF_STOCK
                            : availableStock <= 5
                                ? client_1.StockStatus.LOW_STOCK
                                : client_1.StockStatus.IN_STOCK,
                    },
                });
                await transaction.productVariant.update({
                    where: { id: variantId },
                    data: { purchasePrice: item.unitCost },
                });
            }
            return receipt;
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
        if (!Object.values(client_1.OrderStatus).includes(status)) {
            throw new common_1.BadRequestException('Trạng thái đơn hàng không hợp lệ');
        }
        if (paymentStatus &&
            !Object.values(client_1.PaymentStatus).includes(paymentStatus)) {
            throw new common_1.BadRequestException('Trạng thái thanh toán không hợp lệ');
        }
        return this.prisma.$transaction(async (transaction) => {
            const currentOrder = await transaction.order.findUnique({
                where: { id },
                include: { items: true },
            });
            if (!currentOrder)
                throw new common_1.NotFoundException('Không tìm thấy đơn hàng');
            const nextStatus = status;
            const entersFulfillment = nextStatus === client_1.OrderStatus.CONFIRMED ||
                nextStatus === client_1.OrderStatus.SHIPPING ||
                nextStatus === client_1.OrderStatus.DELIVERED;
            const releasesInventory = nextStatus === client_1.OrderStatus.CANCELLED ||
                nextStatus === client_1.OrderStatus.REFUNDED;
            let allocationStatus = currentOrder.inventoryAllocationStatus;
            if (entersFulfillment && allocationStatus === client_1.InventoryAllocationStatus.RELEASED) {
                throw new common_1.BadRequestException('Đơn đã hủy giữ hàng nên không thể tiếp tục xử lý');
            }
            if (entersFulfillment && allocationStatus === client_1.InventoryAllocationStatus.RESERVED) {
                for (const item of currentOrder.items) {
                    const updated = await transaction.$executeRaw `
            UPDATE "inventories"
            SET
              "stock" = "stock" - ${item.quantity},
              "reserved" = "reserved" - ${item.quantity},
              "status" = CASE
                WHEN "stock" - "reserved" <= 0 THEN 'OUT_OF_STOCK'::"StockStatus"
                WHEN "stock" - "reserved" <= 5 THEN 'LOW_STOCK'::"StockStatus"
                ELSE 'IN_STOCK'::"StockStatus"
              END,
              "updatedAt" = CURRENT_TIMESTAMP
            WHERE "variantId" = ${item.variantId}
              AND "stock" >= ${item.quantity}
              AND "reserved" >= ${item.quantity}
          `;
                    if (updated === 0) {
                        throw new common_1.BadRequestException(`Không đủ hàng đã giữ cho sản phẩm "${item.productName}"`);
                    }
                }
                allocationStatus = client_1.InventoryAllocationStatus.COMMITTED;
            }
            else if (releasesInventory &&
                allocationStatus === client_1.InventoryAllocationStatus.RESERVED) {
                for (const item of currentOrder.items) {
                    const updated = await transaction.$executeRaw `
            UPDATE "inventories"
            SET
              "reserved" = "reserved" - ${item.quantity},
              "status" = CASE
                WHEN "stock" - ("reserved" - ${item.quantity}) <= 0 THEN 'OUT_OF_STOCK'::"StockStatus"
                WHEN "stock" - ("reserved" - ${item.quantity}) <= 5 THEN 'LOW_STOCK'::"StockStatus"
                ELSE 'IN_STOCK'::"StockStatus"
              END,
              "updatedAt" = CURRENT_TIMESTAMP
            WHERE "variantId" = ${item.variantId}
              AND "reserved" >= ${item.quantity}
          `;
                    if (updated === 0) {
                        throw new common_1.BadRequestException(`Không thể giải phóng lượng hàng đang giữ cho "${item.productName}"`);
                    }
                }
                allocationStatus = client_1.InventoryAllocationStatus.RELEASED;
            }
            else if (releasesInventory &&
                allocationStatus === client_1.InventoryAllocationStatus.COMMITTED &&
                (currentOrder.status === client_1.OrderStatus.PENDING ||
                    currentOrder.status === client_1.OrderStatus.CONFIRMED)) {
                for (const item of currentOrder.items) {
                    await transaction.$executeRaw `
            UPDATE "inventories"
            SET
              "stock" = "stock" + ${item.quantity},
              "status" = CASE
                WHEN ("stock" + ${item.quantity}) - "reserved" <= 0 THEN 'OUT_OF_STOCK'::"StockStatus"
                WHEN ("stock" + ${item.quantity}) - "reserved" <= 5 THEN 'LOW_STOCK'::"StockStatus"
                ELSE 'IN_STOCK'::"StockStatus"
              END,
              "updatedAt" = CURRENT_TIMESTAMP
            WHERE "variantId" = ${item.variantId}
          `;
                }
                allocationStatus = client_1.InventoryAllocationStatus.RELEASED;
            }
            const updatedOrder = await transaction.order.update({
                where: { id },
                data: {
                    status: nextStatus,
                    inventoryAllocationStatus: allocationStatus,
                    paymentStatus: paymentStatus
                        ? paymentStatus
                        : undefined,
                },
                include: { payment: true },
            });
            if (paymentStatus && updatedOrder.payment) {
                await transaction.payment.update({
                    where: { orderId: id },
                    data: {
                        status: paymentStatus,
                        paidAt: paymentStatus === 'PAID' ? new Date() : undefined,
                    },
                });
            }
            return updatedOrder;
        });
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