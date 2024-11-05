implement these measurement functionalities using HTML5 Canvas, D3.js v7, and React. create isolated implementations for each measurement type.

```tsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const BoundsMeasurement = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set canvas size based on container
    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;

      const bounds = container.getBoundingClientRect();
      canvas.width = bounds.width;
      canvas.height = bounds.height;

      // Display bounds info
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.font = "14px Arial";
      context.fillStyle = "#333";
      context.fillText(`Canvas Bounds:`, 10, 20);
      context.fillText(`Width: ${canvas.width}px`, 10, 40);
      context.fillText(`Height: ${canvas.height}px`, 10, 60);
      context.fillText(`Top: ${bounds.top}px`, 10, 80);
      context.fillText(`Left: ${bounds.left}px`, 10, 100);

      // Draw boundary box
      context.strokeStyle = "#2563eb";
      context.lineWidth = 2;
      context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-64 border rounded-lg p-4">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default BoundsMeasurement;
```

```tsx
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const PositionDistanceMeasurement = () => {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw points
      points.forEach((point, i) => {
        context.beginPath();
        context.arc(point.x, point.y, 5, 0, Math.PI * 2);
        context.fillStyle = "#2563eb";
        context.fill();

        // Draw coordinates
        context.fillStyle = "#333";
        context.font = "12px Arial";
        context.fillText(
          `P${i + 1}(${point.x.toFixed(0)}, ${point.y.toFixed(0)})`,
          point.x + 10,
          point.y
        );
      });

      // Draw line and distance if 2 points exist
      if (points.length === 2) {
        const [p1, p2] = points;
        context.beginPath();
        context.moveTo(p1.x, p1.y);
        context.lineTo(p2.x, p2.y);
        context.strokeStyle = "#2563eb";
        context.setLineDash([5, 5]);
        context.stroke();

        // Draw distance
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        context.fillStyle = "#333";
        context.font = "14px Arial";
        context.fillText(`${distance.toFixed(1)}px`, midX, midY - 10);
      }
    };

    const handleClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (points.length < 2) {
        setPoints([...points, { x, y }]);

        if (points.length === 1) {
          const dx = x - points[0].x;
          const dy = y - points[0].y;
          setDistance(Math.sqrt(dx * dx + dy * dy));
        }
      } else {
        setPoints([{ x, y }]);
        setDistance(null);
      }
    };

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    canvas.addEventListener("click", handleClick);
    draw();

    return () => canvas.removeEventListener("click", handleClick);
  }, [points, distance]);

  return (
    <div className="w-full h-64 border rounded-lg p-4">
      <div className="mb-2 text-sm">
        Click to place points and measure distance
      </div>
      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />
    </div>
  );
};

export default PositionDistanceMeasurement;
```

