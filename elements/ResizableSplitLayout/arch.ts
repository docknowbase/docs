// types.ts
export type Direction = 'horizontal' | 'vertical';
export type Position = { x: number; y: number };
export type SizeUnit = '%' | 'px';

export interface DimensionStyle {
  width?: string;
  height?: string;
}

export interface Split<T = React.ReactNode> {
  id: string;
  size: number;
  minSize?: number;
  maxSize?: number;
  children?: Split<T>[];
  component?: T;
  metadata?: Record<string, unknown>;
}

export interface DragState {
  isDragging: boolean;
  separator: number;
  startPos: Position;
  startSizes: number[];
}

export interface SplitUpdateEvent {
  type: 'resize' | 'reorder' | 'nested-update';
  splitId: string;
  newSize?: number;
  newIndex?: number;
  timestamp: number;
}

// ports.ts
export interface SplitLayoutPort {
  updateSplitSizes: (sizes: number[]) => void;
  handleSeparatorDrag: (deltaPixels: number, containerSize: number) => void;
  getSplitStyle: (size: number) => React.CSSProperties;
  validateSplitConfig: (splits: Split[]) => boolean;
  getEffectiveSize: (split: Split) => number;
}

export interface DragHandlerPort {
  onDragStart: (separatorIndex: number, position: Position) => void;
  onDragMove: (position: Position) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  currentSeparator: number | null;
}

// core/splitLayoutCore.ts
export const createSplitLayoutCore = <T>(
  initialConfig: Split<T>[],
  direction: Direction,
  onChange?: (newConfig: Split<T>[], event: SplitUpdateEvent) => void
): SplitLayoutPort => {
  const validateSplitConfig = (splits: Split<T>[]): boolean => {
    const totalSize = splits.reduce((sum, split) => sum + split.size, 0);
    return Math.abs(totalSize - 100) < 0.1; // Allow small rounding errors
  };

  const getEffectiveSize = (split: Split<T>): number => {
    if (split.size < (split.minSize ?? 0)) return split.minSize ?? 0;
    if (split.maxSize && split.size > split.maxSize) return split.maxSize;
    return split.size;
  };

  const normalizeSizes = (sizes: number[]): number[] => {
    const total = sizes.reduce((sum, size) => sum + size, 0);
    return sizes.map(size => (size / total) * 100);
  };

  const createUpdateEvent = (splitId: string, type: SplitUpdateEvent['type']): SplitUpdateEvent => ({
    type,
    splitId,
    timestamp: Date.now()
  });

  return {
    validateSplitConfig,
    getEffectiveSize,
    getSplitStyle: (size: number): React.CSSProperties => ({
      [direction === 'horizontal' ? 'width' : 'height']: `${size}%`,
      flex: 'none'
    }),
    updateSplitSizes: (sizes: number[]) => {
      const normalizedSizes = normalizeSizes(sizes);
      const newConfig = initialConfig.map((split, index) => ({
        ...split,
        size: normalizedSizes[index]
      }));
      onChange?.(newConfig, createUpdateEvent(newConfig[0].id, 'resize'));
    },
    handleSeparatorDrag: (deltaPixels: number, containerSize: number) => {
      const deltaPercent = (deltaPixels / containerSize) * 100;
      const sizes = initialConfig.map(split => split.size);
      const dragIndex = sizes.findIndex((_, index) => index === 0);
      
      sizes[dragIndex] = Math.max(
        initialConfig[dragIndex].minSize ?? 0,
        Math.min(
          initialConfig[dragIndex].maxSize ?? 100,
          sizes[dragIndex] + deltaPercent
        )
      );
      
      sizes[dragIndex + 1] = Math.max(
        initialConfig[dragIndex + 1].minSize ?? 0,
        Math.min(
          initialConfig[dragIndex + 1].maxSize ?? 100,
          sizes[dragIndex + 1] - deltaPercent
        )
      );

      const normalizedSizes = normalizeSizes(sizes);
      const newConfig = initialConfig.map((split, index) => ({
        ...split,
        size: normalizedSizes[index]
      }));
      
      onChange?.(newConfig, createUpdateEvent(newConfig[dragIndex].id, 'resize'));
    }
  };
};

