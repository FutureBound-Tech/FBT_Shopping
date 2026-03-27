"use client";

import { useState } from "react";
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
  colors?: string[];   // Color NAMES
  sizes?: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  discount?: number;
  freeShipping?: boolean;
}

const COLOR_MAP: Record<string, string> = {
  Red: "#ef4444", Maroon: "#881337", Gold: "#d4a017", Golden: "#d4a017",
  Blue: "#3b82f6", Navy: "#1e3a5f", "Sky Blue": "#7dd3fc", "Royal Blue": "#2563eb",
  Green: "#22c55e", "Dark Green": "#166534", "Bottle Green": "#145a32", Emerald: "#059669",
  Pink: "#ec4899", "Hot Pink": "#db2777", Rose: "#fb7185",
  Purple: "#a855f7", Violet: "#7c3aed", Lavender: "#c4b5fd",
  Orange: "#f97316", Peach: "#fdba74", Coral: "#fb7285",
  Yellow: "#eab308", Mustard: "#ca8a04", Lemon: "#fde047", "Olive Green": "#6b7c2e",
  Olive: "#84cc16", Saffron: "#f97316",
  White: "#f8fafc", "Off White": "#f5f5f4", Cream: "#fef3c7", Ivory: "#fffff0",
  Black: "#1e1e1e", Grey: "#6b7280", Gray: "#6b7280", Silver: "#94a3b8",
  Brown: "#92400e", "Dark Brown": "#4a1f00", Chocolate: "#3d1f00", Beige: "#d6d3d1",
  Teal: "#14b8a6", Wine: "#7f1d1d", Rust: "#c2410c", Magenta: "#d946ef",
  Turquoise: "#06b6d4", Indigo: "#6366f1", Fuchsia: "#d946ef", Burgundy: "#800020",
};

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

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleAddToCart = () => {
    if (isAddedToCart) return;
    setIsAddingToCart(true);
    setTimeout(() => {
      setIsAddingToCart(false);
      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 2000);
    }, 800);
  };

  return (
    <Card className="w-full max-w-sm overflow-hidden group bg-card text-foreground shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl border-border">
      <div className="relative aspect-[3/4] overflow-hidden">
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
                <button key={i} className={`h-1.5 rounded-full transition-all ${i === currentImageIndex ? "bg-primary w-4" : "bg-primary/30 w-1.5"}`} onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i); }} />
              ))}
            </div>
          </>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isNew && <Badge className="bg-blue-500 text-white">New</Badge>}
          {isBestSeller && <Badge className="bg-amber-500 text-white">Best Seller</Badge>}
          {discount > 0 && <Badge className="bg-rose-500 text-white">-{discount}%</Badge>}
        </div>
        <Button variant="secondary" size="icon" className={`absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm ${isWishlisted ? "text-rose-500" : ""}`} onClick={(e) => { e.stopPropagation(); setIsWishlisted(!isWishlisted); }}>
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-rose-500" : ""}`} />
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold line-clamp-2 text-sm leading-tight">{name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span className="ml-1 text-xs font-medium">{rating}</span>
              </div>
              <span className="text-xs text-muted-foreground">({reviewCount})</span>
              {freeShipping && <span className="text-xs text-emerald-400 ml-auto">Free Delivery</span>}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-foreground">₹{price.toLocaleString("en-IN")}</span>
            {originalPrice && originalPrice > price && <span className="text-sm text-muted-foreground line-through">₹{originalPrice.toLocaleString("en-IN")}</span>}
          </div>
          {colors.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs text-muted-foreground font-medium">Color: <span className="text-foreground font-semibold">{selectedColor}</span></div>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button key={color} title={color} className={`w-6 h-6 rounded-full transition-all border-2 ${selectedColor === color ? "border-primary scale-110 shadow-md" : "border-transparent hover:border-muted-foreground"}`} style={{ backgroundColor: COLOR_MAP[color] || COLOR_MAP[color.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")] || "#888" }} onClick={() => setSelectedColor(color)} />
                ))}
              </div>
            </div>
          )}
          {sizes.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs text-muted-foreground font-medium">Size: <span className="text-foreground font-semibold">{selectedSize || "Select"}</span></div>
              <div className="flex flex-wrap gap-1.5">
                {sizes.map((size) => (
                  <button key={size} className={`min-w-[2.2rem] h-8 px-2 rounded-lg text-xs font-semibold transition-all border ${selectedSize === size ? "bg-primary text-white border-primary" : "bg-card border-border hover:border-primary text-foreground"}`} onClick={() => setSelectedSize(size)}>{size}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full font-semibold" onClick={handleAddToCart} disabled={isAddingToCart || isAddedToCart}>{isAddingToCart ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : isAddedToCart ? <><Check className="mr-2 h-4 w-4" /> Added to Cart</> : <><ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart</>}</Button>
      </CardFooter>
    </Card>
  );
}
