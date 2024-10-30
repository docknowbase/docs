import React, { useState, useEffect, useCallback, useRef } from "react";
import classNames from "classnames";
import "./styles.scss";

interface CarouselProps {
  items: {
    id: number;
    image: string;
    title?: string;
    description?: string;
  }[];
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
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout>();
  const carouselRef = useRef<HTMLDivElement>(null);

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return;

      setIsAnimating(true);
      const normalizedIndex =
        ((index % items.length) + items.length) % items.length;
      setActiveIndex(normalizedIndex);

      setTimeout(() => {
        setIsAnimating(false);
      }, 600); // Match this with SCSS transition duration
    },
    [items.length, isAnimating]
  );

  const nextSlide = useCallback(() => {
    goToSlide(activeIndex + 1);
  }, [activeIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(activeIndex - 1);
  }, [activeIndex, goToSlide]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setDragStart(clientX);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const offset = clientX - dragStart;
    setDragOffset(offset);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);
    const threshold = window.innerWidth * 0.2;

    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }

    setDragOffset(0);
  };

  useEffect(() => {
    if (autoPlay) {
      autoPlayTimeoutRef.current = setTimeout(nextSlide, interval);
    }

    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, [autoPlay, interval, nextSlide, activeIndex]);

  const carouselClasses = classNames("carousel", {
    "carousel--dragging": isDragging,
  });

  const getSlideClasses = (index: number) => {
    return classNames("carousel__slide", {
      "carousel__slide--active": index === activeIndex,
      "carousel__slide--prev":
        index === (activeIndex - 1 + items.length) % items.length,
      "carousel__slide--next": index === (activeIndex + 1) % items.length,
    });
  };

  return (
    <div className={carouselClasses} ref={carouselRef}>
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
          transform: isDragging ? `translateX(${dragOffset}px)` : undefined,
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

      {showArrows && (
        <div className="carousel__arrows">
          <button
            className="carousel__arrow carousel__arrow--prev"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            className="carousel__arrow carousel__arrow--next"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            ›
          </button>
        </div>
      )}

      {showDots && (
        <div className="carousel__dots">
          {items.map((_, index) => (
            <button
              key={index}
              className={classNames("carousel__dot", {
                "carousel__dot--active": index === activeIndex,
              })}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {showThumbnails && (
        <div className="carousel__thumbnails">
          {items.map((item, index) => (
            <button
              key={item.id}
              className={classNames("carousel__thumbnail", {
                "carousel__thumbnail--active": index === activeIndex,
              })}
              onClick={() => goToSlide(index)}
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

export default Carousel;
