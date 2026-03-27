"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart, ShoppingCart, Star, ChevronLeft, ChevronRight, Check, Loader2,
} from "lucide-react";

export interface ProductCardProps {
  name?: string;
  price?: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  images?: string[];
  colors?: string[];
  sizes?: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  discount?: number;
  freeShipping?: boolean;
}

export function ProductCard({
  name = "Premium Product",
  price = 999,
  originalPrice,
  rating = 4.8,
  reviewCount = 142,
  images = [],
  colors = [],
  sizes = [],
  isNew = false,
  isBestSeller = false,
  discount = 0,
  freeShipping = true,
}: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(colors[0] || "");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const displayImages = images.length > 0 ? images : ["https://placehold.co/600x800/1e293b/f8fafc?text=No+Image"];

  const touchStartX = useRef(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleSwipeStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleSwipeEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff < 0) setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
      else setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isAddedToCart) return;
    setIsAddingToCart(true);
    setTimeout(() => {
      setIsAddingToCart(false);
      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 2000);
    }, 800);
  };

  return (
    <Card className="w-full max-w-sm overflow-hidden group bg-card text-foreground shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl border-border flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden" onTouchStart={handleSwipeStart} onTouchEnd={handleSwipeEnd}>
        <motion.img
          key={currentImageIndex}
          src={displayImages[currentImageIndex]}
          alt={`${name} - View ${currentImageIndex + 1}`}
          className="object-cover w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        {displayImages.length > 1 && (
          <>
            <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm" onClick={prevImage}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm" onClick={nextImage}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {displayImages.map((_, i) => (
                <button key={i} className={`h-1.5 rounded-full transition-all ${i === currentImageIndex ? "bg-primary w-4" : "bg-primary/30 w-1.5"}`} onClick={(e) => { e.stopPropagation(); e.preventDefault(); setCurrentImageIndex(i); }} />
              ))}
            </div>
          </>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isNew && <Badge className="bg-blue-500 text-white">New</Badge>}
          {isBestSeller && <Badge className="bg-amber-500 text-white">Best Seller</Badge>}
          {discount > 0 && <Badge className="bg-rose-500 text-white">-{discount}%</Badge>}
        </div>
        <Button variant="secondary" size="icon" className={`absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm ${isWishlisted ? "text-rose-500" : ""}`} onClick={(e) => { e.stopPropagation(); e.preventDefault(); setIsWishlisted(!isWishlisted); }}>
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-rose-500" : ""}`} />
        </Button>
      </div>

      <CardContent className="p-4 flex-1">
        <div className="space-y-2">
          <h3 className="font-semibold line-clamp-2 text-sm leading-tight">{name}</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span className="ml-1 text-xs font-medium">{rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
            {freeShipping && <span className="text-xs text-emerald-400 ml-auto">Free Delivery</span>}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-foreground">₹{price.toLocaleString("en-IN")}</span>
            {originalPrice && originalPrice > price && <span className="text-sm text-muted-foreground line-through">₹{originalPrice.toLocaleString("en-IN")}</span>}
          </div>

          {/* Color names as select buttons */}
          <div className="min-h-[44px]">
            {colors.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs text-muted-foreground font-medium">Color</div>
                <div className="flex flex-wrap gap-1.5">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); setSelectedColor(color); }}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
                        selectedColor === color
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 border-border text-foreground hover:border-primary"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sizes */}
          <div className="min-h-[44px]">
            {sizes.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs text-muted-foreground font-medium">Size</div>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.map((size) => (
                    <button key={size} onClick={(e) => { e.stopPropagation(); e.preventDefault(); setSelectedSize(size); }} className={`min-w-[2.2rem] h-7 px-2 rounded-lg text-xs font-semibold transition-all border ${selectedSize === size ? "bg-primary text-white border-primary" : "bg-card border-border hover:border-primary text-foreground"}`}>{size}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full font-semibold" onClick={handleAddToCart} disabled={isAddingToCart || isAddedToCart}>
          {isAddingToCart ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : isAddedToCart ? <><Check className="mr-2 h-4 w-4" /> Added to Cart</> : <><ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart</>}
        </Button>
      </CardFooter>
    </Card>
  );
}
