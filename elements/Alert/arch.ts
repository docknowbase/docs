// Core Domain - domain/alert/AlertTypes.ts
export type AlertVariant = "success" | "error" | "warning" | "info";
export type AlertSize = "small" | "medium" | "large";

export interface AlertConfig {
  isOpen: boolean;
  variant: AlertVariant;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  closeOnEsc?: boolean;
  closeOnOutsideClick?: boolean;
  size?: AlertSize;
  className?: string;
  showCloseButton?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export interface AlertState extends AlertConfig {
  onClose: () => void;
}

// Ports - ports/AlertPort.ts
export interface AlertPort {
  show: (config: Omit<AlertConfig, "isOpen">) => void;
  hide: () => void;
  update: (config: Partial<AlertConfig>) => void;
  getState: () => AlertState;
}

// Primary Adapter - adapters/primary/AlertAdapter.ts
import { useCallback, useState } from "react";

export const DEFAULT_AUTO_CLOSE_DELAY = 5000;

export const defaultAlertConfig: AlertConfig = {
  isOpen: false,
  variant: "info",
  closeOnEsc: true,
  closeOnOutsideClick: true,
  size: "medium",
  showCloseButton: true,
  autoClose: false,
  autoCloseDelay: DEFAULT_AUTO_CLOSE_DELAY,
};

export const useAlertAdapter = (): AlertPort => {
  const [config, setConfig] = useState<AlertConfig>(defaultAlertConfig);

  const show = useCallback((newConfig: Omit<AlertConfig, "isOpen">) => {
    setConfig((prev) => ({ ...prev, ...newConfig, isOpen: true }));
  }, []);

  const hide = useCallback(() => {
    setConfig((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const update = useCallback((newConfig: Partial<AlertConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  const getState = useCallback(
    (): AlertState => ({
      ...config,
      onClose: hide,
    }),
    [config, hide]
  );

  return { show, hide, update, getState };
};

// Secondary Adapter - adapters/secondary/AlertStyleAdapter.ts
import { LucideIcon, CheckCircle, X, AlertTriangle, Info } from "lucide-react";

interface StyleConfig {
  icon: LucideIcon;
  color: string;
  backgroundColor: string;
}

type StyleConfigMap = Record<AlertVariant, StyleConfig>;

export class AlertStyleAdapter {
  private static readonly styleConfigs: StyleConfigMap = {
    success: {
      icon: CheckCircle,
      color: "text-green-700",
      backgroundColor: "bg-green-50",
    },
    error: {
      icon: X,
      color: "text-red-700",
      backgroundColor: "bg-red-50",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-yellow-700",
      backgroundColor: "bg-yellow-50",
    },
    info: {
      icon: Info,
      color: "text-blue-700",
      backgroundColor: "bg-blue-50",
    },
  };

  public static getStyleConfig(variant: AlertVariant): StyleConfig {
    return this.styleConfigs[variant];
  }
}

// UI Component - components/AlertDialog.tsx
import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import classNames from "classnames";

export const AlertDialog: React.FC<AlertState> = ({
  isOpen,
  onClose,
  variant = "info",
  title,
  description,
  actions,
  closeOnEsc = true,
  closeOnOutsideClick = true,
  size = "medium",
  className,
  showCloseButton = true,
  autoClose = false,
  autoCloseDelay = DEFAULT_AUTO_CLOSE_DELAY,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && closeOnEsc && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeOnEsc, onClose]);

  useEffect(() => {
    if (autoClose && isOpen) {
      autoCloseTimerRef.current = setTimeout(onClose, autoCloseDelay);
    }

    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, [autoClose, autoCloseDelay, isOpen, onClose]);

  const handleBackdropClick = (
    event: React.MouseEvent<HTMLDivElement>
  ): void => {
    if (closeOnOutsideClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const styleConfig = AlertStyleAdapter.getStyleConfig(variant);
  const Icon = styleConfig.icon;

  const dialogClasses = classNames(
    "alert-dialog",
    `alert-dialog--${size}`,
    styleConfig.backgroundColor,
    {
      "alert-dialog--open": isOpen,
    },
    className
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className={dialogClasses}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            {Icon && (
              <Icon
                className={classNames("w-6 h-6", styleConfig.color)}
                aria-hidden="true"
              />
            )}
            {title && (
              <h2
                id="alert-dialog-title"
                className={classNames("text-lg font-medium", styleConfig.color)}
              >
                {title}
              </h2>
            )}
          </div>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {description && (
          <div id="alert-dialog-description" className="p-4 text-gray-700">
            {description}
          </div>
        )}

        {actions && (
          <div className="flex justify-end p-4 space-x-2 border-t">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

// Context - contexts/AlertContext.tsx
import { createContext, useContext, PropsWithChildren } from "react";

interface AlertContextValue {
  alertPort: AlertPort;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export const AlertProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const alertPort = useAlertAdapter();

  return (
    <AlertContext.Provider value={{ alertPort }}>
      {children}
      <AlertDialog {...alertPort.getState()} />
    </AlertContext.Provider>
  );
};

// Hook - hooks/useAlert.ts
export const useAlert = (): AlertPort => {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }

  return context.alertPort;
};

// Example Usage Component - components/ExampleUsage.tsx
interface ExampleUsageProps {
  onSuccess?: () => void;
}

export const ExampleUsage: React.FC<ExampleUsageProps> = ({ onSuccess }) => {
  const { show, hide } = useAlert();

  const handleShowAlert = (): void => {
    show({
      variant: "success",
      title: "Success!",
      description: "Operation completed successfully.",
      actions: (
        <>
          <button
            onClick={hide}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              hide();
              onSuccess?.();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Continue
          </button>
        </>
      ),
    });
  };

  return (
    <button
      onClick={handleShowAlert}
      className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
    >
      Show Alert
    </button>
  );
};

// App level usage
import { AlertProvider } from "./contexts/AlertContext";

const App: React.FC = () => {
  return (
    <AlertProvider>
      <ExampleUsage onSuccess={() => console.log("Success action completed")} />
    </AlertProvider>
  );
};

export default App;
