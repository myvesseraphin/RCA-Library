import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { subscribeToUnauthorized } from './api';

type ToastVariant = 'success' | 'error' | 'info';

type ToastRecord = {
  id: number;
  message: string;
  title?: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (payload: Omit<ToastRecord, 'id'>) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_STYLES: Record<ToastVariant, {
  container: string;
  icon: string;
  Icon: typeof CheckCircle2;
}> = {
  success: {
    container: 'border-brand-primary/20 bg-white/95 text-brand-primary shadow-brand-primary/15',
    icon: 'text-brand-primary',
    Icon: CheckCircle2,
  },
  error: {
    container: 'border-brand-primary/20 bg-white/95 text-brand-primary shadow-brand-primary/15',
    icon: 'text-brand-primary',
    Icon: AlertCircle,
  },
  info: {
    container: 'border-brand-primary/20 bg-white/95 text-brand-primary shadow-brand-primary/15',
    icon: 'text-brand-primary',
    Icon: Info,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const showToast = useCallback((payload: Omit<ToastRecord, 'id'>) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { ...payload, id }]);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToUnauthorized(() => {
      showToast({
        variant: 'error',
        title: 'Session expired',
        message: 'Please sign in again to continue.',
      });
    });

    return unsubscribe;
  }, [showToast]);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    if (toasts.length === 0) {
      return undefined;
    }

    const timers = toasts.map((toast) => window.setTimeout(() => {
      removeToast(toast.id);
    }, 4000));

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [removeToast, toasts]);

  const value = useMemo<ToastContextValue>(() => ({
    showToast,
    success(message, title) {
      showToast({ variant: 'success', message, title });
    },
    error(message, title) {
      showToast({ variant: 'error', message, title });
    },
    info(message, title) {
      showToast({ variant: 'info', message, title });
    },
  }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,24rem)] flex-col gap-3">
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.variant];
          const Icon = style.Icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${style.container}`}
            >
              <div className={`mt-0.5 ${style.icon}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                {toast.title ? (
                  <p className="text-sm font-semibold">{toast.title}</p>
                ) : null}
                <p className="text-sm leading-5">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded-full p-1 text-current/60 transition hover:bg-brand-primary/8 hover:text-current"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider.');
  }

  return context;
}
