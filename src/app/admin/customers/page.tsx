'use client';

import React, { useEffect, useState } from 'react';
import { Users, Pencil, Trash2, X, Check, Phone, Calendar } from 'lucide-react';

interface Customer {
  _id: string;
  fullName: string;
  mobileNumber: string;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    fetch('/api/admin/customers')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCustomers(data.customers);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const startEdit = (customer: Customer) => {
    setEditingId(customer._id);
    setEditName(customer.fullName);
    setEditMobile(customer.mobileNumber);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditMobile('');
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim() || !editMobile.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/customers/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: editName.trim(), mobileNumber: editMobile.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(prev => prev.map(c => c._id === editingId ? data.customer : c));
        cancelEdit();
      } else {
        alert(data.error || 'Failed to update');
      }
    } catch {
      alert('Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  const deleteCustomer = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCustomers(prev => prev.filter(c => c._id !== id));
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch {
      alert('Failed to delete customer');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <h1 className="page-title">Customers</h1>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Customers ({customers.length})</h1>

      {customers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>No customers yet. Users register automatically on their first visit.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {customers.map(customer => {
            const isEditing = editingId === customer._id;
            const isDeleting = deletingId === customer._id;

            return (
              <div key={customer._id} className="glass-panel" style={{
                padding: '1.25rem 1.5rem',
                display: 'flex', alignItems: 'center', gap: '1.5rem',
                flexWrap: 'wrap', opacity: isDeleting ? 0.5 : 1,
                transition: 'opacity 0.2s'
              }}>
                {isEditing ? (
                  <>
                    <div style={{ flex: '1 1 200px' }}>
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="Full Name"
                        style={{
                          width: '100%', padding: '0.5rem 0.75rem',
                          borderRadius: '8px', border: '1px solid var(--border-light)',
                          background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                          fontSize: '0.95rem', outline: 'none'
                        }}
                      />
                    </div>
                    <div style={{ flex: '1 1 160px' }}>
                      <input
                        type="text"
                        value={editMobile}
                        onChange={e => setEditMobile(e.target.value)}
                        placeholder="Mobile Number"
                        style={{
                          width: '100%', padding: '0.5rem 0.75rem',
                          borderRadius: '8px', border: '1px solid var(--border-light)',
                          background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                          fontSize: '0.95rem', outline: 'none'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={saveEdit}
                        disabled={saving || !editName.trim() || !editMobile.trim()}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.5rem 1rem', borderRadius: '8px',
                          background: '#22c55e', color: '#fff', border: 'none',
                          cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                        }}
                      >
                        <Check size={16} /> Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.5rem 1rem', borderRadius: '8px',
                          background: 'transparent', color: 'var(--text-secondary)',
                          border: '1px solid var(--border-light)',
                          cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                        }}
                      >
                        <X size={16} /> Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ flex: '1 1 200px' }}>
                      <div style={{ fontWeight: 600, fontSize: '1rem' }}>{customer.fullName}</div>
                    </div>
                    <div style={{ flex: '1 1 160px', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                      <Phone size={14} />
                      <span>{customer.mobileNumber}</span>
                    </div>
                    <div style={{ flex: '1 1 140px', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <Calendar size={14} />
                      <span>{formatDate(customer.createdAt)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => startEdit(customer)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.5rem 1rem', borderRadius: '8px',
                          background: 'transparent', color: 'var(--color-secondary)',
                          border: '1px solid var(--border-light)',
                          cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                        }}
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete ${customer.fullName}?`)) {
                            deleteCustomer(customer._id);
                          }
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.5rem 1rem', borderRadius: '8px',
                          background: 'transparent', color: '#ef4444',
                          border: '1px solid rgba(239,68,68,0.3)',
                          cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
