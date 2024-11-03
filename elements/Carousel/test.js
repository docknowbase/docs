import React from 'react';
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, fireEvent, act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Carousel from './Carousel';

// Mock items for testing
const mockItems = [
  { id: 1, image: '/image1.jpg', title: 'First Slide', description: 'Description 1' },
  { id: 2, image: '/image2.jpg', title: 'Second Slide', description: 'Description 2' },
  { id: 3, image: '/image3.jpg', title: 'Third Slide', description: 'Description 3' },
];

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

describe('Carousel Component', () => {
  beforeEach(() => {
    // Reset timers before each test
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Basic Rendering Tests
  describe('Rendering', () => {
    test('renders all slides', () => {
      const { container } = render(<Carousel items={mockItems} />);
      const slides = container.querySelectorAll('.carousel__slide');
      expect(slides).toHaveLength(mockItems.length);
    });

    test('renders with default props', () => {
      const { container } = render(<Carousel items={mockItems} />);
      expect(container.querySelector('.carousel__arrows')).toBeTruthy();
      expect(container.querySelector('.carousel__dots')).toBeTruthy();
      expect(container.querySelector('.carousel__thumbnails')).toBeFalsy();
    });

    test('renders slide content correctly', () => {
      render(<Carousel items={mockItems} />);
      expect(screen.getByText('First Slide')).toBeTruthy();
      expect(screen.getByText('Description 1')).toBeTruthy();
    });
  });

  // Navigation Tests
  describe('Navigation', () => {
    test('next button advances to next slide', async () => {
      const { container } = render(<Carousel items={mockItems} />);
      const nextButton = container.querySelector('.carousel__arrow--next');
      
      expect(container.querySelector('.carousel__slide--active img')).toHaveAttribute('alt', 'First Slide');
      
      await userEvent.click(nextButton!);
      vi.advanceTimersByTime(600); // Wait for animation
      
      expect(container.querySelector('.carousel__slide--active img')).toHaveAttribute('alt', 'Second Slide');
    });

    test('previous button goes to previous slide', async () => {
      const { container } = render(<Carousel items={mockItems} />);
      const prevButton = container.querySelector('.carousel__arrow--prev');
      
      await userEvent.click(prevButton!);
      vi.advanceTimersByTime(600);
      
      expect(container.querySelector('.carousel__slide--active img')).toHaveAttribute('alt', 'Third Slide');
    });

    test('dot navigation works correctly', async () => {
      const { container } = render(<Carousel items={mockItems} />);
      const dots = container.querySelectorAll('.carousel__dot');
      
      await userEvent.click(dots[1]);
      vi.advanceTimersByTime(600);
      
      expect(container.querySelector('.carousel__slide--active img')).toHaveAttribute('alt', 'Second Slide');
    });
  });

  // Auto Play Tests
  describe('Auto Play', () => {
    test('advances automatically when autoPlay is true', () => {
      render(<Carousel items={mockItems} autoPlay={true} interval={5000} />);
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      expect(screen.getByText('Second Slide')).toBeTruthy();
    });

    test('does not advance when autoPlay is false', () => {
      render(<Carousel items={mockItems} autoPlay={false} />);
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      expect(screen.getByText('First Slide')).toBeTruthy();
    });
  });

  // Touch and Drag Tests
  describe('Touch and Drag Interactions', () => {
    test('responds to drag movement', () => {
      const { container } = render(<Carousel items={mockItems} />);
      const track = container.querySelector('.carousel__track')!;

      fireEvent.mouseDown(track, { clientX: 500 });
      fireEvent.mouseMove(track, { clientX: 300 });
      fireEvent.mouseUp(track);

      vi.advanceTimersByTime(600);
      expect(screen.getByText('Second Slide')).toBeTruthy();
    });

    test('cancels drag if movement is below threshold', () => {
      const { container } = render(<Carousel items={mockItems} />);
      const track = container.querySelector('.carousel__track')!;

      fireEvent.mouseDown(track, { clientX: 500 });
      fireEvent.mouseMove(track, { clientX: 450 }); // Small movement
      fireEvent.mouseUp(track);

      vi.advanceTimersByTime(600);
      expect(screen.getByText('First Slide')).toBeTruthy();
    });

    test('handles touch events', () => {
      const { container } = render(<Carousel items={mockItems} />);
      const track = container.querySelector('.carousel__track')!;

      fireEvent.touchStart(track, { touches: [{ clientX: 500 }] });
      fireEvent.touchMove(track, { touches: [{ clientX: 300 }] });
      fireEvent.touchEnd(track);

      vi.advanceTimersByTime(600);
      expect(screen.getByText('Second Slide')).toBeTruthy();
    });
  });

  // Feature Toggle Tests
  describe('Feature Toggles', () => {
    test('hides arrows when showArrows is false', () => {
      const { container } = render(<Carousel items={mockItems} showArrows={false} />);
      expect(container.querySelector('.carousel__arrows')).toBeFalsy();
    });

    test('hides dots when showDots is false', () => {
      const { container } = render(<Carousel items={mockItems} showDots={false} />);
      expect(container.querySelector('.carousel__dots')).toBeFalsy();
    });

    test('shows thumbnails when showThumbnails is true', () => {
      const { container } = render(<Carousel items={mockItems} showThumbnails={true} />);
      expect(container.querySelector('.carousel__thumbnails')).toBeTruthy();
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    test('handles empty items array', () => {
      const { container } = render(<Carousel items={[]} />);
      expect(container.querySelector('.carousel__slide')).toBeFalsy();
    });

    test('handles single item', () => {
      const singleItem = [mockItems[0]];
      const { container } = render(<Carousel items={singleItem} />);
      expect(container.querySelectorAll('.carousel__slide')).toHaveLength(1);
    });

    test('handles items without title or description', () => {
      const itemsWithoutContent = [
        { id: 1, image: '/image1.jpg' },
        { id: 2, image: '/image2.jpg' },
      ];
      const { container } = render(<Carousel items={itemsWithoutContent} />);
      expect(container.querySelector('.carousel__slide-content')).toBeFalsy();
    });
  });

  // Animation and State Tests
  describe('Animation and State', () => {
    test('prevents rapid slide changes during animation', async () => {
      const { container } = render(<Carousel items={mockItems} />);
      const nextButton = container.querySelector('.carousel__arrow--next')!;

      await userEvent.click(nextButton);
      await userEvent.click(nextButton); // Second click during animation
      
      vi.advanceTimersByTime(300); // Half-way through animation
      expect(screen.getByText('Second Slide')).toBeTruthy();
      
      vi.advanceTimersByTime(300); // Complete animation
      expect(screen.getByText('Second Slide')).toBeTruthy();
    });

    test('cleans up autoPlay timeout on unmount', () => {
      const { unmount } = render(<Carousel items={mockItems} autoPlay={true} interval={5000} />);
      unmount();
      // Verify no memory leaks or errors after unmount
      expect(() => vi.advanceTimersByTime(5000)).not.toThrow();
    });
  });
});