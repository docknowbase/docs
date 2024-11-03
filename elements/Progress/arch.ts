// src/domain/types/ProgressBar.types.ts
export type ProgressBarStatus = 'default' | 'success' | 'error' | 'warning';
export type ProgressBarSize = 'small' | 'medium' | 'large';
export type ProgressBarVariant = 'primary' | 'secondary' | 'tertiary';
export type ProgressBarThickness = 'thin' | 'normal' | 'thick';
export type LabelPosition = 'top' | 'right' | 'bottom' | 'inner';

export interface ProgressBarState {
  percentage: number;
  isIncreasing: boolean;
  prevValue: number;
  status: ProgressBarStatus;
}

export interface ProgressBarConfig {
  value: number;
  min: number;
  max: number;
  onComplete?: () => void;
}

// src/domain/ports/ProgressBarPort.ts
export interface ProgressBarPort {
  calculatePercentage: (value: number, min: number, max: number) => number;
  validateValue: (value: number, min: number, max: number) => boolean;
  getProgressStatus: (percentage: number) => ProgressBarStatus;
  formatLabel: (value: number, showValue: boolean, customLabel?: string) => string;
}

// src/domain/services/ProgressBarService.ts
export class ProgressBarService implements ProgressBarPort {
  calculatePercentage(value: number, min: number, max: number): number {
    return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  }

