// Sonner.jsx
import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import classNames from "classnames";
import "./styles.scss";
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";

const SonnerContext = createContext(null);

export const useSonner = () => {
  const context = useContext(SonnerContext);
  if (!context) {
    throw new Error("useSonner must be used within a SonnerProvider");
  }
  return context;
};

const SONNER_LIFETIME = 4000;
const SONNER_REMOVE_DELAY = 200;

const SonnerIcon = ({ type }) => {
  const icons = {
    success: <CheckCircle className="sonner__icon" />,
    error: <XCircle className="sonner__icon" />,
    info: <Info className="sonner__icon" />,
    warning: <AlertCircle className="sonner__icon" />,
  };

  return icons[type] || null;
};

export const SonnerProvider = ({ children, position = "bottom-right" }) => {
  const [notifications, setNotifications] = useState([]);

  const createNotification = useCallback((message, type = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [
      { id, message, type, createdAt: Date.now() },
      ...prev,
    ]);

    setTimeout(() => {
      removeNotification(id);
    }, SONNER_LIFETIME);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => {
      const notificationIndex = prev.findIndex((t) => t.id === id);
      if (notificationIndex === -1) return prev;

      const newNotifications = [...prev];
      newNotifications[notificationIndex] = {
        ...newNotifications[notificationIndex],
        removing: true,
      };
      return newNotifications;
    });

    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
    }, SONNER_REMOVE_DELAY);
  }, []);

  const contextValue = {
    success: (message) => createNotification(message, "success"),
    error: (message) => createNotification(message, "error"),
    info: (message) => createNotification(message, "info"),
    warning: (message) => createNotification(message, "warning"),
  };

  return (
    <SonnerContext.Provider value={contextValue}>
      {children}
      <div
        className={classNames(
          "sonner-container",
          `sonner-container--${position}`
        )}
      >
        <div className="sonner-viewport">
          {notifications.map((notification, index) => (
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
              style={{
                "--sonner-index": index,
                "--sonner-count": notifications.length,
              }}
            >
              <div className="sonner__content">
                <SonnerIcon type={notification.type} />
                <p className="sonner__message">{notification.message}</p>
              </div>
              <button
                className="sonner__close-button"
                onClick={() => removeNotification(notification.id)}
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

// Example usage
const ExampleUsage = () => {
  const sonner = useSonner();

  return (
    <div>
      <button onClick={() => sonner.success("Successfully saved!")}>
        Show Success Notification
      </button>
      <button onClick={() => sonner.error("An error occurred!")}>
        Show Error Notification
      </button>
      <button onClick={() => sonner.info("New updates available")}>
        Show Info Notification
      </button>
      <button onClick={() => sonner.warning("Low disk space")}>
        Show Warning Notification
      </button>
    </div>
  );
};

export default ExampleUsage;
