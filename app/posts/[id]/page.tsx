'use client';

import React, { useState, useEffect, use } from 'react';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import CommentSection from '@/components/CommentSection';
import { usePopup } from '@/lib/PopupContext';

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { showAlert } = usePopup();
  const { id } = use(params);
  const [post, setPost] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [postRes, userRes] = await Promise.all([
          fetch(`/api/posts/${id}`),
          fetch('/api/auth/me')
        ]);
        
        if (postRes.ok) {
           const postData = await postRes.json();
           setPost(postData.post);
        }
        
        if (userRes.ok) {
           const userData = await userRes.json();
           setCurrentUser(userData.user);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
     return (
        <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
          <Navbar />
          <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-96 bg-gray-100 dark:bg-zinc-900 rounded-xl" />
              <div className="h-8 bg-gray-100 dark:bg-zinc-900 rounded w-3/4" />
              <div className="h-4 bg-gray-100 dark:bg-zinc-900 rounded w-1/2" />
            </div>
          </div>
        </main>
     );
  }

  if (!post) {
      return (
        <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
          <Navbar />
          <div className="max-w-2xl mx-auto px-4 py-20 text-center">
             <h1 className="text-3xl font-black italic uppercase mb-4">Signal Lost</h1>
             <p className="text-gray-500 font-bold uppercase tracking-widest">This transmission does not exist.</p>
          </div>
        </main>
      );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <PostCard post={post} currentUser={currentUser} />
          
          <div className="mt-8 border-t border-black/10 dark:border-white/10 pt-8">
              <h3 className="text-xl font-black italic uppercase mb-6 tracking-tight">Frequencies</h3>
              <CommentSection 
                  postId={post.id} 
                  currentUser={currentUser} 
                    onAuthRequired={() => {
                        showAlert("Please login to transmit frequencies.", "Authentication Required");
                    }} 

                  onCommentCountChange={(count) => {
                      setPost(prev => prev ? { ...prev, comments_count: count } : null);
                  }}
              />
          </div>
        </div>
    </main>
  );
}
