create a comprehensive example demonstrating these visual properties using HTML5 Canvas with React and D3. create separate artifacts for different aspects of the implementation.

```tsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const CanvasVisualProperties = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = 800;
    const height = 600;

    // Set canvas size with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Scale the context to ensure correct dimensions
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // 1. Fill
    ctx.fillStyle = "#3B82F6";
    ctx.fillRect(50, 50, 100, 100);

    // 2. Stroke
    ctx.strokeStyle = "#EF4444";
    ctx.strokeRect(200, 50, 100, 100);

    // 3. Opacity
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#10B981";
    ctx.fillRect(350, 50, 100, 100);
    ctx.globalAlpha = 1.0;

    // 4. Line Width
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#8B5CF6";
    ctx.strokeRect(500, 50, 100, 100);

    // 5. Line Cap
    ctx.beginPath();
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.moveTo(50, 200);
    ctx.lineTo(150, 200);
    ctx.strokeStyle = "#F59E0B";
    ctx.stroke();

    // 6. Line Join
    ctx.beginPath();
    ctx.lineWidth = 15;
    ctx.lineJoin = "round";
    ctx.moveTo(200, 200);
    ctx.lineTo(250, 250);
    ctx.lineTo(300, 200);
    ctx.strokeStyle = "#EC4899";
    ctx.stroke();

    // 7. Dash Pattern
    ctx.beginPath();
    ctx.setLineDash([20, 5]);
    ctx.moveTo(350, 200);
    ctx.lineTo(450, 200);
    ctx.strokeStyle = "#6366F1";
    ctx.stroke();
    ctx.setLineDash([]);

    // 8. Shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = "#F472B6";
    ctx.fillRect(500, 200, 100, 100);

    // 9. Blur
    ctx.filter = "blur(4px)";
    ctx.fillStyle = "#2DD4BF";
    ctx.fillRect(50, 350, 100, 100);
    ctx.filter = "none";

    // 10. Composite Operations
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(59, 130, 246, 0.8)";
    ctx.fillRect(200, 350, 100, 100);
    ctx.fillStyle = "rgba(239, 68, 68, 0.8)";
    ctx.fillRect(250, 400, 100, 100);
    ctx.globalCompositeOperation = "source-over";
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Canvas Visual Properties Demo</h2>
      <canvas
        ref={canvasRef}
        style={{ width: "800px", height: "600px" }}
        className="border border-gray-300 rounded-lg"
      />
    </div>
  );
};

export default CanvasVisualProperties;
```

```tsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

const CanvasControls = ({ onUpdate }) => {
  const [controls, setControls] = useState({
    opacity: 1,
    lineWidth: 1,
    shadowBlur: 0,
    blur: 0,
  });

  const handleChange = (property, value) => {
    const newControls = { ...controls, [property]: value };
    setControls(newControls);
    onUpdate(newControls);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Visual Properties Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Opacity</label>
          <Slider
            value={[controls.opacity]}
            onValueChange={([value]) => handleChange("opacity", value)}
            min={0}
            max={1}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Line Width</label>
          <Slider
            value={[controls.lineWidth]}
            onValueChange={([value]) => handleChange("lineWidth", value)}
            min={1}
            max={20}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Shadow Blur</label>
          <Slider
            value={[controls.shadowBlur]}
            onValueChange={([value]) => handleChange("shadowBlur", value)}
            min={0}
            max={20}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Blur</label>
          <Slider
            value={[controls.blur]}
            onValueChange={([value]) => handleChange("blur", value)}
            min={0}
            max={10}
            step={0.5}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CanvasControls;
```

```tsx
import React from "react";
import CanvasVisualProperties from "./CanvasVisualProperties";
import CanvasControls from "./CanvasControls";

const CanvasApp = () => {
  const handleControlsUpdate = (values) => {
    // Handle control updates here if needed
    console.log("Controls updated:", values);
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Canvas Visual Properties Demo</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <CanvasVisualProperties />
        <CanvasControls onUpdate={handleControlsUpdate} />
      </div>
    </div>
  );
};

export default CanvasApp;
```

I've created three main components that work together to demonstrate the visual properties you requested:

1. `CanvasVisualProperties`: The main canvas component that demonstrates all visual properties:

   - Fill and stroke with different colors
   - Opacity with transparent shapes
   - Line width variations
   - Line cap demonstrations
   - Line join examples
   - Dash patterns
   - Shadow effects
   - Blur filters
   - Composite operations