```tsx
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const AngleAreaMeasurement = () => {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [measurements, setMeasurements] = useState({ angle: null, area: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const calculateAngle = (p1, p2, p3) => {
      const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
      const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
      let angle = (angle2 - angle1) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      return angle;
    };

    const calculateArea = (points) => {
      let area = 0;
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        area += points[i].x * points[j].y;
        area -= points[j].x * points[i].y;
      }
      return Math.abs(area / 2);
    };

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw points and connect them
      if (points.length > 0) {
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        points.forEach((point, i) => {
          if (i > 0) context.lineTo(point.x, point.y);

          // Draw point
          context.beginPath();
          context.arc(point.x, point.y, 5, 0, Math.PI * 2);
          context.fillStyle = "#2563eb";
          context.fill();

          // Label point
          context.fillStyle = "#333";
          context.font = "12px Arial";
          context.fillText(`P${i + 1}`, point.x + 10, point.y);
        });

        // Close the shape if we have 3 or more points
        if (points.length >= 3) {
          context.beginPath();
          context.moveTo(points[0].x, points[0].y);
          points.forEach((point) => context.lineTo(point.x, point.y));
          context.closePath();
          context.strokeStyle = "#2563eb";
          context.stroke();

          // Fill with semi-transparent color
          context.fillStyle = "rgba(37, 99, 235, 0.1)";
          context.fill();
        }

        // Draw angle arc if we have exactly 3 points
        if (points.length === 3) {
          const [p1, p2, p3] = points;
          const radius = 30;
          context.beginPath();
          context.arc(
            p2.x,
            p2.y,
            radius,
            Math.atan2(p1.y - p2.y, p1.x - p2.x),
            Math.atan2(p3.y - p2.y, p3.x - p2.x)
          );
          context.strokeStyle = "#2563eb";
          context.stroke();
        }
      }

      // Display measurements
      if (measurements.angle !== null || measurements.area !== null) {
        context.fillStyle = "#333";
        context.font = "14px Arial";
        let y = 30;
        if (measurements.angle !== null) {
          context.fillText(`Angle: ${measurements.angle.toFixed(1)}°`, 10, y);
          y += 25;
        }
        if (measurements.area !== null) {
          context.fillText(`Area: ${measurements.area.toFixed(1)}px²`, 10, y);
        }
      }
    };

    const handleClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newPoints = [...points, { x, y }];
      setPoints(newPoints);

      // Calculate measurements
      if (newPoints.length === 3) {
        const angle = calculateAngle(newPoints[0], newPoints[1], newPoints[2]);
        const area = calculateArea(newPoints);
        setMeasurements({ angle, area });
      } else if (newPoints.length > 3) {
        setPoints([{ x, y }]);
        setMeasurements({ angle: null, area: null });
      }
    };

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    canvas.addEventListener("click", handleClick);
    draw();

    return () => canvas.removeEventListener("click", handleClick);
  }, [points, measurements]);

  return (
    <div className="w-full h-64 border rounded-lg p-4">
      <div className="mb-2 text-sm">
        Click to place points (3 points for angle and area)
      </div>
      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />
    </div>
  );
};

export default AngleAreaMeasurement;
```

```tsx
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const PathTextMetrics = () => {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [pathLength, setPathLength] = useState(0);
  const [sampleText, setSampleText] = useState('Sample Text');

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const calculatePathLength = (points) => {
      let length = 0;
      for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i-1].x;
        const dy = points[i].y - points[i-1].y;
        length += Math.sqrt(dx * dx + dy * dy);
      }
      return length;
    };

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw path
      if (points.length > 0) {
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        points.forEach((point, i) => {
          if (i > 0) context.lineTo(point.x, point.y);

          // Draw point
          context.beginPath();
          context.arc(point.x, point.y, 5, 0, Math.PI * 2);
          context.fillStyle = '#2563eb';
          context.fill();
        });

        // Draw path
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        points.forEach(point => context.lineTo(point.x, point.y));
        context.strokeStyle = '#2563eb';
        context.stroke();
      }

      // Display path length
      if (pathLength > 0) {
        context.fillStyle = '#333';
        context.font = '14px Arial';
        context.fillText(`Path Length: ${pathLength.toFixed(1)}px`, 10, 30);
      }

      // Display text metrics
      context.font = '20px Arial';
      const metrics = context.measureText(sampleText);
      const textX = 10;
      const textY = canvas.height - 60;

      // Draw text
      context.fillStyle = '#333';
      context.fillText(sampleText, textX, textY);

      // Draw text metrics visualization
      context.beginPath();
      context.moveTo(textX, textY + 5);
      context.lineTo(textX + metrics.width, textY + 5);
      context.strokeStyle = '#2563eb';
      context.stroke();

      // Display metrics
      context.font = '14px Arial';
      context.fillStyle = '#333';
      context.fillText(`Width: ${metrics.width.toFixed(1)}px`, textX, textY + 25);
      context.fillText(`Ascent: ${metrics.actualBoundingBoxAscent.toFixed(1)}px`, textX + 150, textY + 25);
      context.fillText(`Descent: ${metrics.actualBoundingBoxDescent.toFixed(1)}px`, textX + 300, textY + 25);
    };

    const handleClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newPoints = [...points, { x, y }];
      setPoints(newPoints);

      if (newPoints.length > 1) {
        setPathLength(calculatePathLength(newPoints));
      }

      if (newPoints.length > 5) {
        setPoints([]);
        setPathLength(0);
      }
    };

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    canvas.addEventListener('click', handleClick);
    draw();

    return () => canvas.removeEventListener('click', handleClick);
  }, [points, pathLength, sampleText]);

  return (
    <div className="w-full h-64 border rounded-lg p-4">
      <input
        type="text"
        value={sampleText}
        onChange={(e) => setSampleText(e.target.value)}
        className="
```

