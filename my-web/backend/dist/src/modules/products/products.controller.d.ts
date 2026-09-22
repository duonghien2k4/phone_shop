import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(query: ListProductsDto): Promise<{
        items: ({
            brand: {
                id: number;
                name: string;
                slug: string;
                logoUrl: string | null;
                description: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            category: {
                id: number;
                name: string;
                slug: string;
                description: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            variants: ({
                inventory: {
                    id: number;
                    updatedAt: Date;
                    variantId: number;
                    stock: number;
                    reserved: number;
                    status: import("@prisma/client").$Enums.StockStatus;
                } | null;
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                ram: string | null;
                productId: number;
                sku: string;
                color: string;
                storage: string;
                price: import("@prisma/client-runtime-utils").Decimal;
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
        brand: {
            id: number;
            name: string;
            slug: string;
            logoUrl: string | null;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        category: {
            id: number;
            name: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        variants: ({
            inventory: {
                id: number;
                updatedAt: Date;
                variantId: number;
                stock: number;
                reserved: number;
                status: import("@prisma/client").$Enums.StockStatus;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            ram: string | null;
            productId: number;
            sku: string;
            color: string;
            storage: string;
            price: import("@prisma/client-runtime-utils").Decimal;
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
        rating: import("@prisma/client-runtime-utils").Decimal;
        reviewCount: number;
        isFeatured: boolean;
        tags: string[];
    }>;
    create(dto: CreateProductDto, _user: unknown): Promise<{
        brand: {
            id: number;
            name: string;
            slug: string;
            logoUrl: string | null;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        category: {
            id: number;
            name: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        variants: ({
            inventory: {
                id: number;
                updatedAt: Date;
                variantId: number;
                stock: number;
                reserved: number;
                status: import("@prisma/client").$Enums.StockStatus;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            ram: string | null;
            productId: number;
            sku: string;
            color: string;
            storage: string;
            price: import("@prisma/client-runtime-utils").Decimal;
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
