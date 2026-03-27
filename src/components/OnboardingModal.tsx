'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, User, Phone, CheckCircle2, Loader2 } from 'lucide-react';

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already onboarded
    const user = localStorage.getItem('fbt_user');
    if (!user) {
      setTimeout(() => setIsOpen(true), 1500);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !mobileNumber) return;
    if (mobileNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      // For first visit, we do NOT require OTP. Just register the user.
      const userObj = { fullName, mobileNumber, verified: false };
      
      // Save local for instant UI access
      localStorage.setItem('fbt_user', JSON.stringify(userObj));
      localStorage.setItem('fbt_customer_mobile', mobileNumber);

      // Register in background DB
      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userObj)
      }).catch(err => console.error(err));
      
      setIsOpen(false);
      window.location.reload(); 
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="modal-content glass-panel animate-fade-in relative overflow-hidden p-8 md:p-10 w-[90%] max-w-[420px] rounded-[32px] border border-white/10 shadow-2xl">
        
        {/* Background Decorative Blurs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/30 rounded-full blur-[60px]" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/20 rounded-full blur-[60px]" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-6 p-4 rounded-3xl bg-white/5 border border-white/10 text-primary shadow-inner">
            <Sparkles size={36} className="animate-pulse" />
          </div>
          
          <h2 className="text-3xl font-black text-center mb-2 tracking-tight">
            Welcome to FBT
          </h2>
          <p className="text-center text-muted-foreground mb-8 text-sm leading-relaxed max-w-[280px]">
            Join the community for exclusive luxury collections and a premium shopping experience.
          </p>
          
          {error && (
            <div className="w-full p-3 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={14} className="rotate-180" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative group">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                required
                type="text" 
                className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium" 
                placeholder="Full Name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>
            <div className="relative group">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <div className="absolute left-12 top-1/2 -translate-y-1/2 text-muted-foreground font-bold border-r border-white/10 pr-2">+91</div>
              <input 
                required
                type="tel" 
                maxLength={10}
                className="w-full h-14 pl-24 pr-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-mono font-bold tracking-widest" 
                placeholder="9876543210"
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <button 
              type="submit" 
              className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-black rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : <>Start Shopping <ArrowRight size={20} /></>}
            </button>
            <p className="text-[10px] text-center text-muted-foreground pt-2">
              By joining, you agree to our terms of premium service. 
              <br/>Mobile verification is required only on your first purchase.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
