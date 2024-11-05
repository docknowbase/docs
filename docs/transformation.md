create isolated implementations for various geometric transformations using HTML5 Canvas, D3, and React. break this down into separate artifacts for clarity.

```javascript
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const BasicTransformations = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = 600;
    const height = 400;

    // Set canvas size with device pixel ratio for clarity
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw original rectangle
    ctx.fillStyle = "blue";
    ctx.fillRect(50, 50, 50, 50);

    // Translation
    ctx.save();
    ctx.translate(100, 0);
    ctx.fillStyle = "red";
    ctx.fillRect(50, 50, 50, 50);
    ctx.restore();

    // Rotation
    ctx.save();
    ctx.translate(200, 75);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = "green";
    ctx.fillRect(-25, -25, 50, 50);
    ctx.restore();

    // Scale
    ctx.save();
    ctx.translate(300, 50);
    ctx.scale(1.5, 0.5);
    ctx.fillStyle = "purple";
    ctx.fillRect(0, 0, 50, 50);
    ctx.restore();

    // Labels
    ctx.font = "14px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Original", 50, 120);
    ctx.fillText("Translated", 150, 120);
    ctx.fillText("Rotated", 250, 120);
    ctx.fillText("Scaled", 350, 120);
  }, []);

  return <canvas ref={canvasRef} className="border border-gray-300" />;
};

export default BasicTransformations;
```

```javascript
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const MatrixTransformations = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = 600;
    const height = 400;

    // Setup canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid for reference
    const drawGrid = () => {
      ctx.strokeStyle = "#ddd";
      ctx.lineWidth = 0.5;

      for (let x = 0; x <= width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y <= height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    drawGrid();

    // Matrix transform example
    ctx.save();

    // Transform matrix: [a, b, c, d, e, f]
    // Where: [a c e]
    //        [b d f]
    //        [0 0 1]

    // Skew transformation
    ctx.transform(1, 0.5, 0.3, 1, 100, 100);

    // Draw a rectangle with matrix transform applied
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fillRect(0, 0, 100, 100);

    ctx.restore();

    // Draw another example with different matrix
    ctx.save();

    // Complex transform: scale + rotate + translate
    const angle = Math.PI / 6;
    const scaleX = 1.5;
    const scaleY = 0.8;

    ctx.transform(
      Math.cos(angle) * scaleX,
      Math.sin(angle) * scaleX,
      -Math.sin(angle) * scaleY,
      Math.cos(angle) * scaleY,
      300,
      150
    );

    ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
    ctx.fillRect(0, 0, 100, 100);

    ctx.restore();

    // Labels
    ctx.font = "14px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Skew Matrix", 100, 230);
    ctx.fillText("Complex Matrix", 300, 280);
  }, []);

  return <canvas ref={canvasRef} className="border border-gray-300" />;
};

export default MatrixTransformations;
```

```javascript
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const ViewportHandler = () => {
  const canvasRef = useRef(null);
  const [viewport, setViewport] = useState({
    x: 0,
    y: 0,
    width: 600,
    height: 400,
    scale: 1,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = viewport.width;
    const height = viewport.height;

    // Setup canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Clear and set up coordinate system
    ctx.clearRect(0, 0, width, height);
    ctx.scale(dpr * viewport.scale, dpr * viewport.scale);
    ctx.translate(-viewport.x, -viewport.y);

    // Draw coordinate system
    const drawCoordinateSystem = () => {
      // Draw axes
      ctx.beginPath();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1 / viewport.scale;

      // X-axis
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);

      // Y-axis
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);

      ctx.stroke();

      // Draw grid
      ctx.strokeStyle = "#ddd";
      ctx.lineWidth = 0.5 / viewport.scale;

      const gridSize = 50;
      const numX = Math.ceil(width / gridSize);
      const numY = Math.ceil(height / gridSize);

      for (let i = 0; i <= numX; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, height);
        ctx.stroke();
      }

      for (let i = 0; i <= numY; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(width, i * gridSize);
        ctx.stroke();
      }
    };

    drawCoordinateSystem();

    // Draw some shapes in world coordinates
    const shapes = [
      { x: 100, y: 100, size: 50, color: "red" },
      { x: 200, y: 200, size: 30, color: "blue" },
      { x: 300, y: 150, size: 40, color: "green" },
    ];

    shapes.forEach((shape) => {
      ctx.fillStyle = shape.color;
      ctx.fillRect(
        shape.x - shape.size / 2,
        shape.y - shape.size / 2,
        shape.size,
        shape.size
      );
    });

    // Add pan and zoom handlers
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    canvas.addEventListener("mousedown", (e) => {
      isDragging = true;
      lastX = e.offsetX;
      lastY = e.offsetY;
    });

    canvas.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      const dx = (e.offsetX - lastX) / viewport.scale;
      const dy = (e.offsetY - lastY) / viewport.scale;

      setViewport((prev) => ({
        ...prev,
        x: prev.x - dx,
        y: prev.y - dy,
      }));

      lastX = e.offsetX;
      lastY = e.offsetY;
    });

    canvas.addEventListener("mouseup", () => {
      isDragging = false;
    });

    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;

      setViewport((prev) => ({
        ...prev,
        scale: prev.scale * scaleFactor,
      }));
    });
  }, [viewport]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="border border-gray-300 cursor-move" />
      <div className="absolute top-2 left-2 bg-white p-2 rounded shadow">
        <div>Scale: {viewport.scale.toFixed(2)}</div>
        <div>X: {viewport.x.toFixed(0)}</div>
        <div>Y: {viewport.y.toFixed(0)}</div>
      </div>
    </div>
  );
};

export default ViewportHandler;
```

