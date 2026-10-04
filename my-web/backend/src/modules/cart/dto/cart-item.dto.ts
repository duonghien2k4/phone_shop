import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AddCartItemDto {
  @Type(() => Number)
  @IsInt({ message: 'variantId phải là số nguyên' })
  @Min(1, { message: 'variantId phải lớn hơn 0' })
  variantId: number;

  @Type(() => Number)
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  quantity: number;
}

export class UpdateCartQuantityDto {
  @Type(() => Number)
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  quantity: number;
}
