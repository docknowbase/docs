import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import DraggableElement from './DraggableElement';

describe('DraggableElement', () => {
  beforeEach(() => {
    // Reset body classes before each test
    document.body.className = '';
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <DraggableElement>
        <div data-testid="child">Test Child</div>
      </DraggableElement>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('applies initial position correctly', () => {
    const initialPosition = { x: 100, y: 200 };
    const { container } = render(
      <DraggableElement initialPosition={initialPosition}>
        <div>Test</div>
      </DraggableElement>
    );
    
    const element = container.querySelector('.draggable-element');
    expect(element).toHaveStyle({
      transform: 'translate(100px, 200px)'
    });
  });

  it('applies custom class names', () => {
    const { container } = render(
      <DraggableElement 
        className="custom-element" 
        containerClassName="custom-container"
      >
        <div>Test</div>
      </DraggableElement>
    );

    expect(container.querySelector('.custom-container')).toBeInTheDocument();
    expect(container.querySelector('.custom-element')).toBeInTheDocument();
  });

  describe('Dragging behavior', () => {
    it('handles mouse down event correctly', () => {
      const onDragStart = vi.fn();
      const { container } = render(
        <DraggableElement onDragStart={onDragStart}>
          <div>Test</div>
        </DraggableElement>
      );

      const element = container.querySelector('.draggable-element');
      fireEvent.mouseDown(element!, { clientX: 0, clientY: 0 });

      expect(document.body.classList.contains('dragging')).toBe(true);
      expect(onDragStart).toHaveBeenCalledWith({ x: 0, y: 0 });
    });

    it('handles mouse move correctly', () => {
      const onDrag = vi.fn();
      const { container } = render(
        <DraggableElement onDrag={onDrag}>
          <div>Test</div>
        </DraggableElement>
      );

      const element = container.querySelector('.draggable-element')!;
      
      // Start drag
      fireEvent.mouseDown(element, { clientX: 0, clientY: 0 });
      
      // Move mouse
      act(() => {
        fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
      });

      expect(onDrag).toHaveBeenCalledWith({ x: 100, y: 100 });
    });

    it('handles mouse up correctly', () => {
      const onDragEnd = vi.fn();
      const { container } = render(
        <DraggableElement onDragEnd={onDragEnd}>
          <div>Test</div>
        </DraggableElement>
      );

      const element = container.querySelector('.draggable-element')!;
      
      // Start and end drag
      fireEvent.mouseDown(element, { clientX: 0, clientY: 0 });
      fireEvent.mouseUp(window);

      expect(document.body.classList.contains('dragging')).toBe(false);
      expect(onDragEnd).toHaveBeenCalled();
    });
  });

  describe('Axis restrictions', () => {
    it('restricts movement to X axis', () => {
      const { container } = render(
        <DraggableElement restrictAxis="x">
          <div>Test</div>
        </DraggableElement>
      );

      const element = container.querySelector('.draggable-element')!;
      
      fireEvent.mouseDown(element, { clientX: 0, clientY: 0 });
      
      act(() => {
        fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
      });

      const style = window.getComputedStyle(element);
      expect(style.transform).toMatch(/translate\(100px, 0px\)/);
    });

    it('restricts movement to Y axis', () => {
      const { container } = render(
        <DraggableElement restrictAxis="y">
          <div>Test</div>
        </DraggableElement>
      );

      const element = container.querySelector('.draggable-element')!;
      
      fireEvent.mouseDown(element, { clientX: 0, clientY: 0 });
      
      act(() => {
        fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
      });

      const style = window.getComputedStyle(element);
      expect(style.transform).toMatch(/translate\(0px, 100px\)/);
    });
  });

  describe('Bounds', () => {
    it('respects left and right bounds', () => {
      const bounds = { left: -50, right: 50 };
      const { container } = render(
        <DraggableElement bounds={bounds}>
          <div>Test</div>
        </DraggableElement>
      );

      const element = container.querySelector('.draggable-element')!;
      
      // Test left bound
      fireEvent.mouseDown(element, { clientX: 0, clientY: 0 });
      act(() => {
        fireEvent.mouseMove(window, { clientX: -100, clientY: 0 });
      });
      
      let style = window.getComputedStyle(element);
      expect(style.transform).toMatch(/translate\(-50px, 0px\)/);

      // Test right bound
      fireEvent.mouseDown(element, { clientX: 0, clientY: 0 });
      act(() => {
        fireEvent.mouseMove(window, { clientX: 100, clientY: 0 });
      });
      
      style = window.getComputedStyle(element);
      expect(style.transform).toMatch(/translate\(50px, 0px\)/);
    });

    it('respects top and bottom bounds', () => {
      const bounds = { top: -50, bottom: 50 };
      const { container } = render(
        <DraggableElement bounds={bounds}>
          <div>Test</div>
        </DraggableElement>
      );

      const element = container.querySelector('.draggable-element')!;
      
      // Test top bound
      fireEvent.mouseDown(element, { clientX: 0, clientY: 0 });
      act(() => {
        fireEvent.mouseMove(window, { clientX: 0, clientY: -100 });
      });
      
      let style = window.getComputedStyle(element);
      expect(style.transform).toMatch(/translate\(0px, -50px\)/);

      // Test bottom bound
      fireEvent.mouseDown(element, { clientX: 0, clientY: 0 });
      act(() => {
        fireEvent.mouseMove(window, { clientX: 0, clientY: 100 });
      });
      
      style = window.getComputedStyle(element);
      expect(style.transform).toMatch(/translate\(0px, 50px\)/);
    });
  });

  describe('Cleanup', () => {
    it('removes event listeners on unmount', () => {
      const { unmount } = render(
        <DraggableElement>
          <div>Test</div>
        </DraggableElement>
      );

      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    });

    it('removes dragging class on unmount while dragging', () => {
      const { container, unmount } = render(
        <DraggableElement>
          <div>Test</div>
        </DraggableElement>
      );

      const element = container.querySelector('.draggable-element')!;
      fireEvent.mouseDown(element, { clientX: 0, clientY: 0 });
      
      unmount();
      
      expect(document.body.classList.contains('dragging')).toBe(false);
    });
  });
});