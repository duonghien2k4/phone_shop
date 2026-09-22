import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';

const productInclude = {
  brand: true,
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: { include: { inventory: true } },
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListProductsDto) {
    const where = {
      isActive: true,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' as const } },
              { description: { contains: query.search, mode: 'insensitive' as const } },
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

  async findOne(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isActive: true },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Slug sản phẩm đã tồn tại');
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        brandId: dto.brandId,
        categoryId: dto.categoryId,
        description: dto.description,
        specs: dto.specs as Prisma.InputJsonValue | undefined,
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

  async deactivate(id: number) {
    const result = await this.prisma.product.updateMany({
      where: { id, isActive: true },
      data: { isActive: false },
    });

    if (result.count === 0) {
      throw new NotFoundException('Không tìm thấy sản phẩm đang hoạt động');
    }

    return { id, isActive: false };
  }
}
