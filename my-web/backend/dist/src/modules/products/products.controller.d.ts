import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
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
    canReview(slug: string, user: {
        sub: number;
    }): Promise<{
        canReview: boolean;
        reason: string | null;
    }>;
    submitReview(slug: string, user: {
        sub: number;
    }, body: {
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
    create(dto: CreateProductDto, _user: unknown): Promise<{
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
    }>;
    deactivate(id: number): Promise<{
        id: number;
        isActive: boolean;
    }>;
}
