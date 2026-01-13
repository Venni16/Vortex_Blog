'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', username: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/signin' : '/api/auth/signup';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.reload();
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl p-8"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-black tracking-tighter mb-2">
                {isLogin ? 'WELCOME BACK' : 'JOIN VORTEX'}
              </h2>
              <p className="text-gray-500 text-sm">
                {isLogin ? 'Sign in to continue your journey' : 'Create an account to start sharing'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 ml-1">Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="John Doe"
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                        value={formData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 ml-1">Username</label>
                      <input 
                        required
                        type="text" 
                        placeholder="johndoe"
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                        value={formData.username}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, username: e.target.value})}
                      />
                    </div>
                  </>
                )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 ml-1">Email</label>
                <input 
                  required
                  type="email" 
                  placeholder="vortex@example.com"
                  className="w-full bg-gray-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 ml-1">Password</label>
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-gray-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  value={formData.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

              <button 
                disabled={loading}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'PROCESSING...' : (isLogin ? 'SIGN IN' : 'SIGN UP')}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-bold hover:underline underline-offset-4"
              >
                {isLogin ? "DON'T HAVE AN ACCOUNT? SIGN UP" : "ALREADY HAVE AN ACCOUNT? SIGN IN"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
