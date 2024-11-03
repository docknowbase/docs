// src/types/common.ts
export type Position = "top" | "bottom" | "left" | "right";

export interface Coordinates {
  top: number;
  left: number;
}

export interface DOMRectReadOnly {
  readonly top: number;
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
  readonly width: number;
  readonly height: number;
}

export interface WindowSize {
  readonly width: number;
  readonly height: number;
}

// src/core/ports/position-calculator.port.ts
export interface PositionCalculatorPort {
  calculatePosition(params: {
    triggerRect: DOMRectReadOnly;
    cardRect: DOMRectReadOnly;
    windowSize: WindowSize;
    preferredPosition: Position;
    offset: number;
  }): PositionCalculationResult;
}

export interface PositionCalculationResult {
  position: Position;
  coordinates: Coordinates;
}

// src/core/ports/element-measurer.port.ts
export interface ElementMeasurerPort {
  getBoundingClientRect(element: HTMLElement): DOMRectReadOnly;
  getWindowSize(): WindowSize;
}

// src/core/ports/timer.port.ts
export interface TimerPort {
  setTimeout(callback: () => void, delay: number): number;
  clearTimeout(id: number): void;
}

// src/core/domain/hover-card.types.ts
export interface HoverCardState {
  readonly isVisible: boolean;
  readonly position: Position;
  readonly coordinates: Coordinates;
}

export interface HoverCardConfig {
  readonly position: Position;
  readonly openDelay: number;
  readonly closeDelay: number;
  readonly disabled: boolean;
  readonly arrowSize: number;
  readonly zIndex: number;
  readonly offset: number;
  readonly showArrow: boolean;
  readonly width: number | string;
  readonly animationDuration: number;
  readonly showOnFocus: boolean;
}

export interface HoverCardHandlers {
  readonly handleShow: () => void;
  readonly handleHide: () => void;
  readonly calculatePosition: (trigger: HTMLElement, card: HTMLElement) => void;
}

export interface HoverCardHookResult {
  readonly state: HoverCardState;
  readonly handlers: HoverCardHandlers;
}

// src/core/domain/use-hover-card.hook.ts
import { useState } from "react";
import type {
  PositionCalculatorPort,
  ElementMeasurerPort,
  TimerPort,
} from "../ports";
import type {
  HoverCardState,
  HoverCardConfig,
  HoverCardHookResult,
} from "./hover-card.types";

export function useHoverCard(
  config: Readonly<HoverCardConfig>,
  positionCalculator: PositionCalculatorPort,
  elementMeasurer: ElementMeasurerPort,
  timerService: TimerPort
): HoverCardHookResult {
  const [state, setState] = useState<HoverCardState>({
    isVisible: false,
    position: config.position,
    coordinates: { top: 0, left: 0 },
  });

  const calculatePosition = (
    triggerElement: HTMLElement,
    cardElement: HTMLElement
  ): void => {
    const triggerRect = elementMeasurer.getBoundingClientRect(triggerElement);
    const cardRect = elementMeasurer.getBoundingClientRect(cardElement);
    const windowSize = elementMeasurer.getWindowSize();

    const { position, coordinates } = positionCalculator.calculatePosition({
      triggerRect,
      cardRect,
      windowSize,
      preferredPosition: config.position,
      offset: config.offset,
    });

    setState((prev) => ({ ...prev, position, coordinates }));
  };

  let showTimeoutId: number;
  let hideTimeoutId: number;

  const handleShow = (): void => {
    if (config.disabled) return;
    timerService.clearTimeout(hideTimeoutId);
    showTimeoutId = timerService.setTimeout(() => {
      setState((prev) => ({ ...prev, isVisible: true }));
    }, config.openDelay);
  };

  const handleHide = (): void => {
    timerService.clearTimeout(showTimeoutId);
    hideTimeoutId = timerService.setTimeout(() => {
      setState((prev) => ({ ...prev, isVisible: false }));
    }, config.closeDelay);
  };

  return {
    state,
    handlers: {
      handleShow,
      handleHide,
      calculatePosition,
    },
  };
}

// src/adapters/browser-element-measurer.adapter.ts
import type {
  ElementMeasurerPort,
  DOMRectReadOnly,
  WindowSize,
} from "../core/ports";

export class BrowserElementMeasurer implements ElementMeasurerPort {
  public getBoundingClientRect(element: HTMLElement): DOMRectReadOnly {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      width: rect.width,
      height: rect.height,
    };
  }

  public getWindowSize(): WindowSize {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
}

// src/adapters/default-position-calculator.adapter.ts
import type {
  PositionCalculatorPort,
  Position,
  DOMRectReadOnly,
  WindowSize,
  PositionCalculationResult,
} from "../core/ports";

