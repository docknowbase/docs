// RangeSlider.jsx
import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames";
import "./styles.scss";

const RangeSlider = ({
  min = 0,
  max = 100,
  step = 1,
  defaultValue = 50,
  label = "Range",
  onChange = () => {},
  className,
  disabled = false,
  theme = "primary", // primary, secondary, success
}) => {
  const [value, setValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const sliderRef = useRef(null);

  const percentage = ((value - min) * 100) / (max - min);

  const handleInputChange = (e) => {
    const newValue = Math.min(Math.max(Number(e.target.value), min), max);
    setValue(newValue);
    onChange(newValue);
  };

  const handleSliderClick = (e) => {
    if (!sliderRef.current || disabled) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const newValue = Math.round((percentage * (max - min)) / 100 + min);
    const clampedValue = Math.min(Math.max(newValue, min), max);

    setValue(clampedValue);
    onChange(clampedValue);
  };

  const handleDragStart = () => {
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleDrag = (e) => {
      if (!isDragging || !sliderRef.current || disabled) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      const newValue = Math.round((percentage * (max - min)) / 100 + min);
      const clampedValue = Math.min(Math.max(newValue, min), max);

      setValue(clampedValue);
      onChange(clampedValue);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleDrag);
      window.addEventListener("mouseup", handleDragEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", handleDragEnd);
    };
  }, [isDragging, min, max, onChange, disabled]);

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
          onChange={handleInputChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="range-slider__input"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>

      <div
        ref={sliderRef}
        className="range-slider__track"
        onClick={handleSliderClick}
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
