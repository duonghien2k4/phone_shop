"use client";

import Navbar from "./components/landing/Navbar.jsx";
import HeroSection from "./components/landing/HeroSection.jsx";
import Product3DShowcase from "./components/landing/Product3DShowcase.jsx";
import ProductSpecs from "./components/landing/ProductSpecs.jsx";
import StoreStats from "./components/landing/StoreStats.jsx";
import StoreStory from "./components/landing/StoreStory.jsx";
import CategorySection from "./components/landing/CategorySection.jsx";
import FeaturedProducts from "./components/landing/FeaturedProducts.jsx";
import ReviewsSection from "./components/landing/ReviewsSection.jsx";
import StoreLocations from "./components/landing/StoreLocations.jsx";
import FinalCTA from "./components/landing/FinalCTA.jsx";
import { useState, useEffect } from "react";
import Footer from "./components/landing/Footer.jsx";
import { productService } from "@/services/product.service";
import { FEATURED_PRODUCTS } from "@/data/mock-products";
import {
  featuredProduct,
  categories,
  storeStats,
  reviews,
  storeLocations,
} from "./data/product.js";

export default function LandingPage() {
  const [landingProducts, setLandingProducts] = useState(() =>
    FEATURED_PRODUCTS.slice(0, 4).map((product) => ({
      id: product.id,
      slug: product.slug,
      brand: product.brand,
      name: product.name,
      spec: product.variants[0]?.storage || product.category,
      price: product.price,
      oldPrice: product.variants[0]?.oldPrice,
      image: product.image,
      rating: product.rating,
      reviews: product.reviewCount,
      variants: product.variants,
      specs: product.specs,
    }))
  );

  useEffect(() => {
    let mounted = true;
    productService.getProducts({ limit: 4 }).then((list) => {
      if (mounted && list && list.length > 0) {
        setLandingProducts(list.slice(0, 4));
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="landing-root">
      <Navbar />
      <HeroSection product={featuredProduct} />
      <Product3DShowcase product={featuredProduct} />
      <ProductSpecs product={featuredProduct} />
      <StoreStats stats={storeStats} />
      <StoreStory />
      <CategorySection categories={categories} />
      <FeaturedProducts products={landingProducts} />
      <ReviewsSection reviews={reviews} />
      <StoreLocations locations={storeLocations} />
      <FinalCTA />
      <Footer />
    </div>
  );
}
