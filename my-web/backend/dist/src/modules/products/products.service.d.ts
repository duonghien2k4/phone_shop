import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
                price: Prisma.Decimal;
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
            price: Prisma.Decimal;
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
        rating: Prisma.Decimal;
        reviewCount: number;
        isFeatured: boolean;
        tags: string[];
    }>;
    create(dto: CreateProductDto): Promise<{
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
            price: Prisma.Decimal;
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
        rating: Prisma.Decimal;
        reviewCount: number;
        isFeatured: boolean;
        tags: string[];
    }>;
    deactivate(id: number): Promise<{
        id: number;
        isActive: boolean;
    }>;
}
