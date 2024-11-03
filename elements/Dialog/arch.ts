// src/types/dialog.types.ts
export type DialogSize = "small" | "medium" | "large";

export interface BaseDialogConfig {
  title?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  initialValue?: string;
  placeholder?: string;
  size?: DialogSize;
}

// src/domain/ports/dialog.port.ts
export interface DialogState {
  readonly isOpen: boolean;
  readonly inputValue: string;
}

export interface DialogActions {
  readonly open: () => void;
  readonly close: () => void;
  readonly setInputValue: (value: string) => void;
  readonly submit: (value: string) => void;
}

export interface DialogConfig extends Required<BaseDialogConfig> {
  readonly size: DialogSize;
}

export interface DialogPort {
  readonly state: DialogState;
  readonly actions: DialogActions;
  readonly config: DialogConfig;
}

// src/domain/usecases/dialog.usecase.ts
import { useState, useCallback } from "react";
import {
  DialogPort,
  DialogState,
  DialogActions,
  DialogConfig,
  BaseDialogConfig,
} from "../ports/dialog.port";

export const DEFAULT_CONFIG: DialogConfig = {
  title: "Dialog Title",
  submitButtonText: "Submit",
  cancelButtonText: "Cancel",
  initialValue: "",
  placeholder: "Enter value...",
  size: "medium",
} as const;

type DialogUseCaseProps = {
  onSubmit?: (value: string) => void;
  config?: Partial<BaseDialogConfig>;
};

export const useDialogUseCase = ({
  onSubmit,
  config: userConfig,
}: DialogUseCaseProps): DialogPort => {
  const [state, setState] = useState<DialogState>({
    isOpen: false,
    inputValue: userConfig?.initialValue || DEFAULT_CONFIG.initialValue,
  });

  const actions: DialogActions = {
    open: useCallback(() => {
      setState((prev) => ({ ...prev, isOpen: true }));
    }, []),

    close: useCallback(() => {
      setState((prev) => ({ ...prev, isOpen: false }));
    }, []),

    setInputValue: useCallback((value: string) => {
      setState((prev) => ({ ...prev, inputValue: value }));
    }, []),

    submit: useCallback(
      (value: string) => {
        onSubmit?.(value);
        setState((prev) => ({ ...prev, isOpen: false, inputValue: "" }));
      },
      [onSubmit]
    ),
  };

  const config: DialogConfig = {
    ...DEFAULT_CONFIG,
    ...userConfig,
  };

  return { state, actions, config };
};

// src/adapters/secondary/keyboard.adapter.ts
import { useEffect } from "react";
import { DialogActions } from "../../domain/ports/dialog.port";

type KeyboardAdapterProps = {
  isOpen: boolean;
  actions: Pick<DialogActions, "close">;
};

export const useKeyboardAdapter = ({
  isOpen,
  actions,
}: KeyboardAdapterProps): void => {
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && isOpen) {
        actions.close();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, actions]);
};

// src/adapters/secondary/scroll-lock.adapter.ts
import { useEffect } from "react";

type ScrollLockAdapterProps = {
  isOpen: boolean;
};

export const useScrollLockAdapter = ({
  isOpen,
}: ScrollLockAdapterProps): void => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);
};

// src/adapters/primary/dialog-presenter.tsx
import React from "react";
import classNames from "classnames";
import { DialogPort } from "../../domain/ports/dialog.port";
import { useKeyboardAdapter } from "../secondary/keyboard.adapter";
import { useScrollLockAdapter } from "../secondary/scroll-lock.adapter";
import "./dialog-presenter.scss";

type DialogPresenterProps = {
  dialogPort: DialogPort;
  className?: string;
};

export const DialogPresenter: React.FC<DialogPresenterProps> = ({
  dialogPort,
  className,
}) => {
  const { state, actions, config } = dialogPort;
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  useKeyboardAdapter({ isOpen: state.isOpen, actions });
  useScrollLockAdapter({ isOpen: state.isOpen });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    actions.submit(state.inputValue);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      actions.close();
    }
  };

  const dialogClasses = classNames(
    "dialog",
    `dialog--${config.size}`,
    {
      "dialog--open": state.isOpen,
    },
    className
  );

  if (!state.isOpen) return null;

  return (
    <div className="dialog-wrapper" onClick={handleBackdropClick}>
      <div
        className={dialogClasses}
        role="dialog"
        aria-modal="true"
        ref={dialogRef}
      >
        <div className="dialog__header">
          <h2 className="dialog__title">{config.title}</h2>
          <button
            className="dialog__close"
            onClick={actions.close}
            aria-label="Close dialog"
            type="button"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dialog__form">
          <div className="dialog__content">
            <div className="dialog__input-group">
              <label className="dialog__label" htmlFor="dialogInput">
                Input
              </label>
              <input
                id="dialogInput"
                className="dialog__input"
                type="text"
                value={state.inputValue}
                onChange={(e) => actions.setInputValue(e.target.value)}
                placeholder={config.placeholder}
                autoFocus
              />
            </div>
          </div>

          <div className="dialog__footer">
            <button
              type="button"
              className="dialog__button dialog__button--cancel"
              onClick={actions.close}
            >
              {config.cancelButtonText}
            </button>
            <button
              type="submit"
              className="dialog__button dialog__button--submit"
            >
              {config.submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// src/components/Dialog.tsx
import React, { useEffect } from "react";
import { DialogPresenter } from "../adapters/primary/dialog-presenter";
import { useDialogUseCase } from "../domain/usecases/dialog.usecase";
import { BaseDialogConfig } from "../types/dialog.types";

interface DialogProps extends BaseDialogConfig {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit?: (value: string) => void;
  readonly className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen: initialIsOpen,
  onClose,
  onSubmit,
  className,
  ...config
}) => {
  const dialogPort = useDialogUseCase({
    onSubmit,
    config,
  });

  useEffect(() => {
    if (initialIsOpen) {
      dialogPort.actions.open();
    } else {
      dialogPort.actions.close();
    }
  }, [initialIsOpen, dialogPort.actions]);

  useEffect(() => {
    const originalClose = dialogPort.actions.close;
    const wrappedClose = () => {
      originalClose();
      onClose();
    };
    Object.defineProperty(dialogPort.actions, "close", {
      value: wrappedClose,
      writable: false,
      configurable: true,
    });
  }, [onClose, dialogPort.actions]);

  return <DialogPresenter dialogPort={dialogPort} className={className} />;
};

// Example usage with TypeScript
// src/example/ExampleComponent.tsx
import React, { useState } from "react";
import { Dialog } from "../components/Dialog";

export const ExampleComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleSubmit = (value: string): void => {
    console.log("Submitted value:", value);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSubmit={handleSubmit}
      title="TypeScript Dialog"
      size="medium"
      placeholder="Type something..."
    />
  );
};
