// domain/types.ts
export type CarouselItem = {
  id: number;
  image: string;
  title?: string;
  description?: string;
};

export type CarouselState = {
  activeIndex: number;
  isAnimating: boolean;
  isDragging: boolean;
  dragStart: number;
  dragOffset: number;
};

export type CarouselConfig = {
  autoPlay: boolean;
  interval: number;
  showArrows: boolean;
  showDots: boolean;
  showThumbnails: boolean;
};

// domain/events.ts
export type DragEvent = {
  clientX: number;
};

export type CarouselEvent = {
  type:
    | "NEXT_SLIDE"
    | "PREV_SLIDE"
    | "GOTO_SLIDE"
    | "DRAG_START"
    | "DRAG_MOVE"
    | "DRAG_END";
  payload?: any;
};

// ports/carousel.ts
export interface CarouselStatePort {
  getState(): CarouselState;
  setState(state: Partial<CarouselState>): void;
  resetDragState(): void;
}

export interface CarouselNavigationPort {
  goToSlide(index: number): void;
  nextSlide(): void;
  prevSlide(): void;
}

export interface CarouselDragPort {
  handleDragStart(clientX: number): void;
  handleDragMove(clientX: number): void;
  handleDragEnd(): void;
}

export interface CarouselAutoPlayPort {
  startAutoPlay(): void;
  stopAutoPlay(): void;
}

// adapters/primary/CarouselController.ts
export type CarouselController = {
  items: ReadonlyArray<CarouselItem>;
  config: Readonly<CarouselConfig>;
  statePort: CarouselStatePort;
  navigationPort: CarouselNavigationPort;
  handleDragStart: (e: React.MouseEvent | React.TouchEvent) => void;
  handleDragMove: (e: React.MouseEvent | React.TouchEvent) => void;
  handleDragEnd: () => void;
};

export const createCarouselController = (
  items: ReadonlyArray<CarouselItem>,
  config: Readonly<CarouselConfig>,
  statePort: CarouselStatePort,
  navigationPort: CarouselNavigationPort,
  dragPort: CarouselDragPort,
  autoPlayPort: CarouselAutoPlayPort
): CarouselController => {
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent): void => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    dragPort.handleDragStart(clientX);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent): void => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    dragPort.handleDragMove(clientX);
  };

  const handleDragEnd = (): void => {
    dragPort.handleDragEnd();
  };

  return {
    items,
    config,
    statePort,
    navigationPort,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
};

// adapters/secondary/CarouselStateAdapter.ts
export const createCarouselStateAdapter = (
  initialState: CarouselState,
  setState: React.Dispatch<React.SetStateAction<CarouselState>>
): CarouselStatePort => ({
  getState: (): CarouselState => initialState,
  setState: (newState: Partial<CarouselState>): void =>
    setState((prev) => ({ ...prev, ...newState })),
  resetDragState: (): void =>
    setState((prev) => ({
      ...prev,
      isDragging: false,
      dragStart: 0,
      dragOffset: 0,
    })),
});

// adapters/secondary/CarouselNavigationAdapter.ts
export const createCarouselNavigationAdapter = (
  items: ReadonlyArray<CarouselItem>,
  statePort: CarouselStatePort
): CarouselNavigationPort => ({
  goToSlide: (index: number): void => {
    const state = statePort.getState();
    if (state.isAnimating) return;

    const normalizedIndex =
      ((index % items.length) + items.length) % items.length;
    statePort.setState({
      isAnimating: true,
      activeIndex: normalizedIndex,
    });

    setTimeout(() => {
      statePort.setState({ isAnimating: false });
    }, 600);
  },
  nextSlide: function (): void {
    const { activeIndex } = statePort.getState();
    this.goToSlide(activeIndex + 1);
  },
  prevSlide: function (): void {
    const { activeIndex } = statePort.getState();
    this.goToSlide(activeIndex - 1);
  },
});

// adapters/secondary/CarouselDragAdapter.ts
export const createCarouselDragAdapter = (
  items: ReadonlyArray<CarouselItem>,
  statePort: CarouselStatePort,
  navigationPort: CarouselNavigationPort
): CarouselDragPort => ({
  handleDragStart: (clientX: number): void => {
    statePort.setState({
      isDragging: true,
      dragStart: clientX,
    });
  },
  handleDragMove: (clientX: number): void => {
    const state = statePort.getState();
    if (!state.isDragging) return;

    const offset = clientX - state.dragStart;
    statePort.setState({ dragOffset: offset });
  },
  handleDragEnd: (): void => {
    const state = statePort.getState();
    if (!state.isDragging) return;

    const threshold = window.innerWidth * 0.2;
    if (Math.abs(state.dragOffset) > threshold) {
      if (state.dragOffset > 0) {
        navigationPort.prevSlide();
      } else {
        navigationPort.nextSlide();
      }
    }

    statePort.resetDragState();
  },
});

