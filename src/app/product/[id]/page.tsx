'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { IProduct } from '@/models/Product';
import { ProductDetailPage as ProductView } from '@/components/ui/product-detail-page';
import Link from 'next/link';

type ProductData = IProduct & { _id: string };

function ProductContent() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProduct(data.product);
        }
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = (options: { color: string; size: string; quantity: number }) => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('fbt_cart') || '[]');
    const cartId = `${product._id}_${options.color}_${options.size}`;
    const existing = cart.find((item: any) => item.cartId === cartId);
    
    if (existing) {
      existing.quantity += options.quantity;
    } else {
      cart.push({
        cartId,
        _id: product._id,
        title: product.title,
        price: product.price,
        media: product.media,
        selectedColor: options.color,
        selectedSize: options.size,
        quantity: options.quantity
      });
    }
    localStorage.setItem('fbt_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="loader"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 bg-background text-muted-foreground">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link href="/" className="text-primary hover:underline mt-4 inline-block">Return Home</Link>
      </div>
    );
  }

  // Map to the format component expects
  const mappedProduct = {
    _id: product._id,
    name: product.title,
    price: product.price,
    category: product.category,
    description: product.description, // Correctly point to AI-cleaned description
    media: product.media.map((m) => ({ url: m.url, type: m.type as "image" | "video" })),
    colors: product.colors || [],
    sizes: product.sizes || [],
    fabric: product.fabric || "",
    highlights: product.highlights || [],
    pageContent: product.pageContent || "",
    tags: product.tags || [],
    views: product.views,
  };

  return <ProductView product={mappedProduct} onAddToCart={handleAddToCart} />;
}

export default function ProductPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={<div className="flex justify-center p-20"><div className="loader"></div></div>}>
        <ProductContent />
      </Suspense>
    </main>
  );
}
