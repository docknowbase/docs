// Core Domain (core/domain/types.ts)
export type ToggleId = string;

export interface ToggleState {
  id: ToggleId;
  isOn: boolean;
  disabled: boolean;
  label?: string;
}

export type ToggleStateUpdate = Partial<Omit<ToggleState, "id">>;

export interface ToggleActions {
  toggle: () => void;
  reset: () => void;
}

// Ports (core/ports/togglePorts.ts)
export interface ToggleStatePort {
  getToggleState: () => ToggleState;
  setToggleState: (newState: ToggleStateUpdate) => void;
  resetState: () => void;
}

export interface TogglePresenterPort {
  presentToggleState: (state: ToggleState) => void;
  presentError: (error: Error) => void;
}

export interface ToggleEventPort {
  onToggle: (handler: (state: ToggleState) => void) => void;
  offToggle: (handler: (state: ToggleState) => void) => void;
}

// Primary Adapter - React UI (adapters/primary/ToggleSwitchUI.tsx)
import React from "react";
import { ToggleState } from "../../core/domain/types";

interface ToggleSwitchUIProps {
  state: ToggleState;
  onToggle: () => void;
  className?: string;
}

export const ToggleSwitchUI: React.FC<ToggleSwitchUIProps> = ({
  state: { isOn, disabled, label },
  onToggle,
  className = "",
}) => {
  const switchClasses = React.useMemo(
    () =>
      ["toggle-switch", disabled && "toggle-switch--disabled", className]
        .filter(Boolean)
        .join(" "),
    [disabled, className]
  );

  const trackClasses = React.useMemo(
    () =>
      ["toggle-switch__track", isOn && "toggle-switch__track--active"]
        .filter(Boolean)
        .join(" "),
    [isOn]
  );

  const handleKeyPress = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle();
      }
    },
    [onToggle]
  );

  return (
    <label className={switchClasses}>
      <div
        className="toggle-switch__container"
        role="switch"
        aria-checked={isOn}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyPress={handleKeyPress}
      >
        <input
          type="checkbox"
          className="toggle-switch__input"
          checked={isOn}
          onChange={onToggle}
          disabled={disabled}
          aria-label={label}
        />
        <div className={trackClasses}>
          <div className="toggle-switch__thumb" />
        </div>
      </div>
      {label && <span className="toggle-switch__label">{label}</span>}
    </label>
  );
};

// Secondary Adapter - State Management (adapters/secondary/ToggleStateManager.ts)
import { useState, useCallback } from "react";
import {
  ToggleState,
  ToggleStatePort,
  ToggleStateUpdate,
} from "../../core/ports/togglePorts";

export class ToggleStateManager implements ToggleStatePort {
  private initialState: ToggleState;
  private state: ToggleState;
  private setState: React.Dispatch<React.SetStateAction<ToggleState>>;

  constructor(
    initialState: ToggleState,
    setState: React.Dispatch<React.SetStateAction<ToggleState>>
  ) {
    this.initialState = { ...initialState };
    this.state = initialState;
    this.setState = setState;
  }

  getToggleState = (): ToggleState => this.state;

  setToggleState = (newState: ToggleStateUpdate): void => {
    this.setState((current) => {
      this.state = { ...current, ...newState };
      return this.state;
    });
  };

  resetState = (): void => {
    this.setState(this.initialState);
    this.state = { ...this.initialState };
  };
}

export const useToggleStateManager = (
  initialState: ToggleState
): ToggleStatePort => {
  const [state, setState] = useState<ToggleState>(initialState);
  return React.useMemo(
    () => new ToggleStateManager(initialState, setState),
    [initialState]
  );
};

// Use Case (core/useCases/toggleUseCase.ts)
import { ToggleStatePort, TogglePresenterPort } from "../ports/togglePorts";
import { ToggleActions } from "../domain/types";

export class ToggleUseCase implements ToggleActions {
  constructor(
    private readonly statePort: ToggleStatePort,
    private readonly presenterPort: TogglePresenterPort
  ) {}