continue with more advanced measurement implementations focusing on client/screen coordinates, element sizing, and complex interactions.

```tsx
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const ScreenCoordinateSystem = () => {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({
    client: null,
    screen: null,
    canvas: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let animationFrameId;

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Apply transformations
      context.save();
      context.translate(offset.x, offset.y);
      context.scale(scale, scale);

      // Draw grid
      const gridSize = 50;
      const gridWidth = canvas.width / scale;
      const gridHeight = canvas.height / scale;

      context.beginPath();
      context.strokeStyle = "#e5e7eb";

      for (let x = 0; x <= gridWidth; x += gridSize) {
        context.moveTo(x - offset.x / scale, 0 - offset.y / scale);
        context.lineTo(x - offset.x / scale, gridHeight - offset.y / scale);
      }

      for (let y = 0; y <= gridHeight; y += gridSize) {
        context.moveTo(0 - offset.x / scale, y - offset.y / scale);
        context.lineTo(gridWidth - offset.x / scale, y - offset.y / scale);
      }

      context.stroke();

      // Draw axes
      context.beginPath();
      context.strokeStyle = "#2563eb";
      context.lineWidth = 2 / scale;

      // X-axis
      context.moveTo(0 - offset.x / scale, 0);
      context.lineTo(gridWidth - offset.x / scale, 0);

      // Y-axis
      context.moveTo(0, 0 - offset.y / scale);
      context.lineTo(0, gridHeight - offset.y / scale);

      context.stroke();

      // Draw coordinate info if mouse position exists
      if (mousePos.canvas) {
        const { x, y } = mousePos.canvas;

        context.beginPath();
        context.arc(x, y, 4 / scale, 0, Math.PI * 2);
        context.fillStyle = "#2563eb";
        context.fill();

        context.font = `${12 / scale}px Arial`;
        context.fillStyle = "#333";
        context.fillText(
          `Canvas: (${x.toFixed(0)}, ${y.toFixed(0)})`,
          x + 10 / scale,
          y - 10 / scale
        );
      }

      context.restore();

      // Draw fixed position info
      context.font = "12px Arial";
      context.fillStyle = "#333";
      let textY = 20;

      if (mousePos.client) {
        context.fillText(
          `Client: (${mousePos.client.x.toFixed(
            0
          )}, ${mousePos.client.y.toFixed(0)})`,
          10,
          textY
        );
        textY += 20;
      }

      if (mousePos.screen) {
        context.fillText(
          `Screen: (${mousePos.screen.x.toFixed(
            0
          )}, ${mousePos.screen.y.toFixed(0)})`,
          10,
          textY
        );
      }

      context.fillText(`Scale: ${scale.toFixed(2)}x`, canvas.width - 100, 20);

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;

      // Calculate canvas coordinates accounting for scale and offset
      const canvasX = (clientX - offset.x) / scale;
      const canvasY = (clientY - offset.y) / scale;

      setMousePos({
        client: { x: clientX, y: clientY },
        screen: { x: event.screenX, y: event.screenY },
        canvas: { x: canvasX, y: canvasY },
      });

      if (isDragging && dragStart) {
        const dx = event.clientX - dragStart.x;
        const dy = event.clientY - dragStart.y;
        setOffset({
          x: offset.x + dx,
          y: offset.y + dy,
        });
        setDragStart({ x: event.clientX, y: event.clientY });
      }
    };

    const handleWheel = (event) => {
      event.preventDefault();
      const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
      setScale(scale * scaleFactor);
    };

    const handleMouseDown = (event) => {
      setIsDragging(true);
      setDragStart({ x: event.clientX, y: event.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragStart(null);
    };

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("wheel", handleWheel);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [scale, offset, mousePos, isDragging, dragStart]);

  return (
    <div className="w-full h-96 border rounded-lg p-4">
      <div className="mb-2 text-sm">
        Drag to pan, scroll to zoom, move mouse to see coordinates
      </div>
      <canvas ref={canvasRef} className="w-full h-full cursor-move" />
    </div>
  );
};

export default ScreenCoordinateSystem;
```

