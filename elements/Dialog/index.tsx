import React, { useEffect, useRef } from "react";
import classNames from "classnames";
import "./styles.scss";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (value: string) => void;
  title?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  initialValue?: string;
  placeholder?: string;
  className?: string;
  size?: "small" | "medium" | "large";
}

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Dialog Title",
  submitButtonText = "Submit",
  cancelButtonText = "Cancel",
  initialValue = "",
  placeholder = "Enter value...",
  className,
  size = "medium",
}) => {
  const [inputValue, setInputValue] = React.useState(initialValue);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setInputValue(initialValue);
    }
  }, [isOpen, initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(inputValue);
    setInputValue("");
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const dialogClasses = classNames(
    "dialog",
    `dialog--${size}`,
    {
      "dialog--open": isOpen,
    },
    className
  );

  if (!isOpen) return null;

  return (
    <div className="dialog-wrapper" onClick={handleBackdropClick}>
      <div
        className={dialogClasses}
        role="dialog"
        aria-modal="true"
        ref={dialogRef}
      >
        <div className="dialog__header">
          <h2 className="dialog__title">{title}</h2>
          <button
            className="dialog__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dialog__form">
          <div className="dialog__content">
            <div className="dialog__input-group">
              <label className="dialog__label" htmlFor="dialogInput">
                Input
              </label>
              <input
                id="dialogInput"
                className="dialog__input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                autoFocus
              />
            </div>
          </div>

          <div className="dialog__footer">
            <button
              type="button"
              className="dialog__button dialog__button--cancel"
              onClick={onClose}
            >
              {cancelButtonText}
            </button>
            <button
              type="submit"
              className="dialog__button dialog__button--submit"
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dialog;
