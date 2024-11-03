// src/domain/types/index.ts
export interface ExpandablePanelState {
  id: string;
  isExpanded: boolean;
  height: string;
}

export interface StateRepository {
  get(id: string): ExpandablePanelState;
  save(state: ExpandablePanelState): void;
}

export interface EventEmitter {
  emit(event: string, data: unknown): void;
  on(event: string, handler: (data: unknown) => void): void;
  off(event: string, handler: (data: unknown) => void): void;
}

// src/domain/ports/ExpandablePanelPort.ts
export interface ExpandablePanelPort {
  // Primary/Driving ports (incoming)
  toggle(id: string): ExpandablePanelState;
  getExpansionState(id: string): ExpandablePanelState;
  setInitialState(id: string, state: boolean): ExpandablePanelState;

  // Secondary/Driven ports (outgoing)
  onExpansionChange(id: string, state: ExpandablePanelState): void;
  measureContentHeight(element: HTMLElement): string;
}

// src/application/ExpandablePanelService.ts
export class ExpandablePanelService implements ExpandablePanelPort {
  constructor(
    private stateRepository: StateRepository,
    private eventEmitter: EventEmitter
  ) {}

  toggle(id: string): ExpandablePanelState {
    const currentState = this.stateRepository.get(id);
    const newState: ExpandablePanelState = {
      ...currentState,
      isExpanded: !currentState.isExpanded,
    };

    this.stateRepository.save(newState);
    this.eventEmitter.emit("expansionChange", newState);
    return newState;
  }

  getExpansionState(id: string): ExpandablePanelState {
    return this.stateRepository.get(id);
  }

  setInitialState(id: string, isExpanded: boolean): ExpandablePanelState {
    const state: ExpandablePanelState = {
      id,
      isExpanded,
      height: "0px",
    };

    this.stateRepository.save(state);
    return state;
  }

  onExpansionChange(id: string, state: ExpandablePanelState): void {
    this.eventEmitter.emit("expansionChange", state);
  }

  measureContentHeight(element: HTMLElement): string {
    return `${element.scrollHeight}px`;
  }

  updateHeight(id: string, height: string): ExpandablePanelState {
    const currentState = this.stateRepository.get(id);
    const newState: ExpandablePanelState = {
      ...currentState,
      height,
    };

    this.stateRepository.save(newState);
    return newState;
  }
}

// src/infrastructure/adapters/LocalStorageStateRepository.ts
export class LocalStorageStateRepository implements StateRepository {
  private states: Map<string, ExpandablePanelState>;

  constructor() {
    this.states = new Map();
  }

  get(id: string): ExpandablePanelState {
    return (
      this.states.get(id) || {
        id,
        isExpanded: false,
        height: "0px",
      }
    );
  }

  save(state: ExpandablePanelState): void {
    this.states.set(state.id, state);
  }
}

// src/infrastructure/adapters/DOMEventEmitter.ts
type EventHandler = (data: unknown) => void;

export class DOMEventEmitter implements EventEmitter {
  private listeners: Map<string, EventHandler[]>;

  constructor() {
    this.listeners = new Map();
  }

  emit(event: string, data: unknown): void {
    const handlers = this.listeners.get(event) || [];
    handlers.forEach((handler) => handler(data));
  }

  on(event: string, handler: EventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(handler);
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.listeners.get(event) || [];
    this.listeners.set(
      event,
      handlers.filter((h) => h !== handler)
    );
  }
}

// src/presentation/hooks/useExpandablePanel.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { ExpandablePanelState, ExpandablePanelPort } from "../../domain/types";

interface UseExpandablePanelProps {
  id: string;
  service: ExpandablePanelPort;
  isInitiallyExpanded?: boolean;
}

interface UseExpandablePanelReturn {
  isExpanded: boolean;
  contentHeight: string;
  toggle: () => void;
  updateHeight: (height: string) => void;
  contentRef: React.RefObject<HTMLDivElement>;
}

export const useExpandablePanel = ({
  id,
  service,
  isInitiallyExpanded = false,
}: UseExpandablePanelProps): UseExpandablePanelReturn => {
  const [state, setState] = useState<ExpandablePanelState>(() => {
    return service.setInitialState(id, isInitiallyExpanded);
  });

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleExpansionChange = (newState: unknown) => {
      if (
        typeof newState === "object" &&
        newState !== null &&
        "id" in newState &&
        newState.id === id
      ) {
        setState(newState as ExpandablePanelState);
      }
    };

    service.eventEmitter.on("expansionChange", handleExpansionChange);
    return () => {
      service.eventEmitter.off("expansionChange", handleExpansionChange);
    };
  }, [id, service]);

  const toggle = useCallback(() => {
    const newState = service.toggle(id);
    setState(newState);
  }, [id, service]);

  const updateHeight = useCallback(
    (height: string) => {
      const newState = service.updateHeight(id, height);
      setState(newState);
    },
    [id, service]
  );

  return {
    isExpanded: state.isExpanded,
    contentHeight: state.height,
    toggle,
    updateHeight,
    contentRef,
  };
};

// src/presentation/components/ExpandablePanel.tsx
import React from "react";
import { ChevronDown } from "lucide-react";
import classNames from "classnames";
import { ExpandablePanelPort } from "../../domain/types";

interface ExpandablePanelProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isInitiallyExpanded?: boolean;
  icon?: React.ReactNode;
  className?: string;
  service: ExpandablePanelPort;
}

export const ExpandablePanel: React.FC<ExpandablePanelProps> = ({
  id,
  title,
  children,
  isInitiallyExpanded = false,
  icon = null,
  className = "",
  service,
}) => {
  const { isExpanded, contentHeight, toggle, updateHeight, contentRef } =
    useExpandablePanel({
      id,
      service,
      isInitiallyExpanded,
    });

  React.useEffect(() => {
    if (contentRef.current) {
      updateHeight(service.measureContentHeight(contentRef.current));
    }
  }, [children, updateHeight, service]);

  return (
    <div className={classNames("expandable", className)}>
      <button
        className={classNames("expandable__header", {
          "expandable__header--expanded": isExpanded,
        })}
        onClick={toggle}
        aria-expanded={isExpanded}
      >
        <div className="expandable__header-content">
          {icon && <span className="expandable__icon">{icon}</span>}
          <span className="expandable__title">{title}</span>
        </div>
        <ChevronDown
          className={classNames("expandable__arrow", {
            "expandable__arrow--expanded": isExpanded,
          })}
          size={20}
        />
      </button>

      <div
        ref={contentRef}
        className={classNames("expandable__content", {
          "expandable__content--expanded": isExpanded,
        })}
        style={{ "--content-height": contentHeight } as React.CSSProperties}
      >
        <div className="expandable__content-inner">{children}</div>
      </div>
    </div>
  );
};

// src/index.ts
export const createExpandablePanelService = (): ExpandablePanelService => {
  const repository = new LocalStorageStateRepository();
  const eventEmitter = new DOMEventEmitter();
  return new ExpandablePanelService(repository, eventEmitter);
};

// Example usage with TypeScript:
// App.tsx
import React from "react";
import { ExpandablePanel } from "./presentation/components/ExpandablePanel";
import { createExpandablePanelService } from "./index";

const service = createExpandablePanelService();

export const App: React.FC = () => {
  return (
    <ExpandablePanel
      id="panel-1"
      title="Example Panel"
      service={service}
      isInitiallyExpanded={false}
    >
      <div>Panel content goes here</div>
    </ExpandablePanel>
  );
};
