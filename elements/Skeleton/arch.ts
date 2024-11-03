// src/domain/models/types.ts
export type SkeletonVariant = "text" | "circular" | "rectangular" | "custom";
export type AnimationType = "pulse" | "wave" | "shimmer";

export interface BaseStyle {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export interface SkeletonStyle extends BaseStyle {
  [key: string]: string | number | undefined;
}

export interface SkeletonConfig {
  variant: SkeletonVariant;
  animate: boolean;
  animation: AnimationType;
  dark: boolean;
}

// src/domain/ports/skeleton.port.ts
import { SkeletonConfig, SkeletonStyle } from "../models/types";

export interface IStyleGeneratorPort {
  generateBaseStyles(style: SkeletonStyle): React.CSSProperties;
  generateRandomWidth(): string;
  generateGapStyle(gap: number | string): React.CSSProperties;
}

export interface IClassGeneratorPort {
  generateSkeletonClasses(config: SkeletonConfig, className?: string): string;
}

// src/domain/services/skeleton.service.ts
import {
  IStyleGeneratorPort,
  IClassGeneratorPort,
} from "../ports/skeleton.port";
import { SkeletonConfig, SkeletonStyle } from "../models/types";

export class SkeletonService {
  constructor(
    private readonly styleGenerator: IStyleGeneratorPort,
    private readonly classGenerator: IClassGeneratorPort
  ) {}

  public generateStyles(style: SkeletonStyle): React.CSSProperties {
    return this.styleGenerator.generateBaseStyles(style);
  }

  public generateClasses(config: SkeletonConfig, className?: string): string {
    return this.classGenerator.generateSkeletonClasses(config, className);
  }

  public getRandomWidth(): string {
    return this.styleGenerator.generateRandomWidth();
  }

  public generateGapStyle(gap: number | string): React.CSSProperties {
    return this.styleGenerator.generateGapStyle(gap);
  }
}

// src/infrastructure/adapters/style-generator.adapter.ts
import { IStyleGeneratorPort } from "../../domain/ports/skeleton.port";
import { SkeletonStyle } from "../../domain/models/types";

export class StyleGeneratorAdapter implements IStyleGeneratorPort {
  private readonly DEFAULT_WIDTHS: readonly number[] = [
    70, 80, 85, 90, 95,
  ] as const;

  public generateBaseStyles(style: SkeletonStyle): React.CSSProperties {
    const { width, height, borderRadius, ...rest } = style;
    return {
      width,
      height,
      borderRadius,
      ...rest,
    };
  }

  public generateRandomWidth(): string {
    return `${
      this.DEFAULT_WIDTHS[
        Math.floor(Math.random() * this.DEFAULT_WIDTHS.length)
      ]
    }%`;
  }

  public generateGapStyle(gap: number | string): React.CSSProperties {
    return {
      "--skeleton-gap": typeof gap === "number" ? `${gap}px` : gap,
    } as React.CSSProperties;
  }
}

// src/infrastructure/adapters/class-generator.adapter.ts
import classNames from "classnames";
import { IClassGeneratorPort } from "../../domain/ports/skeleton.port";
import { SkeletonConfig } from "../../domain/models/types";

export class ClassGeneratorAdapter implements IClassGeneratorPort {
  public generateSkeletonClasses(
    config: SkeletonConfig,
    className?: string
  ): string {
    return classNames("skeleton", `skeleton--${config.variant}`, {
      "skeleton--animated": config.animate,
      [`skeleton--${config.animation}`]: config.animate && config.animation,
      "skeleton--dark": config.dark,
      [className || ""]: Boolean(className),
    });
  }
}

// src/presentation/hooks/use-skeleton.hook.ts
import { useMemo } from "react";
import { SkeletonService } from "../../domain/services/skeleton.service";
import { StyleGeneratorAdapter } from "../../infrastructure/adapters/style-generator.adapter";
import { ClassGeneratorAdapter } from "../../infrastructure/adapters/class-generator.adapter";

export const useSkeleton = (): SkeletonService => {
  return useMemo(() => {
    const styleGenerator = new StyleGeneratorAdapter();
    const classGenerator = new ClassGeneratorAdapter();
    return new SkeletonService(styleGenerator, classGenerator);
  }, []);
};

// src/presentation/components/skeleton.component.tsx
import React from "react";
import { useSkeleton } from "../hooks/use-skeleton.hook";
import { SkeletonVariant, AnimationType } from "../../domain/models/types";

export interface SkeletonProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  animate?: boolean;
  animation?: AnimationType;
  borderRadius?: string | number;
  rows?: number;
  randomWidths?: boolean;
  style?: React.CSSProperties;
  dark?: boolean;
  as?: keyof JSX.IntrinsicElements;
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
  const skeletonService = useSkeleton();

  const baseStyles = React.useMemo(
    () =>
      skeletonService.generateStyles({
        width,
        height,
        borderRadius,
        ...style,
      }),
    [width, height, borderRadius, style, skeletonService]
  );

  const skeletonClasses = React.useMemo(
    () =>
      skeletonService.generateClasses(
        { variant, animate, animation, dark },
        className
      ),
    [variant, animate, animation, dark, className, skeletonService]
  );

  const renderTextRows = React.useCallback(() => {
    return Array.from({ length: rows }, (_, index) => {
      const rowStyle = {
        width: randomWidths ? skeletonService.getRandomWidth() : "100%",
        ...(height && { height }),
      };

      return (
        <div key={index} className="skeleton__text-row" style={rowStyle} />
      );
    });
  }, [rows, randomWidths, height, skeletonService]);

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

// src/presentation/components/skeleton-group.component.tsx
import React from "react";
import { useSkeleton } from "../hooks/use-skeleton.hook";

interface SkeletonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  gap?: number | string;
  children?: React.ReactNode;
  className?: string;
}

export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  count = 1,
  gap = "1rem",
  children,
  className,
  ...props
}) => {
  const skeletonService = useSkeleton();

  const gapStyle = React.useMemo(
    () => skeletonService.generateGapStyle(gap),
    [gap, skeletonService]
  );

  return (
    <div
      className={classNames("skeleton-group", className)}
      style={gapStyle}
      {...props}
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="skeleton-group__item">
          {children}
        </div>
      ))}
    </div>
  );
};

// src/index.ts
export * from "./presentation/components/skeleton.component";
export * from "./presentation/components/skeleton-group.component";
export * from "./domain/models/types";
