// DualRangeSlider.jsx
import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames";
import "./styles.scss";

const DualRangeSlider = ({
  min = 0,
  max = 100,
  step = 1,
  defaultMinValue = 25,
  defaultMaxValue = 75,
  label = "Range",
  onChange = () => {},
  className,
  disabled = false,
  theme = "primary",
}) => {
  const [minValue, setMinValue] = useState(defaultMinValue);
  const [maxValue, setMaxValue] = useState(defaultMaxValue);
  const [activeDragHandle, setActiveDragHandle] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const sliderRef = useRef(null);

  const minPercentage = ((minValue - min) * 100) / (max - min);
  const maxPercentage = ((maxValue - min) * 100) / (max - min);

  const handleMinInputChange = (e) => {
    const newValue = Math.min(Math.max(Number(e.target.value), min), maxValue);
    setMinValue(newValue);
    onChange({ min: newValue, max: maxValue });
  };

  const handleMaxInputChange = (e) => {
    const newValue = Math.min(Math.max(Number(e.target.value), minValue), max);
    setMaxValue(newValue);
    onChange({ min: minValue, max: newValue });
  };

  const calculateValueFromPosition = (clientX) => {
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    return Math.round(((percentage * (max - min)) / 100 + min) / step) * step;
  };

  const handleSliderClick = (e) => {
    if (!sliderRef.current || disabled) return;

    const newValue = calculateValueFromPosition(e.clientX);
    const distanceToMin = Math.abs(newValue - minValue);
    const distanceToMax = Math.abs(newValue - maxValue);

    if (distanceToMin < distanceToMax) {
      setMinValue(Math.min(newValue, maxValue - step));
      onChange({ min: Math.min(newValue, maxValue - step), max: maxValue });
    } else {
      setMaxValue(Math.max(newValue, minValue + step));
      onChange({ min: minValue, max: Math.max(newValue, minValue + step) });
    }
  };

  const handleDragStart = (handle) => (e) => {
    if (!disabled) {
      e.preventDefault();
      setActiveDragHandle(handle);
    }
  };

  useEffect(() => {
    const handleDrag = (e) => {
      if (!activeDragHandle || !sliderRef.current || disabled) return;

      const newValue = calculateValueFromPosition(e.clientX);

      if (activeDragHandle === "min") {
        const clampedValue = Math.min(Math.max(newValue, min), maxValue - step);
        setMinValue(clampedValue);
        onChange({ min: clampedValue, max: maxValue });
      } else {
        const clampedValue = Math.min(Math.max(newValue, minValue + step), max);
        setMaxValue(clampedValue);
        onChange({ min: minValue, max: clampedValue });
      }
    };

    const handleDragEnd = () => {
      setActiveDragHandle(null);
    };

    if (activeDragHandle) {
      window.addEventListener("mousemove", handleDrag);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDrag);
      window.addEventListener("touchend", handleDragEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDrag);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [
    activeDragHandle,
    min,
    max,
    step,
    minValue,
    maxValue,
    onChange,
    disabled,
  ]);

  const sliderClasses = classNames(
    "dual-range-slider",
    `dual-range-slider--${theme}`,
    {
      "dual-range-slider--disabled": disabled,
      "dual-range-slider--dragging": activeDragHandle,
      "dual-range-slider--focused": isFocused,
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
            value={minValue}
            onChange={handleMinInputChange}
            min={min}
            max={maxValue - step}
            step={step}
            disabled={disabled}
            className="dual-range-slider__input"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <span className="dual-range-slider__input-separator">-</span>
          <input
            type="number"
            value={maxValue}
            onChange={handleMaxInputChange}
            min={minValue + step}
            max={max}
            step={step}
            disabled={disabled}
            className="dual-range-slider__input"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </div>
      </div>

      <div
        ref={sliderRef}
        className="dual-range-slider__track"
        onClick={handleSliderClick}
      >
        <div
          className="dual-range-slider__progress"
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`,
          }}
        />

        <div
          className={classNames(
            "dual-range-slider__handle",
            "dual-range-slider__handle--min",
            {
              "dual-range-slider__handle--active": activeDragHandle === "min",
            }
          )}
          style={{ left: `${minPercentage}%` }}
          onMouseDown={handleDragStart("min")}
          onTouchStart={handleDragStart("min")}
        />

        <div
          className={classNames(
            "dual-range-slider__handle",
            "dual-range-slider__handle--max",
            {
              "dual-range-slider__handle--active": activeDragHandle === "max",
            }
          )}
          style={{ left: `${maxPercentage}%` }}
          onMouseDown={handleDragStart("max")}
          onTouchStart={handleDragStart("max")}
        />
      </div>

      <div className="dual-range-slider__limits">
        <span className="dual-range-slider__limit">{min}</span>
        <span className="dual-range-slider__limit">{max}</span>
      </div>
    </div>
  );
};

export default DualRangeSlider;