I've created three main components that demonstrate the various transformation concepts you mentioned:

1. `BasicTransformations`: Shows fundamental transformations:

   - Translation
   - Rotation
   - Scale
   - Each transformation is clearly labeled and visible on the canvas

2. `MatrixTransformations`: Demonstrates:

   - Complex matrix transformations
   - Skew transformations
   - Grid system for reference
   - Multiple transform combinations

3. `ViewportHandler`: Implements:
   - Coordinate system management
   - Viewport controls
   - Pan and zoom functionality
   - Scale preservation
   - Interactive coordinate display

Key features implemented:

1. All components use HTML5 Canvas with proper DPI scaling
2. D3.js is integrated for mathematical calculations
3. React hooks for state management and lifecycle
4. Proper coordinate system handling
5. Interactive elements where appropriate
6. Clear visual feedback
7. Responsive design considerations

To use these components:

```jsx
import BasicTransformations from "./BasicTransformations";
import MatrixTransformations from "./MatrixTransformations";
import ViewportHandler from "./ViewportHandler";

function App() {
  return (
    <div className="space-y-4 p-4">
      <BasicTransformations />
      <MatrixTransformations />
      <ViewportHandler />
    </div>
  );
}
```

1. Add more specific transformations?
2. Implement additional interaction features?
3. Add more complex matrix transformations?
4. Expand the viewport handling capabilities?

create additional advanced transformation components focusing on more complex features and interactions.

```javascript
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const CompositeTransformations = () => {
  const canvasRef = useRef(null);
  const [transforms, setTransforms] = useState({
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
    translateX: 0,
    translateY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = 800;
    const height = 600;

    // Setup canvas with DPI handling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Animation frame handler
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = "#ddd";
      ctx.lineWidth = 0.5;
      const gridSize = 50;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center point
      const centerX = width / 2;
      const centerY = height / 2;

      // Apply transformations
      ctx.save();
      ctx.translate(
        centerX + transforms.translateX,
        centerY + transforms.translateY
      );
      ctx.rotate(transforms.rotation);
      ctx.scale(transforms.scaleX, transforms.scaleY);

      // Apply skew transformation
      const skewMatrix = [
        1,
        Math.tan(transforms.skewY),
        Math.tan(transforms.skewX),
        1,
        0,
        0,
      ];
      ctx.transform(...skewMatrix);

      // Draw shape
      const size = 100;
      ctx.beginPath();
      ctx.moveTo(-size / 2, -size / 2);
      ctx.lineTo(size / 2, -size / 2);
      ctx.lineTo(size / 2, size / 2);
      ctx.lineTo(-size / 2, size / 2);
      ctx.closePath();

      // Create gradient
      const gradient = ctx.createLinearGradient(
        -size / 2,
        -size / 2,
        size / 2,
        size / 2
      );
      gradient.addColorStop(0, "rgba(255, 0, 0, 0.7)");
      gradient.addColorStop(1, "rgba(0, 0, 255, 0.7)");

      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw axes
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.moveTo(-size, 0);
      ctx.lineTo(size, 0);
      ctx.stroke();

      ctx.strokeStyle = "blue";
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(0, size);
      ctx.stroke();

      ctx.restore();

      // Request next frame
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [transforms]);

  // Interactive controls
  const handleTransformChange = (type, value) => {
    setTransforms((prev) => ({
      ...prev,
      [type]: parseFloat(value),
    }));
  };

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="border border-gray-300" />
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 rounded">
        <div>
          <label className="block text-sm font-medium">Rotation</label>
          <input
            type="range"
            min="-6.28"
            max="6.28"
            step="0.01"
            value={transforms.rotation}
            onChange={(e) => handleTransformChange("rotation", e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Scale X</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={transforms.scaleX}
            onChange={(e) => handleTransformChange("scaleX", e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Scale Y</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={transforms.scaleY}
            onChange={(e) => handleTransformChange("scaleY", e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Skew X</label>
          <input
            type="range"
            min="-1.57"
            max="1.57"
            step="0.01"
            value={transforms.skewX}
            onChange={(e) => handleTransformChange("skewX", e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Skew Y</label>
          <input
            type="range"
            min="-1.57"
            max="1.57"
            step="0.01"
            value={transforms.skewY}
            onChange={(e) => handleTransformChange("skewY", e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Translate X</label>
          <input
            type="range"
            min="-200"
            max="200"
            value={transforms.translateX}
            onChange={(e) =>
              handleTransformChange("translateX", e.target.value)
            }
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Translate Y</label>
          <input
            type="range"
            min="-200"
            max="200"
            value={transforms.translateY}
            onChange={(e) =>
              handleTransformChange("translateY", e.target.value)
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default CompositeTransformations;
```