  validateValue(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  getProgressStatus(percentage: number): ProgressBarStatus {
    if (percentage === 100) return 'success';
    if (percentage < 25) return 'error';
    if (percentage < 50) return 'warning';
    return 'default';
  }

  formatLabel(value: number, showValue: boolean, customLabel?: string): string {
    if (customLabel) return customLabel;
    return showValue ? `${Math.round(value)}%` : '';
  }
}

// src/adapters/ui/hooks/useProgressBar.ts
import { useState, useEffect } from 'react';
import { 
  ProgressBarPort, 
  ProgressBarState, 
  ProgressBarConfig 
} from '../../../domain/types/ProgressBar.types';

export const useProgressBar = (
  progressBarService: ProgressBarPort,
  config: ProgressBarConfig
): ProgressBarState => {
  const { value, min, max, onComplete } = config;

  const [state, setState] = useState<ProgressBarState>({
    percentage: progressBarService.calculatePercentage(value, min, max),
    isIncreasing: false,
    prevValue: value,
    status: 'default'
  });

  useEffect(() => {
    if (value !== state.prevValue) {
      const percentage = progressBarService.calculatePercentage(value, min, max);
      const status = progressBarService.getProgressStatus(percentage);
      
      setState(prev => ({
        ...prev,
        percentage,
        isIncreasing: value > prev.prevValue,
        prevValue: value,
        status
      }));
    }
  }, [value, state.prevValue, min, max, progressBarService]);

  useEffect(() => {
    if (state.percentage === 100 && onComplete) {
      onComplete();
    }
  }, [state.percentage, onComplete]);

  return state;
};

// src/adapters/ui/components/ProgressBarView.tsx
import React from 'react';
import classNames from 'classnames';
import { 
  ProgressBarPort,
  ProgressBarState,
  ProgressBarSize,
  ProgressBarVariant,
  ProgressBarThickness,
  LabelPosition 
} from '../../../domain/types/ProgressBar.types';

interface ProgressBarViewProps {
  state: ProgressBarState;
  progressBarService: ProgressBarPort;
  className?: string;
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
  showLabel?: boolean;
  labelPosition?: LabelPosition;
  animated?: boolean;
  striped?: boolean;
  indeterminate?: boolean;
  thickness?: ProgressBarThickness;
  roundedCorners?: boolean;
  showValue?: boolean;
  customLabel?: string;
}

export const ProgressBarView: React.FC<ProgressBarViewProps> = ({
  state,
  progressBarService,
  className,
  variant = 'primary',
  size = 'medium',
  showLabel = true,
  labelPosition = 'right',
  animated = true,
  striped = false,
  indeterminate = false,
  thickness = 'normal',
  roundedCorners = true,
  showValue = true,
  customLabel,
}) => {
  const progressClasses = classNames(
    'progress-bar',
    `progress-bar--${variant}`,
    `progress-bar--${size}`,
    `progress-bar--${thickness}`,
    `progress-bar--${state.status}`,
    {
      'progress-bar--animated': animated && !indeterminate,
      'progress-bar--striped': striped,
      'progress-bar--indeterminate': indeterminate,
      'progress-bar--rounded': roundedCorners,
      'progress-bar--increasing': state.isIncreasing,
      'progress-bar--decreasing': !state.isIncreasing,
      'progress-bar--complete': state.percentage === 100,
      [`progress-bar--label-${labelPosition}`]: showLabel,
    },
    className
  );

  const label = progressBarService.formatLabel(state.percentage, showValue, customLabel);

  return (
    <div className={progressClasses}>
      {showLabel && labelPosition === 'top' && (
        <div className="progress-bar__label progress-bar__label--top">
          {label}
        </div>
      )}

      <div
        className="progress-bar__track"
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : state.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={customLabel || 'Progress'}
      >
        <div
          className="progress-bar__fill"
          style={{ width: indeterminate ? '100%' : `${state.percentage}%` }}
        >
          {showLabel && labelPosition === 'inner' && (
            <div className="progress-bar__label progress-bar__label--inner">
              {label}
            </div>
          )}
        </div>
      </div>

      {showLabel && labelPosition === 'right' && (
        <div className="progress-bar__label progress-bar__label--right">
          {label}
        </div>
      )}

      {showLabel && labelPosition === 'bottom' && (
        <div className="progress-bar__label progress-bar__label--bottom">
          {label}
        </div>
      )}
    </div>
  );
};

// src/components/ProgressBar.tsx
import React from 'react';
import { ProgressBarService } from '../domain/services/ProgressBarService';
import { useProgressBar } from '../adapters/ui/hooks/useProgressBar';
import { ProgressBarView } from '../adapters/ui/components/ProgressBarView';
import { 
  ProgressBarSize,
  ProgressBarVariant,
  ProgressBarThickness,
  LabelPosition 
} from '../domain/types/ProgressBar.types';

interface ProgressBarProps {
  value: number;
  max?: number;
  min?: number;
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
  showLabel?: boolean;
  labelPosition?: LabelPosition;
  animated?: boolean;
  striped?: boolean;
  indeterminate?: boolean;
  thickness?: ProgressBarThickness;
  className?: string;
  customLabel?: string;
  showValue?: boolean;
  roundedCorners?: boolean;
  onComplete?: () => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  min = 0,
  onComplete,
  ...props
}) => {
  const progressBarService = new ProgressBarService();
  
  const state = useProgressBar(progressBarService, {
    value,
    min,
    max,
    onComplete
  });

  return (
    <ProgressBarView
      state={state}
      progressBarService={progressBarService}
      {...props}
    />
  );
};

export default ProgressBar;

// Optional: src/styles/progress-bar.scss
.progress-bar {
  display: flex;
  align-items: center;
  gap: 1rem;

  &__track {
    flex-grow: 1;
    height: var(--progress-height);
    background-color: var(--track-bg);
    border-radius: var(--border-radius);
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    background-color: var(--fill-bg);
    transition: width 0.3s ease-in-out;
  }

  &__label {
    font-size: var(--label-size);
    color: var(--label-color);

    &--inner {
      color: var(--label-inner-color);
      padding: 0 0.5rem;
    }
  }

  // Variants
  &--primary {
    --fill-bg: var(--primary-color);
  }

  &--animated {
    .progress-bar__fill {
      animation: progress-animation 1s linear infinite;
    }
  }

  &--striped {
    .progress-bar__fill {
      background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
      );
      background-size: 1rem 1rem;
    }
  }
}

@keyframes progress-animation {
  0% {
    background-position: 1rem 0;
  }
  100% {
    background-position: 0 0;
  }
}