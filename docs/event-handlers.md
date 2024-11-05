implement event handlers for an HTML5 Canvas using React and D3 v7. create a comprehensive implementation that handles all the specified events.

```javascript
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const CanvasEvents = () => {
  const canvasRef = useRef(null);
  const [eventLog, setEventLog] = useState([]);
  const [scale, setScale] = useState(1);
  const lastTouchDistance = useRef(null);
  const isMouseDown = useRef(false);

  // Initialize canvas and context
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas size with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    // Initial draw
    drawCanvas(ctx, scale);
  }, [scale]);

  // Drawing function
  const drawCanvas = (ctx, scale) => {
    const width = ctx.canvas.width / (window.devicePixelRatio || 1);
    const height = ctx.canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, width, height);

    // Draw something to visualize scaling
    ctx.save();
    ctx.scale(scale, scale);

    ctx.fillStyle = "#3498db";
    ctx.fillRect(
      width / 4 / scale,
      height / 4 / scale,
      width / 2 / scale,
      height / 2 / scale
    );

    ctx.restore();
  };

  // Log events helper
  const logEvent = (eventName, details) => {
    setEventLog((prev) =>
      [
        {
          time: new Date().toISOString(),
          event: eventName,
          details,
        },
        ...prev,
      ].slice(0, 5)
    );
  };

  // Mouse event handlers
  const handleMouseEnter = (e) => {
    logEvent("mouseenter", { x: e.offsetX, y: e.offsetY });
  };

  const handleMouseLeave = (e) => {
    logEvent("mouseleave", { x: e.offsetX, y: e.offsetY });
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown.current) return;
    const ctx = canvasRef.current.getContext("2d");
    logEvent("mousemove", { x: e.offsetX, y: e.offsetY });

    // Draw something at cursor position
    ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.arc(e.offsetX, e.offsetY, 5, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const newScale = scale + (e.deltaY > 0 ? -0.1 : 0.1);
    setScale(Math.max(0.1, Math.min(3, newScale)));
    logEvent("wheel", { deltaY: e.deltaY, scale: newScale });
  };

  // Touch event handlers
  const handleTouchStart = (e) => {
    e.preventDefault();
    logEvent("touchstart", {
      touches: e.touches.length,
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });

    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      lastTouchDistance.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    logEvent("touchend", { remainingTouches: e.touches.length });
    lastTouchDistance.current = null;
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    logEvent("touchmove", {
      touches: e.touches.length,
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });

    // Handle pinch zoom
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      if (lastTouchDistance.current) {
        const delta = currentDistance - lastTouchDistance.current;
        const newScale = scale + delta * 0.01;
        setScale(Math.max(0.1, Math.min(3, newScale)));
      }

      lastTouchDistance.current = currentDistance;
    }
  };

  // Mouse button handlers
  const handleMouseDown = (e) => {
    isMouseDown.current = true;
    logEvent("mousedown", { x: e.offsetX, y: e.offsetY, button: e.button });
  };

  const handleMouseUp = (e) => {
    isMouseDown.current = false;
    logEvent("mouseup", { x: e.offsetX, y: e.offsetY, button: e.button });
  };

  // Double click handler
  const handleDoubleClick = (e) => {
    logEvent("dblclick", { x: e.offsetX, y: e.offsetY });
    // Reset scale on double click
    setScale(1);
  };

  // Key and focus handlers
  const handleKeyPress = (e) => {
    logEvent("keypress", { key: e.key, code: e.code });
  };

  const handleFocus = () => {
    logEvent("focus", {});
  };

  const handleBlur = () => {
    logEvent("blur", {});
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <canvas
        ref={canvasRef}
        className="border border-gray-300 w-full h-96 touch-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onKeyPress={handleKeyPress}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={0}
      />
      <div className="mt-4">
        <h3 className="font-bold mb-2">Event Log:</h3>
        <div className="bg-gray-100 p-2 rounded">
          {eventLog.map((log, i) => (
            <div key={i} className="text-sm mb-1">
              <span className="font-mono">
                {log.time.split("T")[1].split(".")[0]}
              </span>
              {" - "}
              <span className="font-semibold">{log.event}</span>
              {": "}
              <span className="font-mono">{JSON.stringify(log.details)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CanvasEvents;
```

