'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';
import { useCommentSidebar } from '@/lib/CommentContext';
import CommentSection from './CommentSection';
import { useEffect, useState } from 'react';

export default function CommentSidebar() {
  const { isOpen, postId, postTitle, closeComments } = useCommentSidebar();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => setCurrentUser(data?.user));
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeComments}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-all"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-black border-l border-black/10 dark:border-white/10 z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest leading-none">Transmissions</h2>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight line-clamp-1">{postTitle}</p>
                </div>
              </div>
              <button 
                onClick={closeComments}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {postId && (
                <CommentSection 
                  postId={postId} 
                  currentUser={currentUser} 
                  onAuthRequired={() => {}} // Handle this if needed
                  isSidebar={true}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
