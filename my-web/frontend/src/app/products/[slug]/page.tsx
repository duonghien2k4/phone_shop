import { notFound } from 'next/navigation';
import Header from '@/components/base/Header';
import Footer from '@/components/base/Footer';
import ProductDetailContent from '@/components/features/product/ProductDetailContent';
import { productService } from '@/services/product.service';
import { FEATURED_PRODUCTS } from '@/data/mock-products';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return FEATURED_PRODUCTS.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await productService.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const allProducts = await productService.getProducts({ limit: 12 });

  return (
    <div className="storefront-page product-detail-page">
      <Header />
      <ProductDetailContent product={product} allProducts={allProducts} />
      <Footer />
    </div>
  );
}
