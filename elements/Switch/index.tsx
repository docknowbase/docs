import React from "react";
import "./styles.scss";

export const ToggleSwitch = ({ isOn, onToggle, label, disabled = false }) => {
  const switchClasses = ["toggle-switch", disabled && "toggle-switch--disabled"]
    .filter(Boolean)
    .join(" ");

  const trackClasses = [
    "toggle-switch__track",
    isOn && "toggle-switch__track--active",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={switchClasses}>
      <div className="toggle-switch__container">
        <input
          type="checkbox"
          className="toggle-switch__input"
          checked={isOn}
          onChange={onToggle}
          disabled={disabled}
        />
        <div className={trackClasses}>
          <div className="toggle-switch__thumb" />
        </div>
      </div>
      {label && <span className="toggle-switch__label">{label}</span>}
    </label>
  );
};

// Example usage component
const ToggleExample = () => {
  const [isOn, setIsOn] = React.useState(false);

  return (
    <div className="toggle-example">
      <h2>Toggle Switch Examples</h2>

      <div className="toggle-list">
        {/* Basic toggle */}
        <ToggleSwitch
          isOn={isOn}
          onToggle={() => setIsOn(!isOn)}
          label="Basic toggle"
        />

        {/* Disabled toggle - off */}
        <ToggleSwitch
          isOn={false}
          onToggle={() => {}}
          label="Disabled toggle (off)"
          disabled={true}
        />

        {/* Disabled toggle - on */}
        <ToggleSwitch
          isOn={true}
          onToggle={() => {}}
          label="Disabled toggle (on)"
          disabled={true}
        />
      </div>

      <p className="toggle-status">Toggle status: {isOn ? "On" : "Off"}</p>
    </div>
  );
};

export default ToggleExample;
