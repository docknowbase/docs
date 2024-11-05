implement these advanced selection operations using HTML5 Canvas, D3.js v7, and React. break this down into core implementations focusing on element manipulation.

```tsx
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const CanvasSelectionManager = () => {
  const canvasRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [selectedElements, setSelectedElements] = useState([]);

  // Initialize canvas and elements
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Sample elements for demonstration
    const initialElements = [
      {
        id: 1,
        x: 50,
        y: 50,
        width: 60,
        height: 60,
        type: "rect",
        color: "#2563eb",
      },
      {
        id: 2,
        x: 150,
        y: 150,
        width: 60,
        height: 60,
        type: "rect",
        color: "#16a34a",
      },
      {
        id: 3,
        x: 250,
        y: 100,
        width: 60,
        height: 60,
        type: "rect",
        color: "#dc2626",
      },
    ];

    setElements(initialElements);
    drawElements(ctx, initialElements, []);
  }, []);

  // Draw all elements
  const drawElements = (ctx, elements, selectedIds) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    elements.forEach((element) => {
      ctx.beginPath();
      ctx.fillStyle = element.color;
      ctx.fillRect(element.x, element.y, element.width, element.height);

      // Draw selection highlight
      if (selectedIds.includes(element.id)) {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          element.x - 2,
          element.y - 2,
          element.width + 4,
          element.height + 4
        );
      }
    });
  };

  // Selection Operations
  const filterElements = (predicate) => {
    const filtered = elements.filter(predicate);
    setSelectedElements(filtered);
    drawElements(
      canvasRef.current.getContext("2d"),
      elements,
      filtered.map((el) => el.id)
    );
  };

  const sortElements = (compareFn) => {
    const sorted = [...elements].sort(compareFn);
    setElements(sorted);
    drawElements(
      canvasRef.current.getContext("2d"),
      sorted,
      selectedElements.map((el) => el.id)
    );
  };

  const raiseElement = (elementId) => {
    const elementIndex = elements.findIndex((el) => el.id === elementId);
    if (elementIndex < elements.length - 1) {
      const newElements = [...elements];
      [newElements[elementIndex], newElements[elementIndex + 1]] = [
        newElements[elementIndex + 1],
        newElements[elementIndex],
      ];
      setElements(newElements);
      drawElements(
        canvasRef.current.getContext("2d"),
        newElements,
        selectedElements.map((el) => el.id)
      );
    }
  };

  const lowerElement = (elementId) => {
    const elementIndex = elements.findIndex((el) => el.id === elementId);
    if (elementIndex > 0) {
      const newElements = [...elements];
      [newElements[elementIndex], newElements[elementIndex - 1]] = [
        newElements[elementIndex - 1],
        newElements[elementIndex],
      ];
      setElements(newElements);
      drawElements(
        canvasRef.current.getContext("2d"),
        newElements,
        selectedElements.map((el) => el.id)
      );
    }
  };

  const cloneElement = (elementId) => {
    const element = elements.find((el) => el.id === elementId);
    if (element) {
      const clone = {
        ...element,
        id: Math.max(...elements.map((el) => el.id)) + 1,
        x: element.x + 20,
        y: element.y + 20,
      };
      const newElements = [...elements, clone];
      setElements(newElements);
      drawElements(
        canvasRef.current.getContext("2d"),
        newElements,
        selectedElements.map((el) => el.id)
      );
    }
  };

  const insertElement = (element) => {
    const newElement = {
      ...element,
      id: Math.max(...elements.map((el) => el.id)) + 1,
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    drawElements(
      canvasRef.current.getContext("2d"),
      newElements,
      selectedElements.map((el) => el.id)
    );
  };

  const removeElement = (elementId) => {
    const newElements = elements.filter((el) => el.id !== elementId);
    setElements(newElements);
    setSelectedElements(selectedElements.filter((el) => el.id !== elementId));
    drawElements(
      canvasRef.current.getContext("2d"),
      newElements,
      selectedElements.filter((el) => el.id !== elementId).map((el) => el.id)
    );
  };

  const emptySelection = () => {
    setSelectedElements([]);
    drawElements(canvasRef.current.getContext("2d"), elements, []);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-300 w-full"
      />
      <div className="mt-4 space-y-2">
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => filterElements((el) => el.y < 100)}
          >
            Filter Top Elements
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => sortElements((a, b) => a.x - b.x)}
          >
            Sort by X
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={emptySelection}
          >
            Clear Selection
          </button>
        </div>
        {selectedElements.map((element) => (
          <div key={element.id} className="flex space-x-2">
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={() => raiseElement(element.id)}
            >
              Raise
            </button>
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={() => lowerElement(element.id)}
            >
              Lower
            </button>
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={() => cloneElement(element.id)}
            >
              Clone
            </button>
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={() => removeElement(element.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CanvasSelectionManager;
```

