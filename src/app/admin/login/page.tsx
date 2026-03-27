'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, Loader2, ArrowRight, Smartphone, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [attemptId, setAttemptId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        setAttemptId(data.attemptId);
        setStep('otp');
      } else {
        setError(data.error || 'Identity Verification Failed');
      }
    } catch (err) {
      setError('Connection Protocol Error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, otp }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = '/admin'; // Force full reload for cookie
      } else {
        setError(data.error || 'Security Code Mismatch');
      }
    } catch (err) {
      setError('Internal Synchronization Failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      {/* High-End Tech Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[160px] opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <div className="w-full max-w-[440px] relative z-10 animate-fade-in">
        
        {/* Brand/Security Header */}
        <div className="text-center mb-10">
          <div className="h-20 w-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mx-auto mb-6 shadow-[0_0_50px_rgba(99,102,241,0.2)] ring-1 ring-primary/30 rotate-12 transition-transform hover:rotate-0">
             <ShieldCheck size={40} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">Warehouse <span className="text-primary">Perimeter</span></h1>
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground/60">Administrator Identity Terminal 2.4</p>
        </div>

        <Card className="glass-panel border-white/5 bg-white/[0.02] p-8 md:p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
          
          <div className="absolute top-0 right-0 p-4 opacity-20">
             <div className="h-1.5 w-1.5 bg-primary rounded-full animate-ping" />
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black flex items-center gap-3 animate-shake">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {step === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Terminal ID</label>
                <div className="relative group/input">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                  <input 
                    required
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full h-16 pl-14 pr-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-bold placeholder:text-muted-foreground/30" 
                    placeholder="Enter Username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Master Key</label>
                <div className="relative group/input">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                  <input 
                    required
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-16 pl-14 pr-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-bold placeholder:text-muted-foreground/30" 
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] mt-4"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Initiate Authentication <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-8 text-center animate-fade-in">
              <div className="mx-auto h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 ring-1 ring-primary/20">
                 <Smartphone size={32} />
              </div>
              <div className="space-y-2">
                 <h2 className="text-xl font-black">2-Factor Handshake</h2>
                 <p className="text-xs text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
                   Synchronizing encrypted code with <span className="text-primary font-bold">@OFFICIAL_ADMIN</span> email channel.
                 </p>
              </div>

              <input 
                required
                type="text" 
                maxLength={6} 
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full h-24 text-center text-5xl font-black tracking-[0.2em] font-mono bg-white/5 border-2 border-primary/20 rounded-[32px] outline-none focus:border-primary transition-all shadow-inner focus:ring-8 focus:ring-primary/5" 
                placeholder="000000"
              />

              <div className="grid grid-cols-2 gap-4">
                 <button type="button" onClick={() => setStep('login')} className="h-14 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors">Abort</button>
                 <Button type="submit" disabled={loading || otp.length < 6} className="h-14 bg-primary rounded-2xl font-black shadow-lg shadow-primary/30">
                    {loading ? <Loader2 className="animate-spin" /> : "Authorize"}
                 </Button>
              </div>

              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest pt-4">Encryption Level: AES-256 Symmetric</p>
            </form>
          )}
        </Card>

        {/* Security Disclaimers */}
        <div className="mt-12 flex items-center justify-center gap-10 opacity-40">
           <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-tighter">System Protected</span>
           </div>
           <span className="text-[10px] font-black uppercase tracking-tighter">RSA-Verified Nodes</span>
        </div>
      </div>
    </main>
  );
}
