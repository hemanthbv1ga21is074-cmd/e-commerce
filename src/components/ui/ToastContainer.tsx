import React from 'react';
import { useToastStore } from '../../store/useToastStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-primary text-white rounded-xl shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />}
            {toast.type === 'info' && <Info size={16} className="text-sky-400 flex-shrink-0" />}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="text-white/60 hover:text-white p-0.5 rounded transition-colors"
            aria-label="Dismiss toast"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
