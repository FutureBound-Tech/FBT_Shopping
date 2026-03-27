"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, ShoppingCart, Eye, Check, Minus, Plus,
  Truck, Shield, RotateCcw, ChevronLeft, ChevronRight,
  Heart, Star,
} from "lucide-react";

// Color name → hex map
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

function getColorHex(name: string): string {
  if (COLOR_MAP[name]) return COLOR_MAP[name];
  // Try title-cased version
  const titled = name.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  return COLOR_MAP[titled] || "#888888";
}

interface MappedProduct {
  _id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  media: { url: string; type: "image" | "video" }[];
  colors: string[];
  sizes: string[];
  fabric: string;
  highlights: string[];
  views: number;
}

interface Props {
  product: MappedProduct;
  onAddToCart: (options: { color: string; size: string; quantity: number }) => void;
}

export function ProductDetailPage({ product, onAddToCart }: Props) {
  const [activeMedia, setActiveMedia] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "");
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const hasColors = product.colors.length > 0;
  const hasSizes = product.sizes.length > 0;

  const handleAddToCart = () => {
    onAddToCart({ color: selectedColor, size: selectedSize, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const nextMedia = () => setActiveMedia((p) => (p + 1) % product.media.length);
  const prevMedia = () => setActiveMedia((p) => (p - 1 + product.media.length) % product.media.length);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* ── LEFT: Media Gallery ── */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-card border border-border group">
            <AnimatePresence mode="wait">
              <motion.div key={activeMedia} className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                {product.media[activeMedia]?.type === "image" ? (
                  <img src={product.media[activeMedia].url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <video src={product.media[activeMedia]?.url} className="w-full h-full object-cover" autoPlay loop muted controls />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Views badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
              <Eye className="h-3 w-3" /> {product.views}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => setWishlisted(!wishlisted)}
              className={`absolute top-3 right-3 h-9 w-9 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all ${wishlisted ? "text-rose-400" : "text-white"}`}
            >
              <Heart className={`h-4 w-4 ${wishlisted ? "fill-rose-400" : ""}`} />
            </button>

            {/* Left/right arrows */}
            {product.media.length > 1 && (
              <>
                <button onClick={prevMedia} className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={nextMedia} className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {product.media.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.media.map((m, i) => (
                <button key={i} onClick={() => setActiveMedia(i)}
                  className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeMedia === i ? "border-primary opacity-100" : "border-transparent opacity-50 hover:opacity-75"}`}>
                  {m.type === "image" ? (
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <video src={m.url} className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Product Details ── */}
        <div className="flex flex-col gap-1">
          {/* Category + badges */}
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-primary border-primary/30 uppercase tracking-wider text-[10px] font-bold">
              Premium {product.category}
            </Badge>
          </div>

          <h1 className="text-3xl font-extrabold leading-tight text-foreground">{product.name}</h1>

          {/* Rating row (decorative) */}
          <div className="flex items-center gap-2 py-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`h-4 w-4 ${s <= 4 ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
            ))}
            <span className="text-sm text-muted-foreground ml-1">Premium Quality</span>
          </div>

          {/* Price */}
          <div className="py-2 flex items-baseline gap-3 border-b border-border">
            <span className="text-4xl font-black text-foreground">
              ₹{product.price > 0 ? product.price.toLocaleString("en-IN") : "—"}
            </span>
            {product.fabric && (
              <span className="text-sm px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                {product.fabric}
              </span>
            )}
          </div>

          {/* Highlights */}
          {product.highlights.length > 0 && (
            <ul className="space-y-1.5 pt-3 pb-2">
              {product.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  {h}
                </li>
              ))}
            </ul>
          )}

          {/* ══ COLOR SELECTOR ══ */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Color</span>
              {selectedColor && <span className="text-sm font-bold text-foreground">{selectedColor}</span>}
            </div>
            {hasColors ? (
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button key={color} title={color} onClick={() => setSelectedColor(color)}
                    className={`relative w-8 h-8 rounded-full transition-all duration-200 ${selectedColor === color ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : "ring-1 ring-border hover:scale-105"}`}
                    style={{ backgroundColor: getColorHex(color) }}>
                    {selectedColor === color && (
                      <Check className="absolute inset-0 m-auto h-3 w-3 text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Color info not available for this product</p>
            )}
          </div>

          {/* ══ SIZE SELECTOR ══ */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Size</span>
              {selectedSize && <span className="text-sm font-bold text-foreground">{selectedSize}</span>}
            </div>
            {hasSizes ? (
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    className={`min-w-[3rem] h-10 px-3 rounded-xl text-sm font-bold transition-all border-2 ${selectedSize === size ? "bg-primary text-white border-primary shadow-lg shadow-primary/30" : "border-border bg-card text-foreground hover:border-primary/60"}`}>
                    {size}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">One size / Free size</p>
            )}
          </div>

          {/* ══ QUANTITY ══ */}
          <div className="border-t border-border pt-4 space-y-2">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quantity</span>
            <div className="inline-flex items-center border border-border rounded-xl overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}
                className="w-11 h-11 flex items-center justify-center hover:bg-card transition-colors disabled:opacity-30">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-bold text-lg">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}
                className="w-11 h-11 flex items-center justify-center hover:bg-card transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ══ ADD TO CART ══ */}
          <div className="pt-3 space-y-3">
            <Button
              onClick={handleAddToCart}
              className={`w-full h-14 text-lg font-bold rounded-2xl transition-all ${added ? "bg-emerald-500 hover:bg-emerald-500 shadow-lg shadow-emerald-500/30" : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"}`}
            >
              {added ? (
                <><Check className="mr-2 h-5 w-5" /> Added to Cart!</>
              ) : (
                <><ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart — ₹{(product.price * quantity).toLocaleString("en-IN")}</>
              )}
            </Button>

            {/* Trust badges */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-blue-400" /> Free Delivery</div>
              <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-400" /> Secure Payment</div>
              <div className="flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5 text-amber-400" /> Easy Returns</div>
            </div>
          </div>

          {/* ══ PRODUCT DESCRIPTION ══ */}
          <div className="border-t border-border pt-4 mt-2">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Product Details</span>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