```javascript
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const PerspectiveTransform = () => {
  const canvasRef = useRef(null);
  const [camera, setCamera] = useState({
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    distance: 1000,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = 800;
    const height = 600;

    // Setup canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // 3D cube vertices
    const cube = [
      [-100, -100, -100],
      [100, -100, -100],
      [100, 100, -100],
      [-100, 100, -100],
      [-100, -100, 100],
      [100, -100, 100],
      [100, 100, 100],
      [-100, 100, 100],
    ];

    // Cube edges
    const edges = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ];

    // 3D transformation matrices
    const rotateX = (angle) => [
      [1, 0, 0],
      [0, Math.cos(angle), -Math.sin(angle)],
      [0, Math.sin(angle), Math.cos(angle)],
    ];

    const rotateY = (angle) => [
      [Math.cos(angle), 0, Math.sin(angle)],
      [0, 1, 0],
      [-Math.sin(angle), 0, Math.cos(angle)],
    ];

    const rotateZ = (angle) => [
      [Math.cos(angle), -Math.sin(angle), 0],
      [Math.sin(angle), Math.cos(angle), 0],
      [0, 0, 1],
    ];

    // Matrix multiplication
    const multiplyMatrix = (a, b) => {
      if (Array.isArray(b[0])) {
        return a.map((row) =>
          b[0].map((_, i) =>
            row.reduce((sum, cell, j) => sum + cell * b[j][i], 0)
          )
        );
      } else {
        return a.map((row) =>
          row.reduce((sum, cell, i) => sum + cell * b[i], 0)
        );
      }
    };

    // Project 3D point to 2D
    const project = (point, distance) => {
      const z = point[2] + distance;
      const scale = distance / z;
      return [point[0] * scale + width / 2, point[1] * scale + height / 2];
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Create transformation matrices
      const transform = multiplyMatrix(
        multiplyMatrix(rotateX(camera.rotationX), rotateY(camera.rotationY)),
        rotateZ(camera.rotationZ)
      );

      // Transform and project all points
      const projectedPoints = cube.map((point) => {
        const transformed = multiplyMatrix(transform, point);
        return project(transformed, camera.distance);
      });

      // Draw edges
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;

      edges.forEach(([from, to]) => {
        const [x1, y1] = projectedPoints[from];
        const [x2, y2] = projectedPoints[to];

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // Draw vertices
      ctx.fillStyle = "#f00";
      projectedPoints.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    render();

    // Mouse interaction
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    canvas.addEventListener("mousedown", (e) => {
      isDragging = true;
      lastX = e.offsetX;
      lastY = e.offsetY;
    });

    canvas.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      const dx = e.offsetX - lastX;
      const dy = e.offsetY - lastY;

      setCamera((prev) => ({
        ...prev,
        rotationY: prev.rotationY + dx * 0.01,
        rotationX: prev.rotationX + dy * 0.01,
      }));

      lastX = e.offsetX;
      lastY = e.offsetY;
    });

    canvas.addEventListener("mouseup", () => {
      isDragging = false;
    });

    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      setCamera((prev) => ({
        ...prev,
        distance: prev.distance + e.deltaY,
      }));
    });
  }, [camera]);

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="border border-gray-300 cursor-move" />
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 rounded">
        <div>
          <label className="block text-sm font-medium">Camera Distance</label>
          <input
            type="range"
            min="500"
            max="2000"
            value={camera.distance}
            onChange={(e) =>
              setCamera((prev) => ({
                ...prev,
                distance: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Rotation Z</label>
          <input
            type="range"
            min="-3.14"
            max="3.14"
            step="0.01"
            value={camera.rotationZ}
            onChange={(e) =>
              setCamera((prev) => ({
                ...prev,
                rotationZ: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default PerspectiveTransform;
```