```tsx
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const ElementSizing = () => {
  const canvasRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [resizing, setResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState(null);
  const [resizeHandle, setResizeHandle] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let animationFrameId;

    const drawElement = (element) => {
      const { x, y, width, height, type } = element;

      context.save();

      if (type === 'rectangle') {
        context.beginPath();
        context.rect(x, y, width, height);
        context.fillStyle = element === selectedElement ?
          'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)';
        context.fill();
        context.strokeStyle = '#2563eb';
        context.stroke();
      } else if (type === 'ellipse') {
        context.beginPath();
        context.ellipse(
          x + width/2,
          y + height/2,
          width/2,
          height/2,
          0, 0, Math.PI * 2
        );
        context.fillStyle = element === selectedElement ?
          'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)';
        context.fill();
        context.strokeStyle = '#2563eb';
        context.stroke();
      }

      // Draw size info
      if (element === selectedElement) {
        context.font = '12px Arial';
        context.fillStyle = '#333';
        context.fillText(
          `${width.toFixed(0)} × ${height.toFixed(0)}`,
          x + width/2 - 20,
          y + height/2
        );

        // Draw resize handles
        const handles = [
          { x, y }, // top-left
          { x: x + width/2, y }, // top-center
          { x: x + width, y }, // top-right
          { x: x + width, y: y + height/2 }, // middle-right
          { x: x + width, y: y + height }, // bottom-right
          { x: x + width/2, y: y + height }, // bottom-center
          { x: x, y: y + height }, // bottom-left
          { x, y: y + height/2 } // middle-left
        ];

        handles.forEach((handle, i) => {
          context.beginPath();
          context.arc(handle.x, handle.y, 4, 0, Math.PI * 2);
          context.fillStyle = '#2563eb';
          context.fill();
        });
      }

      context.restore();
    };

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      elements.forEach(drawElement);
      animationFrameId = requestAnimationFrame(draw);
    };

    const getResizeHandle = (element, x, y) => {
      if (!element) return null;

      const handles = [
        { x: element.x, y: element.y, cursor: 'nw-resize' },
        { x: element.x + element.width/2, y: element.y, cursor: 'n-resize' },
        { x: element.x + element.width, y: element.y, cursor: 'ne-resize' },
        { x: element.x + element.width, y: element.y + element.height/2, cursor: 'e-resize' },
        { x: element.x + element.width, y: element.y + element.height, cursor: 'se-resize' },
        { x: element.x + element.width/2, y: element.y + element.height, cursor: 's-resize' },
        { x: element.x, y: element.y + element.height, cursor: 'sw-resize' },
        { x: element.x, y: element.y + element.height/2, cursor: 'w-resize' }
      ];

      return handles.find(handle => {
        const dx = handle.x - x;
        const dy = handle.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 5;
      });
    };

    const handleMouseDown = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (selectedElement) {
        const handle = getResizeHandle(selectedElement, x, y);
        if (handle) {
          setResizing(true);
          setResizeStart({ x, y });
          setResizeHandle(handle);
          return;
        }
      }

      // Check if clicked on an element
      const clicked = elements.find(element => {
        if (element.type === 'rectangle') {
          return x >= element.x && x <= element.x + element.width &&
                 y >= element.y && y <= element.y + element.height;
        } else if (element.type === 'ellipse') {
          const cx = element.x + element.width/2;
          const cy = element.y + element.height/2;
          const rx = element.width/2;
          const ry = element.height/2;
          const dx = (x - cx) / rx;
          const dy = (y - cy) / ry;
          return dx * dx + dy * dy <= 1;
        }
        return false;
      });

      setSelectedElement(clicked || null);

      if (!clicked) {
        // Create new element
        const newElement = {
          type: Math.random() > 0.5 ? 'rectangle' : 'ellipse',
          x,
          y,
          width: 100,
          height: 80
        };
        setElements([...elements, newElement]);
        setSelectedElement(newElement);
      }
    };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (resizing && selectedElement && resizeStart && resizeHandle) {
        const dx = x - resizeStart.x;
        const dy = y - resizeStart.y;

        const newElements = elements.map(element => {
          if (element === selectedElement) {
            const newElement = { ...element };

            // Update size based on resize handle position
            switch (resizeHandle.cursor) {
              case 'nw-resize':
                newElement.x += dx;
                newElement.y += dy;
                newElement.width -= dx;
                newElement.height -= dy;
                break;
              case 'n-resize':
                newElement.y += dy;
                newElement.height -= dy;
                break;
              case 'ne-resize':
                newElement.y += dy;
                newElement.width += dx;
                newElement.height -= dy;
                break;
              case 'e-resize':
                newElement.width += dx;
                break;
              case 'se-resize':
                newElement.width += dx;
                newElement.height += dy;
                break;
              case 's-resize':
                newElement.height += dy;
                break;
              case 'sw-resize':
                newElement.x += dx;
                newElement.width -= dx;
                newElement.height += dy;
                break;
              case 'w-resize':
                newElement.x += dx;
                newElement.width -= dx;
                break;
            }

            // Ensure minimum size
            if (newElement.width < 20) newElement.width = 20;
            if (newElement.height < 20) newElement.height = 20;

            return newElement;
          }
          return element;
        });

        setElements(newElements);
        setResizeStart({ x, y });
      }

      // Update cursor
      if (selectedElement) {
        const handle = getResizeHandle(selectedElement, x, y);
        canvas.style.cursor = handle ? handle.cursor : 'default';
      } else {
        canvas.style.cursor = 'default';
      }
    };

    const handleMouseUp = () => {
      setResizing(false);
      setResizeStart(null);
      setResizeHandle(null);
    };

    canvas.width = canvas.offsetWidth;
    canvas
```

