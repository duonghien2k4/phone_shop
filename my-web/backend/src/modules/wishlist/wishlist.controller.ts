import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../../common/decorators/get-user.decorator';
import type { UserPayload } from '../../common/decorators/get-user.decorator';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { WishlistService } from './wishlist.service';

@UseGuards(ClerkAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getWishlist(@GetUser() user: UserPayload) {
    return this.wishlistService.getWishlist(user.sub);
  }

  @Post('toggle/:productId')
  toggleWishlist(
    @GetUser() user: UserPayload,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistService.toggleWishlist(user.sub, productId);
  }

  @Post(':productId')
  addToWishlist(
    @GetUser() user: UserPayload,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistService.addToWishlist(user.sub, productId);
  }

  @Delete(':productId')
  removeFromWishlist(
    @GetUser() user: UserPayload,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistService.removeFromWishlist(user.sub, productId);
  }
}

