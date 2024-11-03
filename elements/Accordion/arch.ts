// src/domain/models/types.ts
export interface AccordionItem {
  id?: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export type IconType = "chevron" | "plus";
export type AccordionVariant = "default" | "bordered" | "custom";

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultExpanded?: string[];
  onChange?: (expandedItems: string[]) => void;
  className?: string;
  variant?: AccordionVariant;
  iconType?: IconType;
  bordered?: boolean;
}

export interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
  icon?: IconType;
  showBorder?: boolean;
}

// src/domain/ports/AccordionPort.ts
import { AccordionState } from "../models/AccordionState";

export interface IAccordionRepository {
  updateExpandedItems(
    itemId: string,
    currentState: AccordionState,
    allowMultiple: boolean
  ): AccordionState;
  getInitialState(defaultExpanded: string[]): AccordionState;
}

export class AccordionPort {
  constructor(private repository: IAccordionRepository) {}

  toggleItem(
    itemId: string,
    currentState: AccordionState,
    allowMultiple: boolean
  ): AccordionState {
    return this.repository.updateExpandedItems(
      itemId,
      currentState,
      allowMultiple
    );
  }

  getInitialState(defaultExpanded: string[]): AccordionState {
    return this.repository.getInitialState(defaultExpanded);
  }
}

// src/domain/models/AccordionState.ts
export class AccordionState {
  constructor(public readonly expandedItems: Set<string>) {}

  isExpanded(itemId: string): boolean {
    return this.expandedItems.has(itemId);
  }

  getExpandedItems(): string[] {
    return Array.from(this.expandedItems);
  }
}

// src/infrastructure/repositories/AccordionStateRepository.ts
import { IAccordionRepository } from "../../domain/ports/AccordionPort";
import { AccordionState } from "../../domain/models/AccordionState";

export class AccordionStateRepository implements IAccordionRepository {
  updateExpandedItems(
    itemId: string,
    currentState: AccordionState,
    allowMultiple: boolean
  ): AccordionState {
    const newExpanded = new Set(currentState.expandedItems);

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

    return new AccordionState(newExpanded);
  }

  getInitialState(defaultExpanded: string[]): AccordionState {
    return new AccordionState(new Set(defaultExpanded));
  }
}

// src/application/hooks/useAccordion.ts
import { useState, useCallback } from "react";
import { AccordionPort } from "../../domain/ports/AccordionPort";
import { AccordionStateRepository } from "../../infrastructure/repositories/AccordionStateRepository";

interface UseAccordionResult {
  expandedItems: Set<string>;
  toggleItem: (itemId: string) => void;
}

export const useAccordion = (
  defaultExpanded: string[] = [],
  allowMultiple: boolean = false,
  onChange?: (expandedItems: string[]) => void
): UseAccordionResult => {
  const repository = new AccordionStateRepository();
  const port = new AccordionPort(repository);

  const [state, setState] = useState(() =>
    port.getInitialState(defaultExpanded)
  );

  const toggleItem = useCallback(
    (itemId: string) => {
      const newState = port.toggleItem(itemId, state, allowMultiple);
      setState(newState);
      onChange?.(newState.getExpandedItems());
    },
    [state, allowMultiple, onChange]
  );

  return {
    expandedItems: state.expandedItems,
    toggleItem,
  };
};

// src/presentation/components/AccordionItem.tsx
import React, { useRef, useState, useEffect } from "react";
import { ChevronDown, Plus, Minus } from "lucide-react";
import classNames from "classnames";
import { AccordionItemProps } from "../../domain/models/types";

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  isOpen,
  onToggle,
  disabled = false,
  icon = "chevron",
  showBorder = true,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [children]);

  const toggleIcons: Record<string, React.ReactNode> = {
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

// src/presentation/components/Accordion.tsx
import React from "react";
import classNames from "classnames";
import { AccordionItem } from "./AccordionItem";
import { useAccordion } from "../../application/hooks/useAccordion";
import { AccordionProps } from "../../domain/models/types";

export const Accordion: React.FC<AccordionProps> = ({
  items = [],
  allowMultiple = false,
  defaultExpanded = [],
  onChange,
  className = "",
  variant = "default",
  iconType = "chevron",
  bordered = true,
}) => {
  const { expandedItems, toggleItem } = useAccordion(
    defaultExpanded,
    allowMultiple,
    onChange
  );

  return (
    <div
      className={classNames("accordion", `accordion--${variant}`, className)}
    >
      {items.map((item, index) => (
        <AccordionItem
          key={item.id || index}
          title={item.title}
          isOpen={expandedItems.has(item.id || String(index))}
          onToggle={() => toggleItem(item.id || String(index))}
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

// Example usage with TypeScript
interface ExampleProps {
  initialExpanded?: string[];
}

export const Example: React.FC<ExampleProps> = ({
  initialExpanded = ["1"],
}) => {
  const items: AccordionItem[] = [
    { id: "1", title: "Section 1", content: "Content 1" },
    { id: "2", title: "Section 2", content: "Content 2", disabled: false },
  ];

  const handleChange = (expandedItems: string[]): void => {
    console.log("Expanded items:", expandedItems);
  };

  return (
    <Accordion
      items={items}
      allowMultiple={false}
      defaultExpanded={initialExpanded}
      onChange={handleChange}
      variant="default"
      iconType="chevron"
      bordered={true}
    />
  );
};
