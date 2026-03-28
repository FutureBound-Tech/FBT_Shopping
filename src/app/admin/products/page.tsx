'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, PackageSearch, Pencil, Trash2, X, Check, Plus, Sparkles, Copy, Download, CheckCheck, Image as ImageIcon } from 'lucide-react';
import { IProduct } from '@/models/Product';
import { motion, AnimatePresence } from 'framer-motion';

type ProductData = IProduct & { _id: string };

const IgIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

interface EditForm {
  title: string;
  price: number;
  category: 'saree' | 'dress';
  description: string;
  fabric: string;
  colors: string[];
  sizes: string[];
  highlights: string[];
}

interface InstagramState {
  product: ProductData;
  caption: string;
  loading: boolean;
  copied: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // Instagram modal state
  const [igState, setIgState] = useState<InstagramState | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(data => {
        if (data.success) setProducts(data.products);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const startEdit = (product: ProductData) => {
    setEditingId(product._id);
    setEditForm({
      title: product.title,
      price: product.price,
      category: product.category,
      description: product.description,
      fabric: product.fabric || '',
      colors: [...(product.colors || [])],
      sizes: [...(product.sizes || [])],
      highlights: [...(product.highlights || [])],
    });
    setNewColor('');
    setNewSize('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editForm) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p._id === editingId ? data.product : p));
        cancelEdit();
      }
    } catch (err) {
      console.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p._id !== id));
      }
    } catch (err) {
      console.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const reAnalyze = async (id: string) => {
    setAnalyzingId(id);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p._id === id ? data.product : p));
        alert(`AI Re-analysis done!\nColors: ${data.aiData.colors.join(', ') || 'none'}\nSizes: ${data.aiData.sizes.join(', ') || 'none'}`);
      } else {
        alert('AI re-analysis failed: ' + data.error);
      }
    } catch (err) {
      console.error('Re-analyze failed:', err);
      alert('Re-analysis failed. Check console.');
    } finally {
      setAnalyzingId(null);
    }
  };

  // ─── Instagram Share ──────────────────────────────────────────
  const openInstagram = async (product: ProductData) => {
    setIgState({ product, caption: '', loading: true, copied: false });

    try {
      const res = await fetch('/api/admin/products/instagram-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: product.title,
          description: product.description,
          category: product.category,
          colors: product.colors,
          fabric: product.fabric,
          price: product.price,
          tags: product.tags,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIgState(prev => prev ? { ...prev, caption: data.caption, loading: false } : null);
      } else {
        setIgState(prev => prev ? { ...prev, caption: 'Failed to generate caption. Try again.', loading: false } : null);
      }
    } catch {
      setIgState(prev => prev ? { ...prev, caption: 'Failed to generate caption. Try again.', loading: false } : null);
    }
  };

  const copyCaption = () => {
    if (!igState?.caption) return;
    navigator.clipboard.writeText(igState.caption);
    setIgState(prev => prev ? { ...prev, copied: true } : null);
    setTimeout(() => setIgState(prev => prev ? { ...prev, copied: false } : null), 2000);
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch {
      window.open(url, '_blank');
    }
  };

  const addColor = () => {
    if (!editForm || !newColor.trim()) return;
    if (!editForm.colors.includes(newColor.trim())) {
      setEditForm({ ...editForm, colors: [...editForm.colors, newColor.trim()] });
    }
    setNewColor('');
  };

  const addSize = () => {
    if (!editForm || !newSize.trim()) return;
    if (!editForm.sizes.includes(newSize.trim())) {
      setEditForm({ ...editForm, sizes: [...editForm.sizes, newSize.trim()] });
    }
    setNewSize('');
  };

  const addHighlight = () => {
    if (!editForm) return;
    setEditForm({ ...editForm, highlights: [...editForm.highlights, ''] });
  };

  const updateHighlight = (index: number, value: string) => {
    if (!editForm) return;
    const updated = [...editForm.highlights];
    updated[index] = value;
    setEditForm({ ...editForm, highlights: updated });
  };

  const removeHighlight = (index: number) => {
    if (!editForm) return;
    setEditForm({ ...editForm, highlights: editForm.highlights.filter((_, i) => i !== index) });
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Manage Products</h1>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
            <Loader2 className="loader" size={32} />
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <PackageSearch size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3>No products found</h3>
            <p>You haven't added any products yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Media</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Title</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Colors</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sizes</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Price</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Views</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <React.Fragment key={product._id}>
                    <tr style={{
                      borderBottom: editingId === product._id ? 'none' : '1px solid var(--border-light)',
                      background: editingId === product._id ? 'rgba(255, 51, 102, 0.05)' : 'transparent',
                    }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: '#111' }}>
                          {product.media[0]?.type === 'image' ? (
                            <img src={product.media[0]?.url} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <video src={product.media[0]?.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{product.title}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem',
                          fontWeight: 600,
                          background: product.category === 'saree' ? 'rgba(255, 51, 102, 0.2)' : 'rgba(0, 194, 255, 0.2)',
                          color: product.category === 'saree' ? '#FF6B8B' : '#00C2FF'
                        }}>
                          {product.category.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {product.colors?.map(c => <span key={c} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>{c}</span>)}
                          {(!product.colors || product.colors.length === 0) && <span style={{ color: 'var(--text-muted)' }}>-</span>}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {product.sizes?.map(s => <span key={s} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px' }}>{s}</span>)}
                          {(!product.sizes || product.sizes.length === 0) && <span style={{ color: 'var(--text-muted)' }}>-</span>}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>₹{product.price}</td>
                      <td style={{ padding: '1rem' }}>{product.views}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => openInstagram(product)}
                            title="Share to Instagram"
                            style={{
                              background: 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)',
                              border: 'none',
                              color: 'white', borderRadius: 8, padding: '0.4rem 0.6rem', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600,
                            }}
                          >
                            <IgIcon size={14} /> IG
                          </button>
                          <button
                            onClick={() => startEdit(product)}
                            style={{
                              background: 'rgba(0,194,255,0.1)', border: '1px solid rgba(0,194,255,0.3)',
                              color: '#00C2FF', borderRadius: 8, padding: '0.4rem 0.6rem', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600,
                            }}
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            onClick={() => reAnalyze(product._id)}
                            disabled={analyzingId === product._id}
                            title="Re-run AI to extract colors, sizes & highlights"
                            style={{
                              background: 'rgba(255,183,0,0.1)', border: '1px solid rgba(255,183,0,0.3)',
                              color: '#f59e0b', borderRadius: 8, padding: '0.4rem 0.6rem', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600,
                              opacity: analyzingId === product._id ? 0.6 : 1,
                            }}
                          >
                            {analyzingId === product._id
                              ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</>
                              : <><Sparkles size={14} /> AI</>
                            }
                          </button>
                          <button
                            onClick={() => deleteProduct(product._id)}
                            disabled={deletingId === product._id}
                            style={{
                              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                              color: '#ef4444', borderRadius: 8, padding: '0.4rem 0.6rem', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600,
                              opacity: deletingId === product._id ? 0.5 : 1,
                            }}
                          >
                            <Trash2 size={14} /> {deletingId === product._id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Edit Row */}
                    {editingId === product._id && editForm && (
                      <tr>
                        <td colSpan={8} style={{ padding: 0, borderBottom: '1px solid var(--border-light)' }}>
                          <div style={{
                            padding: '1.5rem 2rem', background: 'rgba(255, 51, 102, 0.03)',
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
                          }}>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Pencil size={16} style={{ color: 'var(--color-primary)' }} />
                              <span style={{ fontWeight: 700, fontSize: '1rem' }}>Editing: {product.title}</span>
                            </div>

                            {/* Title */}
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>Title</label>
                              <input
                                className="input-field"
                                value={editForm.title}
                                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                              />
                            </div>

                            {/* Price */}
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>Price (₹)</label>
                              <input
                                className="input-field"
                                type="number"
                                value={editForm.price}
                                onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                              />
                            </div>

                            {/* Category */}
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>Category</label>
                              <select
                                className="input-field"
                                value={editForm.category}
                                onChange={e => setEditForm({ ...editForm, category: e.target.value as 'saree' | 'dress' })}
                              >
                                <option value="saree">Saree</option>
                                <option value="dress">Dress</option>
                              </select>
                            </div>

                            {/* Fabric */}
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>Fabric</label>
                              <input
                                className="input-field"
                                value={editForm.fabric}
                                onChange={e => setEditForm({ ...editForm, fabric: e.target.value })}
                                placeholder="e.g. Silk, Cotton"
                              />
                            </div>

                            {/* Colors */}
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>Colors</label>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                {editForm.colors.map((c, i) => (
                                  <span key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                                    padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.1)',
                                    borderRadius: 99, fontSize: '0.8rem',
                                  }}>
                                    {c}
                                    <X size={12} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => setEditForm({ ...editForm, colors: editForm.colors.filter((_, j) => j !== i) })} />
                                  </span>
                                ))}
                              </div>
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <input className="input-field" value={newColor} onChange={e => setNewColor(e.target.value)} placeholder="Add color" style={{ flex: 1 }}
                                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColor())}
                                />
                                <button onClick={addColor} style={{
                                  background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-light)',
                                  borderRadius: 8, padding: '0 0.75rem', cursor: 'pointer', color: 'var(--text-primary)',
                                }}><Plus size={16} /></button>
                              </div>
                            </div>

                            {/* Sizes */}
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>Sizes</label>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                {editForm.sizes.map((s, i) => (
                                  <span key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                                    padding: '0.2rem 0.6rem', border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: 8, fontSize: '0.8rem',
                                  }}>
                                    {s}
                                    <X size={12} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => setEditForm({ ...editForm, sizes: editForm.sizes.filter((_, j) => j !== i) })} />
                                  </span>
                                ))}
                              </div>
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <input className="input-field" value={newSize} onChange={e => setNewSize(e.target.value)} placeholder="Add size" style={{ flex: 1 }}
                                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())}
                                />
                                <button onClick={addSize} style={{
                                  background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-light)',
                                  borderRadius: 8, padding: '0 0.75rem', cursor: 'pointer', color: 'var(--text-primary)',
                                }}><Plus size={16} /></button>
                              </div>
                            </div>

                            {/* Description */}
                            <div style={{ gridColumn: '1 / -1' }}>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>Description</label>
                              <textarea
                                className="input-field"
                                rows={3}
                                value={editForm.description}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                style={{ resize: 'vertical' }}
                              />
                            </div>

                            {/* Highlights */}
                            <div style={{ gridColumn: '1 / -1' }}>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>Highlights</label>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                {editForm.highlights.map((h, i) => (
                                  <div key={i} style={{ display: 'flex', gap: '0.4rem' }}>
                                    <input
                                      className="input-field"
                                      value={h}
                                      onChange={e => updateHighlight(i, e.target.value)}
                                      placeholder={`Highlight ${i + 1}`}
                                      style={{ flex: 1 }}
                                    />
                                    <button onClick={() => removeHighlight(i)} style={{
                                      background: 'transparent', border: 'none', cursor: 'pointer',
                                      color: 'var(--text-muted)', padding: '0 0.5rem',
                                    }}><X size={16} /></button>
                                  </div>
                                ))}
                              </div>
                              <button onClick={addHighlight} style={{
                                background: 'transparent', border: '1px dashed var(--border-light)',
                                borderRadius: 8, padding: '0.4rem 1rem', cursor: 'pointer',
                                color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
                              }}>
                                <Plus size={14} /> Add Highlight
                              </button>
                            </div>

                            {/* Actions */}
                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                              <button onClick={saveEdit} disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Check size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                              </button>
                              <button onClick={cancelEdit} className="btn btn-secondary">
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          INSTAGRAM SHARE MODAL
          ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {igState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && setIgState(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25 }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                width: '90%',
                maxWidth: '650px',
                maxHeight: '85vh',
                overflow: 'auto',
                padding: '2rem',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <IgIcon size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Instagram Reel Ready</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{igState.product.title}</p>
                  </div>
                </div>
                <button onClick={() => setIgState(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 8 }}>
                  <X size={20} />
                </button>
              </div>

              {/* Media Grid */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                  <ImageIcon size={14} /> Media Files ({igState.product.media.length}) — Click to download
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {igState.product.media.map((m, i) => (
                    <div key={i} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => downloadImage(m.url, `${igState.product.title.replace(/\s+/g, '_')}_${i + 1}.${m.type === 'video' ? 'mp4' : 'jpg'}`)}>
                      {m.type === 'image' ? (
                        <img src={m.url} alt="" style={{ width: 90, height: 110, borderRadius: 10, objectFit: 'cover', border: '2px solid var(--border-light)' }} />
                      ) : (
                        <video src={m.url} style={{ width: 90, height: 110, borderRadius: 10, objectFit: 'cover', border: '2px solid var(--border-light)' }} />
                      )}
                      <div style={{
                        position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
                        background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '2px 6px',
                        display: 'flex', alignItems: 'center', gap: 3,
                      }}>
                        <Download size={10} color="white" />
                        <span style={{ fontSize: '0.6rem', color: 'white', fontWeight: 600 }}>{m.type === 'video' ? 'MP4' : 'JPG'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                  <span>AI-Generated Caption + Hashtags</span>
                  <button
                    onClick={copyCaption}
                    disabled={!igState.caption || igState.loading}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      background: igState.copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)',
                      border: '1px solid ' + (igState.copied ? 'rgba(16,185,129,0.4)' : 'var(--border-light)'),
                      borderRadius: 8, padding: '0.35rem 0.75rem', cursor: 'pointer',
                      color: igState.copied ? '#10b981' : 'var(--text-primary)',
                      fontSize: '0.8rem', fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                  >
                    {igState.copied ? <><CheckCheck size={14} /> Copied!</> : <><Copy size={14} /> Copy Caption</>}
                  </button>
                </label>
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 12,
                  padding: '1rem',
                  maxHeight: '250px',
                  overflow: 'auto',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  color: 'var(--text-secondary)',
                }}>
                  {igState.loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 0' }}>
                      <Loader2 size={20} className="loader" />
                      <span>Generating viral caption with hashtags...</span>
                    </div>
                  ) : (
                    igState.caption
                  )}
                </div>
              </div>

              {/* How to use */}
              <div style={{
                marginTop: '1.25rem', padding: '1rem', borderRadius: 12,
                background: 'rgba(131, 58, 180, 0.1)', border: '1px solid rgba(131, 58, 180, 0.2)',
                fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5,
              }}>
                <strong style={{ color: '#E1306C' }}>How to post:</strong>
                <ol style={{ margin: '0.5rem 0 0 1.25rem', padding: 0 }}>
                  <li>Download images above</li>
                  <li>Copy the caption</li>
                  <li>Open Instagram → Create Reel → Upload</li>
                  <li>Paste caption and post</li>
                </ol>
              </div>

              {/* Close button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button
                  onClick={() => setIgState(null)}
                  style={{
                    padding: '0.6rem 1.5rem', borderRadius: 10, border: '1px solid var(--border-light)',
                    background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
