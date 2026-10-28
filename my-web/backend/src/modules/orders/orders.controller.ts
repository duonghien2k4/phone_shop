import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../../common/decorators/get-user.decorator';
import type { UserPayload } from '../../common/decorators/get-user.decorator';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@UseGuards(ClerkAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findMyOrders(@GetUser() user: UserPayload) {
    return this.ordersService.findMyOrders(user.sub);
  }

  @Get(':id')
  findById(
    @GetUser() user: UserPayload,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    return this.ordersService.findById(user.sub, orderId);
  }

  @Post()
  createOrder(@GetUser() user: UserPayload, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user.sub, dto);
  }
}
