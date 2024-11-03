// src/types/common.ts
export type Nullable<T> = T | null;

// src/domain/ports/MultiselectPort.ts
export interface Option {
  value: string;
  label: string;
}

export interface MultiselectConfig {
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  maxItems?: number;
  closeOnSelect?: boolean;
}

export interface MultiselectState {
  isOpen: boolean;
  searchValue: string;
  focusedIndex: number;
  selectedValues: string[];
}

export interface IMultiselectPort {
  getFilteredOptions: (
    options: ReadonlyArray<Option>,
    searchValue: string
  ) => ReadonlyArray<Option>;
  getSelectedOptions: (
    options: ReadonlyArray<Option>,
    selectedValues: ReadonlyArray<string>
  ) => ReadonlyArray<Option>;
  toggleOption: (
    currentValues: ReadonlyArray<string>,
    optionValue: string,
    maxItems?: number
  ) => ReadonlyArray<string>;
  removeOption: (
    currentValues: ReadonlyArray<string>,
    optionValue: string
  ) => ReadonlyArray<string>;
  clearAll: () => ReadonlyArray<string>;
  handleKeyboardNavigation: (
    key: string,
    state: Readonly<MultiselectState>,
    options: ReadonlyArray<Option>
  ) => Partial<MultiselectState>;
}

// src/domain/adapters/MultiselectAdapter.ts
import {
  IMultiselectPort,
  Option,
  MultiselectState,
} from "../ports/MultiselectPort";

export class MultiselectAdapter implements IMultiselectPort {
  public getFilteredOptions(
    options: ReadonlyArray<Option>,
    searchValue: string
  ): ReadonlyArray<Option> {
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    );
  }

  public getSelectedOptions(
    options: ReadonlyArray<Option>,
    selectedValues: ReadonlyArray<string>
  ): ReadonlyArray<Option> {
    return options.filter((option) => selectedValues.includes(option.value));
  }

  public toggleOption(
    currentValues: ReadonlyArray<string>,
    optionValue: string,
    maxItems?: number
  ): ReadonlyArray<string> {
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter((v) => v !== optionValue)
      : [...currentValues, optionValue];

    if (
      maxItems &&
      !currentValues.includes(optionValue) &&
      newValues.length > maxItems
    ) {
      return currentValues;
    }

    return newValues;
  }

  public removeOption(
    currentValues: ReadonlyArray<string>,
    optionValue: string
  ): ReadonlyArray<string> {
    return currentValues.filter((v) => v !== optionValue);
  }

  public clearAll(): ReadonlyArray<string> {
    return [];
  }

  public handleKeyboardNavigation(
    key: string,
    state: Readonly<MultiselectState>,
    options: ReadonlyArray<Option>
  ): Partial<MultiselectState> {
    const filteredOptions = this.getFilteredOptions(options, state.searchValue);

    switch (key) {
      case "ArrowDown":
        return {
          isOpen: true,
          focusedIndex:
            state.focusedIndex < filteredOptions.length - 1
              ? state.focusedIndex + 1
              : 0,
        };

      case "ArrowUp":
        return {
          isOpen: true,
          focusedIndex:
            state.focusedIndex > 0
              ? state.focusedIndex - 1
              : filteredOptions.length - 1,
        };

      case "Enter":
        if (state.isOpen && state.focusedIndex >= 0) {
          const option = filteredOptions[state.focusedIndex];
          return {
            selectedValues: this.toggleOption(
              state.selectedValues,
              option.value
            ),
          };
        }
        return { isOpen: true };

      case "Escape":
        return {
          isOpen: false,
          searchValue: "",
        };

      case "Backspace":
        if (!state.searchValue && state.selectedValues.length > 0) {
          return {
            selectedValues: state.selectedValues.slice(0, -1),
          };
        }
        return {};

      default:
        return {};
    }
  }
}

// src/presentation/hooks/useClickOutside.ts
import { useEffect, RefObject } from "react";

export const useClickOutside = <T extends HTMLElement>(
  ref: RefObject<T>,
  handler: () => void
): void => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, handler]);
};

// src/presentation/components/Multiselect/MultiselectDropdown.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Option,
  MultiselectConfig,
  MultiselectState,
  IMultiselectPort,
} from "../../../domain/ports/MultiselectPort";
import { useClickOutside } from "../../hooks/useClickOutside";
import { Nullable } from "../../../types/common";
import "./styles.scss";

interface MultiselectDropdownProps extends MultiselectConfig {
  options: ReadonlyArray<Option>;
  value: ReadonlyArray<string>;
  onChange: (values: ReadonlyArray<string>) => void;
  multiselectPort: IMultiselectPort;
}

