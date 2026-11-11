import { PrismaService } from '../../database/prisma.service';
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(): Promise<{
        year: number;
        overview: {
            totalRevenue: number;
            totalOrders: number;
            pendingOrders: number;
            totalProducts: number;
            lowStockVariants: number;
            totalCustomers: number;
            completedOrders: number;
            inventoryTotalVariants: number;
            inventoryHealthyVariants: number;
            yearToDateRevenue: number;
            yearToDateGrossProfit: number;
            yearToDateGrossMargin: number;
            yearToDatePaidOrders: number;
            yearToDatePaidOrdersWithCost: number;
            yearToDatePaidOrdersMissingCost: number;
        };
        recentOrders: ({
            user: {
                email: string;
                profile: {
                    fullName: string | null;
                } | null;
            };
            items: {
                id: number;
                createdAt: Date;
                productId: number;
                color: string;
                storage: string;
                imageUrl: string | null;
                total: import("@prisma/client-runtime-utils").Decimal;
                productName: string;
                quantity: number;
                unitPrice: import("@prisma/client-runtime-utils").Decimal;
                unitCostSnapshot: import("@prisma/client-runtime-utils").Decimal | null;
                variantId: number;
                orderId: number;
            }[];
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            discount: import("@prisma/client-runtime-utils").Decimal;
            inventoryAllocationStatus: import("@prisma/client").$Enums.InventoryAllocationStatus;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            shippingFee: import("@prisma/client-runtime-utils").Decimal;
            total: import("@prisma/client-runtime-utils").Decimal;
            voucherCode: string | null;
            shippingAddress: import("@prisma/client/runtime/client").JsonValue;
            note: string | null;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            userId: number;
        })[];
        popularItems: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.OrderItemGroupByOutputType, ("productId" | "productName")[]> & {
            _sum: {
                quantity: number | null;
                total: import("@prisma/client-runtime-utils").Decimal | null;
            };
        })[];
        monthlyData: {
            month: string;
            revenue: number;
            grossProfit: number;
            orders: number;
        }[];
        paymentMethodData: {
            revenue: number;
            orders: number;
            paymentMethod: string;
        }[];
    }>;
    getProducts(page?: number, limit?: number, search?: string, categoryId?: number, brandId?: number): Promise<{
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
                purchasePrice: import("@prisma/client-runtime-utils").Decimal | null;
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
    createProduct(data: any): Promise<{
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
            purchasePrice: import("@prisma/client-runtime-utils").Decimal | null;
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
    updateProduct(id: number, data: any): Promise<{
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
            purchasePrice: import("@prisma/client-runtime-utils").Decimal | null;
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
    deleteProduct(id: number): Promise<{
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
    createVariant(productId: number, data: any): Promise<{
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
        purchasePrice: import("@prisma/client-runtime-utils").Decimal | null;
        oldPrice: import("@prisma/client-runtime-utils").Decimal | null;
        imageUrl: string | null;
    }>;
    updateVariant(id: number, data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        color: string;
        storage: string;
        ram: string | null;
        sku: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        purchasePrice: import("@prisma/client-runtime-utils").Decimal | null;
        oldPrice: import("@prisma/client-runtime-utils").Decimal | null;
        imageUrl: string | null;
    }>;
    private parsePurchasePrice;
    deleteVariant(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        color: string;
        storage: string;
        ram: string | null;
        sku: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        purchasePrice: import("@prisma/client-runtime-utils").Decimal | null;
        oldPrice: import("@prisma/client-runtime-utils").Decimal | null;
        imageUrl: string | null;
    }>;
    getBrands(): Promise<({
        _count: {
            products: number;
        };
    } & {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        logoUrl: string | null;
    })[]>;
    createBrand(data: any): Promise<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        logoUrl: string | null;
    }>;
    updateBrand(id: number, data: any): Promise<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        logoUrl: string | null;
    }>;
    deleteBrand(id: number): Promise<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        logoUrl: string | null;
    }>;
    getCategories(): Promise<({
        _count: {
            products: number;
        };
    } & {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createCategory(data: any): Promise<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateCategory(id: number, data: any): Promise<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteCategory(id: number): Promise<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getInventory(page?: number, limit?: number, search?: string, status?: string): Promise<{
        items: ({
            variant: {
                product: {
                    id: number;
                    name: string;
                    image: string | null;
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
                };
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
                purchasePrice: import("@prisma/client-runtime-utils").Decimal | null;
                oldPrice: import("@prisma/client-runtime-utils").Decimal | null;
                imageUrl: string | null;
            };
        } & {
            id: number;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.StockStatus;
            variantId: number;
            stock: number;
            reserved: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateInventoryStock(id: number, stock: number): Promise<({
        variant: {
            product: {
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
            updatedAt: Date;
            productId: number;
            color: string;
            storage: string;
            ram: string | null;
            sku: string;
            price: import("@prisma/client-runtime-utils").Decimal;
            purchasePrice: import("@prisma/client-runtime-utils").Decimal | null;
            oldPrice: import("@prisma/client-runtime-utils").Decimal | null;
            imageUrl: string | null;
        };
    } & {
        id: number;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.StockStatus;
        variantId: number;
        stock: number;
        reserved: number;
    }) | null>;
    createStockReceipt(data: any): Promise<{
        items: {
            id: number;
            createdAt: Date;
            quantity: number;
            variantId: number;
            unitCost: import("@prisma/client-runtime-utils").Decimal;
            receiptId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        supplier: string | null;
        billImageUrl: string | null;
        ocrText: string | null;
    }>;
    getOrders(page?: number, limit?: number, search?: string, status?: string): Promise<{
        items: ({
            user: {
                id: number;
                email: string;
                profile: {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    userId: number;
                    phone: string | null;
                    address: string | null;
                    city: string | null;
                    fullName: string | null;
                    avatarUrl: string | null;
                    dateOfBirth: Date | null;
                } | null;
            };
            items: {
                id: number;
                createdAt: Date;
                productId: number;
                color: string;
                storage: string;
                imageUrl: string | null;
                total: import("@prisma/client-runtime-utils").Decimal;
                productName: string;
                quantity: number;
                unitPrice: import("@prisma/client-runtime-utils").Decimal;
                unitCostSnapshot: import("@prisma/client-runtime-utils").Decimal | null;
                variantId: number;
                orderId: number;
            }[];
            payment: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.PaymentStatus;
                method: import("@prisma/client").$Enums.PaymentMethod;
                amount: import("@prisma/client-runtime-utils").Decimal;
                transactionId: string | null;
                gatewayData: import("@prisma/client/runtime/client").JsonValue | null;
                paidAt: Date | null;
                orderId: number;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            discount: import("@prisma/client-runtime-utils").Decimal;
            inventoryAllocationStatus: import("@prisma/client").$Enums.InventoryAllocationStatus;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            shippingFee: import("@prisma/client-runtime-utils").Decimal;
            total: import("@prisma/client-runtime-utils").Decimal;
            voucherCode: string | null;
            shippingAddress: import("@prisma/client/runtime/client").JsonValue;
            note: string | null;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            userId: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getOrderById(id: number): Promise<{
        user: {
            id: number;
            email: string;
            profile: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                userId: number;
                phone: string | null;
                address: string | null;
                city: string | null;
                fullName: string | null;
                avatarUrl: string | null;
                dateOfBirth: Date | null;
            } | null;
        };
        items: {
            id: number;
            createdAt: Date;
            productId: number;
            color: string;
            storage: string;
            imageUrl: string | null;
            total: import("@prisma/client-runtime-utils").Decimal;
            productName: string;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            unitCostSnapshot: import("@prisma/client-runtime-utils").Decimal | null;
            variantId: number;
            orderId: number;
        }[];
        payment: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: import("@prisma/client-runtime-utils").Decimal;
            transactionId: string | null;
            gatewayData: import("@prisma/client/runtime/client").JsonValue | null;
            paidAt: Date | null;
            orderId: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        discount: import("@prisma/client-runtime-utils").Decimal;
        inventoryAllocationStatus: import("@prisma/client").$Enums.InventoryAllocationStatus;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        shippingFee: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        voucherCode: string | null;
        shippingAddress: import("@prisma/client/runtime/client").JsonValue;
        note: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        userId: number;
    }>;
    updateOrderStatus(id: number, status: string, paymentStatus?: string): Promise<{
        payment: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: import("@prisma/client-runtime-utils").Decimal;
            transactionId: string | null;
            gatewayData: import("@prisma/client/runtime/client").JsonValue | null;
            paidAt: Date | null;
            orderId: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        discount: import("@prisma/client-runtime-utils").Decimal;
        inventoryAllocationStatus: import("@prisma/client").$Enums.InventoryAllocationStatus;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        shippingFee: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        voucherCode: string | null;
        shippingAddress: import("@prisma/client/runtime/client").JsonValue;
        note: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        userId: number;
    }>;
    getPayments(page?: number, limit?: number, method?: string, status?: string): Promise<{
        items: ({
            order: {
                user: {
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
                status: import("@prisma/client").$Enums.OrderStatus;
                discount: import("@prisma/client-runtime-utils").Decimal;
                inventoryAllocationStatus: import("@prisma/client").$Enums.InventoryAllocationStatus;
                subtotal: import("@prisma/client-runtime-utils").Decimal;
                shippingFee: import("@prisma/client-runtime-utils").Decimal;
                total: import("@prisma/client-runtime-utils").Decimal;
                voucherCode: string | null;
                shippingAddress: import("@prisma/client/runtime/client").JsonValue;
                note: string | null;
                paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
                paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
                userId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: import("@prisma/client-runtime-utils").Decimal;
            transactionId: string | null;
            gatewayData: import("@prisma/client/runtime/client").JsonValue | null;
            paidAt: Date | null;
            orderId: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updatePaymentStatus(id: number, status: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        method: import("@prisma/client").$Enums.PaymentMethod;
        amount: import("@prisma/client-runtime-utils").Decimal;
        transactionId: string | null;
        gatewayData: import("@prisma/client/runtime/client").JsonValue | null;
        paidAt: Date | null;
        orderId: number;
    }>;
    getVouchers(page?: number, limit?: number, search?: string): Promise<{
        items: {
            id: number;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            discountType: string;
            discountValue: import("@prisma/client-runtime-utils").Decimal;
            minOrderValue: import("@prisma/client-runtime-utils").Decimal;
            maxDiscount: import("@prisma/client-runtime-utils").Decimal | null;
            usageLimit: number | null;
            usedCount: number;
            startsAt: Date | null;
            expiresAt: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    createVoucher(data: any): Promise<{
        id: number;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discountType: string;
        discountValue: import("@prisma/client-runtime-utils").Decimal;
        minOrderValue: import("@prisma/client-runtime-utils").Decimal;
        maxDiscount: import("@prisma/client-runtime-utils").Decimal | null;
        usageLimit: number | null;
        usedCount: number;
        startsAt: Date | null;
        expiresAt: Date | null;
    }>;
    updateVoucher(id: number, data: any): Promise<{
        id: number;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discountType: string;
        discountValue: import("@prisma/client-runtime-utils").Decimal;
        minOrderValue: import("@prisma/client-runtime-utils").Decimal;
        maxDiscount: import("@prisma/client-runtime-utils").Decimal | null;
        usageLimit: number | null;
        usedCount: number;
        startsAt: Date | null;
        expiresAt: Date | null;
    }>;
    deleteVoucher(id: number): Promise<{
        id: number;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        discountType: string;
        discountValue: import("@prisma/client-runtime-utils").Decimal;
        minOrderValue: import("@prisma/client-runtime-utils").Decimal;
        maxDiscount: import("@prisma/client-runtime-utils").Decimal | null;
        usageLimit: number | null;
        usedCount: number;
        startsAt: Date | null;
        expiresAt: Date | null;
    }>;
    getReviews(page?: number, limit?: number, rating?: number): Promise<{
        items: ({
            user: {
                email: string;
                profile: {
                    fullName: string | null;
                    avatarUrl: string | null;
                } | null;
            };
            product: {
                id: number;
                name: string;
                image: string | null;
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
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    toggleReviewVisibility(id: number, isVisible: boolean): Promise<{
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
    deleteReview(id: number): Promise<{
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
    getFinancePartners(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        badge: string | null;
        badgeType: string | null;
        recommended: boolean;
        approvalRate: string | null;
        interestRate: import("@prisma/client-runtime-utils").Decimal;
        partnerMonthlyFee: import("@prisma/client-runtime-utils").Decimal;
        partnerMonthlyFeeLabel: string | null;
        subtext: string | null;
        breakdownNote: string | null;
    }[]>;
    createFinancePartner(data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        badge: string | null;
        badgeType: string | null;
        recommended: boolean;
        approvalRate: string | null;
        interestRate: import("@prisma/client-runtime-utils").Decimal;
        partnerMonthlyFee: import("@prisma/client-runtime-utils").Decimal;
        partnerMonthlyFeeLabel: string | null;
        subtext: string | null;
        breakdownNote: string | null;
    }>;
    updateFinancePartner(id: string, data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        badge: string | null;
        badgeType: string | null;
        recommended: boolean;
        approvalRate: string | null;
        interestRate: import("@prisma/client-runtime-utils").Decimal;
        partnerMonthlyFee: import("@prisma/client-runtime-utils").Decimal;
        partnerMonthlyFeeLabel: string | null;
        subtext: string | null;
        breakdownNote: string | null;
    }>;
    deleteFinancePartner(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        badge: string | null;
        badgeType: string | null;
        recommended: boolean;
        approvalRate: string | null;
        interestRate: import("@prisma/client-runtime-utils").Decimal;
        partnerMonthlyFee: import("@prisma/client-runtime-utils").Decimal;
        partnerMonthlyFeeLabel: string | null;
        subtext: string | null;
        breakdownNote: string | null;
    }>;
    private static installmentApplications;
    getInstallmentApplications(status?: string): any[];
    updateInstallmentStatus(id: string, status: string, note?: string): any;
    private static tradeInRequests;
    getTradeInRequests(status?: string): any[];
    updateTradeInRequest(id: string, status: string, estimatedPrice?: number, note?: string): any;
    private static warrantyRecords;
    getWarrantyRecords(search?: string): any[];
    createWarrantyRecord(data: any): {
        id: string;
        serialNumber: any;
        customerName: any;
        phone: any;
        productName: any;
        purchaseDate: any;
        warrantyExpiry: any;
        status: any;
        issueReported: any;
        technicianNote: any;
        updatedAt: string;
    };
    updateWarrantyRecord(id: string, data: any): any;
    getAiMonitoringStats(): Promise<{
        totalConversations: number;
        averageRating: number;
        responseRate: string;
        feedbacks: {
            query: string;
            id: number;
            createdAt: Date;
            rating: number | null;
            userId: number | null;
            comment: string | null;
            response: string;
        }[];
    }>;
    getAiFeedbacks(page?: number, limit?: number): Promise<{
        items: {
            query: string;
            id: number;
            createdAt: Date;
            rating: number | null;
            userId: number | null;
            comment: string | null;
            response: string;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
