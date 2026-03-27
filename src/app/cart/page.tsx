'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { 
  ArrowLeft, Trash2, ArrowRight, CheckCircle, MapPin, 
  Package, ShoppingBag, ShieldCheck, Smartphone, 
  Loader2, ChevronRight, History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

type CartItem = {
  cartId: string;
  _id: string;
  title: string;
  price: number;
  media: { url: string; type: string }[];
  selectedColor: string;
  selectedSize: string;
  quantity: number;
};

type ShippingAddress = {
  fullName: string;
  mobileNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
};

type Step = 'cart' | 'verify' | 'address' | 'success';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [step, setStep] = useState<Step>('cart');
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: '',
    mobileNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const loadInitialData = useCallback(() => {
    const cart = JSON.parse(localStorage.getItem('fbt_cart') || '[]');
    setCartItems(cart);

    const storedUser = localStorage.getItem('fbt_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAddress(prev => ({
          ...prev,
          fullName: user.fullName || '',
          mobileNumber: user.mobileNumber || ''
        }));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const syncCart = (updated: CartItem[]) => {
    setCartItems(updated);
    localStorage.setItem('fbt_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    const updated = cartItems.map(item => {
      if (item.cartId === cartId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    syncCart(updated);
  };

  const removeItem = (cartId: string) => {
    syncCart(cartItems.filter(item => item.cartId !== cartId));
  };

  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const isAddressValid = () => {
    return address.fullName && address.mobileNumber && address.addressLine1 && address.city && address.state && address.pincode;
  };

  const checkVerificationAndProceed = async () => {
    const storedUser = localStorage.getItem('fbt_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.verified) {
          setStep('address');
          return;
        }
      } catch (e) {}
    }
    
    // Trigger OTP flow
    setVerifying(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: address.mobileNumber, action: 'send' })
      });
      const data = await res.json();
      if (data.success) {
        if (data.isWhitelistError || data.fallback) {
          setError(data.message); // Will show on the verify step
        }
        setStep('verify');
      } else {
        setError(data.error || 'Failed to send verification code. Please try again.');
      }
    } catch (e) {
      setError('Connection failed. Please check your internet.');
    } finally {
      setVerifying(false);
    }
  };

  const handleOtpVerify = async () => {
    setVerifying(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: address.mobileNumber, otp, action: 'verify' })
      });
      const data = await res.json();
      if (data.success) {
        // Update user state to verified
        const storedUser = JSON.parse(localStorage.getItem('fbt_user') || '{}');
        localStorage.setItem('fbt_user', JSON.stringify({ ...storedUser, verified: true }));
        setStep('address');
      } else {
        setError('Incorrect OTP. Try again.');
      }
    } catch (e) {
      setError('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const placeOrder = async () => {
    if (!isAddressValid()) return;
    setPlacing(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: address.fullName,
          customerMobile: address.mobileNumber,
          items: cartItems.map(item => ({
            product: item._id,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            selectedColor: item.selectedColor,
            selectedSize: item.selectedSize,
          })),
          totalAmount: total,
          shippingAddress: address,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      setOrderId(data.order._id);
      localStorage.removeItem('fbt_cart');
      window.dispatchEvent(new Event('cart-updated'));
      setCartItems([]);
      setStep('success');
    } catch (err: any) {
      alert(err.message || 'Something went wrong');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        
        {/* Breadcrumb / Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Continue Shopping
        </Link>

        {/* Dynamic Stepper */}
        <div className="flex items-center justify-between max-w-xl mx-auto mb-12 relative px-4">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 -z-1" />
          {[
            { id: 'cart', label: 'Cart', icon: ShoppingBag },
            { id: 'verify', label: 'Verify', icon: ShieldCheck },
            { id: 'address', label: 'Ship', icon: MapPin },
            { id: 'success', label: 'Done', icon: CheckCircle }
          ].map((s, idx) => {
            const isActive = step === s.id;
            const isDone = ['success', 'address', 'verify', 'cart'].indexOf(step) > idx;
            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${isActive ? 'bg-primary border-primary scale-125 shadow-lg shadow-primary/30 text-white' : isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-background border-white/10 text-muted-foreground'}`}>
                   {isDone ? <CheckCircle size={20} /> : <s.icon size={18} />}
                </div>
                <span className={`text-[10px] uppercase font-black tracking-widest mt-3 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* STEP 1: CART VIEW */}
        {step === 'cart' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
               <h1 className="text-3xl font-black mb-6">Your Shopping Bag</h1>
               {cartItems.length === 0 ? (
                 <div className="py-20 flex flex-col items-center justify-center bg-white/5 rounded-[32px] border border-dashed border-white/10">
                   <Package size={64} className="text-muted-foreground/30 mb-4" />
                   <p className="text-xl font-bold text-muted-foreground">Your bag is lonely...</p>
                   <Link href="/" className="mt-8"><Button className="rounded-2xl px-10 h-12 shadow-xl shadow-primary/20">Find Something Beautiful</Button></Link>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {cartItems.map((item) => (
                     <Card key={item.cartId} className="border-white/5 bg-white/[0.02] p-4 md:p-6 rounded-[24px] overflow-hidden group">
                       <div className="flex items-center gap-6">
                         <div className="h-24 w-20 md:h-32 md:w-24 bg-muted rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                            <img src={item.media?.[0]?.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <h3 className="font-bold text-lg md:text-xl truncate">{item.title}</h3>
                           <div className="flex gap-2 mt-2 flex-wrap">
                             <Badge variant="outline" className="text-[10px] uppercase font-black border-white/10 text-muted-foreground">{item.selectedColor}</Badge>
                             <Badge variant="outline" className="text-[10px] uppercase font-black border-white/10 text-primary">{item.selectedSize}</Badge>
                           </div>
                           <div className="mt-4 flex items-center justify-between gap-4">
                             <div className="text-xl font-mono font-black">₹{item.price.toLocaleString('en-IN')}</div>
                             <div className="flex items-center bg-white/5 rounded-xl border border-white/5 p-1">
                               <button onClick={() => updateQuantity(item.cartId, -1)} className="h-8 w-8 flex items-center justify-center hover:bg-white/10 rounded-lg disabled:opacity-30" disabled={item.quantity <= 1}>-</button>
                               <span className="w-10 text-center font-bold">{item.quantity}</span>
                               <button onClick={() => updateQuantity(item.cartId, 1)} className="h-8 w-8 flex items-center justify-center hover:bg-white/10 rounded-lg">+</button>
                             </div>
                           </div>
                         </div>
                         <button onClick={() => removeItem(item.cartId)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-rose-500 hover:bg-rose-500/10 transition-all self-start">
                           <Trash2 size={18} />
                         </button>
                       </div>
                     </Card>
                   ))}
                 </div>
               )}
            </div>

            {/* Sticky Summary */}
            <div className="lg:col-span-1">
               <Card className="border-white/10 bg-white/5 backdrop-blur-xl p-8 rounded-[32px] sticky top-24 shadow-2xl">
                 <h3 className="text-xl font-black mb-6 flex items-center justify-between">Summary <History className="h-5 w-5 text-muted-foreground" /></h3>
                 <div className="space-y-4 mb-8">
                   <div className="flex justify-between text-muted-foreground font-medium"><span>Bag Total</span> <span className="font-mono">₹{total.toLocaleString('en-IN')}</span></div>
                   <div className="flex justify-between text-muted-foreground font-medium"><span>Shipping</span> <span className="text-emerald-400 font-bold uppercase text-xs">FREE</span></div>
                   <div className="h-px bg-white/5 my-4" />
                   <div className="flex justify-between text-2xl font-black"><span>Total</span> <span>₹{total.toLocaleString('en-IN')}</span></div>
                 </div>
                 <Button 
                   onClick={checkVerificationAndProceed} 
                   className="w-full h-14 rounded-2xl text-lg font-black shadow-lg shadow-primary/30 group"
                   disabled={cartItems.length === 0 || verifying}
                 >
                   {verifying ? <Loader2 className="animate-spin" /> : <>Complete Selection <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" /></>}
                 </Button>
                 <p className="text-[10px] text-center text-muted-foreground mt-4 font-bold uppercase tracking-widest">Secure Checkout via FBT Platform</p>
               </Card>
            </div>
          </div>
        )}

        {/* STEP 2: OT VERIFICATION (If needed) */}
        {step === 'verify' && (
          <div className="max-w-md mx-auto py-10">
             <Card className="border-white/10 bg-white/5 backdrop-blur-xl p-10 rounded-[32px] text-center">
                <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                  <Smartphone size={32} />
                </div>
                <h2 className="text-3xl font-black mb-2">Check Your Mobile</h2>
                <p className="text-muted-foreground text-sm mb-10 leading-relaxed">
                  We've sent a code to <span className="text-foreground font-bold font-mono">+91 {address.mobileNumber}</span> to secure your identity.
                </p>
                
                <div className="space-y-6">
                  <input 
                    type="text" 
                    maxLength={6} 
                    className="w-full h-20 text-center text-4xl font-black font-mono bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-primary/20 outline-none transition-all tracking-[0.2em]" 
                    placeholder="000000"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                  {error && <p className="text-rose-400 text-xs font-bold uppercase">{error}</p>}
                  <Button onClick={handleOtpVerify} className="w-full h-14 rounded-2xl text-lg font-black" disabled={otp.length < 6 || verifying}>
                    {verifying ? <Loader2 size={24} className="animate-spin" /> : 'Confirm Digit Code'}
                  </Button>
                  <button onClick={() => setStep('cart')} className="text-xs font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">Start Over</button>
                </div>
             </Card>
          </div>
        )}

        {/* STEP 3: SHIPPING ADDRESS */}
        {step === 'address' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
               <Card className="border-white/5 bg-white/5 rounded-[32px] p-8 md:p-10">
                 <h2 className="text-3xl font-black mb-8 flex items-center gap-4">Where to send? <MapPin className="text-primary h-8 w-8" /></h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Full Name</label>
                      <input className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none" value={address.fullName} onChange={e => handleAddressChange('fullName', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Secure Contact</label>
                      <input className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-2xl opacity-60 flex items-center font-bold" disabled value={address.mobileNumber} />
                    </div>
                    <div className="col-span-full space-y-2">
                      <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Address Line 1</label>
                      <input className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none" value={address.addressLine1} onChange={e => handleAddressChange('addressLine1', e.target.value)} placeholder="House/Flat/Building" />
                    </div>
                    <div className="col-span-full space-y-2">
                      <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Address Line 2 (Optional)</label>
                      <input className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none" value={address.addressLine2} onChange={e => handleAddressChange('addressLine2', e.target.value)} placeholder="Landmark/Locality" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">City</label>
                      <input className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none" value={address.city} onChange={e => handleAddressChange('city', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">State</label>
                      <input className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none" value={address.state} onChange={e => handleAddressChange('state', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Pincode</label>
                      <input maxLength={6} className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-mono" value={address.pincode} onChange={e => handleAddressChange('pincode', e.target.value)} />
                    </div>
                 </div>
               </Card>
            </div>

            <div className="lg:col-span-1">
               <Card className="border-white/10 bg-white/5 backdrop-blur-xl p-8 rounded-[32px] sticky top-24">
                  <h3 className="text-xl font-black mb-6">Final Review</h3>
                  <div className="space-y-3 mb-8">
                     {cartItems.map(item => (
                       <div key={item.cartId} className="flex justify-between text-sm">
                         <span className="text-muted-foreground truncate max-w-[150px]">{item.title}</span>
                         <span className="font-mono font-bold">₹{item.price.toLocaleString('en-IN')}</span>
                       </div>
                     ))}
                     <div className="h-px bg-white/5 my-4" />
                     <div className="flex justify-between text-2xl font-black uppercase"><span>Grand Total</span> <span>₹{total.toLocaleString('en-IN')}</span></div>
                  </div>
                  <Button 
                    onClick={placeOrder} 
                    className="w-full h-14 rounded-2xl text-lg font-bold bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                    disabled={!isAddressValid() || placing}
                  >
                    {placing ? <Loader2 className="animate-spin" /> : 'Confirm Order Now'}
                  </Button>
                  <button onClick={() => setStep('cart')} className="w-full text-xs font-black text-muted-foreground uppercase tracking-widest mt-6 hover:text-primary transition-colors">Adjust Selection</button>
               </Card>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'success' && (
           <div className="max-w-2xl mx-auto py-20 text-center space-y-8 animate-fade-in">
              <div className="h-24 w-24 bg-emerald-500/10 rounded-[40px] flex items-center justify-center text-emerald-500 mx-auto shadow-[0_0_100px_rgba(16,185,129,0.3)] animate-bounce">
                <CheckCircle size={64} />
              </div>
              <h1 className="text-5xl font-black tracking-tighter">Fashion Incoming!</h1>
              <p className="text-muted-foreground text-xl max-w-md mx-auto leading-relaxed">
                Your order <span className="text-foreground font-black font-mono">#{orderId.slice(-8).toUpperCase()}</span> is confirmed and being prepared for dispatch.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
                <Link href="/profile"><Button className="w-full md:w-auto px-10 h-14 rounded-2xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10">Track Orders</Button></Link>
                <Link href="/"><Button className="w-full md:w-auto px-10 h-14 rounded-2xl shadow-xl shadow-primary/30 font-black">Back to Gallery</Button></Link>
              </div>
           </div>
        )}
      </div>
    </main>
  );
}