// adapters/secondary/CarouselAutoPlayAdapter.ts
export const createCarouselAutoPlayAdapter = (
  navigationPort: CarouselNavigationPort,
  interval: number
): CarouselAutoPlayPort => {
  let timeoutId: NodeJS.Timeout;

  return {
    startAutoPlay: (): void => {
      timeoutId = setTimeout(() => {
        navigationPort.nextSlide();
      }, interval);
    },
    stopAutoPlay: (): void => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    },
  };
};

// components/CarouselUI.tsx
interface CarouselUIProps {
  controller: CarouselController;
}

const CarouselUI: React.FC<CarouselUIProps> = ({ controller }): JSX.Element => {
  const {
    items,
    config,
    statePort,
    navigationPort,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = controller;

  const state = statePort.getState();

  const getSlideClasses = (index: number): string =>
    classNames("carousel__slide", {
      "carousel__slide--active": index === state.activeIndex,
      "carousel__slide--prev":
        index === (state.activeIndex - 1 + items.length) % items.length,
      "carousel__slide--next": index === (state.activeIndex + 1) % items.length,
    });

  return (
    <div
      className={classNames("carousel", {
        "carousel--dragging": state.isDragging,
      })}
    >
      <div
        className="carousel__track"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        style={{
          transform: state.isDragging
            ? `translateX(${state.dragOffset}px)`
            : undefined,
        }}
      >
        {items.map((item, index) => (
          <div key={item.id} className={getSlideClasses(index)}>
            <img
              src={item.image}
              alt={item.title || `Slide ${index + 1}`}
              className="carousel__slide-image"
            />
            {(item.title || item.description) && (
              <div className="carousel__slide-content">
                {item.title && (
                  <h3 className="carousel__slide-title">{item.title}</h3>
                )}
                {item.description && (
                  <p className="carousel__slide-description">
                    {item.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {config.showArrows && (
        <div className="carousel__arrows">
          <button
            className="carousel__arrow carousel__arrow--prev"
            onClick={() => navigationPort.prevSlide()}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            className="carousel__arrow carousel__arrow--next"
            onClick={() => navigationPort.nextSlide()}
            aria-label="Next slide"
          >
            ›
          </button>
        </div>
      )}

      {config.showDots && (
        <div className="carousel__dots">
          {items.map((_, index) => (
            <button
              key={index}
              className={classNames("carousel__dot", {
                "carousel__dot--active": index === state.activeIndex,
              })}
              onClick={() => navigationPort.goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {config.showThumbnails && (
        <div className="carousel__thumbnails">
          {items.map((item, index) => (
            <button
              key={item.id}
              className={classNames("carousel__thumbnail", {
                "carousel__thumbnail--active": index === state.activeIndex,
              })}
              onClick={() => navigationPort.goToSlide(index)}
            >
              <img
                src={item.image}
                alt={`Thumbnail ${index + 1}`}
                className="carousel__thumbnail-image"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// components/Carousel.tsx
interface CarouselProps {
  items: ReadonlyArray<CarouselItem>;
  autoPlay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  showThumbnails?: boolean;
}

const Carousel: React.FC<CarouselProps> = ({
  items,
  autoPlay = true,
  interval = 5000,
  showArrows = true,
  showDots = true,
  showThumbnails = false,
}): JSX.Element => {
  const [carouselState, setCarouselState] = useState<CarouselState>({
    activeIndex: 0,
    isAnimating: false,
    isDragging: false,
    dragStart: 0,
    dragOffset: 0,
  });

  const config: CarouselConfig = {
    autoPlay,
    interval,
    showArrows,
    showDots,
    showThumbnails,
  };

  const stateAdapter = createCarouselStateAdapter(
    carouselState,
    setCarouselState
  );
  const navigationAdapter = createCarouselNavigationAdapter(
    items,
    stateAdapter
  );
  const dragAdapter = createCarouselDragAdapter(
    items,
    stateAdapter,
    navigationAdapter
  );
  const autoPlayAdapter = createCarouselAutoPlayAdapter(
    navigationAdapter,
    interval
  );

  const controller = createCarouselController(
    items,
    config,
    stateAdapter,
    navigationAdapter,
    dragAdapter,
    autoPlayAdapter
  );

  useEffect(() => {
    if (config.autoPlay) {
      autoPlayAdapter.startAutoPlay();
    }
    return () => autoPlayAdapter.stopAutoPlay();
  }, [carouselState.activeIndex, config.autoPlay]);

  return <CarouselUI controller={controller} />;
};

export default Carousel;
