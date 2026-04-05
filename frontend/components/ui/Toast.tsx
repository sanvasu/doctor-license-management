'use client';

import { useState } from 'react';

export type ToastVariant = 'success' | 'error';

export interface ToastMessage {
  id:      number;
  message: string;
  variant: ToastVariant;
}

// ── Toast item ────────────────────────────────────────────────────────────────

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  const isSuccess = toast.variant === 'success';

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3
                  shadow-lg bg-white min-w-[300px] max-w-sm
                  ${isSuccess
                    ? 'border-emerald-200'
                    : 'border-red-200'}`}
    >
      {/* Icon */}
      <span className={`text-lg ${isSuccess ? 'text-emerald-500' : 'text-red-500'}`}>
        {isSuccess ? '✓' : '✕'}
      </span>

      {/* Message */}
      <p className="flex-1 text-sm font-medium text-slate-700">
        {toast.message}
      </p>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

// ── Toaster container ─────────────────────────────────────────────────────────

interface ToasterProps {
  toasts:  ToastMessage[];
  dismiss: (id: number) => void;
}

export function Toaster({ toasts, dismiss }: ToasterProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}

// ── useToast hook ─────────────────────────────────────────────────────────────

let toastCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const add = (message: string, variant: ToastVariant) => {
    const id = ++toastCounter;
    setToasts(t => [...t, { id, message, variant }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => dismiss(id), 4000);
  };

  const dismiss = (id: number) =>
    setToasts(t => t.filter(toast => toast.id !== id));

  const success = (message: string) => add(message, 'success');
  const error   = (message: string) => add(message, 'error');

  return { toasts, dismiss, success, error };
}