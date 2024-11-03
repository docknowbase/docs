import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SplitLayout from './SplitLayout';

describe('SplitLayout Component', () => {
  // Mock ResizeObserver for tests
  const mockResizeObserver = vi.fn();
  mockResizeObserver.mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
  window.ResizeObserver = mockResizeObserver;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // Basic Rendering Tests
  describe('Rendering', () => {
    it('renders horizontal split layout correctly', () => {
      const config = [
        { id: '1', size: 50, component: <div>Panel 1</div> },
        { id: '2', size: 50, component: <div>Panel 2</div> }
      ];

      const { container } = render(<SplitLayout config={config} direction="horizontal" />);
      
      expect(container.querySelector('.split-layout--horizontal')).toBeTruthy();
      expect(container.querySelectorAll('.split-layout__panel')).toHaveLength(2);
      expect(container.querySelectorAll('.split-layout__separator')).toHaveLength(1);
    });

    it('renders vertical split layout correctly', () => {
      const config = [
        { id: '1', size: 50, component: <div>Panel 1</div> },
        { id: '2', size: 50, component: <div>Panel 2</div> }
      ];

      const { container } = render(<SplitLayout config={config} direction="vertical" />);
      
      expect(container.querySelector('.split-layout--vertical')).toBeTruthy();
      expect(container.querySelectorAll('.split-layout__panel')).toHaveLength(2);
      expect(container.querySelectorAll('.split-layout__separator')).toHaveLength(1);
    });

    it('renders nested splits correctly', () => {
      const config = [
        {
          id: '1',
          size: 50,
          children: [
            { id: '1-1', size: 30, component: <div>Panel 1-1</div> },
            { id: '1-2', size: 70, component: <div>Panel 1-2</div> }
          ]
        },
        { id: '2', size: 50, component: <div>Panel 2</div> }
      ];

      const { container } = render(<SplitLayout config={config} />);
      
      expect(container.querySelectorAll('.split-layout')).toHaveLength(2);
      expect(container.querySelectorAll('.split-layout__panel')).toHaveLength(3);
    });
  });

  // Sizing Tests
  describe('Panel Sizing', () => {
    it('applies correct initial sizes to panels', () => {
      const config = [
        { id: '1', size: 30, component: <div>Panel 1</div> },
        { id: '2', size: 70, component: <div>Panel 2</div> }
      ];

      const { container } = render(<SplLayout config={config} direction="horizontal" />);
      
      const panels = container.querySelectorAll('.split-layout__panel');
      expect(panels[0]).toHaveStyle({ width: '30%' });
      expect(panels[1]).toHaveStyle({ width: '70%' });
    });

    it('maintains minimum size constraints during resizing', async () => {
      const config = [
        { id: '1', size: 50, minSize: 20, component: <div>Panel 1</div> },
        { id: '2', size: 50, minSize: 20, component: <div>Panel 2</div> }
      ];

      const { container } = render(<SplitLayout config={config} />);
      const separator = container.querySelector('.split-layout__separator');
      
      // Simulate dragging separator beyond minimum size
      fireEvent.mouseDown(separator!, { clientX: 0, clientY: 0 });
      fireEvent.mouseMove(window, { clientX: -1000, clientY: 0 });
      fireEvent.mouseUp(window);

      const panels = container.querySelectorAll('.split-layout__panel');
      const firstPanelSize = parseFloat(panels[0].style.width);
      expect(firstPanelSize).toBeGreaterThanOrEqual(20);
    });
  });

  // Drag Interaction Tests
  describe('Drag Interactions', () => {
    it('updates panel sizes on drag', async () => {
      const onChangeMock = vi.fn();
      const config = [
        { id: '1', size: 50, component: <div>Panel 1</div> },
        { id: '2', size: 50, component: <div>Panel 2</div> }
      ];

      const { container } = render(
        <SplitLayout config={config} direction="horizontal" onChange={onChangeMock} />
      );

      // Mock getBoundingClientRect for the container
      const mockRect = { width: 1000, height: 1000, x: 0, y: 0, top: 0, left: 0, right: 1000, bottom: 1000 };
      const containerRef = container.querySelector('.split-layout');
      vi.spyOn(containerRef!, 'getBoundingClientRect').mockImplementation(() => mockRect);

      const separator = container.querySelector('.split-layout__separator');
      
      // Simulate drag
      fireEvent.mouseDown(separator!, { clientX: 500, clientY: 0 });
      fireEvent.mouseMove(window, { clientX: 600, clientY: 0 });
      fireEvent.mouseUp(window);

      expect(onChangeMock).toHaveBeenCalled();
      const newConfig = onChangeMock.mock.calls[onChangeMock.mock.calls.length - 1][0];
      expect(newConfig[0].size).toBeGreaterThan(50);
      expect(newConfig[1].size).toBeLessThan(50);
    });

    it('adds dragging class during drag operations', () => {
      const config = [
        { id: '1', size: 50, component: <div>Panel 1</div> },
        { id: '2', size: 50, component: <div>Panel 2</div> }
      ];

      const { container } = render(<SplitLayout config={config} />);
      const separator = container.querySelector('.split-layout__separator');
      
      fireEvent.mouseDown(separator!, { clientX: 0, clientY: 0 });
      expect(container.querySelector('.split-layout--dragging')).toBeTruthy();
      
      fireEvent.mouseUp(window);
      expect(container.querySelector('.split-layout--dragging')).toBeFalsy();
    });

    it('cleans up event listeners after drag', () => {
      const config = [
        { id: '1', size: 50, component: <div>Panel 1</div> },
        { id: '2', size: 50, component: <div>Panel 2</div> }
      ];

      const { container } = render(<SplitLayout config={config} />);
      const separator = container.querySelector('.split-layout__separator');
      
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      fireEvent.mouseDown(separator!, { clientX: 0, clientY: 0 });
      fireEvent.mouseUp(window);
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    });
  });

  // Edge Cases and Error Handling
  describe('Edge Cases', () => {
    it('handles empty config gracefully', () => {
      const { container } = render(<SplitLayout config={[]} />);
      expect(container.querySelector('.split-layout')).toBeTruthy();
      expect(container.querySelectorAll('.split-layout__panel')).toHaveLength(0);
    });

    it('handles single panel config correctly', () => {
      const config = [
        { id: '1', size: 100, component: <div>Single Panel</div> }
      ];

      const { container } = render(<SplitLayout config={config} />);
      expect(container.querySelectorAll('.split-layout__panel')).toHaveLength(1);
      expect(container.querySelectorAll('.split-layout__separator')).toHaveLength(0);
    });

    it('normalizes panel sizes to 100%', () => {
      const config = [
        { id: '1', size: 200, component: <div>Panel 1</div> },
        { id: '2', size: 300, component: <div>Panel 2</div> }
      ];

      const { container } = render(<SplitLayout config={config} />);
      const panels = container.querySelectorAll('.split-layout__panel');
      
      const firstPanelSize = parseFloat(panels[0].style.width);
      const secondPanelSize = parseFloat(panels[1].style.width);
      
      expect(firstPanelSize + secondPanelSize).toBeCloseTo(100, 1);
    });
  });

  // Callback and Update Tests
  describe('Callbacks and Updates', () => {
    it('calls onChange with updated config when splits change', () => {
      const onChangeMock = vi.fn();
      const initialConfig = [
        { id: '1', size: 50, component: <div>Panel 1</div> },
        { id: '2', size: 50, component: <div>Panel 2</div> }
      ];

      const { container } = render(
        <SplitLayout config={initialConfig} onChange={onChangeMock} />
      );

      const separator = container.querySelector('.split-layout__separator');
      
      fireEvent.mouseDown(separator!, { clientX: 0, clientY: 0 });
      fireEvent.mouseMove(window, { clientX: 100, clientY: 0 });
      fireEvent.mouseUp(window);

      expect(onChangeMock).toHaveBeenCalled();
      expect(onChangeMock.mock.calls[0][0]).toHaveLength(2);
      expect(onChangeMock.mock.calls[0][0].map(c => c.id)).toEqual(['1', '2']);
    });

    it('updates layout when config prop changes', () => {
      const { container, rerender } = render(
        <SplitLayout 
          config={[
            { id: '1', size: 50, component: <div>Panel 1</div> },
            { id: '2', size: 50, component: <div>Panel 2</div> }
          ]} 
        />
      );

      rerender(
        <SplitLayout 
          config={[
            { id: '1', size: 30, component: <div>Panel 1</div> },
            { id: '2', size: 70, component: <div>Panel 2</div> }
          ]} 
        />
      );

      const panels = container.querySelectorAll('.split-layout__panel');
      expect(panels[0]).toHaveStyle({ width: '30%' });
      expect(panels[1]).toHaveStyle({ width: '70%' });
    });
  });
});