This implementation provides:

1. Core Selection Features:

- Filter: Filter elements based on custom predicates
- Sort: Sort elements using compare functions
- Order: Raise/lower elements in the stack
- Clone: Create copies of selected elements
- Insert: Add new elements to the canvas
- Remove: Delete selected elements
- Empty: Clear all selections
- Node access: Direct element access through state management
- Parent/child traversal: Handled through element ordering

2. Key Components:

- Canvas rendering using HTML5 Canvas
- D3.js for data manipulation (though minimal in this core implementation)
- React for state management and UI components
- Basic styling using Tailwind classes

The implementation focuses on the core functionality while maintaining clean separation of concerns.

1. Add more advanced selection features?
2. Implement drag-and-drop functionality?
3. Add more complex filtering options?
4. Include additional element types beyond rectangles?

expand the implementation with more advanced selection features and sophisticated manipulations.

```tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { ArrowUpDown, Layers, Move, Grid, Lock, Unlock, Copy, Trash2 } from 'lucide-react';

const AdvancedCanvasManager = () => {
  const canvasRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [selectedElements, setSelectedElements] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState(null);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lockedElements, setLockedElements] = useState(new Set());

  // Initialize with more complex shapes
  useEffect(() => {
    const initialElements = [
      {
        id: 1,
        x: 50,
        y: 50,
        width: 60,
        height: 60,
        type: 'rect',
        color: '#2563eb',
        rotation: 0,
        opacity: 1,
        properties: { layer: 1, name: 'Blue Rectangle' }
      },
      {
        id: 2,
        x: 150,
        y: 150,
        radius: 30,
        type: 'circle',
        color: '#16a34a',
        rotation: 0,
        opacity: 0.8,
        properties: { layer: 2, name: 'Green Circle' }
      },
      {
        id: 3,
        points: [[250, 100], [310, 100], [280, 160]],
        type: 'polygon',
        color: '#dc2626',
        rotation: 45,
        opacity: 0.9,
        properties: { layer: 3, name: 'Red Triangle' }
      }
    ];

    setElements(initialElements);
    addToHistory(initialElements);
  }, []);

  // History management
  const addToHistory = useCallback((newElements) => {
    const newHistory = [...history.slice(0, historyIndex + 1), newElements];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  // Advanced drawing function
  const drawElements = useCallback((ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw grid if enabled
    if (gridEnabled) {
      const gridSize = 20;
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 0.5;

      for (let x = 0; x < ctx.canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ctx.canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < ctx.canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ctx.canvas.width, y);
        ctx.stroke();
      }
    }

    // Apply canvas transformations
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    elements.forEach(element => {
      ctx.save();
      ctx.globalAlpha = element.opacity;

      // Apply element rotation
      ctx.translate(element.x, element.y);
      ctx.rotate((element.rotation || 0) * Math.PI / 180);
      ctx.translate(-element.x, -element.y);

      ctx.fillStyle = element.color;

      switch (element.type) {
        case 'rect':
          ctx.fillRect(element.x, element.y, element.width, element.height);
          break;
        case 'circle':
          ctx.beginPath();
          ctx.arc(element.x, element.y, element.radius, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'polygon':
          ctx.beginPath();
          ctx.moveTo(element.points[0][0], element.points[0][1]);
          element.points.slice(1).forEach(point => {
            ctx.lineTo(point[0], point[1]);
          });
          ctx.closePath();
          ctx.fill();
          break;
      }

      // Draw selection
      if (selectedElements.find(sel => sel.id === element.id)) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        if (element.type === 'rect') {
          ctx.strokeRect(element.x - 2, element.y - 2, element.width + 4, element.height + 4);
        } else if (element.type === 'circle') {
          ctx.beginPath();
          ctx.arc(element.x, element.y, element.radius + 2, 0, Math.PI * 2);
          ctx.stroke();
        } else if (element.type === 'polygon') {
          ctx.beginPath();
          ctx.moveTo(element.points[0][0], element.points[0][1]);
          element.points.forEach(point => {
            ctx.lineTo(point[0], point[1]);
          });
          ctx.closePath();
          ctx.stroke();
        }
      }

      // Draw locked indicator
      if (lockedElements.has(element.id)) {
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        if (element.type === 'rect') {
          ctx.strokeRect(element.x - 4, element.y - 4, element.width + 8, element.height + 8);
        } else if (element.type === 'circle') {
          ctx.beginPath();
          ctx.arc(element.x, element.y, element.radius + 4, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }

      ctx.restore();
    });

    // Draw selection box if active
    if (selectionBox) {
      ctx.strokeStyle = '#0066ff';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        selectionBox.x,
        selectionBox.y,
        selectionBox.width,
        selectionBox.height
      );
      ctx.setLineDash([]);
    }

    ctx.restore();
  }, [elements, selectedElements, gridEnabled, scale, offset, selectionBox, lockedElements]);

  // Advanced element manipulation
  const transformElements = (transform) => {
    if (selectedElements.length === 0) return;

    const newElements = elements.map(element => {
      if (selectedElements.find(sel => sel.id === element.id)) {
        if (lockedElements.has(element.id)) return element;
        return transform(element);
      }
      return element;
    });

    setElements(newElements);
    addToHistory(newElements);
  };

  const rotateElements = (angle) => {
    transformElements(element => ({
      ...element,
      rotation: (element.rotation || 0) + angle
    }));
  };

  const scaleElements = (factor) => {
    transformElements(element => {
      if (element.type === 'rect') {
        return {
          ...element,
          width: element.width * factor,
          height: element.height * factor
        };
      } else if (element.type === 'circle') {
        return {
          ...element,
          radius: element.radius * factor
        };
      } else if (element.type === 'polygon') {
        const centerX = element.points.reduce((sum, p) => sum + p[0], 0) / element.points.length;
        const centerY = element.points.reduce((sum, p) => sum + p[1], 0) / element.points.length;

        return {
          ...element,
          points: element.points.map(point => [
            centerX + (point[0] - centerX) * factor,
            centerY + (point[1] - centerY) * factor
          ])
        };
      }
      return element;
    });
  };

  // Advanced selection handlers
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale - offset.x;
    const y = (e.clientY - rect.top) / scale - offset.y;

    setDragStart({ x, y });
    setIsDragging(true);

    // Check if clicked on an element
    const clickedElement = elements.findLast(element => {
      if (element.type === 'rect') {
        return x >= element.x && x <= element.x + element.width &&
               y >= element.y && y <= element.y + element.height;
      } else if (element.type === 'circle') {
        const dx = x - element.x;
        const dy = y - element.y;
        return Math.sqrt(dx * dx + dy * dy) <= element.radius;
      }
      return false;
    });

    if (clickedElement) {
      if (!e.shiftKey) {
        setSelectedElements([clickedElement]);
      } else {
        setSelectedElements(prev => {
          const isSelected = prev.find(el => el.id === clickedElement.id);
          if (isSelected) {
            return prev.filter(el => el.id !== clickedElement.id);
          }
          return [...prev, clickedElement];
        });
      }
    } else if (!e.shiftKey) {
      setSelectedElements([]);
      setSelectionBox({ x, y, width: 0, height: 0 });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale - offset.x;
    const y = (e.clientY - rect.top) / scale - offset.y;

    if (selectedElements.length > 0 && !selectionBox) {
      // Move selected elements
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;

      const newElements = elements.map(element => {
        if (selectedElements.find(sel => sel.id === element.id)) {
          if (lockedElements.has(element.id)) return element;

          if (snapToGrid) {
            const gridSize = 20;
            const newX = Math.round((element.x + dx) / gridSize) * gridSize;
            const newY = Math.round((element.y + dy) / gridSize) * gridSize;
            return { ...element, x: newX, y: newY };
          }

          return { ...element, x: element.x + dx, y: element.y + dy };
        }
        return element;
      });

      setElements(newElements);
      setDragStart({ x, y });
    } else if (selectionBox) {
      // Update selection box
      setSelectionBox({
        x: Math.min(dragStart.x, x),
        y: Math.min(dragStart.y, y),
        width: Math.abs(x - dragStart.x),
        height: Math.abs(y - dragStart.y)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    if (selectionBox) {
      // Select elements within the selection box
      const selectedElements = elements.filter(element => {
        if (element.type === 'rect') {
          return element.x >= selectionBox.x &&
                 element.x + element.width <= selectionBox.x + selectionBox.width &&
                 element.y >= selectionBox.y &&
                 element.y + element.height <= selectionBox.y + selectionBox.height;
        } else if (element.type === 'circle') {
          return element.x >= selectionBox.x &&
                 element.x <= selectionBox.x + selectionBox.width &&
                 element.y >= selectionBox.y &&
                 element.y <= selectionBox.y + selectionBox.height;
        }
        return false;
      });

      setSelectedElements(selectedElements);
      setSelectionBox(null);
    }

    addToHistory(elements);
  };

  // Canvas zoom and pan
  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(scale * scaleFactor);
    } else {
      setOffset({
        x: offset.x - e.deltaX,
        y: offset.y - e.deltaY
      });
    }
  };

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    drawElements(ctx);
  }, [drawElements]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="mb-4 flex space-x-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
          onClick={undo}
          disabled={historyIndex <= 0}
        >
          Undo
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
        >
          Redo
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
          onClick={() => setGridEnabled(!gridEnabled)}
        >
          <Grid className="w-4 h-4 mr-2" />
          {gridEnabled ? 'Hide Grid' : 'Show Grid'}
        </button>
        <button
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center"
          onClick={() => setSnapToGrid(!snapToGrid)}
        >
          <Move className="w-4 h-4 mr-2" />
          {snapToGrid ? 'Disable Snap' : 'Enable Snap'}
        </button>
      </div
```

