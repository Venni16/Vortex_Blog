'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';

function Feed() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = query ? `/api/posts?q=${encodeURIComponent(query)}` : '/api/posts';
        const [postsRes, userRes] = await Promise.all([
          fetch(url),
          fetch('/api/auth/me')
        ]);
        const postsData = await postsRes.json();
        const userData = await userRes.json();
        setPosts(postsData.posts || []);
        setUser(userData.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query]);

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-black tracking-[calc(-0.05em)] italic uppercase mb-2">
          {query ? `SEARCH: ${query}` : 'VORTEX FEED'}
        </h1>
        <div className="h-1 w-20 bg-black dark:bg-white mx-auto" />
      </header>

      {loading ? (
        <div className="space-y-8 mt-28 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-100 dark:bg-zinc-900 rounded-xl" />
          ))}
        </div>
      ) : (
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post: any) => (
                <PostCard key={post.id} post={post} currentUser={user} />
              ))
            ) : (

            <div className="text-center py-20 border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl">
              <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">No transmissions found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Navbar />
      
      <Suspense fallback={<div className="min-h-screen" />}>
        <Feed />
      </Suspense>

      <footer className="py-12 border-t border-black/5 dark:border-white/5 text-center">
        <p className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase">
          &copy; 2026 VORTEX BLOG // BEYOND THE VOID
        </p>
      </footer>
    </main>
  );
}
