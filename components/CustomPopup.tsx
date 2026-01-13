'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { usePopup } from '@/lib/PopupContext';

export default function CustomPopup() {
  const { popup, closePopup } = usePopup();

  if (!popup) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl relative"
        >
          <button
            onClick={closePopup}
            className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`p-4 rounded-full ${popup.type === 'confirm' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-500' : 'bg-red-50 dark:bg-red-950/30 text-red-500'}`}>
              {popup.type === 'confirm' ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase italic tracking-tighter">{popup.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {popup.message}
              </p>
            </div>

            <div className="flex w-full gap-3 pt-4">
              {popup.type === 'confirm' ? (
                <>
                  <button
                    onClick={() => {
                      if (popup.onCancel) popup.onCancel();
                      closePopup();
                    }}
                    className="flex-1 px-6 py-3 border border-black/10 dark:border-white/10 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={popup.onConfirm}
                    className="flex-1 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button
                  onClick={closePopup}
                  className="w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
