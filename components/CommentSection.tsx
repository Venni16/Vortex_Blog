'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Send, Reply, Trash2, User, CornerDownRight, XCircle } from 'lucide-react';
import Link from 'next/link';
import { usePopup } from '@/lib/PopupContext';

interface CommentSectionProps {
  postId: string;
  currentUser: any;
  onAuthRequired: () => void;
  onCommentCountChange?: (count: number) => void;
  isSidebar?: boolean;
}

  export default function CommentSection({ postId, currentUser, onAuthRequired, onCommentCountChange, isSidebar }: CommentSectionProps) {
    const { showConfirm } = usePopup();
    const [comments, setComments] = useState<any[]>([]);

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      const data = await res.json();
      const fetchedComments = data.comments || [];
      setComments(fetchedComments);
      if (onCommentCountChange) {
        onCommentCountChange(fetchedComments.length);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onAuthRequired();
      return;
    }
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        content,
        parentComment: replyingTo?.id || null
      }),

      });
      if (res.ok) {
        setContent('');
        setReplyingTo(null);
        await fetchComments();
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setLoading(false);
    }
  };

    const handleDelete = async (commentId: string) => {
      showConfirm(
        'Delete this comment?',
        async () => {
          try {
            const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
            if (res.ok) {
              await fetchComments();
            }
          } catch (err) {
            console.error('Failed to delete comment:', err);
          }
        },
        'Delete Comment'
      );
    };


  // Organize comments into a tree
  const commentTree = useMemo(() => {
    const map = new Map();
    const roots: any[] = [];

    comments.forEach(comment => {
      map.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach(comment => {
      if (comment.parent_comment_id) {
        const parent = map.get(comment.parent_comment_id);
        if (parent) {
          parent.replies.push(map.get(comment.id));
        } else {
          // Parent might be missing (deleted?)
          roots.push(map.get(comment.id));
        }
      } else {
        roots.push(map.get(comment.id));
      }
    });

    return roots;
  }, [comments]);

    const CommentItem = ({ comment, depth = 0 }: { comment: any; depth?: number }) => {
      const isAuthor = currentUser?.id === comment.author?.id;
      const isAdmin = currentUser?.role === 'admin';

      return (
        <div className={`group ${depth > 0 ? 'mt-4 ml-6 pl-4 border-l border-black/5 dark:border-white/5' : 'mt-6 first:mt-0'}`}>
          <div className="flex items-start gap-3">
            <Link href={`/profile/${comment.author?.username || comment.author?.id || ''}`} className="shrink-0">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black border border-black/5 dark:border-white/5 overflow-hidden hover:opacity-80 transition-opacity">
                {comment.author?.avatar ? (
                  <img 
                    src={comment.author.avatar} 
                    alt="" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.name || 'User')}&background=random`;
                    }}
                  />
                ) : (
                  <User className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </Link>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${comment.author?.username || comment.author?.id || ''}`} className="text-[10px] font-black uppercase tracking-tight hover:underline">
                    {comment.author?.name}
                  </Link>
                  <span className="text-[8px] text-gray-400 uppercase">{new Date(comment.created_at).toLocaleDateString()}</span>
                </div>

              {(isAuthor || isAdmin) && (
                <button 
                  onClick={() => handleDelete(comment.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{comment.content}</p>
            
            <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => setReplyingTo(comment)}
                className="text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-1"
              >
                <Reply className="w-2.5 h-2.5" /> Reply
              </button>
            </div>

            {/* Render Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-2">
                {comment.replies.map((reply: any) => (
                  <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${!isSidebar ? 'mt-4 pt-4 border-t border-black/5 dark:border-white/5' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          Transmissions ({comments.length})
        </h4>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[200px]">
        {commentTree.length > 0 ? (
          commentTree.map((comment: any) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-zinc-900 flex items-center justify-center mb-4">
              <CornerDownRight className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No transmissions received yet</p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5">
        {replyingTo && (
          <div className="mb-3 flex items-center justify-between bg-gray-50 dark:bg-zinc-900 px-3 py-2 rounded-lg border border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Reply className="w-3 h-3 text-gray-400" />
              <p className="text-[10px] font-medium text-gray-500">
                Replying to <span className="font-black text-black dark:text-white">{replyingTo.author?.name}</span>
              </p>
            </div>
            <button onClick={() => setReplyingTo(null)}>
              <XCircle className="w-4 h-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors" />
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="relative">
          <input 
            type="text" 
            placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
            className="w-full bg-gray-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 ring-black dark:ring-white transition-all pr-12"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <button 
            disabled={loading || !content.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-lg disabled:opacity-30 hover:scale-105 transition-transform"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
