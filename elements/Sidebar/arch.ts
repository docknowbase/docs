// src/domain/ports/sheet.port.ts
export interface SheetConfiguration {
  isOpen: boolean;
  position: "left" | "right" | "top" | "bottom";
  size: "small" | "medium" | "large";
  showCloseButton: boolean;
  closeOnEsc: boolean;
  closeOnOverlay: boolean;
  preventScroll: boolean;
  animate: boolean;
  glassmorphism: boolean;
  nested: boolean;
}

export const DefaultSheetConfig: SheetConfiguration = {
  isOpen: false,
  position: "right",
  size: "medium",
  showCloseButton: true,
  closeOnEsc: true,
  closeOnOverlay: true,
  preventScroll: true,
  animate: true,
  glassmorphism: false,
  nested: false,
};

// src/domain/models/sheet.model.ts
export class SheetModel implements SheetConfiguration {
  isOpen: boolean;
  position: "left" | "right" | "top" | "bottom";
  size: "small" | "medium" | "large";
  showCloseButton: boolean;
  closeOnEsc: boolean;
  closeOnOverlay: boolean;
  preventScroll: boolean;
  animate: boolean;
  glassmorphism: boolean;
  nested: boolean;

  constructor(config: Partial<SheetConfiguration>) {
    this.isOpen = config.isOpen ?? DefaultSheetConfig.isOpen;
    this.position = config.position ?? DefaultSheetConfig.position;
    this.size = config.size ?? DefaultSheetConfig.size;
    this.showCloseButton =
      config.showCloseButton ?? DefaultSheetConfig.showCloseButton;
    this.closeOnEsc = config.closeOnEsc ?? DefaultSheetConfig.closeOnEsc;
    this.closeOnOverlay =
      config.closeOnOverlay ?? DefaultSheetConfig.closeOnOverlay;
    this.preventScroll =
      config.preventScroll ?? DefaultSheetConfig.preventScroll;
    this.animate = config.animate ?? DefaultSheetConfig.animate;
    this.glassmorphism =
      config.glassmorphism ?? DefaultSheetConfig.glassmorphism;
    this.nested = config.nested ?? DefaultSheetConfig.nested;
  }

  toggleOpen(isOpen: boolean): this {
    this.isOpen = isOpen;
    return this;
  }

  updateScrollLock(preventScroll: boolean): this {
    this.preventScroll = preventScroll;
    return this;
  }
}

// src/domain/ports/sheet-dom.port.ts
export interface ISheetDOMPort {
  lockScroll(): void;
  unlockScroll(): void;
  addKeyboardListener(handler: (event: KeyboardEvent) => void): void;
  removeKeyboardListener(handler: (event: KeyboardEvent) => void): void;
  getFocusableElements(element: HTMLElement): NodeListOf<HTMLElement>;
  setInitialFocus(element: HTMLElement): void;
}

// src/infrastructure/adapters/sheet-dom.adapter.ts
export class SheetDOMAdapter implements ISheetDOMPort {
  lockScroll(): void {
    document.body.style.overflow = "hidden";
  }

  unlockScroll(): void {
    if (!document.querySelector(".sheet--open:not(:last-child)")) {
      document.body.style.overflow = "";
    }
  }

  addKeyboardListener(handler: (event: KeyboardEvent) => void): void {
    document.addEventListener("keydown", handler);
  }

  removeKeyboardListener(handler: (event: KeyboardEvent) => void): void {
    document.removeEventListener("keydown", handler);
  }

  getFocusableElements(element: HTMLElement): NodeListOf<HTMLElement> {
    return element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  }

  setInitialFocus(element: HTMLElement): void {
    const focusableElements = this.getFocusableElements(element);
    if (focusableElements.length) {
      focusableElements[0].focus();
    }
  }
}

// src/application/sheet.service.ts
export class SheetService {
  constructor(private readonly domAdapter: ISheetDOMPort) {}

  handleOpen(sheetModel: SheetModel): void {
    if (sheetModel.isOpen) {
      if (sheetModel.preventScroll) {
        this.domAdapter.lockScroll();
      }
    }
  }

  handleClose(sheetModel: SheetModel): void {
    if (sheetModel.preventScroll) {
      this.domAdapter.unlockScroll();
    }
  }

  setupKeyboardListeners(
    sheetModel: SheetModel,
    onClose: () => void
  ): () => void {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (
        event.key === "Escape" &&
        sheetModel.closeOnEsc &&
        sheetModel.isOpen
      ) {
        onClose();
      }
    };

