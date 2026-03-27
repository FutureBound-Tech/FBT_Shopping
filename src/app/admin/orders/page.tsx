'use client';

import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle, XCircle, Clock, ChevronDown, MapPin } from 'lucide-react';

interface OrderItem {
  product: any;
  title: string;
  quantity: number;
  price: number;
  selectedColor: string;
  selectedSize: string;
}

interface ShippingAddress {
  fullName: string;
  mobileNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  _id: string;
  customerName: string;
  customerMobile: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  pending: { icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  processing: { icon: Package, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  shipped: { icon: Truck, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  delivered: { icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  cancelled: { icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

const ALL_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    fetch('/api/admin/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrders(data.orders);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: status as any } : o));
      }
    } catch (err) {
      console.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <h1 className="page-title">Orders</h1>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Orders</h1>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {ALL_STATUSES.map(status => {
          const count = orders.filter(o => o.status === status).length;
          const cfg = STATUS_CONFIG[status];
          const Icon = cfg.icon;
          return (
            <div key={status} className="glass-panel" style={{
              padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
              flex: '1 1 140px', minWidth: '140px'
            }}>
              <Icon size={20} style={{ color: cfg.color }} />
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{count}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{status}</div>
              </div>
            </div>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>No orders yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(order => {
            const cfg = STATUS_CONFIG[order.status];
            const Icon = cfg.icon;
            const isExpanded = expandedOrder === order._id;
            const isUpdating = updatingId === order._id;

            return (
              <div key={order._id} className="glass-panel" style={{ overflow: 'hidden' }}>
                {/* Order header row */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem',
                    cursor: 'pointer', flexWrap: 'wrap'
                  }}
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                >
                  <div style={{ flex: '1 1 120px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order</div>
                    <div style={{ fontWeight: 700, letterSpacing: '1px' }}>#{order._id.slice(-8).toUpperCase()}</div>
                  </div>

                  <div style={{ flex: '1 1 160px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer</div>
                    <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.customerMobile}</div>
                  </div>

                  <div style={{ flex: '1 1 80px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Items</div>
                    <div style={{ fontWeight: 600 }}>{order.items.reduce((a, i) => a + i.quantity, 0)}</div>
                  </div>

                  <div style={{ flex: '1 1 100px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amount</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{order.totalAmount.toLocaleString('en-IN')}</div>
                  </div>

                  <div style={{ flex: '1 1 160px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Status</div>
                    <div
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.3rem 0.75rem', borderRadius: '99px',
                        background: cfg.bg, color: cfg.color,
                        fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize'
                      }}
                    >
                      <Icon size={14} />
                      {order.status}
                    </div>
                  </div>

                  <div style={{ flex: '1 1 120px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {formatDate(order.createdAt)}
                  </div>

                  <ChevronDown
                    size={18}
                    style={{
                      color: 'var(--text-muted)', transition: 'transform 0.2s',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid var(--border-light)' }}>
                    {/* Items */}
                    <div style={{ padding: '1rem 0' }}>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Items</h4>
                      {order.items.map((item, i) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '0.6rem 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--border-light)' : 'none'
                        }}>
                          <div>
                            <span style={{ fontWeight: 600 }}>{item.title}</span>
                            <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.85rem' }}>× {item.quantity}</span>
                            {(item.selectedColor || item.selectedSize) && (
                              <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--color-secondary)' }}>
                                {item.selectedColor}{item.selectedColor && item.selectedSize ? ' / ' : ''}{item.selectedSize}
                              </span>
                            )}
                          </div>
                          <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address */}
                    <div style={{ padding: '1rem 0', borderTop: '1px solid var(--border-light)' }}>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={14} /> Shipping Address
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                        {order.shippingAddress.fullName}<br />
                        {order.shippingAddress.addressLine1}<br />
                        {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
                        Phone: {order.shippingAddress.mobileNumber}
                      </p>
                    </div>

                    {/* Status Update */}
                    <div style={{ padding: '1rem 0', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Update Status:</span>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {ALL_STATUSES.map(status => {
                          const sCfg = STATUS_CONFIG[status];
                          const SIcon = sCfg.icon;
                          const isActive = order.status === status;
                          return (
                            <button
                              key={status}
                              disabled={isUpdating || isActive}
                              onClick={() => updateStatus(order._id, status)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '0.35rem',
                                padding: '0.4rem 0.9rem', borderRadius: '99px',
                                border: isActive ? `1px solid ${sCfg.color}` : '1px solid var(--border-light)',
                                background: isActive ? sCfg.bg : 'transparent',
                                color: isActive ? sCfg.color : 'var(--text-secondary)',
                                cursor: isActive ? 'default' : 'pointer',
                                fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize',
                                transition: 'all 0.2s', opacity: isUpdating ? 0.5 : 1
                              }}
                            >
                              <SIcon size={13} />
                              {status}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
