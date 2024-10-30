import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames";
import "./styles.scss";

export interface SplitConfig {
  id: string;
  size: number;
  minSize?: number;
  children?: SplitConfig[];
  component?: React.ReactNode;
}

interface SplitLayoutProps {
  config: SplitConfig[];
  direction?: "horizontal" | "vertical";
  className?: string;
  onChange?: (newConfig: SplitConfig[]) => void;
}

interface DragState {
  isDragging: boolean;
  separator: number;
  startPos: { x: number; y: number };
  startSizes: number[];
}

const SplitLayout: React.FC<SplitLayoutProps> = ({
  config,
  direction = "horizontal",
  className,
  onChange,
}) => {
  const [splits, setSplits] = useState<SplitConfig[]>(config);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSplitSizes = (sizes: number[]) => {
    const newSplits = splits.map((split, index) => ({
      ...split,
      size: sizes[index],
    }));
    setSplits(newSplits);
    onChange?.(newSplits);
  };

  const handleMouseDown = (separatorIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    const startSizes = splits.map((split) => split.size);

    setDragState({
      isDragging: true,
      separator: separatorIndex,
      startPos: { x: e.clientX, y: e.clientY },
      startSizes,
    });

    document.body.style.userSelect = "none";
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragState || !containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const { separator, startPos, startSizes } = dragState;

    const deltaPixels =
      direction === "horizontal"
        ? e.clientX - startPos.x
        : e.clientY - startPos.y;

    const deltaPercent =
      direction === "horizontal"
        ? (deltaPixels / containerRect.width) * 100
        : (deltaPixels / containerRect.height) * 100;

    const newSizes = [...startSizes];
    const minSize = 10; // Minimum size in percentage

    // Update sizes while respecting minimum constraints
    newSizes[separator] = Math.max(
      minSize,
      startSizes[separator] + deltaPercent
    );
    newSizes[separator + 1] = Math.max(
      minSize,
      startSizes[separator + 1] - deltaPercent
    );

    // Normalize sizes to ensure they sum to 100%
    const total = newSizes.reduce((sum, size) => sum + size, 0);
    const normalizedSizes = newSizes.map((size) => (size / total) * 100);

    updateSplitSizes(normalizedSizes);
  };

  const handleMouseUp = () => {
    setDragState(null);
    document.body.style.userSelect = "";
  };

  useEffect(() => {
    if (dragState) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragState]);

  const renderSplit = (split: SplitConfig) => {
    if (split.children) {
      return (
        <SplitLayout
          config={split.children}
          direction={direction === "horizontal" ? "vertical" : "horizontal"}
          onChange={(newConfig) => {
            const newSplits = splits.map((s) =>
              s.id === split.id ? { ...s, children: newConfig } : s
            );
            setSplits(newSplits);
            onChange?.(newSplits);
          }}
        />
      );
    }
    return split.component || null;
  };

  const containerClasses = classNames(
    "split-layout",
    `split-layout--${direction}`,
    { "split-layout--dragging": dragState?.isDragging },
    className
  );

  return (
    <div className={containerClasses} ref={containerRef}>
      {splits.map((split, index) => (
        <React.Fragment key={split.id}>
          <div
            className="split-layout__panel"
            style={{
              [direction === "horizontal"
                ? "width"
                : "height"]: `${split.size}%`,
            }}
          >
            {renderSplit(split)}
          </div>
          {index < splits.length - 1 && (
            <div
              className={classNames(
                "split-layout__separator",
                `split-layout__separator--${direction}`,
                {
                  "split-layout__separator--dragging":
                    dragState?.separator === index,
                }
              )}
              onMouseDown={(e) => handleMouseDown(index, e)}
            >
              <div className="split-layout__separator-handle" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default SplitLayout;
