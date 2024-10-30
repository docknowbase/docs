// src/components/Toast/ToastManager.jsx
import React, { createContext, useContext, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle, XCircle, Info, X } from "lucide-react";
import classNames from "classnames";
import "./styles.scss";

// Toast Context
const ToastContext = createContext(null);

// Toast Types Config
const TOAST_CONFIG = {
  success: {
    icon: CheckCircle,
    className: "toast--success",
  },
  error: {
    icon: XCircle,
    className: "toast--error",
  },
  warning: {
    icon: AlertCircle,
    className: "toast--warning",
  },
  info: {
    icon: Info,
    className: "toast--info",
  },
};

// Individual Toast Component
const Toast = ({ message, type = "info", duration = 5000, onClose, id }) => {
  const ToastIcon = TOAST_CONFIG[type]?.icon;

  React.useEffect(() => {
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

// Toast Container Component
const ToastContainer = ({ children }) => {
  return createPortal(
    <div className="toast-container">{children}</div>,
    document.body
  );
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, options = {}) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, ...options }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => {
      const toast = document.getElementById(`toast-${id}`);
      if (toast) {
        toast.classList.add("toast--animate-out");
      }

      // Remove after animation
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);

      return prev;
    });
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className="toast-wrapper"
          >
            <Toast {...toast} onClose={removeToast} />
          </div>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

// Hook for using toasts
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const { addToast } = context;

  return {
    success: (message, options = {}) =>
      addToast(message, { type: "success", ...options }),
    error: (message, options = {}) =>
      addToast(message, { type: "error", ...options }),
    warning: (message, options = {}) =>
      addToast(message, { type: "warning", ...options }),
    info: (message, options = {}) =>
      addToast(message, { type: "info", ...options }),
  };
};

// In any component
function ExampleComponent() {
  const toast = useToast();

  const showToasts = () => {
    // Success toast
    toast.success("Operation completed successfully!", {
      duration: 5000,
    });

    // Error toast
    toast.error("Something went wrong!", {
      duration: Infinity, // Won't auto-dismiss
    });

    // Warning toast
    toast.warning("Please review your input.", {
      duration: 3000,
    });

    // Info toast
    toast.info("New updates available.", {
      duration: 4000,
    });
  };

  return (
    <div>
      <button onClick={showToasts}>Show Toasts</button>
    </div>
  );
}

export default ExampleComponent;
