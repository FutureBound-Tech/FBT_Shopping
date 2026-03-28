"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, ShoppingCart, Eye, Check, Minus, Plus,
  Truck, Shield, RotateCcw, ChevronLeft, ChevronRight,
  Heart, Star, ArrowRight,
} from "lucide-react";

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
  pageContent: string;
  tags: string[];
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
  const [isInCart, setIsInCart] = useState(false);

  const hasColors = product.colors.length > 0;
  const hasSizes = product.sizes.length > 0;

  // Check if product is in cart
  const checkCartStatus = () => {
    const cart = JSON.parse(localStorage.getItem('fbt_cart') || '[]');
    const inCart = cart.some((item: any) => item._id === product._id);
    setIsInCart(inCart);
  };

  useEffect(() => {
    checkCartStatus();
    // Listen for cart updates from other pages
    const handleCartUpdate = () => checkCartStatus();
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, [product._id]);

  const handleAddToCart = () => {
    onAddToCart({ color: selectedColor, size: selectedSize, quantity });
    setAdded(true);
    setIsInCart(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const nextMedia = () => setActiveMedia((p) => (p + 1) % product.media.length);
  const prevMedia = () => setActiveMedia((p) => (p - 1 + product.media.length) % product.media.length);

  const touchStartX = useRef(0);
  const handleSwipeStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleSwipeEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff < 0) nextMedia();
      else prevMedia();
    }
  };

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
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-card border border-border group" onTouchStart={handleSwipeStart} onTouchEnd={handleSwipeEnd}>
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
            </div>
            {hasColors ? (
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button key={color} onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                      selectedColor === color
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 border-border text-foreground hover:border-primary"
                    }`}>
                    {selectedColor === color && <Check className="inline h-3.5 w-3.5 mr-1" />}
                    {color}
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

          {/* ══ ACTION BUTTONS ══ */}
          <div className="pt-3 space-y-3">
            {isInCart ? (
              /* ── Already in cart: Show Go to Cart ── */
              <Link href="/cart" className="block">
                <Button className="w-full h-14 text-lg font-bold rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all">
                  <ShoppingCart className="mr-2 h-5 w-5" /> Go to Cart <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              /* ── Not in cart: Show Add to Cart + Buy Now ── */
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  className={`flex-1 h-14 text-base font-bold rounded-2xl transition-all ${added ? "bg-emerald-500 hover:bg-emerald-500 shadow-lg shadow-emerald-500/30" : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"}`}
                >
                  {added ? (
                    <><Check className="mr-2 h-5 w-5" /> Added!</>
                  ) : (
                    <><ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart</>
                  )}
                </Button>
                <Link href="/cart">
                  <Button
                    onClick={() => {
                      if (!added) {
                        handleAddToCart();
                      }
                    }}
                    variant="outline"
                    className="h-14 px-6 text-base font-bold rounded-2xl border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary transition-all"
                  >
                    <ArrowRight className="mr-2 h-5 w-5" /> Buy Now
                  </Button>
                </Link>
              </div>
            )}

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

          {/* ══ DETAILED PAGE CONTENT ══ */}
          {product.pageContent && (
            <div className="border-t border-border pt-4 mt-2">
              <div className="text-sm text-muted-foreground leading-relaxed">
                {product.pageContent.split('***').map((section, i) => (
                  <div key={i} className="mb-4 whitespace-pre-line">
                    {section.trim().split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <span key={j} className="font-semibold text-foreground">{part.slice(2, -2)}</span>;
                      }
                      return part;
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ AI TAGS ══ */}
          {product.tags && product.tags.length > 0 && (
            <div className="border-t border-border pt-4 mt-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground block mb-2">AI Tags</span>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