    this.domAdapter.addKeyboardListener(handleKeyDown);
    return () => this.domAdapter.removeKeyboardListener(handleKeyDown);
  }

  handleFocus(element: HTMLElement): void {
    this.domAdapter.setInitialFocus(element);
  }
}

// src/presentation/hooks/useSheet.ts
import { useEffect, useRef, RefObject } from "react";
import { SheetModel } from "../../domain/models/sheet.model";
import { SheetService } from "../../application/sheet.service";

interface UseSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UseSheetResult {
  contentRef: RefObject<HTMLDivElement>;
  sheetRef: RefObject<HTMLDivElement>;
}

export const useSheet = (
  props: UseSheetProps,
  sheetService: SheetService,
  sheetModel: SheetModel
): UseSheetResult => {
  const contentRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.isOpen) {
      sheetService.handleOpen(sheetModel);
    }

    return () => {
      sheetService.handleClose(sheetModel);
    };
  }, [props.isOpen, sheetModel, sheetService]);

  useEffect(() => {
    const cleanup = sheetService.setupKeyboardListeners(
      sheetModel,
      props.onClose
    );
    return cleanup;
  }, [props.isOpen, props.onClose, sheetModel, sheetService]);

  useEffect(() => {
    if (props.isOpen && contentRef.current) {
      sheetService.handleFocus(contentRef.current);
    }
  }, [props.isOpen, sheetService]);

  return { contentRef, sheetRef };
};

// src/presentation/components/Sheet.tsx
import React, { ReactNode } from "react";
import classNames from "classnames";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { SheetModel } from "../../domain/models/sheet.model";
import { SheetService } from "../../application/sheet.service";
import { SheetDOMAdapter } from "../../infrastructure/adapters/sheet-dom.adapter";
import { useSheet } from "../hooks/useSheet";

interface SheetProps {
  isOpen?: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: "left" | "right" | "top" | "bottom";
  size?: "small" | "medium" | "large";
  className?: string;
  overlayClassName?: string;
  showCloseButton?: boolean;
  closeOnEsc?: boolean;
  closeOnOverlay?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  preventScroll?: boolean;
  animate?: boolean;
  glassmorphism?: boolean;
  nested?: boolean;
}

const Sheet: React.FC<SheetProps> = ({
  isOpen = false,
  onClose,
  children,
  position = "right",
  size = "medium",
  className,
  overlayClassName,
  showCloseButton = true,
  closeOnEsc = true,
  closeOnOverlay = true,
  header,
  footer,
  preventScroll = true,
  animate = true,
  glassmorphism = false,
  nested = false,
}) => {
  const sheetModel = new SheetModel({
    isOpen,
    position,
    size,
    showCloseButton,
    closeOnEsc,
    closeOnOverlay,
    preventScroll,
    animate,
    glassmorphism,
    nested,
  });

  const domAdapter = new SheetDOMAdapter();
  const sheetService = new SheetService(domAdapter);

  const { contentRef, sheetRef } = useSheet(
    { isOpen, onClose },
    sheetService,
    sheetModel
  );

  const handleOverlayClick = (
    event: React.MouseEvent<HTMLDivElement>
  ): void => {
    if (closeOnOverlay && event.target === event.currentTarget) {
      onClose();
    }
  };

  const sheetClasses = classNames(
    "sheet",
    `sheet--${position}`,
    `sheet--${size}`,
    {
      "sheet--open": isOpen,
      "sheet--animate": animate,
      "sheet--glass": glassmorphism,
      "sheet--nested": nested,
    },
    className
  );

  const overlayClasses = classNames(
    "sheet__overlay",
    {
      "sheet__overlay--animate": animate,
    },
    overlayClassName
  );

  if (!isOpen) return null;

  const sheet = (
    <div
      className={overlayClasses}
      onClick={handleOverlayClick}
      aria-hidden={!isOpen}
    >
      <div
        ref={sheetRef}
        className={sheetClasses}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {showCloseButton && (
          <button
            className="sheet__close"
            onClick={onClose}
            aria-label="Close sheet"
          >
            <X size={24} />
          </button>
        )}

        {header && <div className="sheet__header">{header}</div>}

        <div ref={contentRef} className="sheet__content" tabIndex={0}>
          {children}
        </div>

        {footer && <div className="sheet__footer">{footer}</div>}
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
};

export default Sheet;