// adapters/dragAdapter.ts
export const createDragAdapter = (
  direction: Direction,
  containerRef: React.RefObject<HTMLDivElement>,
  splitLayoutPort: SplitLayoutPort
): DragHandlerPort => {
  const [dragState, setDragState] = useState<DragState | null>(null);

  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent): void => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const deltaPixels = direction === 'horizontal'
        ? e.clientX - dragState.startPos.x
        : e.clientY - dragState.startPos.y;

      const containerSize = direction === 'horizontal'
        ? containerRect.width
        : containerRect.height;

      splitLayoutPort.handleSeparatorDrag(deltaPixels, containerSize);
    };

    const handleMouseUp = (): void => {
      setDragState(null);
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, direction, containerRef, splitLayoutPort]);

  return {
    onDragStart: (separatorIndex: number, position: Position): void => {
      document.body.style.userSelect = 'none';
      setDragState({
        isDragging: true,
        separator: separatorIndex,
        startPos: position,
        startSizes: []
      });
    },
    onDragMove: (): void => {},
    onDragEnd: (): void => setDragState(null),
    isDragging: !!dragState,
    currentSeparator: dragState?.separator ?? null
  };
};

// components/Separator.tsx
interface SeparatorProps {
  direction: Direction;
  index: number;
  dragHandlerPort: DragHandlerPort;
  className?: string;
}

export const Separator: React.FC<SeparatorProps> = ({
  direction,
  index,
  dragHandlerPort,
  className
}) => {
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.preventDefault();
    dragHandlerPort.onDragStart(index, { x: e.clientX, y: e.clientY });
  };

  return (
    <div
      className={classNames(
        'split-layout__separator',
        `split-layout__separator--${direction}`,
        { 'split-layout__separator--dragging': dragHandlerPort.currentSeparator === index },
        className
      )}
      onMouseDown={handleMouseDown}
    >
      <div className="split-layout__separator-handle" />
    </div>
  );
};

// components/SplitPanel.tsx
interface SplitPanelProps<T> {
  split: Split<T>;
  style: React.CSSProperties;
  direction: Direction;
  onChange?: (newConfig: Split<T>[], event: SplitUpdateEvent) => void;
  className?: string;
}

export const SplitPanel = <T,>({
  split,
  style,
  direction,
  onChange,
  className
}: SplitPanelProps<T>): JSX.Element => {
  const renderContent = () => {
    if (split.children) {
      return (
        <SplitLayout
          config={split.children}
          direction={direction === 'horizontal' ? 'vertical' : 'horizontal'}
          onChange={(newConfig, event) => {
            onChange?.(newConfig, {
              ...event,
              type: 'nested-update',
              splitId: split.id
            });
          }}
        />
      );
    }
    return split.component || null;
  };

  return (
    <div className={classNames('split-layout__panel', className)} style={style}>
      {renderContent()}
    </div>
  );
};

// components/SplitLayout.tsx
interface SplitLayoutProps<T> {
  config: Split<T>[];
  direction?: Direction;
  className?: string;
  onChange?: (newConfig: Split<T>[], event: SplitUpdateEvent) => void;
}

export const SplitLayout = <T,>({
  config,
  direction = 'horizontal',
  className,
  onChange
}: SplitLayoutProps<T>): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const splitLayoutPort = useMemo(
    () => createSplitLayoutCore(config, direction, onChange),
    [config, direction, onChange]
  );
  const dragHandlerPort = createDragAdapter(direction, containerRef, splitLayoutPort);

  const containerClasses = classNames(
    'split-layout',
    `split-layout--${direction}`,
    { 'split-layout--dragging': dragHandlerPort.isDragging },
    className
  );

  return (
    <div className={containerClasses} ref={containerRef}>
      {config.map((split, index) => (
        <React.Fragment key={split.id}>
          <SplitPanel
            split={split}
            style={splitLayoutPort.getSplitStyle(splitLayoutPort.getEffectiveSize(split))}
            direction={direction}
            onChange={onChange}
          />
          {index < config.length - 1 && (
            <Separator
              direction={direction}
              index={index}
              dragHandlerPort={dragHandlerPort}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default SplitLayout;