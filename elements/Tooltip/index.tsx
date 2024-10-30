// src/components/Tooltip/index.jsx
import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames";
import "./styles.scss";

const Tooltip = ({
  children,
  content,
  position = "top",
  theme = "dark",
  delay = 200,
  offset = 8,
  className = "",
  showArrow = true,
  disabled = false,
  maxWidth = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    if (disabled) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="tooltip-wrapper" ref={triggerRef}>
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="tooltip-trigger"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={classNames(
            "tooltip",
            `tooltip--${position}`,
            `tooltip--${theme}`,
            { "tooltip--visible": isVisible },
            className
          )}
          style={{ maxWidth }}
          role="tooltip"
        >
          <div className="tooltip__content">{content}</div>
          {showArrow && <div className="tooltip__arrow" />}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
