// Sheet.jsx
import React, { useEffect, useRef } from "react";
import classNames from "classnames";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import "./styles.scss";

const Sheet = ({
  isOpen = false,
  onClose,
  children,
  position = "right",
  size = "medium",
  className,
  overlayClassName,
  showCloseButton = true,
  closeOnEsc = true,
  closeOnOverlay = true,
  header,
  footer,
  preventScroll = true,
  animate = true,
  glassmorphism = false,
  nested = false,
}) => {
  const sheetRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && closeOnEsc && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      if (preventScroll) {
        document.body.style.overflow = "hidden";
      }
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (
        preventScroll &&
        !document.querySelector(".sheet--open:not(:last-child)")
      ) {
        document.body.style.overflow = "";
      }
    };
  }, [isOpen, closeOnEsc, onClose, preventScroll]);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      const focusableElements = contentRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length) {
        focusableElements[0].focus();
      }
    }
  }, [isOpen]);

  const handleOverlayClick = (event) => {
    if (closeOnOverlay && event.target === event.currentTarget) {
      onClose();
    }
  };

  const sheetClasses = classNames(
    "sheet",
    `sheet--${position}`,
    `sheet--${size}`,
    {
      "sheet--open": isOpen,
      "sheet--animate": animate,
      "sheet--glass": glassmorphism,
      "sheet--nested": nested,
    },
    className
  );

  const overlayClasses = classNames(
    "sheet__overlay",
    {
      "sheet__overlay--animate": animate,
    },
    overlayClassName
  );

  const sheet = (
    <div
      className={overlayClasses}
      onClick={handleOverlayClick}
      aria-hidden={!isOpen}
    >
      <div
        ref={sheetRef}
        className={sheetClasses}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {showCloseButton && (
          <button
            className="sheet__close"
            onClick={onClose}
            aria-label="Close sheet"
          >
            <X size={24} />
          </button>
        )}

        {header && <div className="sheet__header">{header}</div>}

        <div ref={contentRef} className="sheet__content" tabIndex={0}>
          {children}
        </div>

        {footer && <div className="sheet__footer">{footer}</div>}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return createPortal(sheet, document.body);
};

export default Sheet;
