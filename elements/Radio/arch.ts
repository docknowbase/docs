// src/types/radio.types.ts
export interface RadioOptionType {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupState {
  options: RadioOptionType[];
  selectedValue: string | null;
  disabled: boolean;
}

export interface RadioGroupProps {
  adapter: RadioGroupPort;
  options: RadioOptionType[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  horizontal?: boolean;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "default" | "primary" | "secondary";
  className?: string;
  children?: React.ReactNode;
}

export interface RadioProps {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export interface RadioContextType {
  groupId: string;
  selectedValue: string | null;
  onChange: (value: string) => void;
  disabled: boolean;
  size: "small" | "medium" | "large";
  variant: "default" | "primary" | "secondary";
}

// src/domain/radio.ts
export class RadioOption implements RadioOptionType {
  constructor(
    public value: string,
    public label: string,
    public description: string = "",
    public disabled: boolean = false
  ) {}
}

export class RadioGroup {
  constructor(
    private options: RadioOptionType[] = [],
    private selectedValue: string | null = null,
    private disabled: boolean = false
  ) {}

  select(value: string): string | null {
    if (!this.disabled) {
      this.selectedValue = value;
    }
    return this.selectedValue;
  }

  isSelected(value: string): boolean {
    return this.selectedValue === value;
  }

  getState(): RadioGroupState {
    return {
      options: this.options,
      selectedValue: this.selectedValue,
      disabled: this.disabled,
    };
  }
}

// src/ports/radio-port.ts
export abstract class RadioGroupPort {
  abstract initialize(
    options: RadioOptionType[],
    initialValue?: string | null,
    disabled?: boolean
  ): RadioGroupState;

  abstract select(value: string): RadioGroupState;
  abstract getState(): RadioGroupState;
}

export abstract class RadioStoragePort {
  abstract save(state: RadioGroupState): boolean;
  abstract load(): RadioGroupState | null;
}

// src/adapters/primary/radio-group-adapter.ts
import { RadioGroup } from "../../domain/radio";
import { RadioGroupPort } from "../../ports/radio-port";
import { RadioStoragePort } from "../../ports/radio-port";
import { RadioGroupState, RadioOptionType } from "../../types/radio.types";

export class RadioGroupAdapter extends RadioGroupPort {
  private radioGroup: RadioGroup;

  constructor(
    radioGroup: RadioGroup,
    private storageAdapter: RadioStoragePort
  ) {
    super();
    this.radioGroup = radioGroup;
  }

  initialize(
    options: RadioOptionType[],
    initialValue: string | null = null,
    disabled: boolean = false
  ): RadioGroupState {
    const savedState = this.storageAdapter.load();
    this.radioGroup = new RadioGroup(
      options,
      savedState?.selectedValue || initialValue,
      disabled
    );
    return this.getState();
  }

  select(value: string): RadioGroupState {
    const newValue = this.radioGroup.select(value);
    const state = this.getState();
    this.storageAdapter.save(state);
    return state;
  }

  getState(): RadioGroupState {
    return this.radioGroup.getState();
  }
}

// src/adapters/secondary/local-storage-adapter.ts
import { RadioStoragePort } from "../../ports/radio-port";
import { RadioGroupState } from "../../types/radio.types";

export class LocalStorageAdapter extends RadioStoragePort {
  constructor(private storageKey: string = "radio-group-state") {
    super();
  }

  save(state: RadioGroupState): boolean {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error("Failed to save radio state:", error);
      return false;
    }
  }

  load(): RadioGroupState | null {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Failed to load radio state:", error);
      return null;
    }
  }
}

// src/adapters/secondary/session-storage-adapter.ts
import { RadioStoragePort } from "../../ports/radio-port";
import { RadioGroupState } from "../../types/radio.types";

export class SessionStorageAdapter extends RadioStoragePort {
  constructor(private storageKey: string = "radio-group-state") {
    super();
  }

  save(state: RadioGroupState): boolean {
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error("Failed to save radio state:", error);
      return false;
    }
  }

  load(): RadioGroupState | null {
    try {
      const saved = sessionStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Failed to load radio state:", error);
      return null;
    }
  }
}

// src/ui/context/RadioContext.tsx
import { createContext } from "react";
import { RadioContextType } from "../../types/radio.types";

export const RadioContext = createContext<RadioContextType | null>(null);

// src/ui/hooks/useRadioGroup.ts
import { useState, useCallback, useEffect } from "react";
import { RadioGroupPort } from "../../ports/radio-port";
import { RadioGroupState, RadioOptionType } from "../../types/radio.types";

export const useRadioGroup = (
  adapter: RadioGroupPort,
  options: RadioOptionType[],
  initialValue?: string | null,
  disabled: boolean = false
): RadioGroupState & { onChange: (value: string) => void } => {
  const [state, setState] = useState<RadioGroupState>(() =>
    adapter.initialize(options, initialValue, disabled)
  );

  const handleChange = useCallback(
    (value: string) => {
      const newState = adapter.select(value);
      setState(newState);
    },
    [adapter]
  );

  useEffect(() => {
    const currentState = adapter.getState();
    setState(currentState);
  }, [adapter]);

  return {
    ...state,
    onChange: handleChange,
  };
};

// src/ui/components/RadioGroup.tsx
import React, { useId } from "react";
import classNames from "classnames";
import { RadioContext } from "../context/RadioContext";
import { useRadioGroup } from "../hooks/useRadioGroup";
import { RadioGroupProps, RadioContextType } from "../../types/radio.types";

export const RadioGroup: React.FC<RadioGroupProps> = ({
  adapter,
  options,
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
  const { selectedValue, onChange: handleChange } = useRadioGroup(
    adapter,
    options,
    value,
    disabled
  );

  const contextValue: RadioContextType = {
    groupId,
    selectedValue,
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

// src/ui/components/Radio.tsx
import React, { useContext } from "react";
import classNames from "classnames";
import { RadioContext } from "../context/RadioContext";
import { RadioProps, RadioContextType } from "../../types/radio.types";

export const Radio: React.FC<RadioProps> = ({
  value,
  label,
  description,
  disabled: itemDisabled = false,
  className = "",
}) => {
  const context = useContext(RadioContext);

  if (!context) {
    throw new Error("Radio must be used within a RadioGroup");
  }

  const {
    groupId,
    selectedValue,
    onChange,
    disabled: groupDisabled,
    size,
    variant,
  } = context;

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

// Example usage with TypeScript
// src/App.tsx
import React from "react";
import { RadioGroup, Radio } from "./ui/components";
import { RadioGroupAdapter } from "./adapters/primary/radio-group-adapter";
import { LocalStorageAdapter } from "./adapters/secondary/local-storage-adapter";
import { RadioGroup as RadioGroupDomain } from "./domain/radio";
import { RadioOptionType } from "./types/radio.types";

const App: React.FC = () => {
  const storageAdapter = new LocalStorageAdapter("my-radio-group");
  const radioGroup = new RadioGroupDomain();
  const adapter = new RadioGroupAdapter(radioGroup, storageAdapter);

  const options: RadioOptionType[] = [
    { value: "option1", label: "Option 1", description: "Description 1" },
    { value: "option2", label: "Option 2", description: "Description 2" },
    { value: "option3", label: "Option 3", description: "Description 3" },
  ];

  return (
    <RadioGroup
      adapter={adapter}
      options={options}
      label="Select an option"
      required
      horizontal
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          value={option.value}
          label={option.label}
          description={option.description}
        />
      ))}
    </RadioGroup>
  );
};

export default App;
