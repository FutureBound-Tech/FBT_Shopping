'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { 
  ArrowLeft, Trash2, CheckCircle, MapPin, 
  Package, ShoppingBag, ShieldCheck, 
  Loader2, ChevronRight, History, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

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
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
};

type Step = 'cart' | 'address' | 'otp' | 'success';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [step, setStep] = useState<Step>('cart');
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');

  // OTP state
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: '',
    mobileNumber: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

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
    return address.fullName && address.email && address.email.includes('@') && address.mobileNumber && address.addressLine1 && address.city && address.state && address.pincode;
  };

  // ─── Send OTP ──────────────────────────────────────────────
  const sendOtp = async () => {
    if (!isAddressValid()) return;
    setSendingOtp(true);
    setError('');
    setOtpError('');
    setOtpDigits(['', '', '', '', '', '']);

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: address.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setStep('otp');
      setResendCooldown(60);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 300);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email');
    } finally {
      setSendingOtp(false);
    }
  };

  // ─── OTP Input Handler ─────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    setOtpError('');

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (value && index === 5) {
      const fullOtp = newDigits.join('');
      if (fullOtp.length === 6) {
        verifyAndPlaceOrder(fullOtp);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(''));
      otpInputRefs.current[5]?.focus();
      verifyAndPlaceOrder(pasted);
    }
  };

  // ─── Verify OTP + Place Order ──────────────────────────────
  const verifyAndPlaceOrder = async (otpCode?: string) => {
    const fullOtp = otpCode || otpDigits.join('');
    if (fullOtp.length !== 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }

    setVerifyingOtp(true);
    setOtpError('');

    try {
      // Step 1: Verify OTP
      const verifyRes = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: address.email, otp: fullOtp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || 'Invalid OTP');

      // Step 2: OTP verified — place order
      setPlacing(true);
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: address.fullName,
          customerMobile: address.mobileNumber,
          customerEmail: address.email,
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

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to place order');

      setOrderId(orderData.order._id);
      localStorage.removeItem('fbt_cart');
      window.dispatchEvent(new Event('cart-updated'));
      setCartItems([]);
      setStep('success');
    } catch (err: any) {
      setOtpError(err.message || 'Verification failed');
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setVerifyingOtp(false);
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

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Dynamic Stepper */}
        <div className="flex items-center justify-between max-w-xl mx-auto mb-12 relative px-4">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 -z-1" />
          {[
            { id: 'cart', label: 'Cart', icon: ShoppingBag },
            { id: 'address', label: 'Ship', icon: MapPin },
            { id: 'otp', label: 'Verify', icon: ShieldCheck },
            { id: 'success', label: 'Done', icon: CheckCircle }
          ].map((s, idx) => {
            const isActive = step === s.id;
            const steps: Step[] = ['cart', 'address', 'otp', 'success'];
            const isDone = steps.indexOf(step) > idx;
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
                   onClick={() => setStep('address')} 
                   className="w-full h-14 rounded-2xl text-lg font-black shadow-lg shadow-primary/30 group"
                   disabled={cartItems.length === 0}
                 >
                   Proceed to Checkout <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                 </Button>
                 <p className="text-[10px] text-center text-muted-foreground mt-4 font-bold uppercase tracking-widest">Secure Checkout via FBT Platform</p>
               </Card>
            </div>
          </div>
        )}


        {/* STEP 2: SHIPPING ADDRESS */}
        {step === 'address' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
               <Card className="border-white/5 bg-white/5 rounded-[32px] p-8 md:p-10">
                 <h2 className="text-3xl font-black mb-8 flex items-center gap-4">Where to send? <MapPin className="text-primary h-8 w-8" /></h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Full Name *</label>
                      <input className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none" value={address.fullName} onChange={e => handleAddressChange('fullName', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Mobile Number *</label>
                      <input className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-mono" value={address.mobileNumber} onChange={e => handleAddressChange('mobileNumber', e.target.value)} placeholder="10-digit number" />
                    </div>
                    <div className="col-span-full space-y-2">
                      <label className="text-[10px] uppercase font-black text-amber-400 ml-1 flex items-center gap-1.5"><Mail size={12} /> Email Address * <span className="text-muted-foreground font-normal">(for order verification)</span></label>
                      <input type="email" className="w-full h-14 px-5 bg-white/5 border border-amber-500/20 rounded-2xl focus:ring-2 focus:ring-amber-500/20 outline-none" value={address.email} onChange={e => handleAddressChange('email', e.target.value)} placeholder="you@example.com" />
                    </div>
                    <div className="col-span-full space-y-2">
                      <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Address Line 1 *</label>
                      <input className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none" value={address.addressLine1} onChange={e => handleAddressChange('addressLine1', e.target.value)} placeholder="House/Flat/Building" />
                    </div>
                    <div className="col-span-full space-y-2">
                      <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Address Line 2 (Optional)</label>
                      <input className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none" value={address.addressLine2} onChange={e => handleAddressChange('addressLine2', e.target.value)} placeholder="Landmark/Locality" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">City *</label>
                      <input className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none" value={address.city} onChange={e => handleAddressChange('city', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">State *</label>
                      <input className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none" value={address.state} onChange={e => handleAddressChange('state', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Pincode *</label>
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
                    onClick={sendOtp} 
                    className="w-full h-14 rounded-2xl text-lg font-bold bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20"
                    disabled={!isAddressValid() || sendingOtp}
                  >
                    {sendingOtp ? <><Loader2 className="animate-spin mr-2" /> Sending OTP...</> : <><ShieldCheck className="mr-2" /> Verify & Confirm Order</>}
                  </Button>
                  <button onClick={() => setStep('cart')} className="w-full text-xs font-black text-muted-foreground uppercase tracking-widest mt-6 hover:text-primary transition-colors">Adjust Selection</button>
               </Card>
            </div>
          </div>
        )}

        {/* STEP 3: OTP VERIFICATION */}
        {step === 'otp' && (
          <div className="max-w-lg mx-auto text-center">
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl p-10 rounded-[32px]">
              <div className="h-16 w-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-6">
                <Mail size={32} />
              </div>
              <h2 className="text-2xl font-black mb-2">Check Your Email</h2>
              <p className="text-muted-foreground mb-8">
                We sent a 6-digit code to <span className="text-foreground font-bold">{address.email}</span>
              </p>

              {/* OTP Input boxes */}
              <div className="flex justify-center gap-3 mb-6" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpInputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="text-center text-2xl font-black bg-white/5 border-2 border-white/10 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    style={{ width: '52px', height: '64px' }}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-rose-400 text-sm font-medium mb-4">{otpError}</p>
              )}

              <Button
                onClick={() => verifyAndPlaceOrder()}
                disabled={verifyingOtp || placing || otpDigits.join('').length !== 6}
                className="w-full h-14 rounded-2xl text-lg font-bold bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 mb-4"
              >
                {verifyingOtp || placing ? <><Loader2 className="animate-spin mr-2" /> Verifying & Placing Order...</> : 'Confirm Order'}
              </Button>

              {/* Resend */}
              <div className="mt-4">
                {resendCooldown > 0 ? (
                  <p className="text-sm text-muted-foreground">Resend code in <span className="text-foreground font-bold">{resendCooldown}s</span></p>
                ) : (
                  <button onClick={sendOtp} disabled={sendingOtp} className="text-sm text-primary font-bold hover:underline">
                    {sendingOtp ? 'Sending...' : 'Resend Code'}
                  </button>
                )}
              </div>

              <button onClick={() => setStep('address')} className="block mx-auto text-xs font-black text-muted-foreground uppercase tracking-widest mt-8 hover:text-primary transition-colors">
                Change Email / Address
              </button>
            </Card>
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
