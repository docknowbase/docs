// AlertDialog.jsx
import React, { useEffect, useRef } from "react";
import classNames from "classnames";
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";
import "./styles.scss";

const VARIANTS = {
  success: {
    icon: CheckCircle,
    color: "success",
  },
  error: {
    icon: X,
    color: "error",
  },
  warning: {
    icon: AlertTriangle,
    color: "warning",
  },
  info: {
    icon: Info,
    color: "info",
  },
};

const AlertDialog = ({
  isOpen = false,
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
  autoCloseDelay = 5000,
}) => {
  const dialogRef = useRef(null);
  const autoCloseTimerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
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
      autoCloseTimerRef.current = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
    }

    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, [autoClose, autoCloseDelay, isOpen, onClose]);

  const handleBackdropClick = (event) => {
    if (closeOnOutsideClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const Icon = VARIANTS[variant]?.icon;

  const dialogClasses = classNames(
    "alert-dialog",
    `alert-dialog--${size}`,
    `alert-dialog--${variant}`,
    {
      "alert-dialog--open": isOpen,
    },
    className
  );

  if (!isOpen) return null;

  return (
    <div
      className="alert-dialog-wrapper"
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
        <div className="alert-dialog__header">
          {Icon && (
            <Icon className="alert-dialog__icon" size={24} aria-hidden="true" />
          )}
          {title && (
            <h2 id="alert-dialog-title" className="alert-dialog__title">
              {title}
            </h2>
          )}
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="alert-dialog__close"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {description && (
          <div id="alert-dialog-description" className="alert-dialog__content">
            {description}
          </div>
        )}

        {actions && <div className="alert-dialog__actions">{actions}</div>}
      </div>
    </div>
  );
};

export default AlertDialog;
