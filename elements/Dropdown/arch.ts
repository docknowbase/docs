// src/core/domain/types.ts
export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownState {
  isOpen: boolean;
  focusedIndex: number;
  value: string;
  options: DropdownOption[];
}

// src/core/ports/dropdownPorts.ts
import { DropdownState, DropdownOption } from "../domain/types";

export interface DropdownUseCasePort {
  toggleDropdown: () => void;
  selectOption: (value: string) => void;
  handleKeyNavigation: (key: string) => void;
  setFocusedIndex: (index: number) => void;
  getCurrentState: () => DropdownState;
}

export interface DropdownStatePort {
  getState: () => DropdownState;
  setState: (state: Partial<DropdownState>) => void;
  subscribe: (callback: (state: DropdownState) => void) => () => void;
}

export interface ScrollPort {
  scrollIntoView: (element: HTMLElement) => void;
}

// src/infrastructure/adapters/dropdownStateAdapter.ts
import {
  DropdownState,
  DropdownStatePort,
} from "../../core/ports/dropdownPorts";

export class DropdownStateAdapter implements DropdownStatePort {
  private state: DropdownState;
  private subscribers: Array<(state: DropdownState) => void> = [];

  constructor(initialState: DropdownState) {
    this.state = initialState;
  }

  getState = (): DropdownState => this.state;

  setState = (newState: Partial<DropdownState>): void => {
    this.state = { ...this.state, ...newState };
    this.notifySubscribers();
  };

  subscribe = (callback: (state: DropdownState) => void): (() => void) => {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  };

  private notifySubscribers = (): void => {
    this.subscribers.forEach((callback) => callback(this.state));
  };
}

// src/infrastructure/adapters/scrollAdapter.ts
import { ScrollPort } from "../../core/ports/dropdownPorts";

export class ScrollAdapter implements ScrollPort {
  scrollIntoView = (element: HTMLElement): void => {
    element.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  };
}

// src/core/application/dropdownUseCase.ts
import {
  DropdownUseCasePort,
  DropdownStatePort,
  ScrollPort,
} from "../ports/dropdownPorts";
import { DropdownState } from "../domain/types";

export class DropdownUseCase implements DropdownUseCasePort {
  constructor(
    private readonly statePort: DropdownStatePort,
    private readonly scrollPort: ScrollPort
  ) {}

  toggleDropdown = (): void => {
    const state = this.statePort.getState();
    this.statePort.setState({
      isOpen: !state.isOpen,
      focusedIndex: !state.isOpen
        ? state.value
          ? state.options.findIndex((opt) => opt.value === state.value)
          : 0
        : state.focusedIndex,
    });
  };

  selectOption = (value: string): void => {
    this.statePort.setState({
      value,
      isOpen: false,
    });
  };

  handleKeyNavigation = (key: string): void => {
    const state = this.statePort.getState();

    switch (key) {
      case "Enter":
      case " ":
        if (!state.isOpen) {
          this.toggleDropdown();
        } else if (state.focusedIndex >= 0) {
          this.selectOption(state.options[state.focusedIndex].value);
        }
        break;

      case "ArrowDown":
        if (!state.isOpen) {
          this.toggleDropdown();
        } else {
          const nextIndex = (state.focusedIndex + 1) % state.options.length;
          this.setFocusedIndex(nextIndex);
        }
        break;

      case "ArrowUp":
        if (!state.isOpen) {
          this.toggleDropdown();
        } else {
          const prevIndex =
            (state.focusedIndex - 1 + state.options.length) %
            state.options.length;
          this.setFocusedIndex(prevIndex);
        }
        break;

      case "Escape":
        this.statePort.setState({ isOpen: false });
        break;
    }
  };

  setFocusedIndex = (index: number): void => {
    this.statePort.setState({ focusedIndex: index });
  };

  getCurrentState = (): DropdownState => this.statePort.getState();
}

// src/presentation/components/Dropdown/DropdownView.tsx
import React, { useEffect, useRef } from "react";
import { DropdownUseCasePort } from "../../../core/ports/dropdownPorts";

