'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import OnboardingModal from '@/components/OnboardingModal';
import { IProduct } from '@/models/Product';
import { Eye, ChevronRight, X, Play, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/components/ui/product-card-1';

type ProductData = IProduct & { _id: string; _mockRating?: number; _mockReviews?: number; _isNew?: boolean };

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function HomeContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const sort = searchParams.get('sort');
  
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartX = useRef(0);
  const touchStartTime = useRef(0);

  useEffect(() => {
    let url = '/api/products?';
    if (category) url += `category=${category}&`;
    if (sort) url += `sort=${sort}&`;
    
        setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Pre-compute stable mock ratings once when products load
          const now = Date.now();
          const weekMs = 7 * 24 * 60 * 60 * 1000;
          const enriched = data.products.map((p: ProductData) => ({
            ...p,
            _mockRating: Math.round((4.5 + (hashCode(p._id) % 100) / 200) * 10) / 10,
            _mockReviews: (hashCode(p._id) % 200) + 10,
            _isNew: new Date(p.createdAt).getTime() > now - weekMs,
          }));
          setProducts(enriched);
        }
        setLoading(false);
      });
  }, [category, sort]);

  const storyProducts = products.filter(p => (p.media || []).some(m => m.type === 'video'));
  const activeStory = activeStoryIndex !== null ? storyProducts[activeStoryIndex] : null;

  const closeStory = () => {
    setActiveStoryIndex(null);
    setIsHolding(false);
  };

  const nextStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex < storyProducts.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      closeStory();
    }
  };

  const prevStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
    setIsHolding(true);
    if (videoRef.current) videoRef.current.pause();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX.current;

    setIsHolding(false);
    if (videoRef.current) videoRef.current.play();

    // Swipe detection (min 60px)
    if (Math.abs(diff) > 60) {
      if (diff < 0) nextStory();
      else prevStory();
    }
  };

  const handleMouseDown = () => {
    setIsHolding(true);
    if (videoRef.current) videoRef.current.pause();
  };

  const handleMouseUp = () => {
    setIsHolding(false);
    if (videoRef.current) videoRef.current.play();
  };
  
  return (
    <main>
      <Navbar />
      <OnboardingModal />

      {/* Story Modal — Instagram style */}
      {activeStory && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center" style={{ zIndex: 100 }}>
          {/* Close */}
          <button 
            onClick={closeStory}
            className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 rounded-full p-2 text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Prev */}
          {activeStoryIndex! > 0 && (
            <button 
              onClick={prevStory}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 rounded-full p-2 text-white transition-colors hidden sm:flex"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Next */}
          {activeStoryIndex! < storyProducts.length - 1 && (
            <button 
              onClick={nextStory}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 rounded-full p-2 text-white transition-colors hidden sm:flex"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Story container */}
          <div 
            className="w-full max-w-[400px] h-[80vh] bg-black rounded-2xl overflow-hidden relative select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => { setIsHolding(false); if (videoRef.current) videoRef.current.pause(); }}
          >
            {/* Progress dots */}
            <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {storyProducts.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all ${i === activeStoryIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`} />
              ))}
            </div>

            {/* Video — no controls, plays on hold */}
            {(() => {
              const videoMedia = (activeStory.media || []).find(m => m.type === 'video');
              if (!videoMedia) return null;
              return (
                <video 
                  ref={videoRef}
                  src={videoMedia.url}
                  autoPlay
                  muted
                  loop
                  className="w-full h-full object-contain"
                  style={{ pointerEvents: 'none' }}
                />
              );
            })()}

            {/* Hold indicator — shows pause when holding */}
            {isHolding && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/40 rounded-full p-4">
                  <div className="w-8 h-8 flex items-center justify-center gap-1">
                    <div className="w-1.5 h-6 bg-white rounded-full" />
                    <div className="w-1.5 h-6 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex justify-between items-end">
              <div>
                <h3 className="text-lg font-semibold text-white m-0">{activeStory.title}</h3>
                <p className="text-primary font-bold mt-0.5">₹{activeStory.price > 0 ? activeStory.price.toLocaleString("en-IN") : "—"}</p>
              </div>
              <Link href={`/product/${activeStory._id}`} className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1 hover:bg-white/90 transition-colors">
                View <ChevronRight size={14} />
              </Link>
            </div>

            {/* Views */}
            <div className="absolute top-10 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
              <Eye size={12} /> {activeStory.views}
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
              {storyProducts.map((product, index) => {
                const videoMedia = (product.media || []).find(m => m.type === 'video');
                return (
                  <div key={product._id} className="story-wrapper animate-fade-in" onClick={() => setActiveStoryIndex(index)}>
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
                    images={(product.media || []).filter(m => m.type === 'image').map(m => m.url)}
                    colors={product.colors || []}
                    sizes={product.sizes || []}
                    isNew={product._isNew || false}
                    freeShipping={true}
                    rating={product._mockRating || 4.5}
                    reviewCount={product._mockReviews || 50}
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