export class DefaultPositionCalculator implements PositionCalculatorPort {
  public calculatePosition({
    triggerRect,
    cardRect,
    windowSize,
    preferredPosition,
    offset,
  }: {
    triggerRect: DOMRectReadOnly;
    cardRect: DOMRectReadOnly;
    windowSize: WindowSize;
    preferredPosition: Position;
    offset: number;
  }): PositionCalculationResult {
    const isValidPosition = (pos: Position): boolean => {
      const positions: Record<Position, boolean> = {
        top: triggerRect.top - cardRect.height - offset > 0,
        bottom:
          triggerRect.bottom + cardRect.height + offset < windowSize.height,
        left: triggerRect.left - cardRect.width - offset > 0,
        right: triggerRect.right + cardRect.width + offset < windowSize.width,
      };
      return positions[pos];
    };

    const preferredOrder: Position[] = [
      preferredPosition,
      "bottom",
      "top",
      "right",
      "left",
    ];

    const position = preferredOrder.find(isValidPosition) ?? preferredPosition;

    let coordinates: Coordinates;

    switch (position) {
      case "top":
        coordinates = {
          top: triggerRect.top - cardRect.height - offset,
          left: triggerRect.left + (triggerRect.width - cardRect.width) / 2,
        };
        break;
      case "bottom":
        coordinates = {
          top: triggerRect.bottom + offset,
          left: triggerRect.left + (triggerRect.width - cardRect.width) / 2,
        };
        break;
      case "left":
        coordinates = {
          top: triggerRect.top + (triggerRect.height - cardRect.height) / 2,
          left: triggerRect.left - cardRect.width - offset,
        };
        break;
      case "right":
        coordinates = {
          top: triggerRect.top + (triggerRect.height - cardRect.height) / 2,
          left: triggerRect.right + offset,
        };
        break;
      default:
        coordinates = { top: 0, left: 0 };
        break;
    }

    return {
      position,
      coordinates: {
        left: Math.max(
          offset,
          Math.min(coordinates.left, windowSize.width - cardRect.width - offset)
        ),
        top: Math.max(
          offset,
          Math.min(
            coordinates.top,
            windowSize.height - cardRect.height - offset
          )
        ),
      },
    };
  }
}

// src/adapters/browser-timer.adapter.ts
import type { TimerPort } from "../core/ports";

export class BrowserTimer implements TimerPort {
  public setTimeout(callback: () => void, delay: number): number {
    return window.setTimeout(callback, delay);
  }

  public clearTimeout(id: number): void {
    window.clearTimeout(id);
  }
}

// src/infrastructure/hover-card.props.ts
import type { ReactNode } from "react";
import type { Position } from "../types/common";

export interface HoverCardProps {
  readonly children: ReactNode;
  readonly content: ReactNode;
  readonly position?: Position;
  readonly className?: string;
  readonly openDelay?: number;
  readonly closeDelay?: number;
  readonly disabled?: boolean;
  readonly arrowSize?: number;
  readonly zIndex?: number;
  readonly offset?: number;
  readonly showArrow?: boolean;
  readonly width?: number | string;
  readonly animationDuration?: number;
  readonly showOnFocus?: boolean;
}

// src/infrastructure/hover-card.styles.ts
export interface HoverCardStyles extends React.CSSProperties {
  "--arrow-size": string;
  "--animation-duration": string;
}

// src/infrastructure/hover-card.component.tsx
import React, { useRef, useEffect } from "react";
import classNames from "classnames";
import type { HoverCardProps } from "./hover-card.props";
import type { HoverCardStyles } from "./hover-card.styles";
import { useHoverCard } from "../core/domain/use-hover-card.hook";
import { BrowserElementMeasurer } from "../adapters/browser-element-measurer.adapter";
import { DefaultPositionCalculator } from "../adapters/default-position-calculator.adapter";
import { BrowserTimer } from "../adapters/browser-timer.adapter";

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
  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const config = {
    position,
    openDelay,
    closeDelay,
    disabled,
    arrowSize,
    zIndex,
    offset,
    showArrow,
    width,
    animationDuration,
    showOnFocus,
  } as const;

  const elementMeasurer = new BrowserElementMeasurer();
  const positionCalculator = new DefaultPositionCalculator();
  const timerService = new BrowserTimer();

  const { state, handlers } = useHoverCard(
    config,
    positionCalculator,
    elementMeasurer,
    timerService
  );

  useEffect(() => {
    if (state.isVisible && triggerRef.current && cardRef.current) {
      handlers.calculatePosition(triggerRef.current, cardRef.current);

      const handleScroll = (): void => {
        if (triggerRef.current && cardRef.current) {
          handlers.calculatePosition(triggerRef.current, cardRef.current);
        }
      };

      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleScroll);

      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleScroll);
      };
    }
  }, [state.isVisible]);

  const cardClasses = classNames(
    "hover-card",
    `hover-card--${state.position}`,
    {
      "hover-card--visible": state.isVisible,
      "hover-card--with-arrow": showArrow,
      [className ?? ""]: !!className,
    }
  );

  const cardStyle: HoverCardStyles = {
    zIndex,
    top: state.coordinates.top,
    left: state.coordinates.left,
    width,
    "--arrow-size": `${arrowSize}px`,
    "--animation-duration": `${animationDuration}ms`,
  };

  return (
    <>
      <div
        ref={triggerRef}
        className="hover-card__trigger"
        onMouseEnter={handlers.handleShow}
        onMouseLeave={handlers.handleHide}
        onFocus={showOnFocus ? handlers.handleShow : undefined}
        onBlur={showOnFocus ? handlers.handleHide : undefined}
      >
        {children}
      </div>
      {state.isVisible && (
        <div
          ref={cardRef}
          className={cardClasses}
          style={cardStyle}
          onMouseEnter={handlers.handleShow}
          onMouseLeave={handlers.handleHide}
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
