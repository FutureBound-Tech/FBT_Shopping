'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import OnboardingModal from '@/components/OnboardingModal';
import { IProduct } from '@/models/Product';
import { getTimeAgo } from '@/lib/utils';
import { Eye, ChevronRight, X, Play } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/components/ui/product-card-1';

type ProductData = IProduct & { _id: string };

function HomeContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const sort = searchParams.get('sort');
  
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStory, setActiveStory] = useState<ProductData | null>(null);

  useEffect(() => {
    let url = '/api/products?';
    if (category) url += `category=${category}&`;
    if (sort) url += `sort=${sort}&`;
    
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProducts(data.products);
        }
        setLoading(false);
      });
  }, [category, sort]);

  // Extract products with videos for "Stories"
  const storyProducts = products.filter(p => p.media.some(m => m.type === 'video'));
  
  return (
    <main>
      <Navbar />
      <OnboardingModal />

      {/* Active Story Modal */}
      {activeStory && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <button 
            onClick={() => setActiveStory(null)} 
            style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: 8, borderRadius: '50%', cursor: 'pointer', zIndex: 101 }}
          >
            <X size={24} />
          </button>
          <div style={{ width: '100%', maxWidth: '400px', height: '80vh', background: '#000', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
            {activeStory.media.find(m => m.type === 'video') && (
              <video 
                src={activeStory.media.find(m => m.type === 'video')?.url} 
                autoPlay 
                loop 
                controls
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem 1.5rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{activeStory.title}</h3>
                <p style={{ margin: '0.25rem 0', color: 'var(--color-primary)', fontWeight: 700 }}>₹{activeStory.price}</p>
              </div>
              <Link href={`/product/${activeStory._id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                View <ChevronRight size={16} />
              </Link>
            </div>
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem' }}>
              <Eye size={14} /> {activeStory.views} views
            </div>
          </div>
        </div>
      )}

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        
        {/* Stories Section */}
        {!loading && storyProducts.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Play size={18} color="var(--color-primary)" /> Trending Stories
            </h2>
            <div className="stories-container">
              {storyProducts.map(product => {
                const videoMedia = product.media.find(m => m.type === 'video');
                return (
                  <div key={product._id} className="story-wrapper animate-fade-in" onClick={() => setActiveStory(product)}>
                    <div className="story-ring">
                      <div className="story-inner">
                        <video src={videoMedia?.url} style={{ pointerEvents: 'none' }} muted />
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, maxWidth: '80px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {product.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Product Feed */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 className="page-title" style={{ fontSize: '1.75rem', marginBottom: 0 }}>
            {category ? `${category.charAt(0).toUpperCase() + category.slice(1)}s` : 'All Products'}
          </h1>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {/* Simple mobile filters could go here */}
          </div>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="loader"></div>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <p>No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="flex justify-center">
                <Link href={`/product/${product._id}`} className="w-full">
                  <ProductCard
                    name={product.title}
                    price={product.price}
                    category={product.category}
                    images={product.media.filter(m => m.type === 'image').map(m => m.url)}
                    colors={product.colors || []}
                    sizes={product.sizes || []}
                    isNew={new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000}
                    freeShipping={true}
                    rating={4.5 + Math.random() * 0.5} // Mock rating
                    reviewCount={Math.floor(Math.random() * 200) + 10} // Mock review count
                  />
                </Link>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loader"></div></div>}>
      <HomeContent />
    </Suspense>
  );
}
