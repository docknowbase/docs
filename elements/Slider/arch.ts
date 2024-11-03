// src/domain/types/rangeSlider.types.ts
export interface RangeSliderConfig {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  theme?: "primary" | "secondary" | "success";
  disabled?: boolean;
}

export interface UIState {
  isDragging: boolean;
  isFocused: boolean;
}

export interface Position {
  x: number;
  width: number;
}

// src/domain/ports/rangeSlider.ports.ts
export interface RangeSliderOutputPort {
  updateValue(value: number): void;
  notifyValueChange(value: number): void;
  updateUIState(state: UIState): void;
}

export interface RangeSliderInputPort {
  setValue(value: number): void;
  handleDrag(position: Position): void;
  handleClick(position: Position): void;
  setUIState(state: UIState): void;
}

// src/domain/models/RangeSlider.model.ts
export class RangeSliderModel {
  private readonly min: number;
  private readonly max: number;
  private readonly step: number;
  private _value: number;
  readonly theme: string;
  readonly disabled: boolean;

  constructor(config: RangeSliderConfig) {
    this.min = config.min ?? 0;
    this.max = config.max ?? 100;
    this.step = config.step ?? 1;
    this._value = config.defaultValue ?? 50;
    this.theme = config.theme ?? "primary";
    this.disabled = config.disabled ?? false;
  }

  get value(): number {
    return this._value;
  }

  set value(newValue: number) {
    this._value = this.clampValue(newValue);
  }

  public calculatePercentage(): number {
    return ((this.value - this.min) * 100) / (this.max - this.min);
  }

  public clampValue(value: number): number {
    return Math.min(Math.max(Number(value), this.min), this.max);
  }

  public calculateValueFromPosition(position: Position): number {
    const percentage = (position.x / position.width) * 100;
    const newValue = Math.round(
      (percentage * (this.max - this.min)) / 100 + this.min
    );
    return this.clampValue(newValue);
  }
}

// src/application/RangeSlider.service.ts
export class RangeSliderService implements RangeSliderInputPort {
  constructor(
    private readonly model: RangeSliderModel,
    private readonly outputPort: RangeSliderOutputPort
  ) {}

  public setValue(value: number): void {
    const newValue = this.model.clampValue(value);
    this.model.value = newValue;
    this.outputPort.updateValue(newValue);
    this.outputPort.notifyValueChange(newValue);
  }

  public handleDrag(position: Position): void {
    if (this.model.disabled) return;
    const newValue = this.model.calculateValueFromPosition(position);
    this.setValue(newValue);
  }

  public handleClick(position: Position): void {
    if (this.model.disabled) return;
    const newValue = this.model.calculateValueFromPosition(position);
    this.setValue(newValue);
  }

  public setUIState(state: UIState): void {
    this.outputPort.updateUIState(state);
  }
}

// src/infrastructure/adapters/RangeSlider.adapter.ts
export class RangeSliderAdapter {
  constructor(private readonly service: RangeSliderInputPort) {}

  public handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
    this.service.setValue(Number(e.target.value));
  }

  public handleSliderClick(e: React.MouseEvent, rect: DOMRect): void {
    const position: Position = {
      x: e.clientX - rect.left,
      width: rect.width,
    };
    this.service.handleClick(position);
  }

  public handleDrag(e: MouseEvent, rect: DOMRect): void {
    const position: Position = {
      x: e.clientX - rect.left,
      width: rect.width,
    };
    this.service.handleDrag(position);
  }

  public setUIState(state: UIState): void {
    this.service.setUIState(state);
  }
}

// src/infrastructure/ui/RangeSlider.tsx
import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames";
import { RangeSliderModel } from "../../domain/models/RangeSlider.model";
import { RangeSliderService } from "../../application/RangeSlider.service";
import { RangeSliderAdapter } from "../adapters/RangeSlider.adapter";
import {
  RangeSliderOutputPort,
  UIState,
} from "../../domain/ports/rangeSlider.ports";
import "./styles.scss";

interface RangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  label?: string;
  onChange?: (value: number) => void;
  className?: string;
  disabled?: boolean;
  theme?: "primary" | "secondary" | "success";
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  defaultValue = 50,
  label = "Range",
  onChange = () => {},
  className,
  disabled = false,
  theme = "primary",
}) => {
  const [value, setValue] = useState<number>(defaultValue);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Initialize hexagonal architecture components
  const model = new RangeSliderModel({
    min,
    max,
    step,
    defaultValue,
    theme,
    disabled,
  });

  const outputPort: RangeSliderOutputPort = {
    updateValue: (newValue: number) => setValue(newValue),
    notifyValueChange: (newValue: number) => onChange(newValue),
    updateUIState: (state: UIState) => {
      setIsDragging(state.isDragging);
      setIsFocused(state.isFocused);
    },
  };

  const service = new RangeSliderService(model, outputPort);
  const adapter = new RangeSliderAdapter(service);

  const percentage = model.calculatePercentage();

  const handleDragStart = (): void => {
    if (!disabled) {
      adapter.setUIState({ isDragging: true, isFocused });
    }
  };

  const handleDragEnd = (): void => {
    adapter.setUIState({ isDragging: false, isFocused });
  };

  useEffect(() => {
    const handleDrag = (e: MouseEvent): void => {
      if (!isDragging || !sliderRef.current || disabled) return;
      adapter.handleDrag(e, sliderRef.current.getBoundingClientRect());
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleDrag);
      window.addEventListener("mouseup", handleDragEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", handleDragEnd);
    };
  }, [isDragging, disabled]);

  const sliderClasses = classNames(
    "range-slider",
    `range-slider--${theme}`,
    {
      "range-slider--disabled": disabled,
      "range-slider--dragging": isDragging,
      "range-slider--focused": isFocused,
    },
    className
  );

  return (
    <div className={sliderClasses}>
      <div className="range-slider__header">
        <label className="range-slider__label">{label}</label>
        <input
          type="number"
          value={value}
          onChange={(e) => adapter.handleInputChange(e)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="range-slider__input"
          onFocus={() => adapter.setUIState({ isDragging, isFocused: true })}
          onBlur={() => adapter.setUIState({ isDragging, isFocused: false })}
        />
      </div>

      <div
        ref={sliderRef}
        className="range-slider__track"
        onClick={(e) =>
          sliderRef.current &&
          adapter.handleSliderClick(
            e,
            sliderRef.current.getBoundingClientRect()
          )
        }
      >
        <div
          className="range-slider__progress"
          style={{ width: `${percentage}%` }}
        />

        <div
          className="range-slider__handle"
          style={{ left: `${percentage}%` }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        />
      </div>

      <div className="range-slider__limits">
        <span className="range-slider__limit">{min}</span>
        <span className="range-slider__limit">{max}</span>
      </div>
    </div>
  );
};

export default RangeSlider;
