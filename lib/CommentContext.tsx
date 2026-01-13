'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CommentContextType {
  isOpen: boolean;
  postId: string | null;
  postTitle: string | null;
  openComments: (postId: string, postTitle: string) => void;
  closeComments: () => void;
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

export function CommentProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState<string | null>(null);

  const openComments = (id: string, title: string) => {
    setPostId(id);
    setPostTitle(title);
    setIsOpen(true);
  };

  const closeComments = () => {
    setIsOpen(false);
  };

  return (
    <CommentContext.Provider value={{ isOpen, postId, postTitle, openComments, closeComments }}>
      {children}
    </CommentContext.Provider>
  );
}

export function useCommentSidebar() {
  const context = useContext(CommentContext);
  if (context === undefined) {
    throw new Error('useCommentSidebar must be used within a CommentProvider');
  }
  return context;
}
