import { PrismaService } from '../../database/prisma.service';
export declare class WishlistService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getWishlist(userId: number): Promise<{
        items: ({
            product: {
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
                    price: import("@prisma/client-runtime-utils").Decimal;
                    oldPrice: import("@prisma/client-runtime-utils").Decimal | null;
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
                specs: import("@prisma/client/runtime/client").JsonValue | null;
                basePrice: import("@prisma/client-runtime-utils").Decimal;
                salePrice: import("@prisma/client-runtime-utils").Decimal | null;
                discount: number | null;
                image: string | null;
                badge: string | null;
                badgeType: string | null;
                soldCount: string | null;
                promotionText: string | null;
                installment: boolean;
                fastDelivery: boolean;
                rating: import("@prisma/client-runtime-utils").Decimal;
                reviewCount: number;
                isFeatured: boolean;
                tags: string[];
            };
        } & {
            id: number;
            createdAt: Date;
            productId: number;
            userId: number;
        })[];
        products: ({
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
                price: import("@prisma/client-runtime-utils").Decimal;
                oldPrice: import("@prisma/client-runtime-utils").Decimal | null;
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
            specs: import("@prisma/client/runtime/client").JsonValue | null;
            basePrice: import("@prisma/client-runtime-utils").Decimal;
            salePrice: import("@prisma/client-runtime-utils").Decimal | null;
            discount: number | null;
            image: string | null;
            badge: string | null;
            badgeType: string | null;
            soldCount: string | null;
            promotionText: string | null;
            installment: boolean;
            fastDelivery: boolean;
            rating: import("@prisma/client-runtime-utils").Decimal;
            reviewCount: number;
            isFeatured: boolean;
            tags: string[];
        })[];
        productIds: number[];
        total: number;
    }>;
    toggleWishlist(userId: number, productId: number): Promise<{
        inWishlist: boolean;
        productId: number;
        message: string;
    }>;
    addToWishlist(userId: number, productId: number): Promise<{
        inWishlist: boolean;
        productId: number;
        item: {
            id: number;
            createdAt: Date;
            productId: number;
            userId: number;
        };
        message: string;
    }>;
    removeFromWishlist(userId: number, productId: number): Promise<{
        inWishlist: boolean;
        productId: number;
        message: string;
    }>;
}
