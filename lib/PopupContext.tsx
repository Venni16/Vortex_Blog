'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PopupOptions {
  title?: string;
  message: string;
  type: 'alert' | 'confirm';
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface PopupContextType {
  showAlert: (message: string, title?: string) => void;
  showConfirm: (message: string, onConfirm: () => void, title?: string) => void;
  popup: PopupOptions | null;
  closePopup: () => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function PopupProvider({ children }: { children: ReactNode }) {
  const [popup, setPopup] = useState<PopupOptions | null>(null);

  const showAlert = (message: string, title: string = 'Notice') => {
    setPopup({ message, title, type: 'alert' });
  };

  const showConfirm = (message: string, onConfirm: () => void, title: string = 'Confirm') => {
    setPopup({
      message,
      title,
      type: 'confirm',
      onConfirm: () => {
        onConfirm();
        setPopup(null);
      },
      onCancel: () => setPopup(null)
    });
  };

  const closePopup = () => setPopup(null);

  return (
    <PopupContext.Provider value={{ showAlert, showConfirm, popup, closePopup }}>
      {children}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
}
