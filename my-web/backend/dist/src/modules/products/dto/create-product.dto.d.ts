export declare class CreateVariantDto {
    color: string;
    storage: string;
    ram?: string;
    sku: string;
    price: number;
    imageUrl?: string;
    stock?: number;
}
export declare class CreateProductDto {
    name: string;
    slug: string;
    brandId: number;
    categoryId: number;
    description?: string;
    specs?: Record<string, unknown>;
    basePrice: number;
    salePrice?: number;
    discount?: number;
    tags?: string[];
    isFeatured?: boolean;
    variants: CreateVariantDto[];
}