  toggle = (): void => {
    try {
      const currentState = this.statePort.getToggleState();
      if (!currentState.disabled) {
        this.statePort.setToggleState({ isOn: !currentState.isOn });
        this.presenterPort.presentToggleState(this.statePort.getToggleState());
      }
    } catch (error) {
      this.presenterPort.presentError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
    }
  };

  reset = (): void => {
    try {
      this.statePort.resetState();
      this.presenterPort.presentToggleState(this.statePort.getToggleState());
    } catch (error) {
      this.presenterPort.presentError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
    }
  };
}

// Presenter (adapters/presenters/TogglePresenter.ts)
import { TogglePresenterPort } from "../../core/ports/togglePorts";
import { ToggleState } from "../../core/domain/types";

export class TogglePresenter implements TogglePresenterPort {
  constructor(
    private readonly onStateChange: (state: ToggleState) => void,
    private readonly onError?: (error: Error) => void
  ) {}

  presentToggleState = (state: ToggleState): void => {
    this.onStateChange(state);
  };

  presentError = (error: Error): void => {
    if (this.onError) {
      this.onError(error);
    } else {
      console.error("Toggle Switch Error:", error);
    }
  };
}

// Main Component (ToggleSwitch.tsx)
import React, { useCallback, useEffect } from "react";
import { ToggleSwitchUI } from "./adapters/primary/ToggleSwitchUI";
import { useToggleStateManager } from "./adapters/secondary/ToggleStateManager";
import { TogglePresenter } from "./adapters/presenters/TogglePresenter";
import { ToggleUseCase } from "./core/useCases/toggleUseCase";
import { ToggleState } from "./core/domain/types";

interface ToggleSwitchProps {
  id: string;
  isOn: boolean;
  onToggle: (newState: boolean) => void;
  onError?: (error: Error) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  isOn,
  onToggle,
  onError,
  label,
  disabled = false,
  className,
}) => {
  const statePort = useToggleStateManager({
    id,
    isOn,
    disabled,
    label,
  });

  const presenter = React.useMemo(
    () =>
      new TogglePresenter(
        (state: ToggleState) => onToggle(state.isOn),
        onError
      ),
    [onToggle, onError]
  );

  const toggleUseCase = React.useMemo(
    () => new ToggleUseCase(statePort, presenter),
    [statePort, presenter]
  );

  // Sync external props with internal state
  useEffect(() => {
    statePort.setToggleState({ isOn, disabled, label });
  }, [isOn, disabled, label, statePort]);

  const handleToggle = useCallback(() => {
    toggleUseCase.toggle();
  }, [toggleUseCase]);

  return (
    <ToggleSwitchUI
      state={statePort.getToggleState()}
      onToggle={handleToggle}
      className={className}
    />
  );
};

// Example Usage Component (ToggleExample.tsx)
import React, { useState } from "react";
import { ToggleSwitch } from "./ToggleSwitch";

export const ToggleExample: React.FC = () => {
  const [isOn, setIsOn] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleError = (error: Error) => {
    setError(error);
    console.error("Toggle error:", error);
  };

  return (
    <div className="toggle-example">
      <h2>Toggle Switch Examples</h2>

      {error && (
        <div className="error-message" role="alert">
          {error.message}
        </div>
      )}

      <div className="toggle-list">
        <ToggleSwitch
          id="toggle-1"
          isOn={isOn}
          onToggle={setIsOn}
          onError={handleError}
          label="Basic toggle"
        />

        <ToggleSwitch
          id="toggle-2"
          isOn={false}
          onToggle={() => {}}
          onError={handleError}
          label="Disabled toggle (off)"
          disabled={true}
        />

        <ToggleSwitch
          id="toggle-3"
          isOn={true}
          onToggle={() => {}}
          onError={handleError}
          label="Disabled toggle (on)"
          disabled={true}
        />
      </div>

      <p className="toggle-status" role="status">
        Toggle status: {isOn ? "On" : "Off"}
      </p>
    </div>
  );
};

export default ToggleExample;
