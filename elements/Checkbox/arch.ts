// src/domain/types/checkbox.types.ts
export interface CheckboxState {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  error: boolean;
}

export interface CheckboxMetadata {
  label?: string;
  name?: string;
  className?: string;
}

export type CheckboxEventHandler = (state: CheckboxState) => void;

export interface CheckboxProps extends CheckboxState, CheckboxMetadata {
  onChange?: CheckboxEventHandler;
}

// src/domain/ports/checkbox.port.ts
export interface CheckboxPort {
  getState(): CheckboxState;
  setState(newState: Partial<CheckboxState>): void;
  reset(): void;
}

// src/domain/events/checkbox.events.ts
export type CheckboxEventType =
  | "TOGGLE"
  | "SET_INDETERMINATE"
  | "SET_DISABLED"
  | "SET_ERROR";

export interface CheckboxEvent {
  type: CheckboxEventType;
  payload?: Partial<CheckboxState>;
}

// src/application/services/checkbox.service.ts
export class CheckboxService {
  constructor(private readonly port: CheckboxPort) {}

  public toggle(): void {
    const currentState = this.port.getState();
    this.port.setState({
      checked: !currentState.checked,
      indeterminate: false,
    });
  }

  public setIndeterminate(value: boolean): void {
    this.port.setState({ indeterminate: value });
  }

  public setDisabled(value: boolean): void {
    this.port.setState({ disabled: value });
  }

  public setError(value: boolean): void {
    this.port.setState({ error: value });
  }

  public getState(): CheckboxState {
    return this.port.getState();
  }
}

// src/infrastructure/adapters/react-checkbox.adapter.ts
import { Dispatch, SetStateAction } from "react";
import { CheckboxPort, CheckboxState } from "../../domain/types";

export class ReactCheckboxAdapter implements CheckboxPort {
  constructor(
    private state: CheckboxState,
    private setState: Dispatch<SetStateAction<CheckboxState>>
  ) {}

  public getState(): CheckboxState {
    return this.state;
  }

  public setState(newState: Partial<CheckboxState>): void {
    this.setState((prevState) => ({
      ...prevState,
      ...newState,
    }));
  }

  public reset(): void {
    const initialState: CheckboxState = {
      checked: false,
      indeterminate: false,
      disabled: false,
      error: false,
    };
    this.setState(initialState);
  }
}

// src/presentation/hooks/useCheckbox.ts
import { useRef, useState } from "react";
import {
  CheckboxState,
  CheckboxService,
  ReactCheckboxAdapter,
} from "../../domain";

interface UseCheckboxResult {
  state: CheckboxState;
  service: CheckboxService;
}

export const useCheckbox = (initialState: CheckboxState): UseCheckboxResult => {
  const [state, setState] = useState<CheckboxState>(initialState);

  const adapter = useRef<ReactCheckboxAdapter>(
    new ReactCheckboxAdapter(initialState, setState)
  );

  const service = useRef<CheckboxService>(new CheckboxService(adapter.current));

  return {
    state,
    service: service.current,
  };
};

// src/presentation/components/Checkbox.tsx
import React, { forwardRef, useEffect, useRef, RefObject } from "react";
import { CheckboxProps } from "../../domain/types";
import { useCheckbox } from "../hooks";

type CheckboxRef = HTMLInputElement;

export const Checkbox = forwardRef<CheckboxRef, CheckboxProps>(
  (
    {
      checked = false,
      indeterminate = false,
      disabled = false,
      error = false,
      label,
      name,
      className = "",
      onChange,
      ...props
    },
    ref
  ) => {
    const checkboxRef = useRef<CheckboxRef>(null);
    const { state, service } = useCheckbox({
      checked,
      indeterminate,
      disabled,
      error,
    });

    useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = state.indeterminate;
      }
    }, [state.indeterminate]);

    const combinedRef = (element: CheckboxRef | null) => {
      checkboxRef.current = element;
      if (ref) {
        if (typeof ref === "function") {
          ref(element);
        } else {
          (ref as RefObject<CheckboxRef>).current = element;
        }
      }
    };

    const handleChange = (): void => {
      service.toggle();
      onChange?.(service.getState());
    };

    const classes = [
      "custom-checkbox",
      state.disabled && "custom-checkbox--disabled",
      state.error && "custom-checkbox--error",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const controlClasses = [
      "custom-checkbox__control",
      state.indeterminate && "custom-checkbox__control--indeterminate",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <label className={classes}>
        <input
          type="checkbox"
          ref={combinedRef}
          checked={state.checked}
          onChange={handleChange}
          disabled={state.disabled}
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

// src/presentation/components/CheckboxExample.tsx
export const CheckboxExample: React.FC = () => {
  const { state: basicState, service: basicService } = useCheckbox({
    checked: false,
    indeterminate: false,
    disabled: false,
    error: false,
  });

  const { state: indeterminateState, service: indeterminateService } =
    useCheckbox({
      checked: false,
      indeterminate: true,
      disabled: false,
      error: false,
    });

  const { state: errorState, service: errorService } = useCheckbox({
    checked: false,
    indeterminate: false,
    disabled: false,
    error: true,
  });

  return (
    <div className="checkbox-demo">
      <h2>Checkbox Examples</h2>
      <div className="checkbox-list">
        <Checkbox
          label="Basic checkbox"
          {...basicState}
          onChange={() => basicService.toggle()}
        />
        <Checkbox
          label="Indeterminate checkbox"
          {...indeterminateState}
          onChange={() => {
            indeterminateService.toggle();
            indeterminateService.setIndeterminate(false);
          }}
        />
        <Checkbox label="Disabled checkbox" disabled checked={false} />
        <Checkbox
          label="Error state checkbox"
          {...errorState}
          onChange={() => errorService.toggle()}
        />
      </div>
    </div>
  );
};

// src/utils/test-utils.ts
export class MockCheckboxPort implements CheckboxPort {
  private state: CheckboxState = {
    checked: false,
    indeterminate: false,
    disabled: false,
    error: false,
  };

  public getState(): CheckboxState {
    return this.state;
  }

  public setState(newState: Partial<CheckboxState>): void {
    this.state = { ...this.state, ...newState };
  }

  public reset(): void {
    this.state = {
      checked: false,
      indeterminate: false,
      disabled: false,
      error: false,
    };
  }
}

// Example test file: src/__tests__/checkbox.service.test.ts
import { CheckboxService } from "../application/services/checkbox.service";
import { MockCheckboxPort } from "../utils/test-utils";

describe("CheckboxService", () => {
  let service: CheckboxService;
  let port: MockCheckboxPort;

  beforeEach(() => {
    port = new MockCheckboxPort();
    service = new CheckboxService(port);
  });

  test("toggle should switch checked state", () => {
    expect(service.getState().checked).toBe(false);
    service.toggle();
    expect(service.getState().checked).toBe(true);
  });

  test("toggle should clear indeterminate state", () => {
    port.setState({ indeterminate: true });
    service.toggle();
    expect(service.getState().indeterminate).toBe(false);
  });
});
