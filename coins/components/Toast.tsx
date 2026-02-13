'use client';

import { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor = {
    success: 'bg-green-500/20 border-green-500/50 text-green-200',
    error: 'bg-red-500/20 border-red-500/50 text-red-200',
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-200',
  }[type];

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${bgColor} shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-auto hover:opacity-70 transition-opacity"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
