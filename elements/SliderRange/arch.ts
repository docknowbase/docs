// src/domain/types/slider.types.ts
export interface SliderRange {
    min: number;
    max: number;
  }
  
  export interface SliderState extends SliderRange {
    step: number;
    defaultMinValue: number;
    defaultMaxValue: number;
    minValue: number;
    maxValue: number;
    activeDragHandle: 'min' | 'max' | null;
    isFocused: boolean;
    disabled: boolean;
    onChange: (range: SliderRange) => void;
  }
  
  export interface ValidationResult {
    isValid: boolean;
    message: string;
  }
  
  export interface DragResult {
    type: 'min' | 'max';
    value: number;
  }
  
  export interface ClientRect {
    left: number;
    width: number;
  }
  
  // src/domain/ports/SliderPort.ts
  export interface ISliderPort {
    calculatePercentage: (value: number, min: number, max: number) => number;
    clampValue: (value: number, min: number, max: number) => number;
    calculateValueFromPosition: (
      clientX: number,
      rect: ClientRect,
      min: number,
      max: number,
      step: number
    ) => number;
    validateRange: (
      minValue: number,
      maxValue: number,
      min: number,
      max: number,
      step: number
    ) => ValidationResult;
  }
  
  export const createSliderPort = (): ISliderPort => ({
    calculatePercentage: (value: number, min: number, max: number): number => 
      ((value - min) * 100) / (max - min),
    
    clampValue: (value: number, min: number, max: number): number => 
      Math.min(Math.max(value, min), max),
    
    calculateValueFromPosition: (
      clientX: number,
      rect: ClientRect,
      min: number,
      max: number,
      step: number
    ): number => {
      const x = clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      return Math.round(((percentage * (max - min)) / 100 + min) / step) * step;
    },
  
    validateRange: (
      minValue: number,
      maxValue: number,
      min: number,
      max: number,
      step: number
    ): ValidationResult => ({
      isValid: minValue <= maxValue - step && maxValue >= minValue + step && 
               minValue >= min && maxValue <= max,
      message: minValue > maxValue - step ? 
        'Minimum value must be less than maximum value' : 
        'Values must be within range'
    })
  });
  
  // src/domain/SliderState.ts
  export interface ISliderStateManager {
    getState: () => SliderState;
    updateMinValue: (value: number) => SliderState;
    updateMaxValue: (value: number) => SliderState;
    setActiveDragHandle: (handle: 'min' | 'max' | null) => SliderState;
    setFocused: (focused: boolean) => SliderState;
  }
  
  export const createSliderState = (initialState: Partial<SliderState>): ISliderStateManager => {
    const state: SliderState = {
      min: 0,
      max: 100,
      step: 1,
      defaultMinValue: 25,
      defaultMaxValue: 75,
      minValue: initialState.defaultMinValue ?? 25,
      maxValue: initialState.defaultMaxValue ?? 75,
      activeDragHandle: null,
      isFocused: false,
      disabled: false,
      onChange: () => {},
      ...initialState
    };
  
    return {
      getState: () => ({ ...state }),
      
      updateMinValue: (value: number) => {
        state.minValue = value;
        return { ...state };
      },
      
      updateMaxValue: (value: number) => {
        state.maxValue = value;
        return { ...state };
      },
      
      setActiveDragHandle: (handle: 'min' | 'max' | null) => {
        state.activeDragHandle = handle;
        return { ...state };
      },
      
      setFocused: (focused: boolean) => {
        state.isFocused = focused;
        return { ...state };
      }
    };
  };
  
  // src/application/SliderService.ts
  export interface ISliderService {
    handleMinValueChange: (state: SliderState, newValue: number) => number;
    handleMaxValueChange: (state: SliderState, newValue: number) => number;
    handleSliderClick: (state: SliderState, clientX: number, rect: ClientRect) => DragResult;
  }
  
  export const createSliderService = (sliderPort: ISliderPort): ISliderService => {
    const handleMinValueChange = (state: SliderState, newValue: number): number => {
      return sliderPort.clampValue(
        newValue,
        state.min,
        state.maxValue - state.step
      );
    };
  
    const handleMaxValueChange = (state: SliderState, newValue: number): number => {
      return sliderPort.clampValue(
        newValue,
        state.minValue + state.step,
        state.max
      );
    };
  
    const handleSliderClick = (
      state: SliderState,
      clientX: number,
      rect: ClientRect
    ): DragResult => {
      const newValue = sliderPort.calculateValueFromPosition(
        clientX,
        rect,
        state.min,
        state.max,
        state.step
      );
  
      const distanceToMin = Math.abs(newValue - state.minValue);
      const distanceToMax = Math.abs(newValue - state.maxValue);
  
      if (distanceToMin < distanceToMax) {
        return {
          type: 'min',
          value: handleMinValueChange(state, newValue)
        };
      } else {
        return {
          type: 'max',
          value: handleMaxValueChange(state, newValue)
        };
      }
    };
  
    return {
      handleMinValueChange,
      handleMaxValueChange,
      handleSliderClick
    };
  };
  
  // src/adapters/SliderAdapter.ts
  import { useCallback } from 'react';
  import { ISliderService } from '../application/SliderService';
  import { ISliderPort } from '../domain/ports/SliderPort';
  import { SliderState } from '../domain/types/slider.types';
  
  export interface ISliderAdapter {
    handleMinInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleMaxInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSliderClick: (e: React.MouseEvent, rect: ClientRect) => void;
    handleDragStart: (handle: 'min' | 'max') => 
      (e: React.MouseEvent | React.TouchEvent) => void;
  }
  
  export const createSliderAdapter = (
    sliderService: ISliderService,
    sliderPort: ISliderPort
  ) => {
    const useSliderAdapter = (
      state: SliderState,
      setState: React.Dispatch<React.SetStateAction<SliderState>>
    ): ISliderAdapter => {
      const handleMinInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = sliderService.handleMinValueChange(
          state,
          Number(e.target.value)
        );
        setState(prev => ({
          ...prev,
          minValue: newValue
        }));
        state.onChange({ min: newValue, max: state.maxValue });
      }, [state]);
  
      const handleMaxInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = sliderService.handleMaxValueChange(
          state,
          Number(e.target.value)
        );
        setState(prev => ({
          ...prev,
          maxValue: newValue
        }));
        state.onChange({ min: state.minValue, max: newValue });
      }, [state]);
  
      const handleSliderClick = useCallback((e: React.MouseEvent, rect: ClientRect) => {
        if (!state.disabled) {
          const result = sliderService.handleSliderClick(state, e.clientX, rect);
          if (result.type === 'min') {
            setState(prev => ({
              ...prev,
              minValue: result.value
            }));
            state.onChange({ min: result.value, max: state.maxValue });
          } else {
            setState(prev => ({
              ...prev,
              maxValue: result.value
            }));
            state.onChange({ min: state.minValue, max: result.value });
          }
        }
      }, [state]);
  
      const handleDragStart = useCallback((handle: 'min' | 'max') => 
        (e: React.MouseEvent | React.TouchEvent) => {
          if (!state.disabled) {
            e.preventDefault();
            setState(prev => ({
              ...prev,
              activeDragHandle: handle
            }));
          }
        }, [state.disabled]);
  
      return {
        handleMinInputChange,
        handleMaxInputChange,
        handleSliderClick,
        handleDragStart
      };
    };
  
    return { useSliderAdapter };
  };
  
  // src/infrastructure/ui/DualRangeSlider.tsx
  import React, { useState, useRef, useEffect } from 'react';
  import classNames from 'classnames';
  import { createSliderPort } from '../../domain/ports/SliderPort';
  import { createSliderService } from '../../application/SliderService';
  import { createSliderAdapter } from '../../adapters/SliderAdapter';
  import { createSliderState } from '../../domain/SliderState';
  import { SliderRange, SliderState } from '../../domain/types/slider.types';
  
  interface DualRangeSliderProps {
    min?: number;
    max?: number;
    step?: number;
    defaultMinValue?: number;
    defaultMaxValue?: number;
    label?: string;
    onChange?: (range: SliderRange) => void;
    className?: string;
    disabled?: boolean;
    theme?: string;
  }
  
  const sliderPort = createSliderPort();
  const sliderService = createSliderService(sliderPort);
  const { useSliderAdapter } = createSliderAdapter(sliderService, sliderPort);
  
  const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
    min = 0,
    max = 100,
    step = 1,
    defaultMinValue = 25,
    defaultMaxValue = 75,
    label = "Range",
    onChange = () => {},
    className,
    disabled = false,
    theme = "primary"
  }) => {
    const initialState = createSliderState({
      min,
      max,
      step,
      defaultMinValue,
      defaultMaxValue,
      disabled,
      onChange
    });
    
    const [state, setState] = useState<SliderState>(initialState.getState());
    const sliderRef = useRef<HTMLDivElement>(null);
  
    const {
      handleMinInputChange,
      handleMaxInputChange,
      handleSliderClick,
      handleDragStart
    } = useSliderAdapter(state, setState);
  
    useEffect(() => {
      const handleDrag = (e: MouseEvent | TouchEvent) => {
        if (!state.activeDragHandle || !sliderRef.current || state.disabled) return;
  
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const rect = sliderRef.current.getBoundingClientRect();
  
        const newValue = sliderPort.calculateValueFromPosition(
          clientX,
          rect,
          state.min,
          state.max,
          state.step
        );
  
        if (state.activeDragHandle === 'min') {
          const clampedValue = sliderService.handleMinValueChange(state, newValue);
          setState(prev => ({
            ...prev,
            minValue: clampedValue
          }));
          onChange({ min: clampedValue, max: state.maxValue });
        } else {
          const clampedValue = sliderService.handleMaxValueChange(state, newValue);
          setState(prev => ({
            ...prev,
            maxValue: clampedValue
          }));
          onChange({ min: state.minValue, max: clampedValue });
        }
      };
  
      const handleDragEnd = () => {
        setState(prev => ({
          ...prev,
          activeDragHandle: null
        }));
      };
  
      if (state.activeDragHandle) {
        window.addEventListener('mousemove', handleDrag);
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchmove', handleDrag);
        window.addEventListener('touchend', handleDragEnd);
      }
  
      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDrag);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }, [state, onChange]);
  
    const minPercentage = sliderPort.calculatePercentage(state.minValue, min, max);
    const maxPercentage = sliderPort.calculatePercentage(state.maxValue, min, max);
  
    const sliderClasses = classNames(
      'dual-range-slider',
      `dual-range-slider--${theme}`,
      {
        'dual-range-slider--disabled': disabled,
        'dual-range-slider--dragging': state.activeDragHandle,
        'dual-range-slider--focused': state.isFocused
      },
      className
    );
  
    return (
      <div className={sliderClasses}>
        <div className="dual-range-slider__header">
          <label className="dual-range-slider__label">{label}</label>
          <div className="dual-range-slider__inputs">
            <input
              type="number"
              value={state.minValue}
              onChange={handleMinInputChange}
              min={min}
              max={state.maxValue - step}
              step={step}
              disabled={disabled}
              className="dual-range-slider__input"
              onFocus={() => setState(prev => ({ ...prev, isFocused: true }))}
              onBlur={() => setState(prev => ({ ...prev, isFocused: false }))}
            />
            <span className="dual-range-slider__input-separator">-</span>
            <input
              type="number"
              value={state.maxValue}
              onChange={handleMaxInputChange}
              min={state.minValue + step}
              max={max}
              step={step}
              disabled={disabled}
              className="dual-range-slider__input"
              onFocus={() => setState(prev => ({ ...prev, isFocused: true }))}
              onBlur={() => setState(prev => ({ ...prev, isFocused: false }))}
            />
          </div>
        </div>
  
        <div
          ref={sliderRef}
          className="dual-range-slider__track"
          onClick={(e) => handleSliderClick(e, sliderRef.current?.getBoundingClientRect() as DOMRect)}
        >
          <div
            className="dual-range-slider__progress"
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`
            }}
          />
  
          <div
            className={classNames(
              'dual-range-slider__handle',
              'dual-range-slider__handle--min',