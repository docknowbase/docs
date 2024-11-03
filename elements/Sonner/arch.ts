// types/notification.ts
export type NotificationType = "success" | "error" | "info" | "warning";

export interface INotification {
  id: string;
  message: string;
  type: NotificationType;
  createdAt: number;
  removing: boolean;
}

// domain/ports/NotificationPort.ts
export interface NotificationPort {
  createNotification(message: string, type: NotificationType): INotification;
  removeNotification(id: string): void;
}

// domain/models/Notification.ts
import { INotification, NotificationType } from "../../types/notification";

export class Notification implements INotification {
  private constructor(
    public readonly id: string,
    public readonly message: string,
    public readonly type: NotificationType,
    public readonly createdAt: number,
    public removing: boolean = false
  ) {}

  public markAsRemoving(): Notification {
    return new Notification(
      this.id,
      this.message,
      this.type,
      this.createdAt,
      true
    );
  }

  public static create(message: string, type: NotificationType): Notification {
    return new Notification(
      Math.random().toString(36).substr(2, 9),
      message,
      type,
      Date.now()
    );
  }
}

// domain/NotificationService.ts
export class NotificationService {
  constructor(private readonly notificationPort: NotificationPort) {}

  public createNotification(
    message: string,
    type: NotificationType
  ): INotification {
    return this.notificationPort.createNotification(message, type);
  }

  public removeNotification(id: string): void {
    return this.notificationPort.removeNotification(id);
  }

  public success(message: string): INotification {
    return this.createNotification(message, "success");
  }

  public error(message: string): INotification {
    return this.createNotification(message, "error");
  }

  public info(message: string): INotification {
    return this.createNotification(message, "info");
  }

  public warning(message: string): INotification {
    return this.createNotification(message, "warning");
  }
}

// infrastructure/adapters/ReactNotificationAdapter.ts
import { useState, useCallback } from "react";
import { NotificationPort } from "../../domain/ports/NotificationPort";
import { Notification } from "../../domain/models/Notification";
import { INotification, NotificationType } from "../../types/notification";

const SONNER_LIFETIME = 4000;
const SONNER_REMOVE_DELAY = 200;

interface NotificationHook {
  notifications: INotification[];
  createNotification: (
    message: string,
    type: NotificationType
  ) => INotification;
  removeNotification: (id: string) => void;
}

export const useReactNotificationAdapter = (): NotificationHook => {
  const [notifications, setNotifications] = useState<INotification[]>([]);

  const createNotification = useCallback(
    (message: string, type: NotificationType): INotification => {
      const notification = Notification.create(message, type);

      setNotifications((prev) => [notification, ...prev]);

      setTimeout(() => {
        removeNotification(notification.id);
      }, SONNER_LIFETIME);

      return notification;
    },
    []
  );

  const removeNotification = useCallback((id: string): void => {
    setNotifications((prev) => {
      const notificationIndex = prev.findIndex((n) => n.id === id);
      if (notificationIndex === -1) return prev;

      const newNotifications = [...prev];
      const notification = newNotifications[notificationIndex] as Notification;
      newNotifications[notificationIndex] = notification.markAsRemoving();
      return newNotifications;
    });

    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
    }, SONNER_REMOVE_DELAY);
  }, []);

  return {
    notifications,
    createNotification,
    removeNotification,
  };
};

export class ReactNotificationAdapter implements NotificationPort {
  constructor(private readonly hook: NotificationHook) {}

  createNotification(message: string, type: NotificationType): INotification {
    return this.hook.createNotification(message, type);
  }

  removeNotification(id: string): void {
    return this.hook.removeNotification(id);
  }
}

// presentation/components/SonnerIcon.tsx
import React from "react";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";
import { NotificationType } from "../../types/notification";

interface SonnerIconProps {
  type: NotificationType;
}

export const SonnerIcon: React.FC<SonnerIconProps> = ({ type }) => {
  const icons: Record<NotificationType, JSX.Element> = {
    success: <CheckCircle className="sonner__icon" />,
    error: <XCircle className="sonner__icon" />,
    info: <Info className="sonner__icon" />,
    warning: <AlertCircle className="sonner__icon" />,
  };

  return icons[type] || null;
};

// presentation/components/Sonner.tsx
import React, { createContext, useContext } from "react";
import classNames from "classnames";
import { X } from "lucide-react";
import { SonnerIcon } from "./SonnerIcon";
import { NotificationService } from "../../domain/NotificationService";
import { ReactNotificationAdapter } from "../../infrastructure/adapters/ReactNotificationAdapter";
import { useReactNotificationAdapter } from "../../infrastructure/adapters/ReactNotificationAdapter";

interface SonnerContextValue {
  success: (message: string) => INotification;
  error: (message: string) => INotification;
  info: (message: string) => INotification;
  warning: (message: string) => INotification;
}

const SonnerContext = createContext<SonnerContextValue | null>(null);

export const useSonner = (): SonnerContextValue => {
  const context = useContext(SonnerContext);
  if (!context) {
    throw new Error("useSonner must be used within a SonnerProvider");
  }
  return context;
};

interface SonnerProviderProps {
  children: React.ReactNode;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export const SonnerProvider: React.FC<SonnerProviderProps> = ({
  children,
  position = "bottom-right",
}) => {
  const notificationHook = useReactNotificationAdapter();
  const notificationAdapter = new ReactNotificationAdapter(notificationHook);
  const notificationService = new NotificationService(notificationAdapter);

  return (
    <SonnerContext.Provider value={notificationService}>
      {children}
      <div
        className={classNames(
          "sonner-container",
          `sonner-container--${position}`
        )}
      >
        <div className="sonner-viewport">
          {notificationHook.notifications.map((notification, index) => (
            <div
              key={notification.id}
              className={classNames(
                "sonner",
                `sonner--${notification.type}`,
                "sonner--animate-in",
                {
                  "sonner--removing": notification.removing,
                }
              )}
              style={
                {
                  "--sonner-index": index,
                  "--sonner-count": notificationHook.notifications.length,
                } as React.CSSProperties
              }
            >
              <div className="sonner__content">
                <SonnerIcon type={notification.type} />
                <p className="sonner__message">{notification.message}</p>
              </div>
              <button
                className="sonner__close-button"
                onClick={() =>
                  notificationHook.removeNotification(notification.id)
                }
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </SonnerContext.Provider>
  );
};

// presentation/components/ExampleUsage.tsx
interface ExampleUsageProps {
  className?: string;
}

export const ExampleUsage: React.FC<ExampleUsageProps> = ({ className }) => {
  const notificationService = useSonner();

  return (
    <div className={className}>
      <button
        onClick={() => notificationService.success("Successfully saved!")}
      >
        Show Success Notification
      </button>
      <button onClick={() => notificationService.error("An error occurred!")}>
        Show Error Notification
      </button>
      <button onClick={() => notificationService.info("New updates available")}>
        Show Info Notification
      </button>
      <button onClick={() => notificationService.warning("Low disk space")}>
        Show Warning Notification
      </button>
    </div>
  );
};

// App.tsx
export const App: React.FC = () => {
  return (
    <SonnerProvider>
      <ExampleUsage />
    </SonnerProvider>
  );
};
