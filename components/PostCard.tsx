'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Edit3, Trash2, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import AuthModal from './AuthModal';
import CommentSection from './CommentSection';

import { useCommentSidebar } from '@/lib/CommentContext';
import { usePopup } from '@/lib/PopupContext';

interface PostCardProps {
  post: any;
  currentUser: any;
}

function EditPostModal({ isOpen, onClose, post }: { isOpen: boolean; onClose: () => void; post: any }) {
  const { showAlert } = usePopup();
  const [formData, setFormData] = useState({
    title: post.title,
    content: post.content,
    image: post.image || '',
    tags: post.tags?.join(', ') || ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>(post.image?.includes('supabase.co') ? 'file' : 'url');

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
      if (data.url) {
        setFormData(prev => ({ ...prev, image: data.url }));
      }
      } catch (err) {
        console.error('Upload failed:', err);
        showAlert('Upload failed. Please try again.', 'Upload Error');
      } finally {

      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/posts/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      }),
    });

    if (res.ok) {
      onClose();
      window.location.reload();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-101 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-2xl p-8 shadow-2xl relative overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8">Edit Transmission</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-[0.2em] mb-2 text-gray-500">Title</label>
            <input required className="w-full bg-gray-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 ring-black dark:ring-white outline-none transition-all" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-[0.2em] mb-2 text-gray-500">Content</label>
            <textarea required rows={4} className="w-full bg-gray-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 ring-black dark:ring-white outline-none transition-all" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
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
                  id="edit-image-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="edit-image-upload"
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
            <input className="w-full bg-gray-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 ring-black dark:ring-white outline-none transition-all" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} />
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} className="px-6 py-3 font-bold uppercase tracking-widest text-sm hover:opacity-60 transition-opacity">Abort</button>
            <button type="submit" disabled={loading || uploading} className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform disabled:opacity-50">
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PostCard({ post, currentUser }: PostCardProps) {
  const { showAlert, showConfirm } = usePopup();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(post.likes || 0);
  const [commentCount, setCommentCount] = useState<number>(post.comments_count || 0);
  const [isSaved, setIsSaved] = useState(false);

  React.useEffect(() => {
    setCommentCount(post.comments_count || 0);
  }, [post.comments_count]);

  const { openComments } = useCommentSidebar();

  const isAuthor = currentUser?.id === post.author_id || currentUser?.id === post.author?.id;
  const isAdmin = currentUser?.role === 'admin';

    const handleDelete = async () => {
      showConfirm(
        'Are you sure you want to delete this transmission?',
        async () => {
          const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
          if (res.ok) window.location.reload();
        },
        'Confirm Deletion'
      );
    };

    const handleShare = async () => {
      const url = `${window.location.origin}/posts/${post.id}`;
      if (navigator.share) {
        try {
          await navigator.share({
            title: post.title,
            text: post.content,
            url: url,
          });
        } catch (err) {
          console.error('Share failed:', err);
        }
      } else {
        try {
          await navigator.clipboard.writeText(url);
          showAlert('Transmission link copied to clipboard!', 'Shared');
        } catch (err) {
          showAlert('Failed to copy link. Please copy it manually.', 'Error');
        }
      }
    };


  const handleInteraction = (action: () => void) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    action();
  };

  const handleLike = () => {
    handleInteraction(async () => {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIsLiked(!isLiked);
        setLikeCount(data.likes);
      }
    });
  };

  const handleSave = () => {
    handleInteraction(async () => {
      const res = await fetch(`/api/posts/${post.id}/save`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved);
      }
    });
  };

  return (
    <>
      <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl overflow-hidden mb-8 shadow-sm group">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <Link href={`/profile/${post.author?.username || ''}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 border border-black/5 dark:border-white/5 flex items-center justify-center font-bold text-xs overflow-hidden">
              {post.author?.avatar ? (
                <img
                  src={post.author.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'User')}&background=random`;
                  }}
                />
              ) : (
                post.author?.name?.charAt(0).toUpperCase() || 'V'
              )}
            </div>
            <div>
              <p className="font-bold text-sm tracking-tight">{post.author?.name || 'Vortex User'}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </Link>

          {(isAuthor || isAdmin) && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <button
                      onClick={() => { setIsEditModalOpen(true); setShowDropdown(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" /> Edit Transmission
                    </button>
                    <button
                      onClick={() => { handleDelete(); setShowDropdown(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          <Link href={`/posts/${post.id}`}>
            <h3 className="text-xl font-black tracking-tighter mb-2 leading-tight uppercase italic group-hover:tracking-normal transition-all duration-500 hover:underline decoration-2 underline-offset-4">{post.title}</h3>
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed mb-4">
            {post.content}
          </p>
          {post.image && (
            <div className="aspect-video bg-gray-100 dark:bg-zinc-900 rounded-lg overflow-hidden border border-black/5 dark:border-white/5 grayscale hover:grayscale-0 transition-all duration-700">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/1200x800?text=Transmission+Visual+Unavailable';
                }}
              />
            </div>
          )}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag: string, i: number) => (
                <span key={i} className="text-[10px] font-black uppercase tracking-widest text-gray-400">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1.5 transition-colors ${isLiked ? 'text-black dark:text-white' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs font-bold">{likeCount}</span>
            </button>
            <button
              onClick={() => openComments(post.id, post.title)}
              className="flex items-center space-x-1.5 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs font-bold">{commentCount}</span>
            </button>
              <button 
                onClick={handleShare}
                className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                <Share2 className="w-6 h-6" />
              </button>

          </div>
          <button
            onClick={handleSave}
            className={`transition-colors ${isSaved ? 'text-black dark:text-white' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
          >
            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <EditPostModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} post={post} />
    </>
  );
}

