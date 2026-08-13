import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        let bgClass = 'bg-slate-900 text-white border-slate-700';
        let Icon = Info;

        if (toast.type === 'success') {
          bgClass = 'bg-emerald-900 text-emerald-50 border-emerald-600';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          bgClass = 'bg-rose-900 text-rose-50 border-rose-600';
          Icon = XCircle;
        } else if (toast.type === 'warning') {
          bgClass = 'bg-amber-900 text-amber-50 border-amber-600';
          Icon = AlertTriangle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-3 ${bgClass}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm font-medium">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-80 hover:opacity-100 p-1 rounded-lg transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