export const MultiselectDropdown: React.FC<MultiselectDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select options",
  disabled = false,
  searchable = true,
  maxItems,
  closeOnSelect = false,
  multiselectPort,
}) => {
  const [state, setState] = useState<MultiselectState>({
    isOpen: false,
    searchValue: "",
    focusedIndex: -1,
    selectedValues: value,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOptions = multiselectPort.getSelectedOptions(options, value);
  const filteredOptions = multiselectPort.getFilteredOptions(
    options,
    state.searchValue
  );

  useClickOutside(containerRef, () => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
      searchValue: "",
    }));
  });

  const toggleOption = (option: Option): void => {
    if (disabled) return;

    const newValue = multiselectPort.toggleOption(
      value,
      option.value,
      maxItems
    );
    onChange(newValue);

    if (closeOnSelect) {
      setState((prev) => ({
        ...prev,
        isOpen: false,
        searchValue: "",
      }));
    } else if (searchable && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const removeOption = (
    optionValue: string,
    e: React.MouseEvent<HTMLSpanElement>
  ): void => {
    e.stopPropagation();
    onChange(multiselectPort.removeOption(value, optionValue));
  };

  const clearAll = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation();
    onChange(multiselectPort.clearAll());
    setState((prev) => ({
      ...prev,
      searchValue: "",
    }));
    if (searchable && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (disabled) return;

    const newState = multiselectPort.handleKeyboardNavigation(
      e.key,
      state,
      options
    );

    if (Object.keys(newState).length > 0) {
      e.preventDefault();
      setState((prev) => ({
        ...prev,
        ...newState,
      }));

      if (newState.selectedValues) {
        onChange(newState.selectedValues);
      }
    }
  };

  const scrollToOption = useCallback((index: number): void => {
    if (menuRef.current && index >= 0) {
      const option = menuRef.current.children[index] as Nullable<HTMLElement>;
      if (option) {
        option.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, []);

  useEffect(() => {
    scrollToOption(state.focusedIndex);
  }, [state.focusedIndex, scrollToOption]);

  return (
    <div className="multiselect" ref={containerRef} onKeyDown={handleKeyDown}>
      <div
        className={`multiselect__control ${
          state.isOpen ? "multiselect__control--is-focused" : ""
        } ${disabled ? "multiselect__control--is-disabled" : ""}`}
        onClick={() =>
          !disabled && setState((prev) => ({ ...prev, isOpen: true }))
        }
      >
        <div className="multiselect__value-container">
          {selectedOptions.length === 0 && !state.searchValue && (
            <div className="multiselect__placeholder">{placeholder}</div>
          )}

          {selectedOptions.map((option) => (
            <div key={option.value} className="multiselect__tag">
              {option.label}
              <span
                className="multiselect__tag-remove"
                onClick={(e) => removeOption(option.value, e)}
              >
                ×
              </span>
            </div>
          ))}

          {searchable && (
            <input
              ref={inputRef}
              className="multiselect__input"
              value={state.searchValue}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  searchValue: e.target.value,
                }))
              }
              onFocus={() =>
                setState((prev) => ({
                  ...prev,
                  isOpen: true,
                }))
              }
              placeholder=""
              disabled={disabled}
            />
          )}
        </div>

        <div className="multiselect__indicators">
          {value.length > 0 && (
            <>
              <div
                className="multiselect__clear"
                onClick={clearAll}
                title="Clear all"
              >
                ×
              </div>
              <div className="multiselect__indicators-separator" />
            </>
          )}
          <div
            className={`multiselect__dropdown-indicator ${
              state.isOpen ? "multiselect__dropdown-indicator--open" : ""
            }`}
          >
            ▼
          </div>
        </div>
      </div>

      <div
        className={`multiselect__menu ${
          state.isOpen ? "multiselect__menu--open" : ""
        }`}
      >
        <div className="multiselect__menu-list" ref={menuRef}>
          {filteredOptions.length === 0 ? (
            <div className="multiselect__no-options">No options available</div>
          ) : (
            filteredOptions.map((option, index) => (
              <div
                key={option.value}
                className={`multiselect__option ${
                  value.includes(option.value)
                    ? "multiselect__option--is-selected"
                    : ""
                } ${
                  state.focusedIndex === index
                    ? "multiselect__option--is-focused"
                    : ""
                }`}
                onClick={() => toggleOption(option)}
                onMouseEnter={() =>
                  setState((prev) => ({
                    ...prev,
                    focusedIndex: index,
                  }))
                }
              >
                <div
                  className={`multiselect__checkbox ${
                    value.includes(option.value)
                      ? "multiselect__checkbox--checked"
                      : ""
                  }`}
                />
                {option.label}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// src/presentation/components/Multiselect/MultiselectExample.tsx
import React, { useState } from "react";
import { MultiselectDropdown } from "./MultiselectDropdown";
import { MultiselectAdapter } from "../../../domain/adapters/MultiselectAdapter";
import { Option } from "../../../domain/ports/MultiselectPort";

const MultiselectExample: React.FC = () => {
  const [selectedValues, setSelectedValues] = useState<ReadonlyArray<string>>(
    []
  );
  const multiselectPort = new MultiselectAdapter();

  const options: ReadonlyArray<Option> = [
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" },
    { value: "svelte", label: "Svelte" },
    { value: "next", label: "Next.js" },
    { value: "nuxt", label: "Nuxt.js" },
    { value: "gatsby", label: "Gatsby" },
    { value: "remix", label: "Remix" },
  ];

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        Multiselect Dropdown Example
      </h2>

      <MultiselectDropdown
        options={options}
        value={selectedValues}
        onChange={setSelectedValues}
        placeholder="Select frameworks"
        searchable={true}
        maxItems={5}
        multiselectPort={multiselectPort}
      />

      <div className="mt-4">
        <MultiselectDropdown
          options={options}
          value={["react", "vue"]}
          onChange={() => {}}
          placeholder="Disabled multiselect"
          disabled={true}
          multiselectPort={multiselectPort}
        />
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Selected values: {selectedValues.join(", ") || "none"}
      </div>
    </div>
  );
};

export default MultiselectExample;
