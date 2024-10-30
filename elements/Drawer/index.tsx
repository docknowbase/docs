// Drawer.jsx
import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import "./styles.scss";

const DRAWER_DRAG_THRESHOLD = 50;
const DRAWER_SCALE_FACTOR = 0.95;

const Drawer = ({
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
  const [drawerDragStart, setDrawerDragStart] = useState(null);
  const [isDrawerDragging, setIsDrawerDragging] = useState(false);
  const [drawerDragOffset, setDrawerDragOffset] = useState(0);

  const drawerRef = useRef(null);
  const drawerContentRef = useRef(null);
  const initialDrawerTouchRef = useRef(null);

  const handleDrawerClose = () => setDrawerOpen(false);

  useEffect(() => {
    const handleDrawerKeyDown = (event) => {
      if (event.key === "Escape" && closeDrawerOnEsc && isDrawerOpen) {
        handleDrawerClose();
      }
    };

    if (isDrawerOpen) {
      document.addEventListener("keydown", handleDrawerKeyDown);
      if (preventDrawerScroll) {
        document.body.style.overflow = "hidden";
      }
      if (scaleDrawerBackground) {
        document.body.style.transform = `scale(${DRAWER_SCALE_FACTOR})`;
        document.body.style.transformOrigin = "center top";
        document.body.style.height = "100vh";
      }
    }

    return () => {
      document.removeEventListener("keydown", handleDrawerKeyDown);
      if (
        preventDrawerScroll &&
        !document.querySelector(".drawer--open:not(:last-child)")
      ) {
        document.body.style.overflow = "";
      }
      if (scaleDrawerBackground) {
        document.body.style.transform = "";
        document.body.style.height = "";
      }
    };
  }, [
    isDrawerOpen,
    closeDrawerOnEsc,
    setDrawerOpen,
    preventDrawerScroll,
    scaleDrawerBackground,
  ]);

  const handleDrawerDragStart = (event) => {
    if (!isDrawerDraggable) return;

    const touch = event.touches?.[0] || event;
    initialDrawerTouchRef.current = touch.clientY;
    setDrawerDragStart(touch.clientY);
    setIsDrawerDragging(true);
  };

  const handleDrawerDragMove = (event) => {
    if (!isDrawerDragging || !isDrawerDraggable) return;

    const touch = event.touches?.[0] || event;
    const deltaY = touch.clientY - drawerDragStart;
    if (deltaY < 0) return; // Prevent dragging upwards

    setDrawerDragOffset(deltaY);
    event.preventDefault();
  };

  const handleDrawerDragEnd = () => {
    if (!isDrawerDragging || !isDrawerDraggable) return;

    if (drawerDragOffset > DRAWER_DRAG_THRESHOLD) {
      handleDrawerClose();
    } else {
      setDrawerDragOffset(0);
    }
    setIsDrawerDragging(false);
    setDrawerDragStart(null);
  };

  const handleDrawerOverlayClick = (event) => {
    if (closeDrawerOnOverlay && event.target === event.currentTarget) {
      handleDrawerClose();
    }
  };

  const drawerStyle = {
    "--drawer-drag-offset": `${drawerDragOffset}px`,
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
      "drawer--dragging": isDrawerDragging,
      "drawer--rounded": isDrawerRounded,
      "drawer--nested": isNestedDrawer,
    },
    drawerClassName
  );

  // Touch event handlers
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer || !isDrawerDraggable) return;

    const handleDrawerTouchStart = (e) => {
      handleDrawerDragStart(e);
    };

    const handleDrawerTouchMove = (e) => {
      handleDrawerDragMove(e);
    };

    const handleDrawerTouchEnd = () => {
      handleDrawerDragEnd();
    };

    drawer.addEventListener("touchstart", handleDrawerTouchStart);
    window.addEventListener("touchmove", handleDrawerTouchMove, {
      passive: false,
    });
    window.addEventListener("touchend", handleDrawerTouchEnd);

    return () => {
      drawer.removeEventListener("touchstart", handleDrawerTouchStart);
      window.removeEventListener("touchmove", handleDrawerTouchMove);
      window.removeEventListener("touchend", handleDrawerTouchEnd);
    };
  }, [isDrawerDragging, isDrawerDraggable]);

  const drawerContent = (
    <div
      className="drawer__container"
      onClick={handleDrawerOverlayClick}
      aria-hidden={!isDrawerOpen}
    >
      <div
        ref={drawerRef}
        className={drawerClasses}
        role="dialog"
        aria-modal="true"
        style={drawerStyle}
      >
        {showDrawerCloseButton && (
          <button
            className="drawer__close"
            onClick={handleDrawerClose}
            aria-label="Close drawer"
          >
            <X size={24} />
          </button>
        )}

        {isDrawerDraggable && <div className="drawer__drag-handle" />}

        {drawerHeader && <div className="drawer__header">{drawerHeader}</div>}

        <div ref={drawerContentRef} className="drawer__content">
          {children}
        </div>

        {drawerFooter && <div className="drawer__footer">{drawerFooter}</div>}
      </div>
    </div>
  );

  if (!isDrawerOpen) return null;

  return createPortal(drawerContent, document.body);
};

export default Drawer;
