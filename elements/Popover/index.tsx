import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames";
import "./styles.scss";

interface PopoverProps {
  trigger: React.ReactNode;
  position?: "top" | "right" | "bottom" | "left";
  className?: string;
  onSubmit?: (value: string) => void;
  onCancel?: () => void;
}

const Popover: React.FC<PopoverProps> = ({
  trigger,
  position = "bottom",
  className,
  onSubmit,
  onCancel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(inputValue);
    setInputValue("");
    setIsOpen(false);
  };

  const handleCancel = () => {
    setInputValue("");
    setIsOpen(false);
    onCancel?.();
  };

  const popoverClasses = classNames(
    "popover",
    `popover--${position}`,
    {
      "popover--open": isOpen,
    },
    className
  );

  return (
    <div className="popover-container">
      <div
        ref={triggerRef}
        className="popover__trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </div>

      <div ref={popoverRef} className={popoverClasses}>
        <div className="popover__content">
          <form onSubmit={handleSubmit}>
            <div className="popover__input-group">
              <input
                type="text"
                className="popover__input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value..."
                autoFocus
              />
            </div>
            <div className="popover__actions">
              <button
                type="button"
                className="popover__button popover__button--cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="popover__button popover__button--submit"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Popover;