continue with even more advanced implementations, focusing on complex measurements and interactions.

```tsx
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const PrecisionMeasurement = () => {
  const canvasRef = useRef(null);
  const [measurements, setMeasurements] = useState([]);
  const [activeMeasurement, setActiveMeasurement] = useState(null);
  const [mode, setMode] = useState("distance"); // distance, angle, area
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(10);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const screenToWorld = (x, y) => {
      return {
        x: (x - pan.x) / zoom,
        y: (y - pan.y) / zoom,
      };
    };

    const worldToScreen = (x, y) => {
      return {
        x: x * zoom + pan.x,
        y: y * zoom + pan.y,
      };
    };

    const snapToGridPoint = (point) => {
      if (!snapToGrid) return point;
      return {
        x: Math.round(point.x / gridSize) * gridSize,
        y: Math.round(point.y / gridSize) * gridSize,
      };
    };

    const drawGrid = () => {
      const gridSizeScaled = gridSize * zoom;
      ctx.beginPath();
      ctx.strokeStyle = "#e5e7eb";

      // Vertical lines
      for (
        let x = pan.x % gridSizeScaled;
        x < canvas.width;
        x += gridSizeScaled
      ) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }

      // Horizontal lines
      for (
        let y = pan.y % gridSizeScaled;
        y < canvas.height;
        y += gridSizeScaled
      ) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }

      ctx.stroke();
    };

    const drawMeasurement = (measurement) => {
      ctx.save();

      const points = measurement.points.map((p) => worldToScreen(p.x, p.y));

      // Draw lines between points
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });

      if (measurement.type === "area" && points.length > 2) {
        ctx.closePath();
        ctx.fillStyle = "rgba(37, 99, 235, 0.1)";
        ctx.fill();
      }

      ctx.strokeStyle =
        measurement === activeMeasurement ? "#2563eb" : "#94a3b8";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw points
      points.forEach((point, i) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#2563eb";
        ctx.fill();
        ctx.fillStyle = "#333";
        ctx.font = "12px Arial";
        ctx.fillText(`P${i + 1}`, point.x + 8, point.y - 8);
      });

      // Draw measurements
      if (measurement.type === "distance" && points.length === 2) {
        const dx = points[1].x - points[0].x;
        const dy = points[1].y - points[0].y;
        const distance = Math.sqrt(dx * dx + dy * dy) / zoom;
        const midX = (points[0].x + points[1].x) / 2;
        const midY = (points[0].y + points[1].y) / 2;

        ctx.fillStyle = "#333";
        ctx.font = "14px Arial";
        ctx.fillText(`${distance.toFixed(1)}px`, midX + 10, midY - 10);
      } else if (measurement.type === "angle" && points.length === 3) {
        const angle = calculateAngle(points[0], points[1], points[2]);
        const centerX = points[1].x;
        const centerY = points[1].y;

        // Draw angle arc
        ctx.beginPath();
        ctx.arc(
          centerX,
          centerY,
          30,
          Math.atan2(points[0].y - centerY, points[0].x - centerX),
          Math.atan2(points[2].y - centerY, points[2].x - centerX)
        );
        ctx.stroke();

        ctx.fillStyle = "#333";
        ctx.font = "14px Arial";
        ctx.fillText(`${angle.toFixed(1)}°`, centerX + 35, centerY - 15);
      } else if (measurement.type === "area" && points.length > 2) {
        const area = calculateArea(points) / (zoom * zoom);
        const centroid = calculateCentroid(points);

        ctx.fillStyle = "#333";
        ctx.font = "14px Arial";
        ctx.fillText(`${area.toFixed(1)}px²`, centroid.x, centroid.y);
      }

      ctx.restore();
    };

    const calculateAngle = (p1, p2, p3) => {
      const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
      const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
      let angle = (angle2 - angle1) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      return angle;
    };

    const calculateArea = (points) => {
      let area = 0;
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        area += points[i].x * points[j].y;
        area -= points[j].x * points[i].y;
      }
      return Math.abs(area / 2);
    };

    const calculateCentroid = (points) => {
      let cx = 0,
        cy = 0;
      points.forEach((point) => {
        cx += point.x;
        cy += point.y;
      });
      return {
        x: cx / points.length,
        y: cy / points.length,
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (snapToGrid) drawGrid();

      measurements.forEach(drawMeasurement);
      if (activeMeasurement) drawMeasurement(activeMeasurement);

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseDown = (event) => {
      const rect = canvas.getBoundingClientRect();
      let point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      point = screenToWorld(point.x, point.y);
      point = snapToGridPoint(point);

      if (!activeMeasurement) {
        setActiveMeasurement({
          type: mode,
          points: [point],
        });
      } else {
        const newPoints = [...activeMeasurement.points, point];

        if (
          (mode === "distance" && newPoints.length === 2) ||
          (mode === "angle" && newPoints.length === 3) ||
          (mode === "area" && newPoints.length >= 3 && event.button === 2)
        ) {
          setMeasurements([
            ...measurements,
            { ...activeMeasurement, points: newPoints },
          ]);
          setActiveMeasurement(null);
        } else {
          setActiveMeasurement({ ...activeMeasurement, points: newPoints });
        }
      }
    };

    const handleWheel = (event) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const oldZoom = zoom;
      const newZoom = zoom * (event.deltaY > 0 ? 0.9 : 1.1);

      setPan({
        x: mouseX - (mouseX - pan.x) * (newZoom / oldZoom),
        y: mouseY - (mouseY - pan.y) * (newZoom / oldZoom),
      });
      setZoom(newZoom);
    };

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("wheel", handleWheel);
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [measurements, activeMeasurement, mode, snapToGrid, gridSize, zoom, pan]);

  return (
    <div className="w-full h-96 border rounded-lg p-4">
      <div className="flex gap-4 mb-4">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="px-3 py-1 border rounded"
        >
          <option value="distance">Distance</option>
          <option value="angle">Angle</option>
          <option value="area">Area</option>
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={snapToGrid}
            onChange={(e) => setSnapToGrid(e.target.checked)}
          />
          Snap to Grid
        </label>

        <input
          type="number"
          value={gridSize}
          onChange={(e) => setGridSize(Number(e.target.value))}
          min="1"
          max="100"
          className="w-20 px-2 border rounded"
        />

        <button
          onClick={() => setMeasurements([])}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear All
        </button>
      </div>

      <div className="text-sm mb-2">
        {mode === "distance" && "Click two points to measure distance"}
        {mode === "angle" && "Click three points to measure angle"}
        {mode === "area" &&
          "Click points to measure area (right-click to complete)"}
      </div>

      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />
    </div>
  );
};

export default PrecisionMeasurement;
```