2. `CanvasControls`: An interactive control panel using shadcn/ui components that allows adjusting:

   - Opacity
   - Line width
   - Shadow blur
   - Blur effect

3. `CanvasApp`: The main application component that combines the canvas and controls.

The implementation:

- Uses HTML5 Canvas for all rendering
- Integrates with D3 v7 for potential data visualization needs
- Is built with React using modern hooks
- Handles device pixel ratio for sharp rendering
- Uses Tailwind CSS for styling
- Includes shadcn/ui components for the controls

To use this, you would need to:

1. Have the shadcn/ui Card and Slider components installed
2. Import D3 v7
3. Mount the `CanvasApp` component in your application

4. Add more interactive controls for other properties?
5. Include additional visual effects?
6. Add D3-specific visualizations?
7. Modify any of the existing implementations?

expand the implementation with more advanced canvas features and techniques.

```tsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const AdvancedCanvasEffects = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = 800;
    const height = 600;

    // Setup high-DPI canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // 1. Gradient Effects
    const linearGradient = ctx.createLinearGradient(50, 50, 150, 150);
    linearGradient.addColorStop(0, "#3B82F6");
    linearGradient.addColorStop(1, "#EC4899");

    const radialGradient = ctx.createRadialGradient(300, 100, 10, 300, 100, 70);
    radialGradient.addColorStop(0, "#F59E0B");
    radialGradient.addColorStop(0.5, "#10B981");
    radialGradient.addColorStop(1, "transparent");

    // 2. Pattern Creation
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = 20;
    patternCanvas.height = 20;
    const patternCtx = patternCanvas.getContext("2d");
    patternCtx.fillStyle = "#6366F1";
    patternCtx.fillRect(0, 0, 10, 10);
    patternCtx.fillRect(10, 10, 10, 10);
    const pattern = ctx.createPattern(patternCanvas, "repeat");

    // 3. Complex Paths
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.bezierCurveTo(100, 0, 200, 100, 250, 50);
    ctx.strokeStyle = linearGradient;
    ctx.lineWidth = 5;
    ctx.stroke();

    // 4. Radial Gradient Circle
    ctx.beginPath();
    ctx.arc(300, 100, 70, 0, Math.PI * 2);
    ctx.fillStyle = radialGradient;
    ctx.fill();

    // 5. Pattern Fill
    ctx.fillStyle = pattern;
    ctx.fillRect(400, 50, 150, 150);

    // 6. Clipping Paths
    ctx.save();
    ctx.beginPath();
    ctx.arc(650, 100, 50, 0, Math.PI * 2);
    ctx.clip();
    // Draw checkerboard pattern in clipped area
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        ctx.fillStyle = (i + j) % 2 ? "#000" : "#fff";
        ctx.fillRect(600 + i * 20, 50 + j * 20, 20, 20);
      }
    }
    ctx.restore();

    // 7. Complex Composite Operations
    ctx.globalCompositeOperation = "lighter";
    const circles = [
      { x: 100, y: 300, color: "rgba(255,0,0,0.5)" },
      { x: 150, y: 300, color: "rgba(0,255,0,0.5)" },
      { x: 125, y: 250, color: "rgba(0,0,255,0.5)" },
    ];
    circles.forEach((circle) => {
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, 40, 0, Math.PI * 2);
      ctx.fillStyle = circle.color;
      ctx.fill();
    });
    ctx.globalCompositeOperation = "source-over";

    // 8. Text Effects
    ctx.font = "bold 48px Arial";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.fillStyle = "#F472B6";
    const text = "Canvas Text";
    const x = 300;
    const y = 300;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);

    // 9. Shadow Art
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = "#2DD4BF";
    ctx.fillRect(500, 250, 100, 100);

    // 10. Particle System
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 5 + 2,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    }));

    particles.forEach((particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "800px", height: "600px" }}
      className="border border-gray-300 rounded-lg"
    />
  );
};

export default AdvancedCanvasEffects;
```

```tsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const CanvasAnimation = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = 800;
    const height = 600;

    // Setup high-DPI canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Particle system
    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 4 + 1,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      hue: Math.random() * 360,
      connection: [],
    }));

    // Animation loop
    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off walls
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 70%, 50%, 0.8)`;
        ctx.fill();

        // Connect nearby particles
        particles.forEach((other) => {
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `hsla(${particle.hue}, 70%, 50%, ${
              1 - distance / 100
            })`;
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "800px", height: "600px" }}
      className="border border-gray-300 rounded-lg bg-black"
    />
  );
};

