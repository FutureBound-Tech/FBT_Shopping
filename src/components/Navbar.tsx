'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, User } from 'lucide-react';
import './user.css';

export default function Navbar() {
  const [userName, setUserName] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = useCallback(() => {
    try {
      const cart = JSON.parse(localStorage.getItem('fbt_cart') || '[]');
      const total = cart.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
      setCartCount(total);
    } catch { setCartCount(0); }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('fbt_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.fullName);
      } catch (e) {}
    }

    updateCartCount();
    window.addEventListener('cart-updated', updateCartCount);
    window.addEventListener('storage', updateCartCount);
    return () => {
      window.removeEventListener('cart-updated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, [updateCartCount]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
    <nav className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '1.25rem 0' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="logo-icon" style={{ background: 'var(--color-primary)', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255,51,102,0.3)' }}>
            <ShoppingBag size={20} color="white" />
          </div>
          <span style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.5px' }}>FBT <span style={{color: 'var(--color-primary)'}}>Shop</span></span>
        </Link>
        
        <div className="nav-filters desktop-only" style={{ display: 'flex', gap: '2rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          <Link href="/?category=saree" className="hover-text">Sarees</Link>
          <Link href="/?category=dress" className="hover-text">Dresses</Link>
          <Link href="/?sort=new" className="hover-text">New Arrivals</Link>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {userName && (
            <span className="desktop-only text-xs font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
              Hello, <span style={{color: 'var(--color-primary)'}}>{userName.split(' ')[0]}</span>
            </span>
          )}
          
          <Link href="/profile" className="icon-btn focusable p-2 rounded-xl hover:bg-white/10 transition-colors">
            <User size={22} className="text-muted-foreground hover:text-primary" />
          </Link>
          
          <Link href="/cart" className="icon-btn focusable relative p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ShoppingBag size={22} />
            {cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
          </Link>
          
          <button onClick={() => setIsMobileMenuOpen(true)} className="icon-btn focusable p-2 rounded-xl hover:bg-white/10 transition-colors md:hidden">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>

    {/* Mobile Drawer */}
    {isMobileMenuOpen && (
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md animate-fade-in md:hidden">
        <div className="absolute right-0 top-0 h-full w-[80%] max-w-[320px] bg-background border-l border-white/5 shadow-2xl p-8 flex flex-col slide-in-right">
          <div className="flex items-center justify-between mb-12">
            <span className="text-xl font-black">Menu</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="h-10 w-10 flex items-center justify-center bg-white/5 rounded-xl">✕</button>
          </div>
          
          <div className="space-y-6 flex-1">
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/?category=saree" className="block text-2xl font-black hover:text-primary transition-colors">Sarees</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/?category=dress" className="block text-2xl font-black hover:text-primary transition-colors">Dresses</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/?sort=new" className="block text-2xl font-black transition-colors">New Arrivals</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/profile" className="block text-2xl font-black text-primary transition-colors">My Profile</Link>
          </div>
          
          <div className="pb-8 space-y-4">
            <div className="h-px bg-white/5" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">FBT Shopping © 2026</p>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
