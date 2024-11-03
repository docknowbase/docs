// src/domain/types/common.types.ts
export type Nullable<T> = T | null;

export type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

export type ValidationResult<T> = {
  isValid: boolean;
  value?: T;
  errors?: string[];
};

// src/domain/ports/DraggablePort.ts
export interface Position {
  readonly x: number;
  readonly y: number;
}

export interface Bounds {
  readonly left?: number;
  readonly right?: number;
  readonly top?: number;
  readonly bottom?: number;
}

export interface DraggableState {
  readonly position: Position;
  readonly isDragging: boolean;
}

export type AxisRestriction = "x" | "y";

export interface DraggablePort {
  calculateNewPosition(params: {
    currentPosition: DeepReadonly<Position>;
    startPosition: DeepReadonly<Position>;
    mouseStartPosition: DeepReadonly<Position>;
    currentMousePosition: DeepReadonly<Position>;
    restrictAxis?: AxisRestriction;
    bounds?: DeepReadonly<Bounds>;
  }): Position;

  validateBounds(
    position: DeepReadonly<Position>,
    bounds?: DeepReadonly<Bounds>
  ): ValidationResult<Position>;
}

// src/domain/services/DraggableService.ts
import {
  DraggablePort,
  Position,
  Bounds,
  DeepReadonly,
  ValidationResult,
  AxisRestriction,
} from "../ports/DraggablePort";

export class DraggableService implements DraggablePort {
  calculateNewPosition(params: {
    currentPosition: DeepReadonly<Position>;
    startPosition: DeepReadonly<Position>;
    mouseStartPosition: DeepReadonly<Position>;
    currentMousePosition: DeepReadonly<Position>;
    restrictAxis?: AxisRestriction;
    bounds?: DeepReadonly<Bounds>;
  }): Position {
    const {
      currentPosition,
      startPosition,
      mouseStartPosition,
      currentMousePosition,
      restrictAxis,
      bounds,
    } = params;

    const deltaX = currentMousePosition.x - mouseStartPosition.x;
    const deltaY = currentMousePosition.y - mouseStartPosition.y;

    const newPosition: Position = {
      x: restrictAxis === "y" ? currentPosition.x : startPosition.x + deltaX,
      y: restrictAxis === "x" ? currentPosition.y : startPosition.y + deltaY,
    };

    if (bounds) {
      const validationResult = this.validateBounds(newPosition, bounds);
      if (validationResult.isValid && validationResult.value) {
        return validationResult.value;
      }
    }

    return newPosition;
  }

