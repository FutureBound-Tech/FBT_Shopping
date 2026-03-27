"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User, Package, MapPin, Phone,
  ChevronRight, Search, Loader2, ShoppingBag,
  ExternalLink, ArrowLeft, History, ShieldCheck,
  Smartphone, LogOut, ShieldAlert, CheckCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

interface OrderItem {
  product: any;
  title: string;
  quantity: number;
  price: number;
  selectedColor: string;
  selectedSize: string;
}

interface Order {
  _id: string;
  customerName: string;
  customerMobile: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress: any;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [mobile, setMobile] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Verification states
  const [verifying, setVerifying] = useState(false);
  const [verStep, setVerStep] = useState<'none' | 'input'>('none');
  const [otp, setOtp] = useState('');

  const handleSearch = async (targetMobile: string) => {
    if (!targetMobile.trim() || targetMobile.length < 10) {
      setErrorMessage("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(`/api/orders?mobile=${targetMobile}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setSearched(true);
      } else {
        setErrorMessage(data.error || "Something went wrong");
      }
    } catch (err) {
      setErrorMessage("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('fbt_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUser(u);
        if (u.mobileNumber) {
          setMobile(u.mobileNumber);
          handleSearch(u.mobileNumber); // AUTO-LOAD
        }
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('fbt_user');
    localStorage.removeItem('fbt_customer_mobile');
    window.location.reload();
  };

  const initiateVerification = async () => {
    setVerifying(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: user.mobileNumber, action: 'send' })
      });
      const data = await res.json();
      if (data.success) {
        if (data.mockOtp) setErrorMessage(`Test Mode: Use ${data.mockOtp}`);
        setVerStep('input');
      } else {
        setErrorMessage(data.error || 'Failed to send verification code');
      }
    } catch (e) {
      setErrorMessage('Verification failed. Try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyOtp = async () => {
    setVerifying(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: user.mobileNumber, otp, action: 'verify' })
      });
      const data = await res.json();
      if (data.success) {
        // Success! Update local user and state
        const updatedUser = { ...user, verified: true };
        setUser(updatedUser);
        localStorage.setItem('fbt_user', JSON.stringify(updatedUser));
        setVerStep('none');
        setOtp('');
      } else {
        setErrorMessage(data.error || 'Incorrect code');
      }
    } catch (e) {
      setErrorMessage('Verification error');
    } finally {
      setVerifying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'shipped': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'cancelled': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <main className="min-h-screen bg-background pb-20">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
             <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center ring-1 ring-primary/20 shadow-lg shadow-primary/10">
               <User className="h-8 w-8 text-primary" />
             </div>
             <div>
               <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none">
                 {user?.fullName || 'Shopaholic'}
               </h1>
               <div className="flex items-center gap-2 mt-2">
                 {user?.verified ? (
                   <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verified Account
                   </div>
                 ) : (
                   <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/5 px-3 py-1.5 rounded-full border border-amber-500/10">
                      <ShieldAlert className="h-3.5 w-3.5" /> Identity Check Pending
                   </div>
                 )}
                 <span className="text-muted-foreground text-xs font-bold ml-1">+91 {mobile.slice(-10)}</span>
               </div>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-xl h-10 border-white/5 hover:bg-rose-500/10 hover:text-rose-400 group">
               <LogOut className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" /> Logout
             </Button>
          </div>
        </div>

        {/* Verification Banner if NOT verified */}
        {!user?.verified && verStep === 'none' && (
           <Card className="mb-10 border-amber-500/20 bg-amber-500/5 backdrop-blur-xl rounded-[32px] overflow-hidden">
             <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 justify-between">
                <div className="flex items-center gap-5 text-center md:text-left">
                  <div className="h-14 w-14 bg-amber-400/20 text-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/10">
                    <History className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black mb-1">Secure Your Account</h3>
                    <p className="text-sm text-muted-foreground">Verification is required for high-value orders and faster support.</p>
                  </div>
                </div>
                <Button onClick={initiateVerification} disabled={verifying} className="h-12 px-10 rounded-2xl font-black bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-xl shadow-amber-400/20 min-w-[200px]">
                  {verifying ? <Loader2 className="animate-spin" /> : "Verify with OTP"}
                </Button>
             </div>
           </Card>
        )}

        {/* Verification Input if requested */}
        {verStep === 'input' && (
          <Card className="mb-10 border-primary/20 bg-primary/5 backdrop-blur-xl rounded-[32px] overflow-hidden animate-fade-in">
             <div className="p-10 flex flex-col items-center max-w-lg mx-auto text-center space-y-6">
                <div className="h-16 w-16 bg-primary/20 text-primary rounded-3xl flex items-center justify-center">
                   <Smartphone size={32} />
                </div>
                <h3 className="text-2xl font-black">Confirm Mobile Number</h3>
                <p className="text-muted-foreground text-sm max-w-[300px]">We've sent a 6-digit code to <span className="text-foreground font-black">+91 {mobile.slice(-10)}</span></p>
                
                <div className="w-full space-y-4">
                   <input 
                    type="text" 
                    maxLength={6} 
                    className="w-full h-16 text-center text-3xl font-black font-mono bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-primary/20 outline-none transition-all tracking-[0.2em]" 
                    placeholder="000000"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                   />
                   {errorMessage && <p className="text-rose-400 text-xs font-bold uppercase tracking-widest">{errorMessage}</p>}
                   <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" onClick={() => setVerStep('none')} className="h-12 rounded-2xl font-bold border-white/10">Cancel</Button>
                      <Button onClick={handleVerifyOtp} disabled={verifying || otp.length < 6} className="h-12 rounded-2xl font-black shadow-xl shadow-primary/20">
                         {verifying ? <Loader2 className="animate-spin" /> : "Verify Identity"}
                      </Button>
                   </div>
                </div>
             </div>
          </Card>
        )}

        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 gap-4">
             <Loader2 className="h-10 w-10 animate-spin text-primary" />
             <p className="font-bold text-muted-foreground animate-pulse tracking-widest uppercase text-xs">Syncing Order History...</p>
           </div>
        ) : (
          /* Orders List Section */
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold flex items-center gap-2 uppercase tracking-widest text-[11px] text-muted-foreground">
                <Package className="h-5 w-5 text-primary" /> Total Orders <span className="bg-white/5 px-3 py-1 rounded-full text-foreground">{orders.length}</span>
              </h2>
            </div>

            {orders.length === 0 ? (
              <Card className="border-dashed border-white/5 p-20 flex flex-col items-center justify-center bg-transparent group">
                <div className="h-16 w-16 bg-muted/20 rounded-full flex items-center justify-center mb-4 text-muted-foreground group-hover:scale-110 transition-transform">
                  <ShoppingBag size={32} />
                </div>
                <h3 className="font-bold text-xl">No active orders</h3>
                <p className="text-sm text-muted-foreground text-center mt-2 max-w-xs">Looks like you haven't started your luxury journey yet!</p>
                <Link href="/" className="mt-8">
                  <Button className="rounded-2xl px-12 h-14 font-black shadow-xl shadow-primary/30 group">
                    View Collections <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order._id} className="border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all rounded-[32px] overflow-hidden group">
                  <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 text-primary group-hover:scale-110 transition-transform">
                         <History className="h-7 w-7" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Order Summary</div>
                        <div className="font-mono text-sm tracking-tighter text-foreground/80 lowercase">ident-#{order._id.slice(-6).toUpperCase()}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 items-center">
                      <div>
                        <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Date</div>
                        <div className="text-sm font-bold">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Amount</div>
                        <div className="text-lg font-black font-mono">₹{order.totalAmount.toLocaleString("en-IN")}</div>
                      </div>
                      <Badge className={`h-8 px-5 rounded-xl font-black border-2 capitalize transition-all hidden lg:flex ${getStatusColor(order.status)}`}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-0 bg-white/[0.01]">
                    <div className="divide-y divide-white/5">
                      {order.items.map((item, i) => (
                        <div key={i} className="p-6 md:p-8 flex items-center gap-6 group/item">
                          <div className="h-24 w-20 bg-muted/50 rounded-2xl overflow-hidden flex-shrink-0 ring-1 ring-white/10 group-hover/item:scale-105 transition-transform duration-500">
                             <img src={item.product?.media?.[0]?.url} alt={item.title} className="h-full w-full object-cover" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-lg text-foreground truncate">{item.title}</h4>
                            <div className="flex items-center gap-4 mt-3">
                              <Badge variant="outline" className="text-[10px] font-black uppercase text-muted-foreground border-white/5">QTY: {item.quantity}</Badge>
                              {item.selectedSize && <Badge variant="outline" className="text-[10px] font-black uppercase text-primary border-primary/20">SIZE: {item.selectedSize}</Badge>}
                            </div>
                          </div>
                          
                          <div className="text-right flex flex-col items-end gap-2">
                             <div className="text-lg font-black font-mono">₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
                             <Link href={`/product/${item.product?._id || ''}`}>
                               <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg text-[9px] uppercase font-black tracking-widest text-muted-foreground hover:text-primary transition-all">
                                 Buy Again
                               </Button>
                             </Link>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 md:p-8 bg-white/[0.03]">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div className="text-sm">
                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground block mb-1">Shipment Location</span>
                            <span className="font-bold text-foreground">{order.shippingAddress.fullName}</span>
                            <br/>
                            <span className="text-muted-foreground">{order.shippingAddress.addressLine1}, {order.shippingAddress.city}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button size="sm" className="rounded-xl h-11 px-6 text-[10px] uppercase font-black bg-white/5 hover:bg-white/10 text-foreground border border-white/5">
                            Track Order <ExternalLink size={14} className="ml-2" />
                          </Button>
                          <Badge className={`lg:hidden h-11 px-6 rounded-xl font-black border-2 capitalize ${getStatusColor(order.status)}`}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