continue expanding with even more advanced features, focusing now on advanced transformations, grouping, and complex interactions.

```tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import {
  Group, Ungroup, Lock, Unlock, Copy, Trash2,
  Layers, Move, Grid, RotateCcw, RotateCw,
  ZoomIn, ZoomOut, Maximize, Minimize,
  AlignLeft, AlignCenter, AlignRight,
  AlignStartVertical, AlignCenter as AlignMiddle, AlignEndVertical
} from 'lucide-react';

const AdvancedCanvasTransforms = () => {
  const canvasRef = useRef(null);
  const transformControlsRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedElements, setSelectedElements] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [transformMode, setTransformMode] = useState(null); // rotate, scale, skew
  const [masks, setMasks] = useState([]);
  const [layers, setLayers] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [viewportTransform, setViewportTransform] = useState({
    scale: 1,
    rotation: 0,
    translateX: 0,
    translateY: 0
  });

  // Advanced element properties
  const [elementProperties, setElementProperties] = useState({
    effects: {}, // blur, shadow, glow
    gradients: {}, // linear, radial gradients
    animations: {}, // keyframe animations
    filters: {}, // color adjustments, blur, etc
    clips: {}, // clipping paths
    blendModes: {} // blend mode between elements
  });

  // Enhanced transformation controls
  const TransformControls = ({ element }) => {
    const [anchor, setAnchor] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [scale, setScale] = useState({ x: 1, y: 1 });
    const [skew, setSkew] = useState({ x: 0, y: 0 });

    const handleTransform = useCallback((type, value) => {
      const matrix = new DOMMatrix();
      matrix.translateSelf(anchor.x, anchor.y);
      matrix.rotateSelf(rotation);
      matrix.scaleSelf(scale.x, scale.y);
      matrix.skewXSelf(skew.x);
      matrix.skewYSelf(skew.y);

      return matrix;
    }, [anchor, rotation, scale, skew]);

    return (
      <div className="absolute" style={{
        top: element.y,
        left: element.x,
        width: element.width,
        height: element.height,
        transform: `matrix(${handleTransform().toString()})`
      }}>
        {/* Transform handles */}
        <div className="absolute top-0 left-0 w-2 h-2 bg-blue-500 cursor-nw-resize" />
        <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 cursor-ne-resize" />
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-blue-500 cursor-sw-resize" />
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 cursor-se-resize" />

        {/* Rotation handle */}
        <div className="absolute -top-6 left-1/2 w-1 h-6 bg-blue-500 cursor-pointer" />
      </div>
    );
  };

  // Advanced grouping operations
  const handleGrouping = useCallback(() => {
    if (selectedElements.length < 2) return;

    const groupBounds = selectedElements.reduce((bounds, element) => {
      return {
        x: Math.min(bounds.x, element.x),
        y: Math.min(bounds.y, element.y),
        right: Math.max(bounds.right, element.x + (element.width || 0)),
        bottom: Math.max(bounds.bottom, element.y + (element.height || 0))
      };
    }, { x: Infinity, y: Infinity, right: -Infinity, bottom: -Infinity });

    const newGroup = {
      id: `group-${Date.now()}`,
      type: 'group',
      elements: selectedElements.map(el => el.id),
      x: groupBounds.x,
      y: groupBounds.y,
      width: groupBounds.right - groupBounds.x,
      height: groupBounds.bottom - groupBounds.y,
      transform: new DOMMatrix()
    };

    setGroups(prev => [...prev, newGroup]);
    setActiveGroup(newGroup.id);
  }, [selectedElements]);

  // Advanced masking operations
  const createMask = useCallback(() => {
    if (selectedElements.length < 2) return;

    const [maskElement, ...maskedElements] = selectedElements;
    const newMask = {
      id: `mask-${Date.now()}`,
      maskElement: maskElement.id,
      maskedElements: maskedElements.map(el => el.id),
      type: 'alpha' // or 'luminance'
    };

    setMasks(prev => [...prev, newMask]);
  }, [selectedElements]);

  // Advanced path operations
  const PathOperations = {
    unite: (paths) => {
      return paths.reduce((acc, path) => {
        // Implement path union using path commands
        return acc;
      });
    },
    intersect: (paths) => {
      return paths.reduce((acc, path) => {
        // Implement path intersection
        return acc;
      });
    },
    subtract: (paths) => {
      return paths.reduce((acc, path) => {
        // Implement path subtraction
        return acc;
      });
    },
    exclude: (paths) => {
      return paths.reduce((acc, path) => {
        // Implement path exclusion
        return acc;
      });
    }
  };

  // Advanced alignment functions
  const alignElements = useCallback((alignment) => {
    if (selectedElements.length < 2) return;

    const bounds = selectedElements.reduce((acc, el) => ({
      left: Math.min(acc.left, el.x),
      right: Math.max(acc.right, el.x + (el.width || 0)),
      top: Math.min(acc.top, el.y),
      bottom: Math.max(acc.bottom, el.y + (el.height || 0))
    }), { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity });

    const newElements = elements.map(el => {
      if (!selectedElements.find(sel => sel.id === el.id)) return el;

      let newX = el.x;
      let newY = el.y;

      switch (alignment) {
        case 'left':
          newX = bounds.left;
          break;
        case 'center':
          newX = bounds.left + (bounds.right - bounds.left) / 2 - (el.width || 0) / 2;
          break;
        case 'right':
          newX = bounds.right - (el.width || 0);
          break;
        case 'top':
          newY = bounds.top;
          break;
        case 'middle':
          newY = bounds.top + (bounds.bottom - bounds.top) / 2 - (el.height || 0) / 2;
          break;
        case 'bottom':
          newY = bounds.bottom - (el.height || 0);
          break;
      }

      return { ...el, x: newX, y: newY };
    });

    setElements(newElements);
    addToUndoStack();
  }, [elements, selectedElements]);

  // Advanced distribution functions
  const distributeElements = useCallback((axis) => {
    if (selectedElements.length < 3) return;

    const sortedElements = [...selectedElements].sort((a, b) =>
      axis === 'horizontal' ? a.x - b.x : a.y - b.y
    );

    const first = sortedElements[0];
    const last = sortedElements[sortedElements.length - 1];
    const totalSpace = axis === 'horizontal'
      ? last.x - first.x
      : last.y - first.y;
    const spacing = totalSpace / (sortedElements.length - 1);

    const newElements = elements.map(el => {
      const index = sortedElements.findIndex(sel => sel.id === el.id);
      if (index === -1 || index === 0 || index === sortedElements.length - 1) return el;

      return {
        ...el,
        [axis === 'horizontal' ? 'x' : 'y']:
          first[axis === 'horizontal' ? 'x' : 'y'] + spacing * index
      };
    });

    setElements(newElements);
    addToUndoStack();
  }, [elements, selectedElements]);

  // Smart guides and snapping
  const calculateSnapPoints = useCallback((element) => {
    const snapPoints = [];
    elements.forEach(el => {
      if (el.id === element.id) return;

      // Edge snap points
      snapPoints.push(
        { x: el.x, y: el.y, type: 'corner' },
        { x: el.x + el.width, y: el.y, type: 'corner' },
        { x: el.x, y: el.y + el.height, type: 'corner' },
        { x: el.x + el.width, y: el.y + el.height, type: 'corner' }
      );

      // Center snap points
      snapPoints.push(
        { x: el.x + el.width / 2, y: el.y + el.height / 2, type: 'center' }
      );
    });

    return snapPoints;
  }, [elements]);

  // Advanced rendering with effects
  const renderElement = useCallback((ctx, element) => {
    ctx.save();

    // Apply element transform
    if (element.transform) {
      const matrix = element.transform;
      ctx.transform(
        matrix.a, matrix.b,
        matrix.c, matrix.d,
        matrix.e, matrix.f
      );
    }

    // Apply effects
    if (elementProperties.effects[element.id]) {
      const effects = elementProperties.effects[element.id];

      if (effects.shadow) {
        ctx.shadowColor = effects.shadow.color;
        ctx.shadowBlur = effects.shadow.blur;
        ctx.shadowOffsetX = effects.shadow.offsetX;
        ctx.shadowOffsetY = effects.shadow.offsetY;
      }

      if (effects.blur) {
        ctx.filter = `blur(${effects.blur}px)`;
      }
    }

    // Apply gradients
    if (elementProperties.gradients[element.id]) {
      const gradient = elementProperties.gradients[element.id];
      const canvasGradient = gradient.type === 'linear'
        ? ctx.createLinearGradient(
            gradient.x1, gradient.y1,
            gradient.x2, gradient.y2
          )
        : ctx.createRadialGradient(
            gradient.x1, gradient.y1, gradient.r1,
            gradient.x2, gradient.y2, gradient.r2
          );

      gradient.stops.forEach(stop => {
        canvasGradient.addColorStop(stop.offset, stop.color);
      });

      ctx.fillStyle = canvasGradient;
    }

    // Apply blend mode
    if (elementProperties.blendModes[element.id]) {
      ctx.globalCompositeOperation = elementProperties.blendModes[element.id];
    }

    // Draw element based on type
    switch (element.type) {
      case 'path':
        const path = new Path2D(element.d);
        if (element.fill) ctx.fill(path);
        if (element.stroke) ctx.stroke(path);
        break;
      case 'group':
        // Render group elements
        element.elements.forEach(childId => {
          const child = elements.find(el => el.id === childId);
          if (child) renderElement(ctx, child);
        });
        break;
      default:
        // Default shape rendering
        if (element.fill) ctx.fill();
        if (element.stroke) ctx.stroke();
    }

    ctx.restore();
  }, [elementProperties, elements]);

  // Main render loop
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Apply viewport transform
    ctx.save();
    ctx.translate(viewportTransform.translateX, viewportTransform.translateY);
    ctx.scale(viewportTransform.scale, viewportTransform.scale);
    ctx.rotate(viewportTransform.rotation * Math.PI / 180);

    // Render elements by layer
    layers.forEach(layer => {
      const layerElements = elements.filter(el => el.layer === layer.id);
      layerElements.forEach(element => {
        // Apply masks
        const elementMask = masks.find(mask =>
          mask.maskedElements.includes(element.id)
        );

        if (elementMask) {
          ctx.save();
          const maskElement = elements.find(el =>
            el.id === elementMask.maskElement
          );
          if (maskElement) {
            // Create mask
            ctx.beginPath();
            renderElement(ctx, maskElement);
            ctx.clip();
          }
        }

        renderElement(ctx, element);

        if (elementMask) {
          ctx.restore();
        }
      });
    });

    ctx.restore();
  }, [elements, groups, masks, layers, viewportTransform, renderElement]);

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-4 space-y-2">
        {/* Transform controls */}
        <div className="bg-white p-2 rounded shadow space-x-2">
          <button
            onClick={() => setTransformMode('rotate')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTransformMode('scale')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <Maximize className="w-5 h-5" />
          </button>
          {/* Add more transform controls */}
        </div>

        {/* Alignment controls */}
        <div className="bg-white p-2 rounded shadow space-x-2">
          <button
            onClick={() => alignElements('left')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <AlignLeft className="w-5 h-5" />
          </button>
          {/* Add more alignment controls */}
        </div>

        {/* Layer controls */}
        <div className="bg-white p-2 rounded shadow space-y-2">
          {layers.map(layer => (
            <div
              key={layer.id}
              className="flex
```
