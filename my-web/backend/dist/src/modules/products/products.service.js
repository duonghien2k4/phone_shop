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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const productInclude = {
    brand: true,
    category: true,
    images: { orderBy: { sortOrder: 'asc' } },
    variants: { include: { inventory: true } },
};
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const where = {
            isActive: true,
            ...(query.search
                ? {
                    OR: [
                        { name: { contains: query.search, mode: 'insensitive' } },
                        { description: { contains: query.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
            ...(query.brand ? { brand: { slug: query.brand } } : {}),
            ...(query.category ? { category: { slug: query.category } } : {}),
        };
        const skip = (query.page - 1) * query.limit;
        const [items, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: productInclude,
                orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
                skip,
                take: query.limit,
            }),
            this.prisma.product.count({ where }),
        ]);
        return {
            items,
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
            },
        };
    }
    async findOne(slug) {
        const product = await this.prisma.product.findFirst({
            where: { slug, isActive: true },
            include: productInclude,
        });
        if (!product) {
            throw new common_1.NotFoundException('Không tìm thấy sản phẩm');
        }
        return product;
    }
    async create(dto) {
        const existing = await this.prisma.product.findUnique({
            where: { slug: dto.slug },
        });
        if (existing) {
            throw new common_1.ConflictException('Slug sản phẩm đã tồn tại');
        }
        return this.prisma.product.create({
            data: {
                name: dto.name,
                slug: dto.slug,
                brandId: dto.brandId,
                categoryId: dto.categoryId,
                description: dto.description,
                specs: dto.specs,
                basePrice: dto.basePrice,
                salePrice: dto.salePrice,
                discount: dto.discount,
                tags: dto.tags ?? [],
                isFeatured: dto.isFeatured ?? false,
                variants: {
                    create: dto.variants.map((variant) => ({
                        color: variant.color,
                        storage: variant.storage,
                        ram: variant.ram,
                        sku: variant.sku,
                        price: variant.price,
                        imageUrl: variant.imageUrl,
                        inventory: { create: { stock: variant.stock ?? 0 } },
                    })),
                },
            },
            include: productInclude,
        });
    }
    async deactivate(id) {
        const result = await this.prisma.product.updateMany({
            where: { id, isActive: true },
            data: { isActive: false },
        });
        if (result.count === 0) {
            throw new common_1.NotFoundException('Không tìm thấy sản phẩm đang hoạt động');
        }
        return { id, isActive: false };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map