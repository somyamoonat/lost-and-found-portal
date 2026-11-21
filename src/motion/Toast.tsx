import React, { createContext, useContext, useState, useCallback, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Undo2 } from "lucide-react";
import { springs, durations, easings } from "./tokens";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastMessage, "id">) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastMessage, "id">) => {
      const id = "toast-" + Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { ...toast, id };

      setToasts((prev) => [...prev, newToast]);

      const toastDuration = toast.duration ?? 5000;
      if (toastDuration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, toastDuration);
      }

      return id;
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {/* Toast viewport */}
      <div
        role="region"
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={() => dismissToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const labelId = useId();

  return (
    <motion.div
      layout
      drag="x"
      dragConstraints={{ left: 0, right: 300 }}
      dragElastic={{ left: 0.1, right: 0.7 }}
      onDragEnd={(_e, info) => {
        if (info.offset.x > 80) {
          onDismiss();
        }
      }}
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        x: 120,
        scale: 0.96,
        transition: { duration: durations.uiExit, ease: easings.out },
      }}
      transition={springs.soft}
      role="status"
      aria-live="polite"
      aria-labelledby={labelId}
      className="pointer-events-auto bg-surface border border-line rounded-[6px] p-3.5 shadow-elevated flex items-start gap-3 w-full text-ink cursor-grab active:cursor-grabbing select-none"
    >
      <div className="flex-1 min-w-0">
        <h4 id={labelId} className="text-[14px] font-semibold text-ink leading-tight">
          {toast.title}
        </h4>
        {toast.description && (
          <p className="text-[13px] text-ink-muted leading-snug mt-1">
            {toast.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        {toast.action && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toast.action?.onClick();
              onDismiss();
            }}
            className="inline-flex items-center gap-1 px-2 py-1 text-[12px] font-medium bg-green-tint text-campus-green rounded-[6px] hover:bg-[#D5E6DF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-green"
          >
            <Undo2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            {toast.action.label}
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          aria-label="Dismiss notification"
          className="text-ink-muted hover:text-ink p-1 rounded-[6px] hover:bg-paper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-green"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </motion.div>
  );
};
