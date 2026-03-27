'use client';

import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  public_id: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{url: string, type: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

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
    // 1. Get signature
    const sigRes = await fetch('/api/admin/upload', { method: 'POST' });
    const sigData = await sigRes.json();
    
    // 2. Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', sigData.apiKey);
    formData.append('timestamp', sigData.timestamp);
    formData.append('signature', sigData.signature);
    formData.append('folder', 'fbt_shopping');
    
    // Wait for the prompt's video vs image URL
    const resourceType = file.type.startsWith('video') ? 'video' : 'image';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${resourceType}/upload`;
    
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });
    
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
      
      // Upload all files in parallel
      const mediaUrls: MediaItem[] = [];
      for (const file of files) {
         const result = await uploadToCloudinary(file);
         mediaUrls.push(result);
      }
      
      // Submit to our backend — title and price are extracted by AI from description
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          media: mediaUrls
        })
      });
      
      if (!res.ok) throw new Error('Failed to create product');
      
      router.push('/admin/products');
      router.refresh();
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      <h1 className="page-title">Add New Product</h1>
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        {error && <div style={{ color: 'var(--color-primary)', marginBottom: '1rem', padding: '1rem', background: 'rgba(255, 51, 102, 0.1)', borderRadius: '8px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--color-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
              <span style={{background:'rgba(0,194,255,0.1)',padding:'0.35rem 0.75rem',borderRadius:'99px'}}>✨ AI-Powered: Title, price & category will be detected automatically from your description</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Media (Images/Videos)</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Select all media files. AI will automatically determine if this is a Dress or a Saree based on your detailed description.
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              {previews.map((preview, i) => (
                <div key={i} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden' }}>
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
              
              <label style={{ width: '100px', height: '100px', borderRadius: '8px', border: '2px dashed var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
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
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Detailed Description (For AI & Users)</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Provide all details here. Example: "A red silk authentic Kanjivaram Saree with golden border."
            </p>
            <textarea 
              required
              className="input-field" 
              rows={6}
              placeholder="Enter all information here..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={isUploading} style={{ alignSelf: 'flex-start', minWidth: '150px' }}>
            {isUploading ? <><Loader2 size={18} className="loader" style={{marginRight: 8, borderWidth: '2px'}} /> Uploading...</> : 'Save Product'}
          </button>
          
        </form>
      </div>
    </div>
  );
}
