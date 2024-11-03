// src/types/format.ts
export type FormatType = "bold" | "italic" | "underline";

export interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export type FormatChangeHandler = (formats: FormatState) => void;

// src/domain/ports/FormatStatePort.ts
export interface IFormatStatePort {
  getFormatState: (state: FormatState, format: FormatType) => boolean;
  toggleFormat: (state: FormatState, format: FormatType) => FormatState;
  getAllFormats: (state: FormatState) => FormatState;
}

export const createFormatStatePort = (): IFormatStatePort => ({
  getFormatState: (state, format) => state[format],
  toggleFormat: (state, format) => ({
    ...state,
    [format]: !state[format],
  }),
  getAllFormats: (state) => ({ ...state }),
});

// src/domain/models/FormatState.ts
export const createFormatState = (
  initialState: Partial<FormatState> = {}
): FormatState => ({
  bold: initialState.bold ?? false,
  italic: initialState.italic ?? false,
  underline: initialState.underline ?? false,
});

// src/domain/services/FormatService.ts
export interface IFormatService {
  toggleFormat: (state: FormatState, format: FormatType) => FormatState;
  getFormatState: (state: FormatState, format: FormatType) => boolean;
  getAllFormats: (state: FormatState) => FormatState;
}

export const createFormatService = (
  formatStatePort: IFormatStatePort
): IFormatService => {
  const toggleFormat = (
    state: FormatState,
    format: FormatType
  ): FormatState => {
    return formatStatePort.toggleFormat(state, format);
  };

  const getFormatState = (state: FormatState, format: FormatType): boolean => {
    return formatStatePort.getFormatState(state, format);
  };

  const getAllFormats = (state: FormatState): FormatState => {
    return formatStatePort.getAllFormats(state);
  };

  return {
    toggleFormat,
    getFormatState,
    getAllFormats,
  };
};

// src/adapters/primary/FormatPresenter.ts
interface ButtonProps {
  isActive: boolean;
  label: string;
  onClick: () => void;
}

export interface IFormatPresenter {
  handleToggle: (state: FormatState, format: FormatType) => FormatState;
  getButtonProps: (
    state: FormatState,
    format: FormatType,
    label: string
  ) => ButtonProps;
}

export const createFormatPresenter = (
  formatService: IFormatService
): IFormatPresenter => {
  const handleToggle = (
    state: FormatState,
    format: FormatType
  ): FormatState => {
    return formatService.toggleFormat(state, format);
  };

  const getButtonProps = (
    state: FormatState,
    format: FormatType,
    label: string
  ): ButtonProps => ({
    isActive: formatService.getFormatState(state, format),
    label,
    onClick: () => handleToggle(state, format),
  });

  return {
    handleToggle,
    getButtonProps,
  };
};

// src/adapters/secondary/FormatStateAdapter.ts
export interface IFormattedState {
  getFormatState: (format: FormatType) => boolean;
  toggleFormat: (format: FormatType) => FormatState;
  getAllFormats: () => FormatState;
}

export interface IFormatStateAdapter {
  adapt: (state: FormatState) => IFormattedState;
}

export const createFormatStateAdapter = (): IFormatStateAdapter => {
  const formatStatePort = createFormatStatePort();

  return {
    adapt: (state: FormatState): IFormattedState => ({
      getFormatState: (format) => formatStatePort.getFormatState(state, format),
      toggleFormat: (format) => formatStatePort.toggleFormat(state, format),
      getAllFormats: () => formatStatePort.getAllFormats(state),
    }),
  };
};

// src/components/FormatButton/index.tsx
import React from "react";
import { LucideIcon } from "lucide-react";
import classNames from "classnames";

interface FormatButtonProps {
  Icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const FormatButton: React.FC<FormatButtonProps> = ({
  Icon,
  label,
  isActive,
  onClick,
}) => (
  <button
    type="button"
    className={classNames("format-group__button", {
      "format-group__button--active": isActive,
    })}
    onClick={onClick}
    aria-pressed={isActive}
    aria-label={label}
  >
    <span className="format-group__icon-wrapper">
      <Icon className="format-group__icon" />
    </span>
    <span className="format-group__tooltip">{label}</span>
  </button>
);

// src/components/FormatToggleGroup/index.tsx
import React, { useState, useMemo } from "react";
import { Bold, Italic, Underline } from "lucide-react";
import {
  FormatState,
  FormatType,
  FormatChangeHandler,
} from "../../types/format";
import { createFormatState } from "../../domain/models/FormatState";
import { createFormatStatePort } from "../../domain/ports/FormatStatePort";
import { createFormatService } from "../../domain/services/FormatService";
import { createFormatPresenter } from "../../adapters/primary/FormatPresenter";
import { createFormatStateAdapter } from "../../adapters/secondary/FormatStateAdapter";
import { FormatButton } from "../FormatButton";
import "./styles.scss";

interface FormatToggleGroupProps {
  onChange?: FormatChangeHandler;
  initialStates?: Partial<FormatState>;
}

interface FormatButtonConfig {
  id: FormatType;
  Icon: typeof Bold | typeof Italic | typeof Underline;
  label: string;
}

const FormatToggleGroup: React.FC<FormatToggleGroupProps> = ({
  onChange,
  initialStates = {},
}) => {
  const [formats, setFormats] = useState<FormatState>(
    createFormatState(initialStates)
  );

  const { formatPresenter, formatStateAdapter } = useMemo(() => {
    const formatStatePort = createFormatStatePort();
    const formatService = createFormatService(formatStatePort);
    const formatPresenter = createFormatPresenter(formatService);
    const formatStateAdapter = createFormatStateAdapter();
    return { formatPresenter, formatStateAdapter };
  }, []);

  const handleToggle = (format: FormatType): void => {
    const newFormats = formatPresenter.handleToggle(formats, format);
    setFormats(newFormats);
    onChange?.(formatStateAdapter.adapt(newFormats).getAllFormats());
  };

  const formatButtons: FormatButtonConfig[] = [
    { id: "bold", Icon: Bold, label: "Bold" },
    { id: "italic", Icon: Italic, label: "Italic" },
    { id: "underline", Icon: Underline, label: "Underline" },
  ];

  return (
    <div className="format-group">
      <div className="format-group__container">
        {formatButtons.map(({ id, Icon, label }) => {
          const buttonProps = formatPresenter.getButtonProps(
            formats,
            id,
            label
          );
          return (
            <FormatButton
              key={id}
              Icon={Icon}
              label={label}
              isActive={buttonProps.isActive}
              onClick={() => handleToggle(id)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FormatToggleGroup;
