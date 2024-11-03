// src/domain/types/drawer.types.ts
export interface DrawerConfig {
  isDraggable: boolean;
  dragThreshold: number;
  preventScroll: boolean;
  scaleBackground: boolean;
  scaleFactor: number;
  closeOnEsc: boolean;
  closeOnOverlay: boolean;
}

export interface DrawerState {
  isOpen: boolean;
  dragOffset: number;
  isDragging: boolean;
  dragStart: number | null;
}

export interface DrawerPosition {
  clientY: number;
}

export interface DrawerStyle extends React.CSSProperties {
  "--drawer-drag-offset": string;
  "--drawer-height": string;
  "--drawer-min-height": string;
  "--drawer-max-height": string;
}

// src/domain/ports/drawerPort.ts
export interface IDrawerPort {
  open: (config: DrawerConfig) => DrawerState;
  close: () => DrawerState;
  drag: (position: DrawerPosition, config: DrawerConfig) => DrawerState;
  validateDrag: (delta: number, threshold: number) => boolean;
}

export const DrawerPort: IDrawerPort = {
  open: (config) => ({
    isOpen: true,
    dragOffset: 0,
    isDragging: false,
    dragStart: null,
  }),
  close: () => ({
    isOpen: false,
    dragOffset: 0,
    isDragging: false,
    dragStart: null,
  }),
  drag: (position, config) => ({
    isOpen: true,
    dragOffset: 0,
    isDragging: true,
    dragStart: position.clientY,
  }),
  validateDrag: (delta, threshold) => delta > threshold,
};

// src/domain/models/drawerState.ts
export const createDrawerState = ({
  isOpen = false,
  dragOffset = 0,
  isDragging = false,
  dragStart = null,
}: Partial<DrawerState>): DrawerState => ({
  isOpen,
  dragOffset,
  isDragging,
  dragStart,
});

// src/application/drawerService.ts
import {
  DrawerConfig,
  DrawerPosition,
  DrawerState,
} from "../domain/types/drawer.types";
import { DrawerPort } from "../domain/ports/drawerPort";
import { createDrawerState } from "../domain/models/drawerState";

export interface IDrawerService {
  handleDragStart: (touch: DrawerPosition, config: DrawerConfig) => DrawerState;
  handleDragMove: (
    touch: DrawerPosition,
    state: DrawerState,
    config: DrawerConfig
  ) => DrawerState;
  handleDragEnd: (state: DrawerState, config: DrawerConfig) => DrawerState;
}

export const createDrawerService = (): IDrawerService => {
  const handleDragStart = (
    touch: DrawerPosition,
    config: DrawerConfig
  ): DrawerState => {
    if (!config.isDraggable) return createDrawerState({});

    return createDrawerState({
      isDragging: true,
      dragStart: touch.clientY,
      dragOffset: 0,
      isOpen: true,
    });
  };

  const handleDragMove = (
    touch: DrawerPosition,
    state: DrawerState,
    config: DrawerConfig
  ): DrawerState => {
    if (!state.isDragging || !config.isDraggable || state.dragStart === null) {
      return state;
    }

    const deltaY = touch.clientY - state.dragStart;
    if (deltaY < 0) return state;

    return {
      ...state,
      dragOffset: deltaY,
    };
  };

  const handleDragEnd = (
    state: DrawerState,
    config: DrawerConfig
  ): DrawerState => {
    if (!state.isDragging || !config.isDraggable) return state;

    const shouldClose = DrawerPort.validateDrag(
      state.dragOffset,
      config.dragThreshold
    );

    if (shouldClose) {
      return createDrawerState({ isOpen: false });
    }

    return createDrawerState({
      isOpen: true,
      dragOffset: 0,
    });
  };

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
};

// src/infrastructure/adapters/domEventAdapter.ts
export interface DomEventHandlers {
  onDragStart: (touch: DrawerPosition) => void;
  onDragMove: (touch: DrawerPosition) => void;
  onDragEnd: () => void;
}

export const createDomEventAdapter = (
  drawerRef: React.RefObject<HTMLDivElement>,
  handlers: DomEventHandlers
) => {
  const attachEvents = (): (() => void) | undefined => {
    if (!drawerRef.current) return;

    const handleTouchStart = (e: TouchEvent) => {
      handlers.onDragStart(e.touches[0]);
    };

    const handleTouchMove = (e: TouchEvent) => {
      handlers.onDragMove(e.touches[0]);
      e.preventDefault();
    };

    const handleTouchEnd = () => {
      handlers.onDragEnd();
    };

    drawerRef.current.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      drawerRef.current?.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  };

  return { attachEvents };
};

