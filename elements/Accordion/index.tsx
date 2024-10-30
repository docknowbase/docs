// src/components/Accordion/index.jsx
import React, { useState, useRef } from "react";
import { ChevronDown, Plus, Minus } from "lucide-react";
import classNames from "classnames";
import "./styles.scss";

// Individual Accordion Item Component
const AccordionItem = ({
  title,
  children,
  isOpen,
  onToggle,
  disabled = false,
  icon = "chevron",
  showBorder = true,
}) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  React.useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [children]);

  const toggleIcons = {
    chevron: <ChevronDown size={20} />,
    plus: isOpen ? <Minus size={20} /> : <Plus size={20} />,
  };

  return (
    <div
      className={classNames("accordion-item", {
        "accordion-item--open": isOpen,
        "accordion-item--disabled": disabled,
        "accordion-item--bordered": showBorder,
      })}
    >
      <button
        className="accordion-item__header"
        onClick={() => !disabled && onToggle()}
        disabled={disabled}
        aria-expanded={isOpen}
      >
        <span className="accordion-item__title">{title}</span>
        <span
          className={classNames("accordion-item__icon", {
            "accordion-item__icon--rotated": isOpen,
          })}
        >
          {toggleIcons[icon]}
        </span>
      </button>

      <div
        className="accordion-item__content-wrapper"
        style={{ height: isOpen ? `${height}px` : 0 }}
      >
        <div ref={contentRef} className="accordion-item__content">
          {children}
        </div>
      </div>
    </div>
  );
};

// Main Accordion Component
const Accordion = ({
  items = [],
  allowMultiple = false,
  defaultExpanded = [],
  onChange,
  className = "",
  variant = "default",
  iconType = "chevron",
  bordered = true,
}) => {
  const [expandedItems, setExpandedItems] = useState(new Set(defaultExpanded));

  const toggleItem = (itemId) => {
    setExpandedItems((prev) => {
      const newExpanded = new Set(prev);

      if (allowMultiple) {
        if (newExpanded.has(itemId)) {
          newExpanded.delete(itemId);
        } else {
          newExpanded.add(itemId);
        }
      } else {
        if (newExpanded.has(itemId)) {
          newExpanded.clear();
        } else {
          newExpanded.clear();
          newExpanded.add(itemId);
        }
      }

      onChange?.(Array.from(newExpanded));
      return newExpanded;
    });
  };

  return (
    <div
      className={classNames("accordion", `accordion--${variant}`, className)}
    >
      {items.map((item, index) => (
        <AccordionItem
          key={item.id || index}
          title={item.title}
          isOpen={expandedItems.has(item.id || index)}
          onToggle={() => toggleItem(item.id || index)}
          disabled={item.disabled}
          icon={iconType}
          showBorder={bordered}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
};

export default Accordion;
