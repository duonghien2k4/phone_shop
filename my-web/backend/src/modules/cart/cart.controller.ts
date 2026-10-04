import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../../common/decorators/get-user.decorator';
import type { UserPayload } from '../../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AddCartItemDto, UpdateCartQuantityDto } from './dto/cart-item.dto';
import { CartService } from './cart.service';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@GetUser() user: UserPayload) {
    return this.cartService.getCart(user.sub);
  }

  @Post('items')
  addItem(@GetUser() user: UserPayload, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.sub, dto);
  }

  @Put('items/:variantId')
  updateQuantity(
    @GetUser() user: UserPayload,
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() dto: UpdateCartQuantityDto,
  ) {
    return this.cartService.updateQuantity(user.sub, variantId, dto);
  }

  @Delete('items/:variantId')
  removeItem(
    @GetUser() user: UserPayload,
    @Param('variantId', ParseIntPipe) variantId: number,
  ) {
    return this.cartService.removeItem(user.sub, variantId);
  }

  @Delete()
  clearCart(@GetUser() user: UserPayload) {
    return this.cartService.clearCart(user.sub);
  }
}
