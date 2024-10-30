// ProgressBar.jsx
import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import "./styles.scss";

const ProgressBar = ({
  value = 0,
  max = 100,
  min = 0,
  variant = "primary",
  size = "medium",
  showLabel = true,
  labelPosition = "right",
  animated = true,
  striped = false,
  indeterminate = false,
  thickness = "normal",
  className,
  label,
  customLabel,
  showValue = true,
  roundedCorners = true,
  status = "default", // default, success, error, warning
  onComplete,
}) => {
  const [prevValue, setPrevValue] = useState(value);
  const [isIncreasing, setIsIncreasing] = useState(false);
  const progressRef = useRef(null);

  // Calculate percentage
  const percentage = Math.min(
    100,
    Math.max(0, ((value - min) / (max - min)) * 100)
  );

  useEffect(() => {
    if (value !== prevValue) {
      setIsIncreasing(value > prevValue);
      setPrevValue(value);
    }
  }, [value, prevValue]);

  useEffect(() => {
    if (percentage === 100 && onComplete) {
      onComplete();
    }
  }, [percentage, onComplete]);

  const renderLabel = () => {
    if (customLabel) {
      return customLabel;
    }

    if (label) {
      return label;
    }

    if (showValue) {
      return `${Math.round(percentage)}%`;
    }

    return null;
  };

  const progressClasses = classNames(
    "progress-bar",
    `progress-bar--${variant}`,
    `progress-bar--${size}`,
    `progress-bar--${thickness}`,
    `progress-bar--${status}`,
    {
      "progress-bar--animated": animated && !indeterminate,
      "progress-bar--striped": striped,
      "progress-bar--indeterminate": indeterminate,
      "progress-bar--rounded": roundedCorners,
      "progress-bar--increasing": isIncreasing,
      "progress-bar--decreasing": !isIncreasing,
      "progress-bar--complete": percentage === 100,
      [`progress-bar--label-${labelPosition}`]: showLabel,
    },
    className
  );

  return (
    <div className={progressClasses}>
      {showLabel && labelPosition === "top" && (
        <div className="progress-bar__label progress-bar__label--top">
          {renderLabel()}
        </div>
      )}

      <div
        className="progress-bar__track"
        role="progressbar"
        aria-valuenow={indeterminate ? null : value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label || "Progress"}
      >
        <div
          ref={progressRef}
          className="progress-bar__fill"
          style={{ width: indeterminate ? "100%" : `${percentage}%` }}
        >
          {showLabel && labelPosition === "inner" && (
            <div className="progress-bar__label progress-bar__label--inner">
              {renderLabel()}
            </div>
          )}
        </div>
      </div>

      {showLabel && labelPosition === "right" && (
        <div className="progress-bar__label progress-bar__label--right">
          {renderLabel()}
        </div>
      )}

      {showLabel && labelPosition === "bottom" && (
        <div className="progress-bar__label progress-bar__label--bottom">
          {renderLabel()}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
