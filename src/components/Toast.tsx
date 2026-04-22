import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ToastType = 'success' | 'error' | 'info';

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const toastClasses: Record<ToastType, { border: string; icon: string }> = {
  success: {
    border: 'border-l-4 border-l-emerald-500',
    icon: 'text-emerald-600',
  },
  error: {
    border: 'border-l-4 border-l-red-500',
    icon: 'text-red-600',
  },
  info: {
    border: 'border-l-4 border-l-blue-500',
    icon: 'text-blue-600',
  },
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 3500) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      const nextToast: ToastItem = { id, message, type, duration };

      setToasts((prev) => [...prev, nextToast]);
      window.setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[min(92vw,24rem)] flex-col gap-3">
        {toasts.map((toast) => {
          const style = toastClasses[toast.type];
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-xl bg-white p-4 text-sm text-main shadow-lg ring-1 ring-black/5 ${style.border}`}
            >
              <div className="flex items-start gap-3">
                <span className={`text-base leading-none ${style.icon}`}>●</span>
                <p className="leading-5">{toast.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }

  return context;
};