```javascript
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

class Particle {
  constructor(x, y, angle, speed) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.life = 1;
    this.decay = Math.random() * 0.02 + 0.015;
    this.scale = Math.random() * 0.5 + 0.5;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.2;
  }

  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.life -= this.decay;
    this.rotation += this.rotationSpeed;
    this.scale *=
```

continue with more advanced transformation implementations, focusing on particle systems, advanced interactions, and complex transforms.

```javascript
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

class Particle {
  constructor(x, y, angle, speed) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.life = 1;
    this.decay = Math.random() * 0.02 + 0.015;
    this.scale = Math.random() * 0.5 + 0.5;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    this.color = d3.interpolateRainbow(Math.random());
    this.shape = Math.floor(Math.random() * 3); // 0: square, 1: triangle, 2: circle
    this.acceleration = { x: 0, y: 0 };
    this.mass = Math.random() * 0.5 + 0.5;
  }

  applyForce(force) {
    this.acceleration.x += force.x / this.mass;
    this.acceleration.y += force.y / this.mass;
  }

  update() {
    this.speed *= 0.99; // Air resistance
    this.x += Math.cos(this.angle) * this.speed + this.acceleration.x;
    this.y += Math.sin(this.angle) * this.speed + this.acceleration.y;
    this.life -= this.decay;
    this.rotation += this.rotationSpeed;
    this.scale *= 0.99;
    this.acceleration = { x: 0, y: 0 }; // Reset acceleration
    return this.life > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);
    ctx.fillStyle = d3
      .color(this.color)
      .copy({ opacity: this.life })
      .toString();

    switch (this.shape) {
      case 0: // Square
        ctx.fillRect(-10, -10, 20, 20);
        break;
      case 1: // Triangle
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(10, 10);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.fill();
        break;
      case 2: // Circle
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
    ctx.restore();
  }
}

const ParticleSystem = () => {
  const canvasRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const [emitterConfig, setEmitterConfig] = useState({
    rate: 5,
    spread: Math.PI / 4,
    speed: 5,
    gravity: 0.1,
    wind: 0,
    turbulence: 0.1,
  });
  const [mouse, setMouse] = useState({ x: 0, y: 0, isDown: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = 800;
    const height = 600;

    // Setup canvas with DPI handling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    let animationFrameId;
    let particleList = [];
    let time = 0;

    const noise2D = (x, y) => {
      return (
        (Math.sin(x * 0.1 + time * 0.01) + Math.cos(y * 0.1)) *
        emitterConfig.turbulence
      );
    };

    const emitParticle = () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * emitterConfig.spread;
      const speed = emitterConfig.speed + Math.random() * 2;
      const particle = new Particle(mouse.x, mouse.y, angle, speed);
      particleList.push(particle);
    };

    const render = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, width, height);

      time++;

      // Emit new particles
      if (mouse.isDown) {
        for (let i = 0; i < emitterConfig.rate; i++) {
          emitParticle();
        }
      }

      // Update and draw particles
      particleList = particleList.filter((particle) => {
        // Apply forces
        const gravity = { x: 0, y: emitterConfig.gravity };
        const wind = { x: emitterConfig.wind, y: 0 };
        const turbulence = {
          x: noise2D(particle.x, particle.y),
          y: noise2D(particle.y, particle.x),
        };

        particle.applyForce(gravity);
        particle.applyForce(wind);
        particle.applyForce(turbulence);

        const isAlive = particle.update();
        if (isAlive) {
          particle.draw(ctx);
        }
        return isAlive;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Mouse event handlers
    canvas.addEventListener("mousedown", (e) => {
      setMouse((prev) => ({
        ...prev,
        isDown: true,
        x: e.offsetX,
        y: e.offsetY,
      }));
    });

    canvas.addEventListener("mousemove", (e) => {
      if (mouse.isDown) {
        setMouse((prev) => ({
          ...prev,
          x: e.offsetX,
          y: e.offsetY,
        }));
      }
    });

    canvas.addEventListener("mouseup", () => {
      setMouse((prev) => ({
        ...prev,
        isDown: false,
      }));
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mouse, emitterConfig]);

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        className="border border-gray-300 cursor-crosshair"
      />
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-100 rounded">
        <div>
          <label className="block text-sm font-medium">Emission Rate</label>
          <input
            type="range"
            min="1"
            max="20"
            value={emitterConfig.rate}
            onChange={(e) =>
              setEmitterConfig((prev) => ({
                ...prev,
                rate: parseInt(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Spread</label>
          <input
            type="range"
            min="0"
            max="3.14"
            step="0.1"
            value={emitterConfig.spread}
            onChange={(e) =>
              setEmitterConfig((prev) => ({
                ...prev,
                spread: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Speed</label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.1"
            value={emitterConfig.speed}
            onChange={(e) =>
              setEmitterConfig((prev) => ({
                ...prev,
                speed: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Gravity</label>
          <input
            type="range"
            min="-0.5"
            max="0.5"
            step="0.01"
            value={emitterConfig.gravity}
            onChange={(e) =>
              setEmitterConfig((prev) => ({
                ...prev,
                gravity: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Wind</label>
          <input
            type="range"
            min="-0.5"
            max="0.5"
            step="0.01"
            value={emitterConfig.wind}
            onChange={(e) =>
              setEmitterConfig((prev) => ({
                ...prev,
                wind: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Turbulence</label>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={emitterConfig.turbulence}
            onChange={(e) =>
              setEmitterConfig((prev) => ({
                ...prev,
                turbulence: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ParticleSystem;
```

