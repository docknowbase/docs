// src/toast/domain/models/toast.ts
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  createdAt: Date;
}

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
}

export const TOAST_TYPES = {
  SUCCESS: "success" as const,
  ERROR: "error" as const,
  WARNING: "warning" as const,
  INFO: "info" as const,
};

export const TOAST_CONFIG = {
  [TOAST_TYPES.SUCCESS]: {
    className: "toast--success",
  },
  [TOAST_TYPES.ERROR]: {
    className: "toast--error",
  },
  [TOAST_TYPES.WARNING]: {
    className: "toast--warning",
  },
  [TOAST_TYPES.INFO]: {
    className: "toast--info",
  },
} as const;

// src/toast/domain/ports/toastPort.ts
export interface ToastPort {
  create(message: string, options: ToastOptions): Toast;
}

export const createToastPort = (): ToastPort => ({
  create: (message: string, options: ToastOptions): Toast => ({
    id: Math.random().toString(36).substr(2, 9),
    message,
    type: options.type || TOAST_TYPES.INFO,
    duration: options.duration || 5000,
    createdAt: new Date(),
  }),
});

// src/toast/domain/ports/toastStoragePort.ts
export interface ToastStoragePort {
  add(toast: Toast): Promise<Toast>;
  remove(id: string): Promise<string>;
  getAll(): Promise<Toast[]>;
}

// src/toast/application/toastService.ts
export interface ToastService {
  createToast(message: string, options?: ToastOptions): Promise<Toast>;
  removeToast(id: string): Promise<string>;
  getAllToasts(): Promise<Toast[]>;
}

export const createToastService = (
  toastPort: ToastPort,
  storagePort: ToastStoragePort
): ToastService => {
  const createToast = async (
    message: string,
    options: ToastOptions = {}
  ): Promise<Toast> => {
    const toast = toastPort.create(message, options);
    return storagePort.add(toast);
  };

  const removeToast = async (id: string): Promise<string> => {
    return storagePort.remove(id);
  };

  const getAllToasts = async (): Promise<Toast[]> => {
    return storagePort.getAll();
  };

  return {
    createToast,
    removeToast,
    getAllToasts,
  };
};

// src/toast/infrastructure/adapters/reactToastStorageAdapter.ts
import { useState, useCallback } from "react";
import { Toast, ToastStoragePort } from "../../domain/ports/toastStoragePort";

interface ReactToastStorageAdapter extends ToastStoragePort {
  toasts: Toast[];
}

export const createReactToastStorageAdapter = (): ReactToastStorageAdapter => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback(async (toast: Toast): Promise<Toast> => {
    setToasts((prev) => [...prev, toast]);
    return toast;
  }, []);

  const remove = useCallback(async (id: string): Promise<string> => {
    setToasts((prev) => {
      const toast = document.getElementById(`toast-${id}`);
      if (toast) {
        toast.classList.add("toast--animate-out");
      }

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);

      return prev;
    });
    return id;
  }, []);

  const getAll = useCallback(async (): Promise<Toast[]> => {
    return toasts;
  }, [toasts]);

  return {
    add,
    remove,
    getAll,
    toasts,
  };
};

// src/toast/presentation/components/Toast.tsx
import React, { useEffect } from "react";
import { AlertCircle, CheckCircle, XCircle, Info, X } from "lucide-react";
import classNames from "classnames";
import { Toast as ToastType } from "../../domain/models/toast";

interface ToastProps extends ToastType {
  onClose: (id: string) => void;
}

const ICON_MAP = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  duration = 5000,
  onClose,
  id,
}) => {
  const ToastIcon = ICON_MAP[type];

  useEffect(() => {
    if (duration !== Infinity) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose, id]);

  return (
    <div
      className={classNames(
        "toast",
        TOAST_CONFIG[type]?.className,
        "toast--animate-in"
      )}
      role="alert"
    >
      <div className="toast__icon">{ToastIcon && <ToastIcon size={20} />}</div>

      <div className="toast__content">
        <p className="toast__message">{message}</p>
      </div>

      <button
        className="toast__close"
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        <X size={18} />
      </button>

      {duration !== Infinity && (
        <div
          className="toast__progress"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
};

// src/toast/presentation/components/ToastContainer.tsx
import React from "react";
import { createPortal } from "react-dom";

interface ToastContainerProps {
  children: React.ReactNode;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ children }) => {
  return createPortal(
    <div className="toast-container">{children}</div>,
    document.body
  );
};

// src/toast/presentation/context/ToastContext.tsx
import React, { createContext, useContext } from "react";
import { Toast, ToastOptions } from "../../domain/models/toast";

interface ToastContextValue {
  createToast: (message: string, options?: ToastOptions) => Promise<Toast>;
  removeToast: (id: string) => Promise<string>;
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toastPort = createToastPort();
  const storageAdapter = createReactToastStorageAdapter();
  const toastService = createToastService(toastPort, storageAdapter);

  const value: ToastContextValue = {
    createToast: toastService.createToast,
    removeToast: toastService.removeToast,
    toasts: storageAdapter.toasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer>
        {value.toasts.map((toast) => (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className="toast-wrapper"
          >
            <Toast {...toast} onClose={value.removeToast} />
          </div>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

// src/toast/presentation/hooks/useToast.ts
interface ToastHookResult {
  success: (message: string, options?: ToastOptions) => Promise<Toast>;
  error: (message: string, options?: ToastOptions) => Promise<Toast>;
  warning: (message: string, options?: ToastOptions) => Promise<Toast>;
  info: (message: string, options?: ToastOptions) => Promise<Toast>;
}

export const useToast = (): ToastHookResult => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const { createToast } = context;

  return {
    success: (message: string, options: ToastOptions = {}) =>
      createToast(message, { type: TOAST_TYPES.SUCCESS, ...options }),
    error: (message: string, options: ToastOptions = {}) =>
      createToast(message, { type: TOAST_TYPES.ERROR, ...options }),
    warning: (message: string, options: ToastOptions = {}) =>
      createToast(message, { type: TOAST_TYPES.WARNING, ...options }),
    info: (message: string, options: ToastOptions = {}) =>
      createToast(message, { type: TOAST_TYPES.INFO, ...options }),
  };
};

// Example usage with TypeScript
export const ExampleComponent: React.FC = () => {
  const toast = useToast();

  const showToasts = async () => {
    await toast.success("Operation completed successfully!", {
      duration: 5000,
    });

    await toast.error("Something went wrong!", {
      duration: Infinity,
    });

    await toast.warning("Please review your input.", {
      duration: 3000,
    });

    await toast.info("New updates available.", {
      duration: 4000,
    });
  };

  return (
    <div>
      <button onClick={showToasts}>Show Toasts</button>
    </div>
  );
};
