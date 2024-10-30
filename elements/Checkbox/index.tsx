import React, { forwardRef } from "react";
import "./styles.scss";

const Checkbox = forwardRef(
  (
    {
      checked = false,
      indeterminate = false,
      onChange,
      disabled = false,
      label,
      error = false,
      name,
      className = "",
      ...props
    },
    ref
  ) => {
    const checkboxRef = React.useRef(null);
    // Each checkbox now maintains its own internal state
    const [internalChecked, setInternalChecked] = React.useState(checked);
    const [internalIndeterminate, setInternalIndeterminate] =
      React.useState(indeterminate);

    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = internalIndeterminate;
      }
    }, [internalIndeterminate]);

    // Update internal state when props change
    React.useEffect(() => {
      setInternalChecked(checked);
    }, [checked]);

    React.useEffect(() => {
      setInternalIndeterminate(indeterminate);
    }, [indeterminate]);

    const combinedRef = (element) => {
      checkboxRef.current = element;
      if (ref) {
        if (typeof ref === "function") {
          ref(element);
        } else {
          ref.current = element;
        }
      }
    };

    const handleChange = (e) => {
      setInternalChecked(e.target.checked);
      if (internalIndeterminate) {
        setInternalIndeterminate(false);
      }
      if (onChange) {
        onChange(e);
      }
    };

    const classes = [
      "custom-checkbox",
      disabled && "custom-checkbox--disabled",
      error && "custom-checkbox--error",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const controlClasses = [
      "custom-checkbox__control",
      internalIndeterminate && "custom-checkbox__control--indeterminate",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <label className={classes}>
        <input
          type="checkbox"
          ref={combinedRef}
          checked={internalChecked}
          onChange={handleChange}
          disabled={disabled}
          name={name}
          className="custom-checkbox__input"
          {...props}
        />
        <div className={controlClasses} />
        {label && <span className="custom-checkbox__label">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

// Individual checkbox components with their own state management
const BasicCheckbox = () => {
  const [checked, setChecked] = React.useState(false);
  return (
    <Checkbox
      label="Basic checkbox"
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
    />
  );
};

const IndeterminateCheckbox = () => {
  const [checked, setChecked] = React.useState(false);
  const [indeterminate, setIndeterminate] = React.useState(true);
  return (
    <Checkbox
      label="Indeterminate checkbox"
      checked={checked}
      indeterminate={indeterminate}
      onChange={(e) => {
        setChecked(e.target.checked);
        setIndeterminate(false);
      }}
    />
  );
};

const ErrorCheckbox = () => {
  const [checked, setChecked] = React.useState(false);
  return (
    <Checkbox
      label="Error state checkbox"
      error
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
    />
  );
};

// Example usage component with independent checkboxes
const CheckboxExample = () => {
  return (
    <div className="checkbox-demo">
      <h2>Checkbox Examples</h2>

      <div className="checkbox-list">
        <BasicCheckbox />
        <IndeterminateCheckbox />
        <Checkbox label="Disabled checkbox" disabled checked={false} />
        <ErrorCheckbox />

        {/* Example of inline usage with local state */}
        <Checkbox
          label="Additional checkbox"
          checked={React.useState(false)[0]}
          onChange={(e) => React.useState(false)[1](e.target.checked)}
        />
      </div>
    </div>
  );
};

export default CheckboxExample;