This implementation includes all the requested event handlers and features:

1. Mouse Events:

   - Mouse enter/leave
   - Mouse move (with drawing when mouse is down)
   - Mouse wheel (for zooming)
   - Double click (resets zoom)

2. Touch Events:

   - Touch start/end
   - Touch move
   - Pinch zoom gesture

3. Other Interactions:
   - Key press
   - Focus/blur

Key Features:

- Uses React hooks (useState, useRef, useEffect) for state management
- Implements high-DPI canvas rendering
- Includes a visual event log to show all interactions
- Handles scaling/zooming with both mouse wheel and pinch gestures
- Draws a simple rectangle that scales with interactions
- Adds visual feedback for mouse movement when dragging
- Prevents default touch behaviors for better control
- Includes tabIndex for keyboard focus

To use this component:

```jsx
import CanvasEvents from "./CanvasEvents";

function App() {
  return (
    <div>
      <CanvasEvents />
    </div>
  );
}
```

The component maintains an event log that shows the last 5 events with their details, making it easy to verify that all events are working correctly. Would you like me to modify any part of the implementation or add additional features?

extend the implementation with more advanced features including drawing tools, filters, transformations, and advanced event handling patterns.

```javascript
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

// Tool definitions
const TOOLS = {
  BRUSH: 'brush',
  ERASER: 'eraser',
  LINE: 'line',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  TEXT: 'text',
  MOVE: 'move',
  EYEDROPPER: 'eyedropper'
};

// Filter definitions
const FILTERS = {
  NONE: 'none',
  BLUR: 'blur',
  GRAYSCALE: 'grayscale',
  INVERT: 'invert',
  SEPIA: 'sepia'
};

const AdvancedCanvasEvents = () => {
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const isDrawing = useRef(false);
  const lastPoint = useRef(null);
  const transformRef = useRef({ x: 0, y: 0, scale: 1, rotation: 0 });

  // State management
  const [currentTool, setCurrentTool] = useState(TOOLS.BRUSH);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [currentFilter, setCurrentFilter] = useState(FILTERS.NONE);
  const [text, setText] = useState('');
  const [history, setHistory] = useState([]);
  const [selectedShape, setSelectedShape] = useState(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set up offscreen canvas for better performance
    offscreenCanvasRef.current = document.createElement('canvas');
    offscreenCanvasRef.current.width = canvas.width;
    offscreenCanvasRef.current.height = canvas.height;

    // Initial save of blank canvas
    saveToHistory();

    // Set up initial transform
    updateTransform();
  }, []);

  // Transform management
  const updateTransform = useCallback(() => {
    const ctx = canvasRef.current.getContext('2d');
    const { x, y, scale, rotation } = transformRef.current;

    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.rotate(rotation);
  }, []);

  // History management
  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    undoStackRef.current.push(canvas.toDataURL());
    redoStackRef.current = []; // Clear redo stack on new action

    if (undoStackRef.current.length > 20) {
      undoStackRef.current.shift(); // Keep last 20 states
    }
  }, []);

  const undo = useCallback(() => {
    if (undoStackRef.current.length > 1) {
      const currentState = undoStackRef.current.pop();
      redoStackRef.current.push(currentState);
      const previousState = undoStackRef.current[undoStackRef.current.length - 1];
      loadCanvasState(previousState);
    }
  }, []);

  const redo = useCallback(() => {
    if (redoStackRef.current.length > 0) {
      const nextState = redoStackRef.current.pop();
      undoStackRef.current.push(nextState);
      loadCanvasState(nextState);
    }
  }, []);

  const loadCanvasState = useCallback((dataUrl) => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  }, []);

  // Drawing functions
  const startDrawing = useCallback((e) => {
    isDrawing.current = true;
    const point = getCanvasPoint(e);
    lastPoint.current = point;

    if (currentTool === TOOLS.TEXT) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.font = `${brushSize}px Arial`;
      ctx.fillStyle = brushColor;
      ctx.fillText(text, point.x, point.y);
      saveToHistory();
    }
  }, [currentTool, brushSize, brushColor, text]);

  const draw = useCallback((e) => {
    if (!isDrawing.current) return;
    const point = getCanvasPoint(e);
    const ctx = canvasRef.current.getContext('2d');

    switch (currentTool) {
      case TOOLS.BRUSH:
        drawBrushStroke(ctx, lastPoint.current, point);
        break;
      case TOOLS.ERASER:
        drawEraserStroke(ctx, lastPoint.current, point);
        break;
      case TOOLS.LINE:
        drawPreviewLine(ctx, lastPoint.current, point);
        break;
      case TOOLS.RECTANGLE:
        drawPreviewRectangle(ctx, lastPoint.current, point);
        break;
      case TOOLS.CIRCLE:
        drawPreviewCircle(ctx, lastPoint.current, point);
        break;
    }

    lastPoint.current = point;
  }, [currentTool]);

  const stopDrawing = useCallback(() => {
    if (isDrawing.current) {
      isDrawing.current = false;
      saveToHistory();
    }
  }, []);

  // Utility functions
  const getCanvasPoint = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  }, []);

  // Drawing helper functions
  const drawBrushStroke = (ctx, start, end) => {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const drawEraserStroke = (ctx, start, end) => {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    drawBrushStroke(ctx, start, end);
    ctx.restore();
  };

  const drawPreviewLine = (ctx, start, end) => {
    const offCtx = offscreenCanvasRef.current.getContext('2d');
    offCtx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    offCtx.drawImage(canvasRef.current, 0, 0);

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(offscreenCanvasRef.current, 0, 0);

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.stroke();
  };

  const drawPreviewRectangle = (ctx, start, end) => {
    const offCtx = offscreenCanvasRef.current.getContext('2d');
    offCtx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    offCtx.drawImage(canvasRef.current, 0, 0);

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(offscreenCanvasRef.current, 0, 0);

    const width = end.x - start.x;
    const height = end.y - start.y;

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.strokeRect(start.x, start.y, width, height);
  };

  const drawPreviewCircle = (ctx, start, end) => {
    const offCtx = offscreenCanvasRef.current.getContext('2d');
    offCtx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    offCtx.drawImage(canvasRef.current, 0, 0);

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(offscreenCanvasRef.current, 0, 0);

    const radius = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );

    ctx.beginPath();
    ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.stroke();
  };

  // Filter applications
  const applyFilter = useCallback((filter) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    switch (filter) {
      case FILTERS.BLUR:
        // Simple box blur
        const tempData = new Uint8ClampedArray(data);
        const width = canvas.width;
        for (let i = 0; i < data.length; i += 4) {
          if (i % (width * 4) === 0 || i % (width * 4) === width * 4 - 4) continue;
          for (let j = 0; j < 3; j++) {
            data[i + j] = (
              tempData[i - 4 + j] +
              tempData[i + j] +
              tempData[i + 4 + j]
            ) / 3;
          }
        }
        break;

      case FILTERS.GRAYSCALE:
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = data[i + 1] = data[i + 2] = avg;
        }
        break;

      case FILTERS.INVERT:
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i];
          data[i + 1] = 255 - data[i + 1];
          data[i + 2] = 255 - data[i + 2];
        }
        break;

      case FILTERS.SEPIA:
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
          data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
          data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
        break;
    }

    ctx.putImageData(imageData, 0, 0);
    saveToHistory();
  }, []);

  // Event handlers
  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'z':
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          e.preventDefault();
          break;
        case 'y':
          redo();
          e.preventDefault();
          break;
      }
    }
  }, [undo, redo]);

  // Gesture handlers
  const handlePinchZoom = useCallback((e) => {
    if (e.touches.length !== 2) return;

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const dist = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );

    if (!lastPoint.current.pinchDist) {
      lastPoint.current.pinchDist = dist;
      return;
    }

    const scale = dist / lastPoint.current.pinchDist;
    transformRef.current.scale *= scale;
    lastPoint.current.pinchDist = dist;

    updateTransform();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4 space-x-2">
        <select
          value={currentTool}
          onChange={(e) => setCurrentTool(e.target.value)}
          className="border p-2 rounded"
        >
          {Object.values(TOOLS).map(tool => (
            <option key={tool} value={tool}>
              {tool.charAt(0).toUpperCase() + tool.slice(1)}
            </option>
          ))}
        </select>

        <input
          type="color"
          value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
          className="border p-1 rounded"
        />

        <input
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="w-32"
        />

        <select
          value={currentFilter}
          onChange={(e) => {
            setCurrentFilter(e.target.value);
            applyFilter(e.target.value);
          }}
          className="border p-2 rounded"
        >
          {Object.values(FILTERS).map(filter => (
            <option key={filter} value={filter}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </option>
          ))}
        </select>

        {currentTool === TOOLS.TEXT && (
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text..."
            className="border p-2 rounded"
          />
        )}
      </div>

      <canvas
        ref={canvasRef}
        className="border border-gray-300 w-full h-96 touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={(e) => {
          e.
```

