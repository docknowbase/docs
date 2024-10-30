import React from "react";
import classNames from "classnames";
import "./styles.scss";

export interface SkeletonProps {
  /** Custom class name */
  className?: string;
  /** Type of skeleton */
  variant?: "text" | "circular" | "rectangular" | "custom";
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Whether to show animation */
  animate?: boolean;
  /** Animation type */
  animation?: "pulse" | "wave" | "shimmer";
  /** Border radius for rectangular variant */
  borderRadius?: string | number;
  /** Number of rows for text variant */
  rows?: number;
  /** Whether the text rows should have different widths */
  randomWidths?: boolean;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Whether to show darker shade */
  dark?: boolean;
  /** Sets the element type */
  as?: keyof JSX.IntrinsicElements;
  /** Children for custom variant */
  children?: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "text",
  width,
  height,
  animate = true,
  animation = "shimmer",
  borderRadius,
  rows = 1,
  randomWidths = true,
  style = {},
  dark = false,
  as: Component = "div",
  children,
  ...props
}) => {
  const getRandomWidth = () => {
    const widths = [70, 80, 85, 90, 95];
    return `${widths[Math.floor(Math.random() * widths.length)]}%`;
  };

  const renderTextRows = () => {
    return Array(rows)
      .fill(0)
      .map((_, index) => {
        const rowStyle = {
          width: randomWidths ? getRandomWidth() : "100%",
          ...(height && { height }),
        };

        return (
          <div key={index} className="skeleton__text-row" style={rowStyle} />
        );
      });
  };

  const baseStyles = {
    width,
    height,
    borderRadius,
    ...style,
  };

  const skeletonClasses = classNames("skeleton", `skeleton--${variant}`, {
    "skeleton--animated": animate,
    [`skeleton--${animation}`]: animate && animation,
    "skeleton--dark": dark,
    [className || ""]: !!className,
  });

  if (variant === "custom" && children) {
    return (
      <div className={skeletonClasses} style={baseStyles} {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              className: classNames(
                child.props.className,
                "skeleton__custom-child"
              ),
            });
          }
          return child;
        })}
      </div>
    );
  }

  return (
    <Component className={skeletonClasses} style={baseStyles} {...props}>
      {variant === "text" && renderTextRows()}
    </Component>
  );
};

export const SkeletonGroup: React.FC<{
  count?: number;
  gap?: number | string;
  children?: React.ReactNode;
  className?: string;
}> = ({ count = 1, gap = "1rem", children, className }) => {
  return (
    <div
      className={classNames("skeleton-group", className)}
      style={
        {
          "--skeleton-gap": typeof gap === "number" ? `${gap}px` : gap,
        } as React.CSSProperties
      }
    >
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="skeleton-group__item">
            {children}
          </div>
        ))}
    </div>
  );
};

export default Skeleton;
