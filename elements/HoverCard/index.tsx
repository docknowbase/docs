import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames";
import "./styles.scss";

type Position = "top" | "bottom" | "left" | "right";

export interface HoverCardProps {
  /** The element that triggers the hover card */
  children: React.ReactNode;
  /** Content to show in the hover card */
  content: React.ReactNode;
  /** Preferred position of the hover card */
  position?: Position;
  /** Custom class name */
  className?: string;
  /** Delay before showing the card (ms) */
  openDelay?: number;
  /** Delay before hiding the card (ms) */
  closeDelay?: number;
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Arrow size in pixels */
  arrowSize?: number;
  /** Custom z-index */
  zIndex?: number;
  /** Distance from trigger in pixels */
  offset?: number;
  /** Whether to show arrow */
  showArrow?: boolean;
  /** Custom width */
  width?: number | string;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Whether to show on focus */
  showOnFocus?: boolean;
}

export const HoverCard: React.FC<HoverCardProps> = ({
  children,
  content,
  position = "bottom",
  className,
  openDelay = 200,
  closeDelay = 200,
  disabled = false,
  arrowSize = 8,
  zIndex = 1000,
  offset = 8,
  showArrow = true,
  width = "auto",
  animationDuration = 200,
  showOnFocus = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState<Position>(position);
  const [coordinates, setCoordinates] = useState({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  const calculatePosition = () => {
    if (!triggerRef.current || !cardRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const cardRect = cardRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let nextPosition = position;
    let top = 0;
    let left = 0;

    // Helper function to check if position is valid
    const isValidPosition = (pos: Position): boolean => {
      const positions = {
        top: triggerRect.top - cardRect.height - offset > 0,
        bottom: triggerRect.bottom + cardRect.height + offset < windowHeight,
        left: triggerRect.left - cardRect.width - offset > 0,
        right: triggerRect.right + cardRect.width + offset < windowWidth,
      };
      return positions[pos];
    };

    // Find the best position
    const preferredOrder: Position[] = [
      position,
      "bottom",
      "top",
      "right",
      "left",
    ];
    nextPosition = preferredOrder.find(isValidPosition) || position;

    // Calculate coordinates based on position
    switch (nextPosition) {
      case "top":
        top = triggerRect.top - cardRect.height - offset;
        left = triggerRect.left + (triggerRect.width - cardRect.width) / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + offset;
        left = triggerRect.left + (triggerRect.width - cardRect.width) / 2;
        break;
      case "left":
        top = triggerRect.top + (triggerRect.height - cardRect.height) / 2;
        left = triggerRect.left - cardRect.width - offset;
        break;
      case "right":
        top = triggerRect.top + (triggerRect.height - cardRect.height) / 2;
        left = triggerRect.right + offset;
        break;
    }

    // Adjust if card goes beyond window bounds
    left = Math.max(
      offset,
      Math.min(left, windowWidth - cardRect.width - offset)
    );
    top = Math.max(
      offset,
      Math.min(top, windowHeight - cardRect.height - offset)
    );

    setActualPosition(nextPosition);
    setCoordinates({ top, left });
  };

  const handleShow = () => {
    if (disabled) return;
    clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, openDelay);
  };

  const handleHide = () => {
    clearTimeout(showTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, closeDelay);
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      const handleScroll = () => {
        calculatePosition();
      };
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", calculatePosition);
      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", calculatePosition);
      };
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      clearTimeout(showTimeoutRef.current);
      clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const cardClasses = classNames(
    "hover-card",
    `hover-card--${actualPosition}`,
    {
      "hover-card--visible": isVisible,
      "hover-card--with-arrow": showArrow,
      [className || ""]: !!className,
    }
  );

  const cardStyle: React.CSSProperties = {
    zIndex,
    top: coordinates.top,
    left: coordinates.left,
    width,
    "--arrow-size": `${arrowSize}px`,
    "--animation-duration": `${animationDuration}ms`,
  } as React.CSSProperties;

  return (
    <>
      <div
        ref={triggerRef}
        className="hover-card__trigger"
        onMouseEnter={handleShow}
        onMouseLeave={handleHide}
        onFocus={showOnFocus ? handleShow : undefined}
        onBlur={showOnFocus ? handleHide : undefined}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={cardRef}
          className={cardClasses}
          style={cardStyle}
          onMouseEnter={handleShow}
          onMouseLeave={handleHide}
          role="tooltip"
        >
          {showArrow && <div className="hover-card__arrow" />}
          <div className="hover-card__content">{content}</div>
        </div>
      )}
    </>
  );
};

export default HoverCard;