  validateBounds(
    position: DeepReadonly<Position>,
    bounds?: DeepReadonly<Bounds>
  ): ValidationResult<Position> {
    if (!bounds) {
      return { isValid: true, value: { ...position } };
    }

    const adjustedPosition: Position = {
      x: position.x,
      y: position.y,
    };

    const errors: string[] = [];

    if (bounds.left !== undefined && position.x < bounds.left) {
      adjustedPosition.x = bounds.left;
      errors.push("Position exceeded left bound");
    }
    if (bounds.right !== undefined && position.x > bounds.right) {
      adjustedPosition.x = bounds.right;
      errors.push("Position exceeded right bound");
    }
    if (bounds.top !== undefined && position.y < bounds.top) {
      adjustedPosition.y = bounds.top;
      errors.push("Position exceeded top bound");
    }
    if (bounds.bottom !== undefined && position.y > bounds.bottom) {
      adjustedPosition.y = bounds.bottom;
      errors.push("Position exceeded bottom bound");
    }

    return {
      isValid: errors.length === 0,
      value: adjustedPosition,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

// src/infrastructure/adapters/DraggableStateAdapter.ts
import { Position, DraggableState } from "../../domain/ports/DraggablePort";

export interface StateChangeCallback<T> {
  (state: DeepReadonly<T>): void;
}

export interface DraggableStateAdapter {
  updatePosition(position: DeepReadonly<Position>): void;
  updateDraggingState(isDragging: boolean): void;
  getState(): DeepReadonly<DraggableState>;
  subscribe(callback: StateChangeCallback<DraggableState>): () => void;
}

export class DraggableStateManager implements DraggableStateAdapter {
  private state: DraggableState;
  private subscribers: Set<StateChangeCallback<DraggableState>>;

  constructor(initialState: DeepReadonly<DraggableState>) {
    this.state = { ...initialState };
    this.subscribers = new Set();
  }

  private notifySubscribers(): void {
    const frozenState = Object.freeze({ ...this.state });
    this.subscribers.forEach((callback) => callback(frozenState));
  }

  updatePosition(position: DeepReadonly<Position>): void {
    this.state = { ...this.state, position: { ...position } };
    this.notifySubscribers();
  }

  updateDraggingState(isDragging: boolean): void {
    this.state = { ...this.state, isDragging };
    this.notifySubscribers();
  }

  getState(): DeepReadonly<DraggableState> {
    return Object.freeze({ ...this.state });
  }

  subscribe(callback: StateChangeCallback<DraggableState>): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }
}

// src/infrastructure/adapters/DOMEventAdapter.ts
type EventCallback<T extends Event> = (event: T) => void;

export interface DOMEventAdapter {
  attachDragListeners(handlers: {
    onMouseMove: EventCallback<MouseEvent>;
    onMouseUp: EventCallback<MouseEvent>;
  }): void;
  removeDragListeners(handlers: {
    onMouseMove: EventCallback<MouseEvent>;
    onMouseUp: EventCallback<MouseEvent>;
  }): void;
  updateBodyClass(isDragging: boolean): void;
}

export class DOMEventManager implements DOMEventAdapter {
  private readonly dragClassName: string;

  constructor(dragClassName: string = "dragging") {
    this.dragClassName = dragClassName;
  }

  attachDragListeners(handlers: {
    onMouseMove: EventCallback<MouseEvent>;
    onMouseUp: EventCallback<MouseEvent>;
  }): void {
    window.addEventListener("mousemove", handlers.onMouseMove);
    window.addEventListener("mouseup", handlers.onMouseUp);
  }

  removeDragListeners(handlers: {
    onMouseMove: EventCallback<MouseEvent>;
    onMouseUp: EventCallback<MouseEvent>;
  }): void {
    window.removeEventListener("mousemove", handlers.onMouseMove);
    window.removeEventListener("mouseup", handlers.onMouseUp);
  }

  updateBodyClass(isDragging: boolean): void {
    document.body.classList.toggle(this.dragClassName, isDragging);
  }
}

// src/presentation/components/DraggableElement.tsx
import React, { useRef, useEffect, useCallback } from "react";
import classNames from "classnames";
import {
  Position,
  Bounds,
  DraggableState,
  AxisRestriction,
} from "../../domain/ports/DraggablePort";
import { DraggableService } from "../../domain/services/DraggableService";
import { DraggableStateManager } from "../../infrastructure/adapters/DraggableStateAdapter";
import { DOMEventManager } from "../../infrastructure/adapters/DOMEventAdapter";

interface DraggableProps {
  readonly initialPosition?: Position;
  readonly restrictAxis?: AxisRestriction;
  readonly className?: string;
  readonly containerClassName?: string;
  readonly children?: React.ReactNode;
  readonly onDragStart?: (position: Position) => void;
  readonly onDrag?: (position: Position) => void;
  readonly onDragEnd?: (position: Position) => void;
  readonly bounds?: Bounds;
}

const DraggableElement: React.FC<DraggableProps> = ({
  initialPosition = { x: 0, y: 0 },
  restrictAxis,
  className,
  containerClassName,
  children,
  onDragStart,
  onDrag,
  onDragEnd,
  bounds,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<Position>({ x: 0, y: 0 });
  const dragStartMousePos = useRef<Position>({ x: 0, y: 0 });

  // Initialize services and adapters
  const draggableService = useRef(new DraggableService());
  const stateManager = useRef(
    new DraggableStateManager({
      position: initialPosition,
      isDragging: false,
    })
  );
  const domEventManager = useRef(new DOMEventManager());

  // State change handler
  useEffect(() => {
    const unsubscribe = stateManager.current.subscribe((state) => {
      if (elementRef.current) {
        elementRef.current.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`;
      }
    });

    return unsubscribe;
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const currentState = stateManager.current.getState();
      dragStartPos.current = { ...currentState.position };
      dragStartMousePos.current = { x: e.clientX, y: e.clientY };

      stateManager.current.updateDraggingState(true);
      domEventManager.current.updateBodyClass(true);
      onDragStart?.({ ...currentState.position });
    },
    [onDragStart]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const currentState = stateManager.current.getState();
      if (!currentState.isDragging) return;

      const newPosition = draggableService.current.calculateNewPosition({
        currentPosition: currentState.position,
        startPosition: dragStartPos.current,
        mouseStartPosition: dragStartMousePos.current,
        currentMousePosition: { x: e.clientX, y: e.clientY },
        restrictAxis,
        bounds,
      });

      stateManager.current.updatePosition(newPosition);
      onDrag?.({ ...newPosition });
    },
    [restrictAxis, bounds, onDrag]
  );

  const handleMouseUp = useCallback(() => {
    const currentState = stateManager.current.getState();
    if (currentState.isDragging) {
      stateManager.current.updateDraggingState(false);
      domEventManager.current.updateBodyClass(false);
      onDragEnd?.({ ...currentState.position });
    }
  }, [onDragEnd]);

  useEffect(() => {
    const currentState = stateManager.current.getState();
    if (currentState.isDragging) {
      domEventManager.current.attachDragListeners({
        onMouseMove: handleMouseMove,
        onMouseUp: handleMouseUp,
      });
    }

    return () => {
      domEventManager.current.removeDragListeners({
        onMouseMove: handleMouseMove,
        onMouseUp: handleMouseUp,
      });
    };
  }, [handleMouseMove, handleMouseUp]);

  const containerClasses = classNames(
    "draggable-container",
    containerClassName
  );

  const elementClasses = classNames(
    "draggable-element",
    {
      "draggable-element--dragging": stateManager.current.getState().isDragging,
      "draggable-element--restrict-x": restrictAxis === "x",
      "draggable-element--restrict-y": restrictAxis === "y",
    },
    className
  );

  return (
    <div className={containerClasses}>
      <div
        ref={elementRef}
        className={elementClasses}
        onMouseDown={handleMouseDown}
      >
        {children}
      </div>
    </div>
  );
};

export default DraggableElement;
