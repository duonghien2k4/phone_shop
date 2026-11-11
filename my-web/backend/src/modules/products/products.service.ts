import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { publicVariantSelect } from './public-variant.select';

const productInclude = {
  brand: true,
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: { select: publicVariantSelect },
};

const reviewInclude = {
  user: {
    select: {
      id: true,
      email: true,
      profile: { select: { fullName: true, avatarUrl: true } },
    },
  },
};

const REVIEWABLE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.SHIPPING,
  OrderStatus.DELIVERED,
];

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
            inventory: {
              create: {
                stock: variant.stock ?? 0,
                status:
                  (variant.stock ?? 0) <= 0
                    ? 'OUT_OF_STOCK'
                    : (variant.stock ?? 0) <= 5
                      ? 'LOW_STOCK'
                      : 'IN_STOCK',
              },
            },
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

  // ── Reviews ────────────────────────────────────────────────────────────────

  async getProductReviews(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isActive: true },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    const reviews = await this.prisma.review.findMany({
      where: { productId: product.id, isVisible: true },
      include: reviewInclude,
      orderBy: { createdAt: 'desc' },
    });

    const total = reviews.length;
    const avgRating =
      total > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
        : 0;

    return { reviews, total, avgRating: Math.round(avgRating * 10) / 10 };
  }

  async canUserReview(slug: string, userId: number) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isActive: true },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    const hasPurchased = await this.prisma.order.findFirst({
      where: {
        userId,
        status: { in: REVIEWABLE_ORDER_STATUSES },
        items: {
          some: { productId: product.id },
        },
      },
      select: { id: true },
    });

    return {
      canReview: Boolean(hasPurchased),
      reason: hasPurchased
        ? null
        : 'Bạn chỉ có thể đánh giá sau khi đã mua sản phẩm này tại Sóc Mobile.',
    };
  }

  async createOrUpdateReview(
    slug: string,
    userId: number,
    data: { rating: number; comment: string },
  ) {
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Điểm đánh giá phải từ 1 đến 5');
    }
    if (!data.comment || data.comment.trim().length < 5) {
      throw new BadRequestException('Nội dung bình luận tối thiểu 5 ký tự');
    }

    const product = await this.prisma.product.findFirst({
      where: { slug, isActive: true },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    const hasPurchased = await this.prisma.order.findFirst({
      where: {
        userId,
        status: { in: REVIEWABLE_ORDER_STATUSES },
        items: {
          some: { productId: product.id },
        },
      },
      select: { id: true },
    });

    if (!hasPurchased) {
      throw new BadRequestException(
        'Bạn chỉ có thể gửi đánh giá sau khi đã mua sản phẩm này tại Sóc Mobile.',
      );
    }

    const review = await this.prisma.review.upsert({
      where: { userId_productId: { userId, productId: product.id } },
      update: {
        rating: data.rating,
        comment: data.comment.trim(),
        isVisible: true,
      },
      create: {
        userId,
        productId: product.id,
        rating: data.rating,
        comment: data.comment.trim(),
        imageUrls: [],
        isVisible: true,
      },
      include: reviewInclude,
    });

    return review;
  }
}
