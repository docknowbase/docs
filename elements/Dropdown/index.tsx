import React, { useCallback, useEffect, useRef, useState } from "react";
import "./styles.scss";

const Dropdown = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  const selectedOption = options.find((option) => option.value === value);

  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleKeyDown = (event) => {
    if (disabled) return;

    switch (event.key) {
      case "Enter":
      case " ":
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(
            value ? options.findIndex((opt) => opt.value === value) : 0
          );
        } else if (focusedIndex >= 0) {
          onChange(options[focusedIndex].value);
          setIsOpen(false);
        }
        event.preventDefault();
        break;
      case "ArrowDown":
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(
            value ? options.findIndex((opt) => opt.value === value) : 0
          );
        } else {
          setFocusedIndex((prev) => (prev + 1) % options.length);
          scrollIntoView(focusedIndex + 1);
        }
        event.preventDefault();
        break;
      case "ArrowUp":
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(
            value
              ? options.findIndex((opt) => opt.value === value)
              : options.length - 1
          );
        } else {
          setFocusedIndex(
            (prev) => (prev - 1 + options.length) % options.length
          );
          scrollIntoView(focusedIndex - 1);
        }
        event.preventDefault();
        break;
      case "Escape":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const scrollIntoView = (index) => {
    if (menuRef.current && index >= 0) {
      const option = menuRef.current.children[index];
      if (option) {
        option.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  };

  const handleOptionClick = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setFocusedIndex(
          value ? options.findIndex((opt) => opt.value === value) : 0
        );
      }
    }
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button
        className={`dropdown__trigger ${
          disabled ? "dropdown__trigger--disabled" : ""
        }`}
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
      >
        <span
          className={`${
            selectedOption
              ? "dropdown__selected-value"
              : "dropdown__placeholder"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span
          className={`dropdown__chevron ${
            isOpen ? "dropdown__chevron--open" : ""
          }`}
        >
          ▼
        </span>
      </button>

      <div
        ref={menuRef}
        className={`dropdown__menu ${isOpen ? "dropdown__menu--open" : ""}`}
        role="listbox"
        aria-activedescendant={
          focusedIndex >= 0
            ? `option-${options[focusedIndex].value}`
            : undefined
        }
      >
        {options.map((option, index) => (
          <div
            key={option.value}
            id={`option-${option.value}`}
            className={`
              dropdown__option
              ${option.value === value ? "dropdown__option--selected" : ""}
              ${index === focusedIndex ? "dropdown__option--focused" : ""}
            `}
            role="option"
            aria-selected={option.value === value}
            onClick={() => handleOptionClick(option.value)}
            onMouseEnter={() => setFocusedIndex(index)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

// Example usage component
const DropdownExample = () => {
  const [selectedValue, setSelectedValue] = useState("");

  const options = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "orange", label: "Orange" },
    { value: "grape", label: "Grape" },
    { value: "mango", label: "Mango" },
    { value: "pineapple", label: "Pineapple" },
    { value: "strawberry", label: "Strawberry" },
    { value: "blueberry", label: "Blueberry" },
  ];

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-xl font-semibold mb-4">Dropdown Example</h2>

      {/* Basic dropdown */}
      <Dropdown
        options={options}
        value={selectedValue}
        onChange={setSelectedValue}
        placeholder="Select a fruit"
      />

      {/* Disabled dropdown */}
      <div className="mt-4">
        <Dropdown
          options={options}
          value="apple"
          onChange={() => {}}
          placeholder="Select a fruit"
          disabled
        />
      </div>

      {/* Selected value display */}
      <div className="mt-4 text-sm text-gray-600">
        Selected value: {selectedValue || "none"}
      </div>
    </div>
  );
};

export default DropdownExample;