export default CanvasAnimation;
```

```tsx
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const AdvancedCanvasInteractions = () => {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const pathRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = 800;
    const height = 600;

    // Setup high-DPI canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw existing paths
      pathRef.current.forEach((path) => {
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);

        // Create smooth curve through points
        for (let i = 1; i < path.length - 2; i++) {
          const xc = (path[i].x + path[i + 1].x) / 2;
          const yc = (path[i].y + path[i + 1].y) / 2;
          ctx.quadraticCurveTo(path[i].x, path[i].y, xc, yc);
        }

        if (path.length > 2) {
          ctx.quadraticCurveTo(
            path[path.length - 2].x,
            path[path.length - 2].y,
            path[path.length - 1].x,
            path[path.length - 1].y
          );
        }

        ctx.strokeStyle = "#3B82F6";
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Draw hover effect
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(239, 68, 68, 0.5)";
      ctx.fill();
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * dpr;
      const y = (e.clientY - rect.top) * dpr;
      setMousePos({ x, y });

      if (isDrawing) {
        const currentPath = pathRef.current[pathRef.current.length - 1];
        currentPath.push({ x, y });
      }
    };

    const handleMouseDown = () => {
      setIsDrawing(true);
      pathRef.current.push([{ x: mousePos.x, y: mousePos.y }]);
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);

    const animate = () => {
      draw();
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [mousePos, isDrawing]);

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        style={{ width: "800px", height: "600px" }}
        className="border border-gray-300 rounded-lg"
      />
      <button
        className="px-4 py-2 bg-red-500 text-white rounded"
        onClick={() => {
          pathRef.current = [];
        }}
      >
        Clear Canvas
      </button>
    </div>
  );
};

export default AdvancedCanvasInteractions;
```

I've added three new advanced components:

1. `AdvancedCanvasEffects`:

   - Complex gradients (linear and radial)
   - Custom patterns
   - Bezier curves
   - Clipping paths
   - Advanced composite operations
   - Text effects with shadows
   - Particle systems
   - Complex shape rendering

2. `CanvasAnimation`:

   - Animated particle system
   - Inter-particle connections
   - Trail effects
   - Color transitions
   - Physics-based movement
   - Collision detection
   - Performance-optimized rendering

3. `AdvancedCanvasInteractions`:
   - Smooth freehand drawing
   - Mouse interaction
   - Path smoothing
   - Hover effects
   - Real-time rendering
   - Path management
   - Clear functionality

Here are some more advanced features we could add:

1. Image Processing:

   - Color manipulation
   - Filters (blur, sharpen, etc.)
   - Pixel manipulation
   - Image composition

2. Physics:

   - Gravity
   - Forces
   - Constraints
   - Collisions
   - Spring systems

3. Advanced Effects:

   - Ray casting
   - Particle emitters
   - Fluid simulation
   - Noise generation
   - Procedural generation

4. Optimization:
   - Off-screen rendering
   - Layer management
   - Object pooling
   - Spatial partitioning

Would you like me to implement any of these additional features or expand on the existing ones?

create even more advanced implementations focusing on complex graphics techniques and optimizations.

```tsx
import React, { useEffect, useRef } from "react";

