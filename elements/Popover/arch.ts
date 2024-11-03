// src/domain/valueObjects/Position.ts
export const PositionTypes = ["top", "right", "bottom", "left"] as const;
export type PositionType = (typeof PositionTypes)[number];

export class Position {
  private constructor(private readonly value: PositionType) {}

  static create(position: PositionType): Position {
    return new Position(position);
  }

  getValue(): PositionType {
    return this.value;
  }
}

// src/domain/types/popover.types.ts
import { Position, PositionType } from "../valueObjects/Position";

export interface IPopoverState {
  readonly isOpen: boolean;
  readonly inputValue: string;
  readonly position: Position;
}

export type PopoverActionType =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "UPDATE_INPUT"; payload: string }
  | { type: "SUBMIT" }
  | { type: "CANCEL" };

// src/domain/ports/popover.ports.ts
import { IPopoverState } from "../types/popover.types";

export interface IPopoverOutboundPorts {
  onSubmit?: (value: string) => void;
  onCancel?: () => void;
}

export interface IPopoverInboundPorts {
  readonly getState: () => IPopoverState;
  readonly dispatch: (action: PopoverActionType) => void;
}

// src/domain/services/popover.service.ts
import { IPopoverState, PopoverActionType } from "../types/popover.types";
import { IPopoverOutboundPorts } from "../ports/popover.ports";
import { Position } from "../valueObjects/Position";

export class PopoverService {
  private state: IPopoverState;

  constructor(
    private readonly outboundPorts: IPopoverOutboundPorts,
    initialPosition: Position = Position.create("bottom")
  ) {
    this.state = {
      isOpen: false,
      inputValue: "",
      position: initialPosition,
    };
  }

  getState(): Readonly<IPopoverState> {
    return Object.freeze({ ...this.state });
  }

  dispatch(action: PopoverActionType): void {
    switch (action.type) {
      case "OPEN":
        this.state = { ...this.state, isOpen: true };
        break;
      case "CLOSE":
        this.state = { ...this.state, isOpen: false };
        break;
      case "UPDATE_INPUT":
        this.state = { ...this.state, inputValue: action.payload };
        break;
      case "SUBMIT":
        if (this.outboundPorts.onSubmit) {
          this.outboundPorts.onSubmit(this.state.inputValue);
        }
        this.state = { ...this.state, inputValue: "", isOpen: false };
        break;
      case "CANCEL":
        if (this.outboundPorts.onCancel) {
          this.outboundPorts.onCancel();
        }
        this.state = { ...this.state, inputValue: "", isOpen: false };
        break;
    }
  }
}

// src/application/hooks/usePopover.ts
import { useRef, useState, useCallback, useMemo } from "react";
import { PopoverService } from "../../domain/services/popover.service";
import {
  IPopoverState,
  PopoverActionType,
} from "../../domain/types/popover.types";
import { IPopoverOutboundPorts } from "../../domain/ports/popover.ports";
import { Position, PositionType } from "../../domain/valueObjects/Position";

interface UsePopoverResult {
  state: IPopoverState;
  actions: {
    open: () => void;
    close: () => void;
    updateInput: (value: string) => void;
    submit: () => void;
    cancel: () => void;
  };
}

export const usePopover = (
  outboundPorts: IPopoverOutboundPorts,
  initialPosition: PositionType = "bottom"
): UsePopoverResult => {
  const serviceRef = useRef(
    new PopoverService(outboundPorts, Position.create(initialPosition))
  );

  const [state, setState] = useState<IPopoverState>(
    serviceRef.current.getState()
  );

  const dispatch = useCallback((action: PopoverActionType) => {
    serviceRef.current.dispatch(action);
    setState(serviceRef.current.getState());
  }, []);

  const actions = useMemo(
    () => ({
      open: () => dispatch({ type: "OPEN" }),
      close: () => dispatch({ type: "CLOSE" }),
      updateInput: (value: string) =>
        dispatch({ type: "UPDATE_INPUT", payload: value }),
      submit: () => dispatch({ type: "SUBMIT" }),
      cancel: () => dispatch({ type: "CANCEL" }),
    }),
    [dispatch]
  );

  return { state, actions };
};

// src/adapters/ui/PopoverUI.tsx
import React, { useRef, useEffect, FC, FormEvent } from "react";
import classNames from "classnames";
import { IPopoverState } from "../../domain/types/popover.types";

interface PopoverUIProps {
  trigger: React.ReactNode;
  state: IPopoverState;
  actions: {
    open: () => void;
    close: () => void;
    updateInput: (value: string) => void;
    submit: () => void;
    cancel: () => void;
  };
  className?: string;
}

export const PopoverUI: FC<PopoverUIProps> = ({
  trigger,
  state,
  actions,
  className,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        actions.close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [actions]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    actions.submit();
  };

  const popoverClasses = classNames(
    "popover",
    `popover--${state.position.getValue()}`,
    {
      "popover--open": state.isOpen,
    },
    className
  );

  return (
    <div className="popover-container">
      <div ref={triggerRef} className="popover__trigger" onClick={actions.open}>
        {trigger}
      </div>

      <div ref={popoverRef} className={popoverClasses}>
        <div className="popover__content">
          <form onSubmit={handleSubmit}>
            <div className="popover__input-group">
              <input
                type="text"
                className="popover__input"
                value={state.inputValue}
                onChange={(e) => actions.updateInput(e.target.value)}
                placeholder="Enter value..."
                autoFocus
              />
            </div>
            <div className="popover__actions">
              <button
                type="button"
                className="popover__button popover__button--cancel"
                onClick={actions.cancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="popover__button popover__button--submit"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// src/adapters/PopoverAdapter.tsx
import React, { FC } from "react";
import { usePopover } from "../application/hooks/usePopover";
import { PopoverUI } from "./ui/PopoverUI";
import { PositionType } from "../domain/valueObjects/Position";
import { IPopoverOutboundPorts } from "../domain/ports/popover.ports";

interface PopoverAdapterProps extends IPopoverOutboundPorts {
  trigger: React.ReactNode;
  position?: PositionType;
  className?: string;
}

export const PopoverAdapter: FC<PopoverAdapterProps> = ({
  trigger,
  position = "bottom",
  className,
  onSubmit,
  onCancel,
}) => {
  const { state, actions } = usePopover({ onSubmit, onCancel }, position);

  return (
    <PopoverUI
      trigger={trigger}
      state={state}
      actions={actions}
      className={className}
    />
  );
};

// src/index.ts
export { PopoverAdapter as Popover } from "./adapters/PopoverAdapter";
export type { PositionType } from "./domain/valueObjects/Position";
export type { IPopoverOutboundPorts as PopoverProps } from "./domain/ports/popover.ports";
