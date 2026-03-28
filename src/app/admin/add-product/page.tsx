'use client';

import React, { useState } from 'react';
import { Upload, X, Loader2, Sparkles, Check, Edit3, Tag, Palette, Ruler, Shirt, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  public_id: string;
}

interface AIResult {
  title: string;
  description: string;
  rawDescription: string;
  price: number;
  category: 'saree' | 'dress';
  colors: string[];
  sizes: string[];
  fabric: string;
  highlights: string[];
  pageContent: string;
  tags: string[];
  media: MediaItem[];
}

export default function AddProductPage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{url: string, type: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  // Confirmation modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
      
      const newPreviews = selectedFiles.map(file => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video') ? 'video' : 'image'
      }));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadToCloudinary = async (file: File) => {
    const sigRes = await fetch('/api/admin/upload', { method: 'POST' });
    const sigData = await sigRes.json();
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', sigData.apiKey);
    formData.append('timestamp', sigData.timestamp);
    formData.append('signature', sigData.signature);
    formData.append('folder', 'fbt_shopping');
    
    const resourceType = file.type.startsWith('video') ? 'video' : 'image';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${resourceType}/upload`;
    
    const uploadRes = await fetch(uploadUrl, { method: 'POST', body: formData });
    const uploadedFile = await uploadRes.json();
    return {
      url: uploadedFile.secure_url,
      type: resourceType as 'image' | 'video',
      public_id: uploadedFile.public_id
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (files.length === 0) {
      setError('Please select at least one image or video.');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Step 1: Upload all files to Cloudinary
      const mediaUrls: MediaItem[] = [];
      for (const file of files) {
         const result = await uploadToCloudinary(file);
         mediaUrls.push(result);
      }
      
      setIsUploading(false);
      setIsAnalyzing(true);

      // Step 2: Analyze with AI (no save yet)
      const analyzeRes = await fetch('/api/admin/products/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, media: mediaUrls })
      });

      if (!analyzeRes.ok) throw new Error('AI analysis failed');
      const analyzeData = await analyzeRes.json();

      // Step 3: Show confirmation modal
      setAiResult({ ...analyzeData.data, media: mediaUrls });
      setShowConfirm(true);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!aiResult) return;
    setIsSaving(true);
    
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: aiResult.rawDescription,
          media: aiResult.media,
          // Pass edited fields directly
          override: {
            title: aiResult.title,
            description: aiResult.description,
            price: aiResult.price,
            category: aiResult.category,
            colors: aiResult.colors,
            sizes: aiResult.sizes,
            fabric: aiResult.fabric,
            highlights: aiResult.highlights,
            pageContent: aiResult.pageContent,
            tags: aiResult.tags,
          }
        })
      });

      if (!res.ok) throw new Error('Failed to save product');
      
      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = <K extends keyof AIResult>(key: K, value: AIResult[K]) => {
    if (aiResult) setAiResult({ ...aiResult, [key]: value });
  };

  const removeColor = (index: number) => {
    if (aiResult) updateField('colors', aiResult.colors.filter((_, i) => i !== index));
  };

  const removeTag = (index: number) => {
    if (aiResult) updateField('tags', aiResult.tags.filter((_, i) => i !== index));
  };

  const removeSize = (index: number) => {
    if (aiResult) updateField('sizes', aiResult.sizes.filter((_, i) => i !== index));
  };

  const removeHighlight = (index: number) => {
    if (aiResult) updateField('highlights', aiResult.highlights.filter((_, i) => i !== index));
  };

  const isLoading = isUploading || isAnalyzing;

  return (
    <div className="animate-fade-in add-product-page">
      <h1 className="page-title">Add New Product</h1>
      
      <div className="glass-panel add-product-panel">
        {error && <div style={{ color: 'var(--color-primary)', marginBottom: '1rem', padding: '1rem', background: 'rgba(255, 51, 102, 0.1)', borderRadius: '8px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} className="add-product-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div className="add-product-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--color-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
              <span className="ai-banner-pill">✨ AI will analyze your images & description — then show you a preview to confirm before saving</span>
            </div>
          </div>

          <div className="add-product-section">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Media (Images/Videos)</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Select all media files. AI analyzes every image for colors, category, and details.
            </p>
            
            <div className="media-grid">
              {previews.map((preview, i) => (
                <div key={i} className="media-thumb">
                  {preview.type === 'video' ? (
                     <video src={preview.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                     <img src={preview.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="preview" />
                  )}
                  <button 
                    type="button"
                    onClick={() => removeFile(i)}
                    style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', color: 'white', border: 'none', cursor: 'pointer', padding: 4 }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <label className="upload-tile">
                <Upload size={24} />
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,video/*" 
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
          
          <div className="add-product-section">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Detailed Description</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Include price, colors, sizes, fabric — AI extracts everything and shows you a preview.
            </p>
            <textarea 
              required
              className="input-field" 
              rows={6}
              placeholder="e.g. Premium Georgette Saree with golden zari border. Price: ₹1899. Colors: Royal Yellow, Rani Pink, Peacock Teal. 5.5 Meters with blouse piece."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
          
          <button type="submit" className="btn btn-primary add-product-submit" disabled={isLoading} style={{ alignSelf: 'flex-start', minWidth: '200px' }}>
            {isUploading ? <><Loader2 size={18} className="loader" style={{marginRight: 8, borderWidth: '2px'}} /> Uploading...</>
             : isAnalyzing ? <><Sparkles size={18} style={{marginRight: 8}} /> AI Analyzing...</>
             : <><Sparkles size={18} style={{marginRight: 8}} /> Analyze & Preview</>}
          </button>
          
        </form>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CONFIRMATION MODAL
          ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showConfirm && aiResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && setShowConfirm(false)}
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
                maxWidth: '700px',
                maxHeight: '85vh',
                overflow: 'auto',
                padding: '2rem',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #FF3366, #00C2FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={20} color="white" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>AI Analysis Complete</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Review and edit before saving</p>
                  </div>
                </div>
                <button onClick={() => setShowConfirm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 8 }}>
                  <X size={20} />
                </button>
              </div>

              {/* Media thumbnails */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {aiResult.media.filter(m => m.type === 'image').slice(0, 5).map((m, i) => (
                  <img key={i} src={m.url} alt="" style={{ width: 60, height: 75, borderRadius: 8, objectFit: 'cover', border: '2px solid var(--border-light)' }} />
                ))}
              </div>

              {/* Editable fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Title */}
                <FieldGroup label="Title" icon={<Edit3 size={14} />}>
                  <input
                    className="input-field"
                    value={aiResult.title}
                    onChange={e => updateField('title', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </FieldGroup>

                {/* Price + Category row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <FieldGroup label="Price (₹)" icon={<Star size={14} />}>
                    <input
                      type="number"
                      className="input-field"
                      value={aiResult.price}
                      onChange={e => updateField('price', Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </FieldGroup>
                  <FieldGroup label="Category" icon={<Shirt size={14} />}>
                    <select
                      className="input-field"
                      value={aiResult.category}
                      onChange={e => updateField('category', e.target.value as 'saree' | 'dress')}
                      style={{ width: '100%' }}
                    >
                      <option value="saree">Saree</option>
                      <option value="dress">Dress / Lehenga</option>
                    </select>
                  </FieldGroup>
                </div>

                {/* Colors */}
                <FieldGroup label={`Colors (${aiResult.colors.length})`} icon={<Palette size={14} />}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {aiResult.colors.map((color, i) => (
                      <span key={i} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.3rem 0.7rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 500,
                        background: 'rgba(0,194,255,0.1)', border: '1px solid rgba(0,194,255,0.2)', color: '#00C2FF'
                      }}>
                        {color}
                        <button onClick={() => removeColor(i)} style={{ background: 'none', border: 'none', color: '#00C2FF', cursor: 'pointer', padding: 0, display: 'flex' }}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {aiResult.colors.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No colors detected</span>}
                  </div>
                </FieldGroup>

                {/* Sizes */}
                <FieldGroup label={`Sizes (${aiResult.sizes.length})`} icon={<Ruler size={14} />}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {aiResult.sizes.map((size, i) => (
                      <span key={i} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500,
                        background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.2)', color: '#FF3366'
                      }}>
                        {size}
                        <button onClick={() => removeSize(i)} style={{ background: 'none', border: 'none', color: '#FF3366', cursor: 'pointer', padding: 0, display: 'flex' }}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {aiResult.sizes.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No sizes detected</span>}
                  </div>
                </FieldGroup>

                {/* Fabric */}
                <FieldGroup label="Fabric" icon={<Shirt size={14} />}>
                  <input
                    className="input-field"
                    value={aiResult.fabric}
                    onChange={e => updateField('fabric', e.target.value)}
                    placeholder="e.g. Georgette, Silk, Cotton"
                    style={{ width: '100%' }}
                  />
                </FieldGroup>

                {/* Tags */}
                <FieldGroup label={`AI Tags (${aiResult.tags.length})`} icon={<Tag size={14} />}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {aiResult.tags.map((tag, i) => (
                      <span key={i} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)'
                      }}>
                        {tag}
                        <button onClick={() => removeTag(i)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    {aiResult.tags.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No tags</span>}
                  </div>
                </FieldGroup>

                {/* Highlights */}
                {aiResult.highlights.length > 0 && (
                  <FieldGroup label="Highlights" icon={<Check size={14} />}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {aiResult.highlights.map((h, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <Check size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                          <span style={{ flex: 1 }}>{h}</span>
                          <button onClick={() => removeHighlight(i)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </FieldGroup>
                )}

                {/* Description */}
                <FieldGroup label="Description" icon={<Edit3 size={14} />}>
                  <textarea
                    className="input-field"
                    rows={4}
                    value={aiResult.description}
                    onChange={e => updateField('description', e.target.value)}
                    style={{ resize: 'vertical', width: '100%' }}
                  />
                </FieldGroup>

              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{
                    padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)',
                    background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSave}
                  disabled={isSaving}
                  style={{
                    padding: '0.75rem 2rem', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #FF3366, #E62E5C)', color: 'white',
                    cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(255,51,102,0.3)'
                  }}
                >
                  {isSaving ? <><Loader2 size={16} className="loader" style={{ borderWidth: '2px' }} /> Saving...</> : <><Check size={16} /> Confirm & Save</>}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FieldGroup({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {icon} {label}
      </label>
      {children}
    </div>
  );
}