```tsx
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const MeasurementOverlay = () => {
  const canvasRef = useRef(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [elements] = useState([
    { type: 'rect', x: 50, y: 50, width: 200, height: 150, label: 'Rectangle' },
    { type: 'circle', x: 350, y: 120, radius: 80, label: 'Circle' },
    { type: 'text', x: 150, y: 300, text: 'Sample Text', fontSize: 24 }
  ]);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [measurementType, setMeasurementType] = useState('all');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const drawElement = (element) => {
      ctx.save();
      ctx.strokeStyle = element === selectedElement ? '#2563eb' : '#64748b';
      ctx.lineWidth = 2;

      switch (element.type) {
        case 'rect':
          ctx.beginPath();
          ctx.rect(element.x, element.y, element.width, element.height);
          ctx.stroke();
          break;

        case 'circle':
          ctx.beginPath();
          ctx.arc(element.x, element.y, element.radius, 0, Math.PI * 2);
          ctx.stroke();
          break;

        case 'text':
          ctx.font = `${element.fontSize}px Arial`;
          ctx.fillStyle = '#333';
          ctx.fillText(element.text, element.x, element.y);
          break;
      }

      ctx.restore();
    };

    const drawMeasurements = (element) => {
      if (!showMeasurements || !element) return;

      ctx.save();
      ctx.strokeStyle = '#94a3b8';
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Arial';
      ctx.lineWidth = 1;

      const measurements = [];

      if (measurementType === 'all' || measurementType === 'dimensions') {
        // Dimensions
        switch (element.type) {
          case 'rect':
            measurements.push({
              label: `width: ${element.width}px`,
              x: element.x + element.width/2,
              y: element.y - 10,
              align: 'center'
            });
            measurements.push({
              label: `height: ${element.height}px`,
              x: element.x - 10,
              y: element.y + element.height/2,
              align: 'right',
              rotation: -Math.PI/2
            });
            break;

          case 'circle':
            measurements.push({
              label: `r: ${element.radius}px`,
              x: element.x + element.radius/2,
              y: element.y - 10,
              align: 'center'
            });
            measurements.push({
              label: `d: ${element.radius * 2}px`,
              x: element.x,
              y: element.y + element.radius + 20,
              align: 'center'
            });
            break;

          case 'text':
            const metrics = ctx.measureText(element.text);
            measurements.push({
              label: `width: ${metrics.width.toFixed(1)}px`,
              x: element.x + metrics.width/2,
              y: element.y - 10,
              align: 'center'
            });
            break;
        }
      }

      if (measurementType === 'all' || measurementType === 'position') {
        // Position
        measurements.push({
          label: `x: ${element.x}px`,
          x: element.x,
          y: canvas.height - 20,
          align: 'center'
        });
        measurements.push({
          label: `y: ${element.y}px`,
```
