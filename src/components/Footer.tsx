'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Globe, Smartphone, Mail, MapPin, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer-luxury border-t border-white/5 bg-background pt-20 pb-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -bottom-40 -left-60 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary shadow-lg shadow-primary/10 transition-transform hover:rotate-12">
                <ShoppingBag size={20} />
              </div>
              <span className="text-2xl font-black tracking-tighter">FBT <span className="text-primary">Shop</span></span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Crafting an elite shopping experience with AI-powered precision and elite fashion curation for sarees and dresses.
            </p>
            <div className="flex items-center gap-4">
               {[Globe, Smartphone, Mail].map((Icon, idx) => (
                 <a key={idx} href="#" className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all">
                    <Icon size={18} />
                 </a>
               ))}
            </div>
          </div>

          {/* Luxury Collections */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-primary">Collections</h3>
            <ul className="space-y-4">
              {["Exclusive Sarees", "Designer Dresses", "New Arrivals", "Premium Cotton"].map(link => (
                <li key={link}><Link href="/" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">{link}</Link></li>
              ))}
            </ul>
          </div>

          {/* Legal Information */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-secondary">Legal Framework</h3>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:text-secondary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm font-medium text-muted-foreground hover:text-secondary transition-colors">Terms of Service</Link></li>
              <li><Link href="/" className="text-sm font-medium text-muted-foreground hover:text-secondary transition-colors">Shipping Metrics</Link></li>
              <li><Link href="/" className="text-sm font-medium text-muted-foreground hover:text-secondary transition-colors">Returns Central</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-white">Direct Connect</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail size={16} className="text-primary" /> support@fbt.shop
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin size={16} className="text-primary" /> Digital-First, India
              </li>
              <li className="flex items-center gap-3 text-sm font-black text-white group cursor-pointer pt-2">
                <Zap size={18} className="fill-primary text-primary animate-pulse" /> CONTACT ELITE SUPPORT
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
             © 2026 FUTURE BOUND TECHNOLOGY (FBT). ARCHITECTURE BY ANTIGRAVITY.
           </p>
           <div className="flex items-center gap-10">
              <span className="text-[10px] font-bold text-muted-foreground/30 uppercase">Enterprise Protocol 2.4</span>
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                 <span className="text-[10px] font-black uppercase text-emerald-500 tracking-tighter">Systems Live</span>
              </div>
           </div>
        </div>
      </div>
    </footer>
  );
}
