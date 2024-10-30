import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames";
import "./styles.scss";

interface Position {
  x: number;
  y: number;
}

interface DraggableProps {
  initialPosition?: Position;
  restrictAxis?: "x" | "y";
  className?: string;
  containerClassName?: string;
  children?: React.ReactNode;
  onDragStart?: (position: Position) => void;
  onDrag?: (position: Position) => void;
  onDragEnd?: (position: Position) => void;
  bounds?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
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
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>(initialPosition);
  const elementRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<Position>({ x: 0, y: 0 });
  const dragStartMousePos = useRef<Position>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartPos.current = position;
    dragStartMousePos.current = { x: e.clientX, y: e.clientY };
    onDragStart?.(position);

    // Add dragging class to body for cursor styling
    document.body.classList.add("dragging");
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartMousePos.current.x;
    const deltaY = e.clientY - dragStartMousePos.current.y;

    let newX =
      restrictAxis === "y" ? position.x : dragStartPos.current.x + deltaX;
    let newY =
      restrictAxis === "x" ? position.y : dragStartPos.current.y + deltaY;

    // Apply bounds if specified
    if (bounds) {
      if (bounds.left !== undefined) newX = Math.max(bounds.left, newX);
      if (bounds.right !== undefined) newX = Math.min(bounds.right, newX);
      if (bounds.top !== undefined) newY = Math.max(bounds.top, newY);
      if (bounds.bottom !== undefined) newY = Math.min(bounds.bottom, newY);
    }

    const newPosition = { x: newX, y: newY };
    setPosition(newPosition);
    onDrag?.(newPosition);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd?.(position);
      document.body.classList.remove("dragging");
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, position]);

  const containerClasses = classNames(
    "draggable-container",
    containerClassName
  );

  const elementClasses = classNames(
    "draggable-element",
    {
      "draggable-element--dragging": isDragging,
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
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
        onMouseDown={handleMouseDown}
      >
        {children}
      </div>
    </div>
  );
};

export default DraggableElement;
