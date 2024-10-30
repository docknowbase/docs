// src/components/LockToggle/index.jsx
import React, { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import classNames from "classnames";
import "./styles.scss";

const LockToggle = ({
  initialState = false,
  onToggle,
  disabled = false,
  className = "",
}) => {
  const [isLocked, setIsLocked] = useState(initialState);

  const handleToggle = () => {
    if (!disabled) {
      const newState = !isLocked;
      setIsLocked(newState);
      onToggle?.(newState);
    }
  };

  return (
    <button
      type="button"
      className={classNames(
        "lock-toggle",
        {
          "lock-toggle--locked": isLocked,
          "lock-toggle--unlocked": !isLocked,
          "lock-toggle--disabled": disabled,
        },
        className
      )}
      onClick={handleToggle}
      disabled={disabled}
      aria-pressed={isLocked}
    >
      <div className="lock-toggle__content">
        <span className="lock-toggle__icon">
          {isLocked ? (
            <Lock className="lock-toggle__icon-svg" />
          ) : (
            <Unlock className="lock-toggle__icon-svg" />
          )}
        </span>
        <span className="lock-toggle__text">
          {isLocked ? "Locked" : "Unlocked"}
        </span>
      </div>
    </button>
  );
};

export default LockToggle;
