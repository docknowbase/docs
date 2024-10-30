import React, { createContext, useContext, useId } from "react";
import classNames from "classnames";
import "./styles.scss";

const RadioContext = createContext();

const RadioGroup = ({
  name: propName,
  value,
  onChange,
  children,
  label,
  error,
  required,
  horizontal = false,
  disabled = false,
  size = "medium",
  variant = "default",
  className = "",
}) => {
  const groupId = useId();
  const name = propName || groupId;

  const handleChange = (newValue) => {
    if (!disabled) {
      onChange?.(newValue);
    }
  };

  const contextValue = {
    name,
    groupId,
    selectedValue: value,
    onChange: handleChange,
    disabled,
    size,
    variant,
  };

  return (
    <RadioContext.Provider value={contextValue}>
      <fieldset
        className={classNames(
          "radio_group",
          {
            "radio_group--horizontal": horizontal,
            "radio_group--vertical": !horizontal,
            "radio_group--disabled": disabled,
            [`radio_group--${size}`]: size,
            [`radio_group--${variant}`]: variant,
          },
          className
        )}
      >
        {label && (
          <legend className="radio_group__label">
            {label}
            {required && <span className="radio_group__required">*</span>}
          </legend>
        )}
        <div className="radio_group__options">{children}</div>
        {error && <div className="radio_group__error">{error}</div>}
      </fieldset>
    </RadioContext.Provider>
  );
};

const Radio = ({
  value,
  label,
  description,
  disabled: itemDisabled = false,
  className = "",
}) => {
  const {
    name,
    groupId,
    selectedValue,
    onChange,
    disabled: groupDisabled,
    size,
    variant,
  } = useContext(RadioContext);

  const isDisabled = itemDisabled || groupDisabled;
  const isChecked = selectedValue === value;
  const inputId = `${groupId}-${value}`;

  return (
    <label
      htmlFor={inputId}
      className={classNames(
        "radio",
        {
          "radio--disabled": isDisabled,
          "radio--checked": isChecked,
          [`radio--${size}`]: size,
          [`radio--${variant}`]: variant,
        },
        className
      )}
    >
      <input
        id={inputId}
        type="radio"
        className="radio__input"
        name={name}
        value={value}
        checked={isChecked}
        disabled={isDisabled}
        onChange={() => onChange(value)}
      />
      <span className="radio__control">
        <span className="radio__inner" />
      </span>
      <span className="radio__content">
        <span className="radio__label">{label}</span>
        {description && (
          <span className="radio__description">{description}</span>
        )}
      </span>
    </label>
  );
};

RadioGroup.Radio = Radio;
export default RadioGroup;
