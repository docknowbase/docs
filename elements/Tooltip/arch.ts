// src/domain/models/types.ts
export type Position = 'top' | 'bottom' | 'left' | 'right';
export type Theme = 'dark' | 'light';

export interface TooltipConfig {
  position: Position;
  theme: Theme;
  delay: number;
  offset: number;
  className?: string;
  showArrow: boolean;
  disabled: boolean;
  maxWidth: number;
}

export interface PositionStyle {
  top?: string | number;
  bottom?: string | number;
  left?: string | number;
  right?: string | number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
}

// src/domain/ports/TooltipPort.ts
export interface TooltipPort {
  show: (delay: number) => void;
  hide: () => void;
  getPosition: (position: Position, offset: number) => PositionStyle;
  isDisabled: (disabled: boolean) => boolean;
}

// src/application/TooltipService.ts
export class TooltipService {
  constructor(private readonly tooltipPort: TooltipPort) {}

  handleShow(delay: number): void {
    this.tooltipPort.show(delay);
  }

  handleHide(): void {
    this.tooltipPort.hide();
  }

  handlePosition(position: Position, offset: number): PositionStyle {
    return this.tooltipPort.getPosition(position, offset);
  }

  checkDisabled(disabled: boolean): boolean {
    return this.tooltipPort.isDisabled(disabled);
  }
}

// src/infrastructure/adapters/TooltipAdapter.ts
import { MutableRefObject, RefObject } from 'react';
import { Position, PositionStyle, TooltipPort } from '../../domain/ports/TooltipPort';

export class TooltipAdapter implements TooltipPort {
  private timeoutRef: MutableRefObject<NodeJS.Timeout | null>;
  private setIsVisible: ((value: boolean) => void) | null = null;

  constructor() {
    this.timeoutRef = { current: null };
  }

  initialize(setVisibleCallback: (value: boolean) => void): void {
    this.setIsVisible = setVisibleCallback;
  }

  show(delay: number): void {
    if (this.timeoutRef.current) clearTimeout(this.timeoutRef.current);
    this.timeoutRef.current = setTimeout(() => {
      this.setIsVisible?.(true);
    }, delay);
  }

  hide(): void {
    if (this.timeoutRef.current) clearTimeout(this.timeoutRef.current);
    this.setIsVisible?.(false);
  }

  getPosition(position: Position, offset: number): PositionStyle {
    const positions: Record<Position, PositionStyle> = {
      top: { bottom: '100%', marginBottom: offset },
      bottom: { top: '100%', marginTop: offset },
      left: { right: '100%', marginRight: offset },
      right: { left: '100%', marginLeft: offset },
    };
    return positions[position] || positions.top;
  }

  isDisabled(disabled: boolean): boolean {
    return disabled;
  }

  cleanup(): void {
    if (this.timeoutRef.current) {
      clearTimeout(this.timeoutRef.current);
    }
  }
}

// src/hooks/useTooltip.ts
import { useState, useEffect } from 'react';
import { TooltipService } from '../application/TooltipService';
import { TooltipAdapter } from '../infrastructure/adapters/TooltipAdapter';
import { Position, PositionStyle } from '../domain/models/types';

interface TooltipHookConfig {
  position: Position;
  delay: number;
  offset: number;
  disabled: boolean;
}

interface TooltipHookResult {
  isVisible: boolean;
  showTooltip: () => void;
  hideTooltip: () => void;
  getPositionStyle: () => PositionStyle;
}

export const useTooltip = (config: TooltipHookConfig): TooltipHookResult => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const tooltipAdapter = new TooltipAdapter();
  const tooltipService = new TooltipService(tooltipAdapter);

  useEffect(() => {
    tooltipAdapter.initialize(setIsVisible);
    return () => tooltipAdapter.cleanup();
  }, []);

  const showTooltip = (): void => {
    if (tooltipService.checkDisabled(config.disabled)) return;
    tooltipService.handleShow(config.delay);
  };

  const hideTooltip = (): void => {
    tooltipService.handleHide();
  };

  const getPositionStyle = (): PositionStyle => {
    return tooltipService.handlePosition(config.position, config.offset);
  };

  return {
    isVisible,
    showTooltip,
    hideTooltip,
    getPositionStyle,
  };
};

// src/components/Tooltip/index.tsx
import React, { ReactNode, useRef } from 'react';
import classNames from 'classnames';
import { useTooltip } from '../../hooks/useTooltip';
import { Position, Theme } from '../../domain/models/types';
import './styles.scss';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: Position;
  theme?: Theme;
  delay?: number;
  offset?: number;
  className?: string;
  showArrow?: boolean;
  disabled?: boolean;
  maxWidth?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  theme = 'dark',
  delay = 200,
  offset = 8,
  className = '',
  showArrow = true,
  disabled = false,
  maxWidth = 200,
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const config = {
    position,
    delay,
    offset,
    disabled,
  };

  const {
    isVisible,
    showTooltip,
    hideTooltip,
    getPositionStyle,
  } = useTooltip(config);

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
            'tooltip',
            `tooltip--${position}`,
            `tooltip--${theme}`,
            { 'tooltip--visible': isVisible },
            className
          )}
          style={{ 
            ...getPositionStyle(),
            maxWidth 
          }}
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

// src/components/Tooltip/styles.scss
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: absolute;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;

  &--visible {
    opacity: 1;
  }

  &--dark {
    background-color: #333;
    color: white;
  }

  &--light {
    background-color: white;
    color: #333;
    border: 1px solid #ddd;
  }

  &__content {
    padding: 8px 12px;
    border-radius: 4px;
  }

  &__arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background: inherit;
    transform: rotate(45deg);
  }
}