interface DropdownViewProps {
  useCase: DropdownUseCasePort;
  disabled?: boolean;
  placeholder?: string;
}

export const DropdownView: React.FC<DropdownViewProps> = ({
  useCase,
  disabled = false,
  placeholder = "Select an option",
}): JSX.Element => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const state = useCase.getCurrentState();
  const selectedOption = state.options.find(
    (option) => option.value === state.value
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        useCase.getCurrentState().isOpen && useCase.toggleDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [useCase]);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>
  ): void => {
    if (disabled) return;
    useCase.handleKeyNavigation(event.key);
    event.preventDefault();
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button
        className={`dropdown__trigger ${
          disabled ? "dropdown__trigger--disabled" : ""
        }`}
        onClick={() => !disabled && useCase.toggleDropdown()}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={state.isOpen}
        aria-disabled={disabled}
      >
        <span
          className={
            selectedOption
              ? "dropdown__selected-value"
              : "dropdown__placeholder"
          }
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span
          className={`dropdown__chevron ${
            state.isOpen ? "dropdown__chevron--open" : ""
          }`}
        >
          ▼
        </span>
      </button>

      <div
        ref={menuRef}
        className={`dropdown__menu ${
          state.isOpen ? "dropdown__menu--open" : ""
        }`}
        role="listbox"
        aria-activedescendant={
          state.focusedIndex >= 0
            ? `option-${state.options[state.focusedIndex].value}`
            : undefined
        }
      >
        {state.options.map((option, index) => (
          <div
            key={option.value}
            id={`option-${option.value}`}
            className={`
                dropdown__option
                ${
                  option.value === state.value
                    ? "dropdown__option--selected"
                    : ""
                }
                ${
                  index === state.focusedIndex
                    ? "dropdown__option--focused"
                    : ""
                }
              `}
            role="option"
            aria-selected={option.value === state.value}
            onClick={() => useCase.selectOption(option.value)}
            onMouseEnter={() => useCase.setFocusedIndex(index)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

// src/presentation/components/Dropdown/index.tsx
import React, { useEffect, useState } from "react";
import { DropdownView } from "./DropdownView";
import { DropdownStateAdapter } from "../../../infrastructure/adapters/dropdownStateAdapter";
import { ScrollAdapter } from "../../../infrastructure/adapters/scrollAdapter";
import { DropdownUseCase } from "../../../core/application/dropdownUseCase";
import { DropdownOption } from "../../../core/domain/types";

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled,
}): JSX.Element => {
  const [useCase] = useState(() => {
    const stateAdapter = new DropdownStateAdapter({
      isOpen: false,
      focusedIndex: -1,
      value,
      options,
    });
    const scrollAdapter = new ScrollAdapter();
    return new DropdownUseCase(stateAdapter, scrollAdapter);
  });

  useEffect(() => {
    const unsubscribe = (useCase as any).statePort.subscribe(
      (state: DropdownState) => {
        if (state.value !== value) {
          onChange(state.value);
        }
      }
    );
    return unsubscribe;
  }, [useCase, value, onChange]);

  return (
    <DropdownView
      useCase={useCase}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

// Example usage with TypeScript
export const DropdownExample: React.FC = (): JSX.Element => {
  const [selectedValue, setSelectedValue] = useState<string>("");

  const options: DropdownOption[] = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "orange", label: "Orange" },
    { value: "grape", label: "Grape" },
    { value: "mango", label: "Mango" },
  ];

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-xl font-semibold mb-4">Dropdown Example</h2>

      <Dropdown
        options={options}
        value={selectedValue}
        onChange={setSelectedValue}
        placeholder="Select a fruit"
      />

      <div className="mt-4">
        <Dropdown
          options={options}
          value="apple"
          onChange={() => {}}
          placeholder="Select a fruit"
          disabled
        />
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Selected value: {selectedValue || "none"}
      </div>
    </div>
  );
};
