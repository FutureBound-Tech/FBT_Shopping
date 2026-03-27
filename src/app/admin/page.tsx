'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, Users, IndianRupee, ArrowRight, Clock } from 'lucide-react';

interface RecentOrder {
  _id: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface Stats {
  productCount: number;
  orderCount: number;
  customerCount: number;
  totalRevenue: number;
  recentOrders: RecentOrder[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    productCount: 0, orderCount: 0, customerCount: 0, totalRevenue: 0, recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cards = [
    { title: 'Total Products', value: stats.productCount, icon: Package, color: '#FF3366', link: '/admin/products' },
    { title: 'Total Orders', value: stats.orderCount, icon: ShoppingCart, color: '#3b82f6', link: '/admin/orders' },
    { title: 'Customers', value: stats.customerCount, icon: Users, color: '#22c55e', link: '/admin/customers' },
    { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: '#f59e0b', link: null },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Dashboard Overview</h1>

      <div className="stats-grid">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-panel stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="stat-card-title">{card.title}</span>
                  <span className="stat-card-value">
                    {loading ? '...' : card.value}
                  </span>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${card.color}20`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={22} style={{ color: card.color }} />
                </div>
              </div>
              {card.link && (
                <Link href={card.link} style={{
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  fontSize: '0.8rem', color: card.color, marginTop: '0.5rem', fontWeight: 500
                }}>
                  View all <ArrowRight size={14} />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Recent Orders</h3>
        {stats.recentOrders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No recent orders.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.recentOrders.map(order => (
              <div key={order._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 700, color: 'white'
                  }}>
                    {order.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{order.customerName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>₹{order.totalAmount.toLocaleString('en-IN')}</div>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize',
                    color: STATUS_COLORS[order.status] || '#94a3b8'
                  }}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {stats.recentOrders.length > 0 && (
          <Link href="/admin/orders" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
            marginTop: '1.5rem', color: 'var(--color-secondary)', fontSize: '0.85rem', fontWeight: 600
          }}>
            View all orders <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
}