// src/infrastructure/adapters/bodyStyleAdapter.ts
interface BodyStyleConfig {
  preventScroll: boolean;
  scaleBackground: boolean;
  scaleFactor: number;
}

export interface IBodyStyleAdapter {
  applyStyles: (config: BodyStyleConfig) => void;
  resetStyles: () => void;
}

export const createBodyStyleAdapter = (): IBodyStyleAdapter => {
  const applyStyles = ({
    preventScroll,
    scaleBackground,
    scaleFactor,
  }: BodyStyleConfig): void => {
    if (preventScroll) {
      document.body.style.overflow = "hidden";
    }

    if (scaleBackground) {
      document.body.style.transform = `scale(${scaleFactor})`;
      document.body.style.transformOrigin = "center top";
      document.body.style.height = "100vh";
    }
  };

  const resetStyles = (): void => {
    document.body.style.overflow = "";
    document.body.style.transform = "";
    document.body.style.height = "";
  };

  return {
    applyStyles,
    resetStyles,
  };
};

// src/presentation/components/DrawerContent.tsx
import React from "react";
import { X } from "lucide-react";

interface DrawerContentProps {
  onClose: () => void;
  showCloseButton: boolean;
  isDraggable: boolean;
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  style?: DrawerStyle;
}

export const DrawerContent = React.forwardRef<
  HTMLDivElement,
  DrawerContentProps
>(
  (
    {
      onClose,
      showCloseButton,
      isDraggable,
      header,
      children,
      footer,
      className,
      style,
    },
    ref
  ) => (
    <div
      ref={ref}
      className={className}
      role="dialog"
      aria-modal="true"
      style={style}
    >
      {showCloseButton && (
        <button
          className="drawer__close"
          onClick={onClose}
          aria-label="Close drawer"
        >
          <X size={24} />
        </button>
      )}

      {isDraggable && <div className="drawer__drag-handle" />}

      {header && <div className="drawer__header">{header}</div>}

      <div className="drawer__content">{children}</div>

      {footer && <div className="drawer__footer">{footer}</div>}
    </div>
  )
);

DrawerContent.displayName = "DrawerContent";

// src/presentation/hooks/useDrawer.ts
import { useState, useCallback } from "react";
import {
  DrawerConfig,
  DrawerPosition,
  DrawerState,
} from "../../domain/types/drawer.types";
import { createDrawerService } from "../../application/drawerService";
import { createDrawerState } from "../../domain/models/drawerState";

interface DrawerHookResult {
  state: DrawerState;
  handlers: {
    onDragStart: (touch: DrawerPosition) => void;
    onDragMove: (touch: DrawerPosition) => void;
    onDragEnd: () => void;
    onClose: () => void;
  };
}

export const useDrawer = (config: DrawerConfig): DrawerHookResult => {
  const [state, setState] = useState<DrawerState>(createDrawerState({}));
  const drawerService = createDrawerService();

  const handleDragStart = useCallback(
    (touch: DrawerPosition) => {
      setState(drawerService.handleDragStart(touch, config));
    },
    [config]
  );

  const handleDragMove = useCallback(
    (touch: DrawerPosition) => {
      setState((prevState) =>
        drawerService.handleDragMove(touch, prevState, config)
      );
    },
    [config]
  );

  const handleDragEnd = useCallback(() => {
    setState((prevState) => drawerService.handleDragEnd(prevState, config));
  }, [config]);

  const closeDrawer = useCallback(() => {
    setState(createDrawerState({ isOpen: false }));
  }, []);

  return {
    state,
    handlers: {
      onDragStart: handleDragStart,
      onDragMove: handleDragMove,
      onDragEnd: handleDragEnd,
      onClose: closeDrawer,
    },
  };
};

// src/presentation/components/Drawer.tsx
import React, { useRef, useEffect } from "react";
import classNames from "classnames";
import { createPortal } from "react-dom";
import { useDrawer } from "../hooks/useDrawer";
import { DrawerContent } from "./DrawerContent";
import { createDomEventAdapter } from "../../infrastructure/adapters/domEventAdapter";
import { createBodyStyleAdapter } from "../../infrastructure/adapters/bodyStyleAdapter";

