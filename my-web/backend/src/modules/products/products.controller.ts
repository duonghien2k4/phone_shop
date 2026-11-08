import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: ListProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productsService.findOne(slug);
  }

  // ── Reviews ───────────────────────────────────────────────────────────────

  @Get(':slug/reviews')
  getProductReviews(@Param('slug') slug: string) {
    return this.productsService.getProductReviews(slug);
  }

  @Get(':slug/can-review')
  @UseGuards(ClerkAuthGuard)
  canReview(
    @Param('slug') slug: string,
    @GetUser() user: { sub: number },
  ) {
    return this.productsService.canUserReview(slug, user.sub);
  }

  @Post(':slug/reviews')
  @UseGuards(ClerkAuthGuard)
  submitReview(
    @Param('slug') slug: string,
    @GetUser() user: { sub: number },
    @Body() body: { rating: number; comment: string },
  ) {
    return this.productsService.createOrUpdateReview(slug, user.sub, body);
  }

  // ── Admin operations ──────────────────────────────────────────────────────

  @Post()
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  create(@Body() dto: CreateProductDto, @GetUser() _user: unknown) {
    return this.productsService.create(dto);
  }

  @Delete(':id')
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.deactivate(id);
  }
}
