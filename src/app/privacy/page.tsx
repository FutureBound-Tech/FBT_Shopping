'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { Shield, Lock, Eye, Mail, FileText, ChevronRight, Scale } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function PrivacyPolicy() {
  const lastUpdated = "March 27, 2026";
  
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-20 pb-16 overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
         <div className="container relative z-10 flex flex-col items-center text-center">
            <div className="h-20 w-20 bg-primary/20 rounded-[32px] flex items-center justify-center text-primary mb-8 shadow-2xl shadow-primary/20 animate-bounce">
               <Shield size={40} />
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
               Privacy <span className="text-primary">Policy</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl leading-relaxed">
               Your trust is our most valuable asset. At FBT Shopping, we handle your data with the same care and precision as our finest textiles.
            </p>
            <div className="mt-8 flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/50 border-y border-white/5 py-3 px-10">
               Last Updated: {lastUpdated}
            </div>
         </div>
      </div>

      <div className="container max-w-4xl pb-32">
        <div className="space-y-12">
          
          <section className="animate-fade-in group">
            <div className="flex items-center gap-4 mb-6">
               <div className="h-10 w-10 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/10 group-hover:scale-110 transition-transform">
                  <Lock size={20} />
               </div>
               <h2 className="text-3xl font-black">Information We Collect</h2>
            </div>
            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-md rounded-[32px] overflow-hidden p-8 md:p-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <h3 className="font-bold flex items-center gap-2"><div className="h-2 w-2 bg-primary rounded-full" /> Identity Data</h3>
                     <p className="text-muted-foreground text-sm leading-relaxed">Name, mobile number, and shipping address are collected purely to fulfill your luxury orders and maintain your personalized profile.</p>
                  </div>
                  <div className="space-y-4">
                     <h3 className="font-bold flex items-center gap-2"><div className="h-2 w-2 bg-secondary rounded-full" /> Usage Data</h3>
                     <p className="text-muted-foreground text-sm leading-relaxed">We utilize anonymous telemetric data to improve your browsing experience and technical performance across the FBT platform.</p>
                  </div>
               </div>
            </Card>
          </section>

          <section className="animate-fade-in delay-1 group">
            <div className="flex items-center gap-4 mb-6">
               <div className="h-10 w-10 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/10 group-hover:scale-110 transition-transform">
                  <Eye size={20} />
               </div>
               <h2 className="text-3xl font-black">Data Usage & Purpose</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                  { title: "Verification", desc: "Using Firebase OTP to confirm your identity during purchases and profile access." },
                  { title: "Personalization", desc: "Curating your dashboard feed with sarees and dresses that match your style preferences." },
                  { title: "Updates", desc: "Sending order tracking information and exclusive early-access collection drops." }
               ].map((item, i) => (
                 <Card key={i} className="border-white/5 bg-white/[0.02] p-6 rounded-3xl hover:border-primary/20 transition-all">
                    <h3 className="font-black text-sm uppercase tracking-widest text-primary mb-3">0{i+1}. {item.title}</h3>
                    <p className="text-xs leading-loose text-muted-foreground">{item.desc}</p>
                 </Card>
               ))}
            </div>
          </section>

          <section className="animate-fade-in delay-2 group">
             <Card className="bg-primary/10 border-primary/20 rounded-[40px] p-10 md:p-14 text-center">
                <Scale size={48} className="mx-auto mb-6 text-primary" />
                <h2 className="text-3xl font-black mb-6">Commitment to Security</h2>
                <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
                   We employ industry-standard encryption and security protocols provided by Google Cloud and Firebase. Your data is never sold, shared with third-party advertisers, or used for purposes other than the operation of FBT Shopping.
                </p>
                <div className="h-px bg-primary/20 w-1/2 mx-auto mb-8" />
                <div className="flex items-center justify-center gap-8 flex-wrap">
                   <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-primary">100%</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Secure Payments</span>
                   </div>
                   <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-secondary">No-Sale</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data Guarantee</span>
                   </div>
                   <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-white">GDPR</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Compliant Flow</span>
                   </div>
                </div>
             </Card>
          </section>

          <section className="animate-fade-in delay-3 group">
            <div className="flex items-center gap-4 mb-6">
               <div className="h-10 w-10 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/10 group-hover:scale-110 transition-transform">
                  <Mail size={20} />
               </div>
               <h2 className="text-3xl font-black">Inquiries & Contact</h2>
            </div>
            <Card className="border-white/5 bg-white/5 p-8 rounded-[32px] flex flex-col md:flex-row justify-between items-center gap-6">
               <p className="text-muted-foreground font-medium text-center md:text-left">Have questions about your data or wish to request deletion?</p>
               <a href="mailto:futurebound.tech@gmail.com" className="px-10 h-14 bg-white text-black font-black rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all">
                  futurebound.tech@gmail.com <ChevronRight size={18} />
               </a>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