const DRAWER_DRAG_THRESHOLD = 50;
const DRAWER_SCALE_FACTOR = 0.95;

interface DrawerProps {
  isDrawerOpen: boolean;
  setDrawerOpen: (isOpen: boolean) => void;
  children: React.ReactNode;
  drawerHeight?: string | number;
  drawerMinHeight?: string;
  drawerMaxHeight?: string;
  drawerClassName?: string;
  showDrawerCloseButton?: boolean;
  closeDrawerOnEsc?: boolean;
  closeDrawerOnOverlay?: boolean;
  isDrawerDraggable?: boolean;
  drawerHeader?: React.ReactNode;
  drawerFooter?: React.ReactNode;
  isDrawerRounded?: boolean;
  scaleDrawerBackground?: boolean;
  preventDrawerScroll?: boolean;
  animateDrawer?: boolean;
  isNestedDrawer?: boolean;
}

export const Drawer: React.FC<DrawerProps> = ({
  isDrawerOpen = false,
  setDrawerOpen,
  children,
  drawerHeight = "auto",
  drawerMinHeight = "30vh",
  drawerMaxHeight = "90vh",
  drawerClassName,
  showDrawerCloseButton = true,
  closeDrawerOnEsc = true,
  closeDrawerOnOverlay = true,
  isDrawerDraggable = true,
  drawerHeader,
  drawerFooter,
  isDrawerRounded = true,
  scaleDrawerBackground = true,
  preventDrawerScroll = true,
  animateDrawer = true,
  isNestedDrawer = false,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  const config = {
    isDraggable: isDrawerDraggable,
    dragThreshold: DRAWER_DRAG_THRESHOLD,
    preventScroll: preventDrawerScroll,
    scaleBackground: scaleDrawerBackground,
    scaleFactor: DRAWER_SCALE_FACTOR,
    closeOnEsc: closeDrawerOnEsc,
    closeOnOverlay: closeDrawerOnOverlay,
  };

  const { state, handlers } = useDrawer(config);
  const domEventAdapter = createDomEventAdapter(drawerRef, handlers);
  const bodyStyleAdapter = createBodyStyleAdapter();

  useEffect(() => {
    if (!isDrawerOpen) return;

    const cleanup = domEventAdapter.attachEvents();

    bodyStyleAdapter.applyStyles({
      preventScroll: preventDrawerScroll,
      scaleBackground: scaleDrawerBackground,
      scaleFactor: DRAWER_SCALE_FACTOR,
    });

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeDrawerOnEsc) {
        handlers.onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);

    return () => {
      cleanup?.();
      document.removeEventListener("keydown", handleEscKey);
      bodyStyleAdapter.resetStyles();
    };
  }, [
    isDrawerOpen,
    preventDrawerScroll,
    scaleDrawerBackground,
    closeDrawerOnEsc,
  ]);

  useEffect(() => {
    if (state.isOpen === false) {
      setDrawerOpen(false);
    }
  }, [state.isOpen, setDrawerOpen]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeDrawerOnOverlay && event.target === event.currentTarget) {
      handlers.onClose();
    }
  };

  const drawerStyle: DrawerStyle = {
    "--drawer-drag-offset": `${state.dragOffset}px`,
    "--drawer-height":
      typeof drawerHeight === "number" ? `${drawerHeight}px` : drawerHeight,
    "--drawer-min-height": drawerMinHeight,
    "--drawer-max-height": drawerMaxHeight,
  };

  const drawerClasses = classNames(
    "drawer",
    {
      "drawer--open": isDrawerOpen,
      "drawer--animate": animateDrawer,
      "drawer--dragging": state.isDragging,
      "drawer--rounded": isDrawerRounded,
      "drawer--nested": isNestedDrawer,
    },
    drawerClassName
  );

  if (!isDrawerOpen) return null;

  const drawerContent = (
    <div className="drawer__container" onClick={handleOverlayClick}>
      <DrawerContent
        ref={drawerRef}
        className={drawerClasses}
        style={drawerStyle}
        onClose={handlers.onClose}
        showCloseButton={showDrawerCloseButton}
        isDraggable={isDrawerDraggable}
        header={drawerHeader}
        footer={drawerFooter}
      >
        {children}
      </DrawerContent>
    </div>
  );

  return createPortal(drawerContent, document.body);
};

export default Drawer;