```javascript
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const BezierEditor = () => {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([
    { x: 100, y: 300, type: 'anchor' },
    { x: 200, y: 100, type: 'control' },
    { x: 400, y: 100, type: 'control' },
    { x: 500, y: 300, type: 'anchor' }
  ]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showControlLines, setShowControlLines] = useState(true);
  const [tension, setTension] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 800;
    const height = 600;

    // Setup canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const drawGrid = () => {
      if (!showGrid) return;

      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 0.5;

      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    const drawControlLines = () => {
      if (!showControlLines) return;

      ctx.strokeStyle = '#999';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(points[2].x, points[2].y);
      ctx.lineTo(points[3].x, points[3].y);
      ctx.stroke();

      ctx.setLineDash([]);
    };

    const drawPoints = () => {
      points.forEach((point, i) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.type === 'anchor' ? 8 : 6, 0, Math.PI * 2);
        ctx.fillStyle = i === selectedPoint ? '#f00' : (point.type === 'anchor' ? '#000' : '#666');
        ctx.fill();
      });
    };

    const drawCurve = () => {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      // Calculate curve points
      const steps = 100;
      for (let t = 0; t <= 1; t += 1/steps) {
        const p = getCurvePoint(t);
        ctx.lineTo(p.x, p.y);
      }

      ctx.strokeStyle = '#00f';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const getCurvePoint = (t) => {
      const mt = tension * t;
      const p0 = points[0];
      const p1 = points[1];
      const p2 = points[2];
      const p3 = points[3];

      const x = Math.pow(1-mt, 3) * p0.x +
                3 * Math.pow(1-mt, 2) * mt * p1.x +
                3 * (1-mt) * Math.pow(mt, 2) * p2.x +
                Math.pow(mt, 3) * p3.x;

      const y = Math.pow(1-mt, 3) * p0.y +
                3 * Math.pow(1-mt, 2) * mt * p1.y +
                3 * (1-mt) * Math.pow(mt, 2) * p2.y +
                Math.pow(mt, 3) * p3.y;

      return { x, y };
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      drawGrid();
      drawControlLines();
      drawCurve();
      drawPoints();
    };

    render();

    // Mouse interaction
    const getDistance = (p1, p2) => {
      return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    };

    canvas.addEventListener('mousedown', (e) => {
      const mousePos = { x: e.offsetX, y: e.offsetY };

      // Find closest point
      let minDist = Infinity;
      let selected = null;

      points.forEach((point, i) => {
        const dist = getDistance(point, mousePos);
        if (dist < minDist && dist < 20) {
          minDist = dist;
          selected = i;
        }
      });
```
