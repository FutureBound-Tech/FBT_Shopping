'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { FileText, Scale, ShoppingBag, Truck, Smartphone, CheckCircle, ChevronRight, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function TermsOfService() {
  const lastUpdated = "March 27, 2026";
  
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-24 pb-20 overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-secondary/5 to-transparent pointer-events-none" />
         <div className="container relative z-10 flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-secondary/10 rounded-3xl flex items-center justify-center text-secondary mb-8 shadow-2xl shadow-secondary/10 hover:scale-110 transition-transform">
               <FileText size={32} />
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-none">
               Terms & <span className="text-secondary">Conditions</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl leading-relaxed">
               The legal framework that governs your elite shopping experience at FBT platform.
            </p>
            <div className="mt-10 px-6 py-2 rounded-full border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground animate-pulse">
               Version 1.2 • Last Updated: {lastUpdated}
            </div>
         </div>
      </div>

      <div className="container max-w-5xl pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
           
           {/* Sidebar Table of Contents */}
           <div className="lg:col-span-1 border-r border-white/5 pr-8 space-y-4 hidden lg:block sticky top-24 h-max">
              {["Agreement", "Verification", "Shopping", "Shipment", "Returns"].map((t, idx) => (
                <div key={idx} className="flex items-center gap-3 group cursor-pointer hover:bg-white/5 p-4 rounded-2xl transition-all">
                   <span className="text-xs font-black text-muted-foreground group-hover:text-secondary transition-colors">0{idx+1}</span>
                   <span className="text-sm font-bold">{t}</span>
                   <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-30 transition-opacity" />
                </div>
              ))}
              <div className="pt-10">
                 <div className="p-6 bg-secondary/5 border border-secondary/20 rounded-[32px] text-center">
                    <Scale size={24} className="mx-auto mb-4 text-secondary" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Questions?</p>
                    <a href="mailto:legal@fbt.shop" className="text-xs font-bold text-secondary underline">legal@fbt.shop</a>
                 </div>
              </div>
           </div>

           {/* Content */}
           <div className="lg:col-span-3 space-y-20 pl-0 lg:pl-10">
              
              <section className="animate-fade-in group">
                 <h2 className="text-3xl font-black mb-8 flex items-center gap-4"><CheckCircle className="text-secondary group-hover:rotate-12 transition-transform h-8 w-8" /> 1. Agreement to Terms</h2>
                 <div className="space-y-6 text-muted-foreground leading-loose text-lg">
                    <p>By accessing and utilizing the FBT Shopping application, you enter into a legally binding agreement to comply with these Terms of Service. If you do not agree with any part of these terms, you are prohibited from using the platform.</p>
                    <p>FBT Shopping reserves the right to modify these terms at any time. Your continued use of the platform after updates constitutes acceptance of the modified Terms.</p>
                 </div>
              </section>

              <section className="animate-fade-in delay-1 group">
                 <h2 className="text-3xl font-black mb-8 flex items-center gap-4"><Smartphone className="text-secondary group-hover:rotate-12 transition-transform h-8 w-8" /> 2. Identity Verification</h2>
                 <Card className="border-white/5 bg-white/[0.02] p-8 md:p-10 rounded-[40px] mb-8">
                    <div className="space-y-6 text-muted-foreground text-sm leading-relaxed">
                       <p>Verification is mandatory for processing transactions and order tracking. FBT Shopping utilizes Firebase One-Time Password (OTP) verification for high-security mobile-first identification. By using our platform, you consent to receiving verification codes via SMS.</p>
                       <p>Users are responsible for maintaining the confidentiality of their mobile number and for all activity that occurs within their verified profile session.</p>
                    </div>
                 </Card>
              </section>

              <section className="animate-fade-in delay-2 group">
                 <h2 className="text-3xl font-black mb-8 flex items-center gap-4"><ShoppingBag className="text-secondary group-hover:rotate-12 transition-transform h-8 w-8" /> 3. Purchases & Pricing</h2>
                 <div className="space-y-6 text-muted-foreground leading-loose text-lg">
                    <p>All pricing (in ₹ INR) for sarees, dresses and luxury goods are current at the time of listing. FBT Shopping reserves the right to correct pricing errors or cancel orders resulting from inaccurate metadata.</p>
                    <ul className="space-y-4 mt-6">
                       <li className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5"><div className="h-6 w-6 bg-secondary/20 rounded-lg flex items-center justify-center text-secondary text-xs font-bold">✓</div> Payment is required upfront unless Cash on Delivery (COD) is specifically enabled.</li>
                       <li className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5"><div className="h-6 w-6 bg-secondary/20 rounded-lg flex items-center justify-center text-secondary text-xs font-bold">✓</div> Digital coupons must be applied at checkout; retroactive credits are not permitted.</li>
                    </ul>
                 </div>
              </section>

              <section className="animate-fade-in delay-3 group">
                 <h2 className="text-3xl font-black mb-8 flex items-center gap-4"><Truck className="text-secondary group-hover:rotate-12 transition-transform h-8 w-8" /> 4. Shipment & Delivery</h2>
                 <div className="space-y-6 text-muted-foreground leading-loose text-lg">
                    <p>We pride ourselves on dispatching your fashion selections with peak precision. Risk of loss and title for items purchased pass to you upon delivery to the carrier.</p>
                 </div>
              </section>

              <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center md:text-left leading-relaxed">
                    By shopping at FBT, you're joining a community built on <br/>trust, precision, and elite fashion standards.
                 </p>
                 <Link href="/privacy">
                    <button className="h-14 px-10 bg-secondary text-secondary-hover font-black rounded-2xl flex items-center gap-3 shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all">
                       Review Privacy Policy <Lock size={18} />
                    </button>
                 </Link>
              </div>

           </div>
        </div>
      </div>
    </main>
  );
}
