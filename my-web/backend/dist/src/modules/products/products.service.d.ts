import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: ListProductsDto): Promise<{
        items: ({
            category: {
                id: number;
                name: string;
                slug: string;
                description: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            brand: {
                id: number;
                name: string;
                slug: string;
                description: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                logoUrl: string | null;
            };
            variants: ({
                inventory: {
                    id: number;
                    updatedAt: Date;
                    status: import("@prisma/client").$Enums.StockStatus;
                    variantId: number;
                    stock: number;
                    reserved: number;
                } | null;
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                productId: number;
                color: string;
                storage: string;
                ram: string | null;
                sku: string;
                price: Prisma.Decimal;
                oldPrice: Prisma.Decimal | null;
                imageUrl: string | null;
            })[];
            images: {
                url: string;
                id: number;
                createdAt: Date;
                productId: number;
                altText: string | null;
                sortOrder: number;
            }[];
        } & {
            id: number;
            name: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            brandId: number;
            categoryId: number;
            specs: Prisma.JsonValue | null;
            basePrice: Prisma.Decimal;
            salePrice: Prisma.Decimal | null;
            discount: number | null;
            image: string | null;
            badge: string | null;
            badgeType: string | null;
            soldCount: string | null;
            promotionText: string | null;
            installment: boolean;
            fastDelivery: boolean;
            rating: Prisma.Decimal;
            reviewCount: number;
            isFeatured: boolean;
            tags: string[];
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(slug: string): Promise<{
        category: {
            id: number;
            name: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        brand: {
            id: number;
            name: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            logoUrl: string | null;
        };
        variants: ({
            inventory: {
                id: number;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.StockStatus;
                variantId: number;
                stock: number;
                reserved: number;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            productId: number;
            color: string;
            storage: string;
            ram: string | null;
            sku: string;
            price: Prisma.Decimal;
            oldPrice: Prisma.Decimal | null;
            imageUrl: string | null;
        })[];
        images: {
            url: string;
            id: number;
            createdAt: Date;
            productId: number;
            altText: string | null;
            sortOrder: number;
        }[];
    } & {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        brandId: number;
        categoryId: number;
        specs: Prisma.JsonValue | null;
        basePrice: Prisma.Decimal;
        salePrice: Prisma.Decimal | null;
        discount: number | null;
        image: string | null;
        badge: string | null;
        badgeType: string | null;
        soldCount: string | null;
        promotionText: string | null;
        installment: boolean;
        fastDelivery: boolean;
        rating: Prisma.Decimal;
        reviewCount: number;
        isFeatured: boolean;
        tags: string[];
    }>;
    create(dto: CreateProductDto): Promise<{
        category: {
            id: number;
            name: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        brand: {
            id: number;
            name: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            logoUrl: string | null;
        };
        variants: ({
            inventory: {
                id: number;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.StockStatus;
                variantId: number;
                stock: number;
                reserved: number;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            productId: number;
            color: string;
            storage: string;
            ram: string | null;
            sku: string;
            price: Prisma.Decimal;
            oldPrice: Prisma.Decimal | null;
            imageUrl: string | null;
        })[];
        images: {
            url: string;
            id: number;
            createdAt: Date;
            productId: number;
            altText: string | null;
            sortOrder: number;
        }[];
    } & {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        brandId: number;
        categoryId: number;
        specs: Prisma.JsonValue | null;
        basePrice: Prisma.Decimal;
        salePrice: Prisma.Decimal | null;
        discount: number | null;
        image: string | null;
        badge: string | null;
        badgeType: string | null;
        soldCount: string | null;
        promotionText: string | null;
        installment: boolean;
        fastDelivery: boolean;
        rating: Prisma.Decimal;
        reviewCount: number;
        isFeatured: boolean;
        tags: string[];
    }>;
    deactivate(id: number): Promise<{
        id: number;
        isActive: boolean;
    }>;
    getProductReviews(slug: string): Promise<{
        reviews: ({
            user: {
                id: number;
                email: string;
                profile: {
                    fullName: string | null;
                    avatarUrl: string | null;
                } | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            rating: number;
            productId: number;
            userId: number;
            comment: string | null;
            imageUrls: string[];
            isVisible: boolean;
        })[];
        total: number;
        avgRating: number;
    }>;
    createOrUpdateReview(slug: string, userId: number, data: {
        rating: number;
        comment: string;
    }): Promise<{
        user: {
            id: number;
            email: string;
            profile: {
                fullName: string | null;
                avatarUrl: string | null;
            } | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        rating: number;
        productId: number;
        userId: number;
        comment: string | null;
        imageUrls: string[];
        isVisible: boolean;
    }>;
}
