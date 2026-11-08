import type { ProductVariant } from '@/types/product';

export function areSameProductVariants(
  first: ProductVariant,
  second: ProductVariant,
): boolean {
  if (first.id !== undefined && second.id !== undefined) {
    return first.id === second.id;
  }

  return (
    first.storage === second.storage &&
    first.color === second.color &&
    first.ram === second.ram &&
    first.price === second.price
  );
}

export function getProductVariantLabel(variant: ProductVariant): string {
  return variant.color
    ? `${variant.storage} · ${variant.color}`
    : variant.storage;
}

export function getProductVariantKey(
  variant: ProductVariant,
  index: number,
): string | number {
  return (
    variant.id ??
    `${variant.storage}-${variant.color ?? ''}-${variant.ram ?? ''}-${index}`
  );
}