continue building more advanced features, focusing on advanced image manipulation, gestures, and performance optimizations.

```javascript
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';

// Advanced feature constants
const BLEND_MODES = {
  NORMAL: 'source-over',
  MULTIPLY: 'multiply',
  SCREEN: 'screen',
  OVERLAY: 'overlay',
  DARKEN: 'darken',
  LIGHTEN: 'lighten',
  COLOR_DODGE: 'color-dodge',
  COLOR_BURN: 'color-burn',
  HARD_LIGHT: 'hard-light',
  SOFT_LIGHT: 'soft-light',
  DIFFERENCE: 'difference',
  EXCLUSION: 'exclusion'
};

const EFFECTS = {
  BLUR: 'blur',
  SHARPEN: 'sharpen',
  EDGE_DETECT: 'edge-detect',
  EMBOSS: 'emboss',
  PIXELATE: 'pixelate',
  NOISE: 'noise',
  POSTERIZE: 'posterize',
  VIGNETTE: 'vignette'
};

// Kernel definitions for convolution operations
const KERNELS = {
  BLUR: [
    [1/9, 1/9, 1/9],
    [1/9, 1/9, 1/9],
    [1/9, 1/9, 1/9]
  ],
  SHARPEN: [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0]
  ],
  EDGE_DETECT: [
    [-1, -1, -1],
    [-1, 8, -1],
    [-1, -1, -1]
  ],
  EMBOSS: [
    [-2, -1, 0],
    [-1, 1, 1],
    [0, 1, 2]
  ]
};

const AdvancedImageProcessor = () => {
  // Extended refs for performance optimization
  const canvasRef = useRef(null);
  const bufferCanvasRef = useRef(null);
  const layersRef = useRef([]);
  const workerRef = useRef(null);
  const gestureRef = useRef({ scale: 1, rotation: 0, x: 0, y: 0 });

  // Extended state management
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [blendMode, setBlendMode] = useState(BLEND_MODES.NORMAL);
  const [layers, setLayers] = useState([]);
  const [history, setHistory] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [imageData, setImageData] = useState(null);

  // Initialize WebGL context and Web Worker
  useEffect(() => {
    // Initialize WebGL for hardware-accelerated operations
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl2');

    if (gl) {
      initWebGL(gl);
    }

    // Initialize Web Worker for heavy computations
    workerRef.current = new Worker(createWorkerScript());

    workerRef.current.onmessage = (e) => {
      handleWorkerMessage(e.data);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // WebGL initialization
  const initWebGL = (gl) => {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    // Shader programs for various effects
    const shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(shaderProgram);
  };

  // Create shader program
  const createShaderProgram = (gl, vertexShader, fragmentShader) => {
    // Vertex shader source
    const vsSource = `#version 300 es
      in vec4 aPosition;
      in vec2 aTexCoord;
      out vec2 vTexCoord;

      void main() {
        gl_Position = aPosition;
        vTexCoord = aTexCoord;
      }
    `;

    // Fragment shader source
    const fsSource = `#version 300 es
      precision highp float;
      in vec2 vTexCoord;
      uniform sampler2D uTexture;
      uniform float uKernel[9];
      uniform vec2 uTextureSize;
      out vec4 fragColor;

      void main() {
        vec2 onePixel = vec2(1.0, 1.0) / uTextureSize;
        vec4 colorSum =
          texture(uTexture, vTexCoord + onePixel * vec2(-1, -1)) * uKernel[0] +
          texture(uTexture, vTexCoord + onePixel * vec2( 0, -1)) * uKernel[1] +
          texture(uTexture, vTexCoord + onePixel * vec2( 1, -1)) * uKernel[2] +
          texture(uTexture, vTexCoord + onePixel * vec2(-1,  0)) * uKernel[3] +
          texture(uTexture, vTexCoord + onePixel * vec2( 0,  0)) * uKernel[4] +
          texture(uTexture, vTexCoord + onePixel * vec2( 1,  0)) * uKernel[5] +
          texture(uTexture, vTexCoord + onePixel * vec2(-1,  1)) * uKernel[6] +
          texture(uTexture, vTexCoord + onePixel * vec2( 0,  1)) * uKernel[7] +
          texture(uTexture, vTexCoord + onePixel * vec2( 1,  1)) * uKernel[8];

        fragColor = vec4(colorSum.rgb, 1.0);
      }
    `;

    // Compile and link shaders
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);

    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    return program;
  };

  // Worker script for heavy computations
  const createWorkerScript = () => {
    const blob = new Blob([`
      self.onmessage = function(e) {
        const { type, data, params } = e.data;

        switch (type) {
          case 'convolution':
            const result = applyConvolution(data, params.kernel, params.width, params.height);
            self.postMessage({ type: 'convolution-complete', data: result });
            break;

          case 'noise':
            const noiseResult = applyNoise(data, params.amount);
            self.postMessage({ type: 'noise-complete', data: noiseResult });
            break;

          // Add more image processing operations here
        }
      };

      function applyConvolution(imageData, kernel, width, height) {
        const output = new Uint8ClampedArray(imageData.length);
        const kSize = Math.sqrt(kernel.length);
        const kHalf = Math.floor(kSize / 2);

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let rSum = 0, gSum = 0, bSum = 0;

            for (let ky = -kHalf; ky <= kHalf; ky++) {
              for (let kx = -kHalf; kx <= kHalf; kx++) {
                const px = Math.min(Math.max(x + kx, 0), width - 1);
                const py = Math.min(Math.max(y + ky, 0), height - 1);
                const idx = (py * width + px) * 4;
                const kIdx = (ky + kHalf) * kSize + (kx + kHalf);

                rSum += imageData[idx] * kernel[kIdx];
                gSum += imageData[idx + 1] * kernel[kIdx];
                bSum += imageData[idx + 2] * kernel[kIdx];
              }
            }

            const outIdx = (y * width + x) * 4;
            output[outIdx] = Math.min(Math.max(rSum, 0), 255);
            output[outIdx + 1] = Math.min(Math.max(gSum, 0), 255);
            output[outIdx + 2] = Math.min(Math.max(bSum, 0), 255);
            output[outIdx + 3] = imageData[outIdx + 3];
          }
        }

        return output;
      }

      function applyNoise(imageData, amount) {
        const output = new Uint8ClampedArray(imageData.length);

        for (let i = 0; i < imageData.length; i += 4) {
          const noise = (Math.random() - 0.5) * amount;

          output[i] = Math.min(Math.max(imageData[i] + noise, 0), 255);
          output[i + 1] = Math.min(Math.max(imageData[i + 1] + noise, 0), 255);
          output[i + 2] = Math.min(Math.max(imageData[i + 2] + noise, 0), 255);
          output[i + 3] = imageData[i + 3];
        }

        return output;
      }
    `], { type: 'application/javascript' });

    return URL.createObjectURL(blob);
  };

  // Advanced image processing functions
  const applyEffect = useCallback((effect, params = {}) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setProcessing(true);

    switch (effect) {
      case EFFECTS.BLUR:
      case EFFECTS.SHARPEN:
      case EFFECTS.EDGE_DETECT:
      case EFFECTS.EMBOSS:
        workerRef.current.postMessage({
          type: 'convolution',
          data: imageData.data,
          params: {
            kernel: KERNELS[effect.toUpperCase()],
            width: canvas.width,
            height: canvas.height
          }
        });
        break;

      case EFFECTS.PIXELATE:
        const pixelSize = params.size || 10;
        const w = canvas.width;
        const h = canvas.height;

        ctx.drawImage(canvas, 0, 0, w, h);

        // Pixelate by drawing at a smaller size and scaling up
        ctx.drawImage(canvas,
          0, 0, w, h,
          0, 0, w/pixelSize, h/pixelSize
        );
        ctx.drawImage(canvas,
          0, 0, w/pixelSize, h/pixelSize,
          0, 0, w, h
        );
        break;

      case EFFECTS.VIGNETTE:
        const gradient = ctx.createRadialGradient(
          canvas.width/2, canvas.height/2, 0,
          canvas.width/2, canvas.height/2, canvas.width/2
        );

        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.5)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        break;

      case EFFECTS.POSTERIZE:
        const levels = params.levels || 5;
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.floor(data[i] / (256 / levels)) * (256 / levels);
          data[i + 1] = Math.floor(data[i + 1] / (256 / levels)) * (256 / levels);
          data[i + 2] = Math.floor(data[i + 2] / (256 / levels)) * (256 / levels);
        }

        ctx.putImageData(imageData, 0, 0);
        break;
    }

    saveToHistory();
  }, []);

  // Handle worker messages
  const handleWorkerMessage = useCallback((message) => {
    const { type, data } = message;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    switch (type) {
      case 'convolution-complete':
      case 'noise-complete':
        const imageData = new ImageData(data, canvas.width, canvas.height);
        ctx.putImageData(imageData, 0, 0);
        setProcessing(false);
        saveToHistory();
        break;
    }
  }, []);

  // Advanced gesture handling
  const handleGesture = useCallback((e) => {
    if (e.touches.length !== 2) return;

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];

    // Calculate new scale and rotation
    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );

    const angle = Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    );

    if (!gestureRef.current.lastDistance) {
      gestureRef.current.lastDistance = currentDistance;
      gestureRef.current.lastAngle = angle;
      return;
    }

    const scale = currentDistance / gestureRef.current.lastDistance;
    const rotation = angle - gestureRef.current.lastAngle;

    // Update transform
    gestureRef.current.scale *= scale;
    gestureRef.current.rotation += rotation;

    // Apply transform
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(gestureRef.current.scale, gestureRef.current.scale);
    ctx.rotate(gestureRef.current.rotation);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    ctx.drawImage(bufferCanvasRef.current, 0, 0);
    ctx.restore();

    gestureRef.current.lastDistance = currentDistance;
    gestureRef.current.lastAngle = angle;
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4 space-x-2">
        <select
          value={selectedEffect}
          onChange={(e) => {
            setSelectedEffect(e.target.value);
            applyEffect(e.target.value);
          }}
          className="border p-2 rounded"
        >
          <option value="">Select Effect</option>
          {Object.entries(EFFECTS).map(([key, value]) => (
            <option key={key}
```