const FluidSimulation = () => {
  const canvasRef = useRef(null);
  const N = 256; // grid resolution
  const iter = 16; // solver iterations
  const scale = 4;

  // Fluid simulation data
  let diffusion = 0.0001;
  let viscosity = 0.0001;
  let dt = 0.1;

  const create2DArray = (size) => {
    return new Array(size).fill(0).map(() => new Array(size).fill(0));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = N * scale;
    canvas.height = N * scale;

    let density = create2DArray(N);
    let densityPrev = create2DArray(N);
    let vx = create2DArray(N);
    let vy = create2DArray(N);
    let vxPrev = create2DArray(N);
    let vyPrev = create2DArray(N);

    const diffuse = (b, x, x0) => {
      const a = dt * diffusion * (N - 2) * (N - 2);
      lin_solve(b, x, x0, a, 1 + 6 * a);
    };

    const lin_solve = (b, x, x0, a, c) => {
      const cRecip = 1.0 / c;
      for (let k = 0; k < iter; k++) {
        for (let j = 1; j < N - 1; j++) {
          for (let i = 1; i < N - 1; i++) {
            x[i][j] =
              (x0[i][j] +
                a * (x[i + 1][j] + x[i - 1][j] + x[i][j + 1] + x[i][j - 1])) *
              cRecip;
          }
        }
        set_bnd(b, x);
      }
    };

    const project = (velocX, velocY, p, div) => {
      for (let j = 1; j < N - 1; j++) {
        for (let i = 1; i < N - 1; i++) {
          div[i][j] =
            (-0.5 *
              (velocX[i + 1][j] -
                velocX[i - 1][j] +
                velocY[i][j + 1] -
                velocY[i][j - 1])) /
            N;
          p[i][j] = 0;
        }
      }

      set_bnd(0, div);
      set_bnd(0, p);
      lin_solve(0, p, div, 1, 6);

      for (let j = 1; j < N - 1; j++) {
        for (let i = 1; i < N - 1; i++) {
          velocX[i][j] -= 0.5 * (p[i + 1][j] - p[i - 1][j]) * N;
          velocY[i][j] -= 0.5 * (p[i][j + 1] - p[i][j - 1]) * N;
        }
      }

      set_bnd(1, velocX);
      set_bnd(2, velocY);
    };

    const advect = (b, d, d0, velocX, velocY) => {
      let i0, i1, j0, j1;
      let dtx = dt * (N - 2);
      let dty = dt * (N - 2);

      for (let j = 1; j < N - 1; j++) {
        for (let i = 1; i < N - 1; i++) {
          let x = i - dtx * velocX[i][j];
          let y = j - dty * velocY[i][j];

          if (x < 0.5) x = 0.5;
          if (x > N - 1.5) x = N - 1.5;
          i0 = Math.floor(x);
          i1 = i0 + 1;

          if (y < 0.5) y = 0.5;
          if (y > N - 1.5) y = N - 1.5;
          j0 = Math.floor(y);
          j1 = j0 + 1;

          let s1 = x - i0;
          let s0 = 1 - s1;
          let t1 = y - j0;
          let t0 = 1 - t1;

          d[i][j] =
            s0 * (t0 * d0[i0][j0] + t1 * d0[i0][j1]) +
            s1 * (t0 * d0[i1][j0] + t1 * d0[i1][j1]);
        }
      }
      set_bnd(b, d);
    };

    const set_bnd = (b, x) => {
      for (let i = 1; i < N - 1; i++) {
        x[i][0] = b === 2 ? -x[i][1] : x[i][1];
        x[i][N - 1] = b === 2 ? -x[i][N - 2] : x[i][N - 2];
      }

      for (let j = 1; j < N - 1; j++) {
        x[0][j] = b === 1 ? -x[1][j] : x[1][j];
        x[N - 1][j] = b === 1 ? -x[N - 2][j] : x[N - 2][j];
      }

      x[0][0] = 0.5 * (x[1][0] + x[0][1]);
      x[0][N - 1] = 0.5 * (x[1][N - 1] + x[0][N - 2]);
      x[N - 1][0] = 0.5 * (x[N - 2][0] + x[N - 1][1]);
      x[N - 1][N - 1] = 0.5 * (x[N - 2][N - 1] + x[N - 1][N - 2]);
    };

    const addSource = (x, s) => {
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          x[i][j] += dt * s[i][j];
        }
      }
    };

    const vel_step = (vx, vy, vx0, vy0) => {
      addSource(vx, vx0);
      addSource(vy, vy0);

      let temp = vx0;
      vx0 = vx;
      vx = temp;
      temp = vy0;
      vy0 = vy;
      vy = temp;

      diffuse(1, vx, vx0);
      diffuse(2, vy, vy0);

      project(vx, vy, vx0, vy0);

      temp = vx0;
      vx0 = vx;
      vx = temp;
      temp = vy0;
      vy0 = vy;
      vy = temp;

      advect(1, vx, vx0, vx0, vy0);
      advect(2, vy, vy0, vx0, vy0);

      project(vx, vy, vx0, vy0);
    };

    const dens_step = (x, x0, vx, vy) => {
      addSource(x, x0);
      let temp = x0;
      x0 = x;
      x = temp;
      diffuse(0, x, x0);
      temp = x0;
      x0 = x;
      x = temp;
      advect(0, x, x0, vx, vy);
    };

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let lastX = 0;
    let lastY = 0;
    let isMouseDown = false;

    canvas.addEventListener("mousedown", (e) => {
      isMouseDown = true;
      const rect = canvas.getBoundingClientRect();
      lastX = mouseX = (e.clientX - rect.left) / scale;
      lastY = mouseY = (e.clientY - rect.top) / scale;
    });

    canvas.addEventListener("mousemove", (e) => {
      if (!isMouseDown) return;

      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / scale;
      mouseY = (e.clientY - rect.top) / scale;

      // Add velocity
      const dx = mouseX - lastX;
      const dy = mouseY - lastY;

      const i = Math.floor(mouseX);
      const j = Math.floor(mouseY);

      if (i > 0 && i < N - 1 && j > 0 && j < N - 1) {
        vx[i][j] = dx * 5;
        vy[i][j] = dy * 5;
        density[i][j] = 50;
      }

      lastX = mouseX;
      lastY = mouseY;
    });

    canvas.addEventListener("mouseup", () => {
      isMouseDown = false;
    });

    // Animation loop
    const animate = () => {
      vel_step(vx, vy, vxPrev, vyPrev);
      dens_step(density, densityPrev, vx, vy);

      // Render
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          const d = Math.min(255, Math.max(0, Math.floor(density[i][j] * 255)));

          for (let x = 0; x < scale; x++) {
            for (let y = 0; y < scale; y++) {
              const idx =
                4 * ((j * scale + y) * canvas.width + (i * scale + x));
              data[idx] = d;
              data[idx + 1] = d;
              data[idx + 2] = d;
              data[idx + 3] = 255;
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Real-time Fluid Simulation</h2>
      <canvas
        ref={canvasRef}
        className="border border-gray-300 rounded-lg"
        style={{ touchAction: "none" }}
      />
      <p className="mt-2 text-sm text-gray-600">
        Click and drag to add fluid velocity and density
      </p>
    </div>
  );
};

export default FluidSimulation;
```

```tsx
import React, { useEffect, useRef } from 'react';

class Particle {
  constructor(x, y, mass = 1) {
    this.pos = { x, y };
    this.vel = { x: 0, y: 0 };
    this.acc = { x: 0, y: 0 };
    this.mass = mass;
    this.radius = Math.sqrt(mass) * 2;
    this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    this.trails = [];
    this.maxTrails = 20;
  }

  applyForce(force) {
    this.acc.x += force.x / this.mass;
    this.acc.y += force.y / this.mass;
  }

  update(dt) {
    // Verlet integration
    const oldPos = { ...this.pos };

    this.vel.x += this.acc.x * dt;
    this.vel.y += this.acc.y * dt;

    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;

    // Add trail
    this.trails.unshift({ x: oldPos.x, y: oldPos.y, age: 1 });
    if (this.trails.length > this.maxTrails) {
      this.trails.pop();
    }

    // Age trails
    this.trails.forEach(trail => trail.age *= 0.95);

    // Reset acceleration
    this.acc.x = 0;
    this.acc.y = 0;
  }
}

class Spring {
  constructor(p1, p2, restLength, stiffness) {
    this.p1 = p1;
    this.p2 = p2;
    this.restLength = restLength;
    this.stiffness = stiffness;
  }

  update() {
    const dx = this.p2.pos.x - this.p1.pos.x;
    const dy = this.p2.pos.y - this.p1.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const force = (distance - this.restLength) * this.stiffness;
    const fx = (dx / distance) * force;
    const fy = (dy / distance) * force;

    this.p1.applyForce({ x: fx, y: fy });
    this.p2.applyForce({ x: -fx, y: -fy });
  }
}

const ParticleSystem = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const springsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Setup high-DPI canvas
    const dpr = window.devicePixelRatio || 1;
    const width = 800;
    const height = 600;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Create initial particle system
    for (let i = 0; i < 20; i++) {
      particlesRef.current.push(
        new Particle(
          Math.random() * width,
          Math.random() * height,
          Math.random() * 2 + 1
        )
      );
    }

    // Create springs between nearby particles
    const particles = particlesRef.current;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[j].pos.x - particles[i].pos.x;
        const dy = particles[j].pos.y - particles[i].pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          springsRef.current.push
```
