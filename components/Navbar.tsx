'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, LogOut, LayoutDashboard, PlusSquare, Search, X, Upload, Image as ImageIcon } from 'lucide-react';
import AuthModal from './AuthModal';
import NotificationsDropdown from './NotificationsDropdown';
import { usePopup } from '@/lib/PopupContext';

function CreatePostModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { showAlert } = usePopup();
  const [formData, setFormData] = useState({ title: '', content: '', image: '', tags: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('file');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      if (data.url) {
        setFormData(prev => ({ ...prev, image: data.url }));
      }
      } catch (err: any) {
        console.error('Upload failed:', err);
        showAlert(`Upload failed: ${err.message || 'Please try again.'}`, 'Upload Error');
      } finally {

      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      }),
    });

    if (res.ok) {
      onClose();
      setFormData({ title: '', content: '', image: '', tags: '' });
      window.location.reload();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-2xl p-8 shadow-2xl relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8">New Transmission</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-[0.2em] mb-2 text-gray-500">Title</label>
            <input
              required
              className="w-full bg-gray-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 ring-black dark:ring-white outline-none transition-all"
              placeholder="Give your transmission a title..."
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-[0.2em] mb-2 text-gray-500">Content</label>
            <textarea
              required
              rows={4}
              className="w-full bg-gray-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 ring-black dark:ring-white outline-none transition-all"
              placeholder="What's happening in the vortex?"
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-[0.2em] text-gray-500">Visual Data</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${uploadMode === 'file' ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white'}`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${uploadMode === 'url' ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white'}`}
                >
                  URL
                </button>
              </div>
            </div>

            {uploadMode === 'file' ? (
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="image-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-black/10 dark:border-white/10 rounded-xl cursor-pointer hover:border-black dark:hover:border-white transition-all bg-gray-50 dark:bg-zinc-900 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black dark:border-white" />
                  ) : formData.image ? (
                    <div className="relative w-full h-full p-2">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-contain rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Upload+Preview+Failed';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                        <Upload className="text-white w-6 h-6" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Image</span>
                    </>
                  )}
                </label>
              </div>
            ) : (
              <div className="relative">
                <input
                  className="w-full bg-gray-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 ring-black dark:ring-white outline-none transition-all"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                />
                {formData.image && (
                  <div className="mt-4 h-32 rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                    }} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-[0.2em] mb-2 text-gray-500">Tags</label>
            <input
              className="w-full bg-gray-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 ring-black dark:ring-white outline-none transition-all"
              placeholder="tech, art, void"
              value={formData.tags}
              onChange={e => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 font-bold uppercase tracking-widest text-sm hover:opacity-60 transition-opacity"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform disabled:opacity-50"
            >
              {loading ? 'Transmitting...' : 'Transmit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/');
    }
  };

  return (
    <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-100 dark:bg-zinc-900 rounded-lg px-3 py-1.5 w-64 border border-transparent focus-within:border-black dark:focus-within:border-white transition-all">
      <Search className="w-4 h-4 text-gray-500" />
      <input
        type="text"
        placeholder="Search posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full outline-none"
      />
    </form>
  );
}

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    setUser(null);
    window.location.reload();
  };

  const handlePlusClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white dark:bg-black border-b border-black/10 dark:border-white/10 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter hover:opacity-80 transition-opacity">
            VORTEX
          </Link>

          <Suspense fallback={<div className="w-64 h-8 bg-gray-100 dark:bg-zinc-900 rounded-lg animate-pulse" />}>
            <SearchInput />
          </Suspense>

          <div className="flex items-center space-x-4 md:space-x-6">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/admin" className="hover:opacity-60 transition-opacity">
                    <LayoutDashboard className="w-6 h-6" />
                  </Link>
                )}
                <button onClick={handlePlusClick} className="hover:opacity-60 transition-opacity">
                  <PlusSquare className="w-6 h-6" />
                </button>
                <NotificationsDropdown />
                <Link href={`/profile/${user.username}`} className="hover:opacity-60 transition-opacity">
                  <User className="w-6 h-6" />
                </Link>
                <button onClick={handleSignOut} className="hover:opacity-60 transition-opacity">
                  <LogOut className="w-6 h-6" />
                </button>
              </>
            ) : (
              <>
                <button onClick={handlePlusClick} className="hover:opacity-60 transition-opacity">
                  <PlusSquare className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-black dark:bg-white text-white dark:text-black px-5 py-1.5 rounded-full text-sm font-bold hover:scale-105 transition-transform"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </>
  );
}
