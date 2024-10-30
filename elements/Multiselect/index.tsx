import React, { useCallback, useEffect, useRef, useState } from "react";
import "./styles.scss";

const MultiselectDropdown = ({
  options,
  value = [],
  onChange,
  placeholder = "Select options",
  disabled = false,
  searchable = true,
  maxItems,
  closeOnSelect = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  const selectedOptions = options.filter((option) =>
    value.includes(option.value)
  );

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleClickOutside = useCallback((event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsOpen(false);
      setSearchValue("");
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const toggleOption = (option) => {
    if (disabled) return;

    const newValue = value.includes(option.value)
      ? value.filter((v) => v !== option.value)
      : [...value, option.value];

    if (
      maxItems &&
      !value.includes(option.value) &&
      newValue.length > maxItems
    ) {
      return;
    }

    onChange(newValue);

    if (closeOnSelect) {
      setIsOpen(false);
      setSearchValue("");
    } else if (searchable && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const removeOption = (optionValue, e) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange([]);
    setSearchValue("");
    if (searchable && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        setFocusedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;

      case "Enter":
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          toggleOption(filteredOptions[focusedIndex]);
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;

      case "Escape":
        setIsOpen(false);
        setSearchValue("");
        break;

      case "Backspace":
        if (!searchValue && selectedOptions.length > 0) {
          onChange(value.slice(0, -1));
        }
        break;

      default:
        break;
    }
  };

  const scrollToOption = useCallback((index) => {
    if (menuRef.current && index >= 0) {
      const option = menuRef.current.children[index];
      if (option) {
        option.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, []);

  useEffect(() => {
    scrollToOption(focusedIndex);
  }, [focusedIndex, scrollToOption]);

  return (
    <div className="multiselect" ref={containerRef} onKeyDown={handleKeyDown}>
      <div
        className={`multiselect__control ${
          isOpen ? "multiselect__control--is-focused" : ""
        } ${disabled ? "multiselect__control--is-disabled" : ""}`}
        onClick={() => !disabled && setIsOpen(true)}
      >
        <div className="multiselect__value-container">
          {selectedOptions.length === 0 && !searchValue && (
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
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setIsOpen(true)}
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
              isOpen ? "multiselect__dropdown-indicator--open" : ""
            }`}
          >
            ▼
          </div>
        </div>
      </div>

      <div
        className={`multiselect__menu ${
          isOpen ? "multiselect__menu--open" : ""
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
                  focusedIndex === index
                    ? "multiselect__option--is-focused"
                    : ""
                }`}
                onClick={() => toggleOption(option)}
                onMouseEnter={() => setFocusedIndex(index)}
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

// Example usage component
const MultiselectExample = () => {
  const [selectedValues, setSelectedValues] = useState([]);

  const options = [
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
      />

      <div className="mt-4">
        <MultiselectDropdown
          options={options}
          value={["react", "vue"]}
          onChange={() => {}}
          placeholder="Disabled multiselect"
          disabled={true}
        />
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Selected values: {selectedValues.join(", ") || "none"}
      </div>
    </div>
  );
};

export default MultiselectExample;
