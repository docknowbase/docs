create isolated implementations of animation controls using HTML5 Canvas, D3.js v7, and React. break this down into manageable components.

```tsx
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const AnimationControls = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [duration, setDuration] = useState(2000);
  const [delay, setDelay] = useState(0);
  const [loop, setLoop] = useState(false);

  // Animation state
  const state = useRef({
    x: 50,
    y: 150,
    radius: 20,
    startTime: null,
    progress: 0,
  });

  // Setup canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set actual size in memory
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Initial circle
    drawCircle(ctx, state.current.x, state.current.y, state.current.radius);
  }, []);

  // Draw circle helper function
  const drawCircle = (ctx, x, y, radius) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#3498db";
    ctx.fill();
    ctx.closePath();
  };

  // Animation function
  const animate = (timestamp) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!state.current.startTime) {
      state.current.startTime = timestamp;
    }

    const elapsed = timestamp - state.current.startTime - delay;

    if (elapsed < 0) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    let progress = Math.min(elapsed / duration, 1);

    if (isReversed) {
      progress = 1 - progress;
    }

    // Use d3 easing function
    const easedProgress = d3.easeCubicInOut(progress);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate new position
    const newX = 50 + 400 * easedProgress;

    // Update state
    state.current = {
      ...state.current,
      x: newX,
      progress: progress,
    };

    // Draw circle at new position
    drawCircle(ctx, state.current.x, state.current.y, state.current.radius);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (loop) {
      state.current.startTime = null;
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  // Start animation
  const startAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    state.current.startTime = null;
    animationRef.current = requestAnimationFrame(animate);
    setIsPaused(false);
  };

  // Pause animation
  const pauseAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsPaused(true);
  };

  // Resume animation
  const resumeAnimation = () => {
    if (isPaused) {
      state.current.startTime = null;
      animationRef.current = requestAnimationFrame(animate);
      setIsPaused(false);
    }
  };

  // Cancel animation
  const cancelAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    state.current = {
      ...state.current,
      x: 50,
      startTime: null,
      progress: 0,
    };

    drawCircle(ctx, state.current.x, state.current.y, state.current.radius);
    setIsPaused(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl p-4 space-y-4">
      <canvas
        ref={canvasRef}
        className="w-full h-64 border border-gray-300 rounded"
      />

      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={startAnimation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Start
        </button>

        <button
          onClick={isPaused ? resumeAnimation : pauseAnimation}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {isPaused ? "Resume" : "Pause"}
        </button>

        <button
          onClick={cancelAnimation}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Cancel
        </button>

        <button
          onClick={() => setIsReversed(!isReversed)}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          {isReversed ? "Forward" : "Reverse"}
        </button>

        <button
          onClick={() => setLoop(!loop)}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Loop: {loop ? "On" : "Off"}
        </button>
      </div>

      <div className="flex flex-col w-full max-w-xs space-y-2">
        <label className="flex items-center justify-between">
          Delay (ms):
          <input
            type="number"
            value={delay}
            onChange={(e) =>
              setDelay(Math.max(0, parseInt(e.target.value) || 0))
            }
            className="w-24 px-2 py-1 border rounded"
          />
        </label>

        <label className="flex items-center justify-between">
          Duration (ms):
          <input
            type="number"
            value={duration}
            onChange={(e) =>
              setDuration(Math.max(100, parseInt(e.target.value) || 100))
            }
            className="w-24 px-2 py-1 border rounded"
          />
        </label>
      </div>
    </div>
  );
};

export default AnimationControls;
```

I've created a comprehensive React component that implements all the requested animation controls using HTML5 Canvas and D3.js v7. Here's what's included:

1. Animation Controls:

   - Delay: Configurable start delay in milliseconds
   - Duration: Adjustable animation duration
   - Timing function: Uses D3's easeCubicInOut for smooth animation
   - Sequencing: Proper animation frame sequencing
   - Loop: Toggle-able animation loop
   - Reverse: Direction control
   - Pause/Resume: Animation state control
   - Cancel: Reset to initial state

2. Features:

   - Canvas-based animation
   - D3.js easing function for smooth movement
   - Responsive canvas sizing
   - Clean, modular implementation
   - State management using React hooks
   - Proper cleanup and cancellation

3. Visual Elements:
   - Animated circle moving across the canvas
   - Control buttons with hover states
   - Input fields for delay and duration
   - Clear visual feedback

To use this component, you'll need to:

1. Have D3.js v7 installed in your project
2. Import and place the component in your React application
3. Style it using the provided Tailwind classes

4. Add more complex animation paths?
5. Implement additional easing functions?
6. Add more visual elements to animate?
7. Include performance optimizations?

extend the animation controls with more advanced features including complex paths, multiple objects, color transitions, and advanced timing controls.

```tsx
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Slider } from "@/components/ui/slider";
import { Select } from "@/components/ui/select";
import {
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Repeat,
  ChevronUp,
  Settings,
  Palette
} from 'lucide-react';

const EASING_FUNCTIONS = {
  'Linear': d3.easeLinear,
  'Quad In': d3.easeQuadIn,
  'Quad Out': d3.easeQuadOut,
  'Quad InOut': d3.easeQuadInOut,
  'Cubic In': d3.easeCubicIn,
  'Cubic Out': d3.easeCubicOut,
  'Cubic InOut': d3.easeCubicInOut,
  'Elastic In': d3.easeElasticIn,
  'Elastic Out': d3.easeElasticOut,
  'Bounce In': d3.easeBounceIn,
  'Bounce Out': d3.easeBounceOut,
};

const SHAPES = ['circle', 'square', 'triangle', 'star'];
const PATHS = ['linear', 'circular', 'zigzag', 'spiral', 'custom'];

const AdvancedAnimationControls = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [duration, setDuration] = useState(2000);
  const [delay, setDelay] = useState(0);
  const [loop, setLoop] = useState(false);
  const [selectedEasing, setSelectedEasing] = useState('Cubic InOut');
  const [selectedShape, setSelectedShape] = useState('circle');
  const [selectedPath, setSelectedPath] = useState('linear');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [colorTransition, setColorTransition] = useState(true);
  const [trailEffect, setTrailEffect] = useState(false);
  const [rotationEnabled, setRotationEnabled] = useState(false);
  const [scale, setScale] = useState(1);

  // Multiple object states
  const [objects, setObjects] = useState([
    { id: 1, color: '#3498db', offset: 0 },
    { id: 2, color: '#e74c3c', offset: 0.2 },
    { id: 3, color: '#2ecc71', offset: 0.4 },
  ]);

  // Animation state
  const state = useRef({
    startTime: null,
    progress: 0,
    trail: [],
    rotation: 0
  });

  // Path generators
  const pathGenerators = {
    linear: (progress, canvas) => ({
      x: 50 + (canvas.width - 100) * progress,
      y: canvas.height / 2
    }),

    circular: (progress, canvas) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) / 4;
      const angle = progress * Math.PI * 2;
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    },

    zigzag: (progress, canvas) => {
      const segments = 5;
      const segmentProgress = (progress * segments) % 1;
      const segmentIndex = Math.floor(progress * segments);
      const y = canvas.height / 2 + (segmentIndex % 2 ? -1 : 1) *
                Math.sin(segmentProgress * Math.PI) * (canvas.height / 4);
      return {
        x: 50 + (canvas.width - 100) * progress,
        y
      };
    },

    spiral: (progress, canvas) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.min(canvas.width, canvas.height) / 4;
      const angle = progress * Math.PI * 8;
      const radius = progress * maxRadius;
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    },

    custom: (progress, canvas) => {
      // Lemniscate curve (figure-eight)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const a = Math.min(canvas.width, canvas.height) / 4;
      const t = progress * Math.PI * 2;
      return {
        x: centerX + a * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t)),
        y: centerY + a * Math.sin(t) * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t))
      };
    }
  };

  // Draw shape helper functions
  const drawShape = (ctx, x, y, radius, shape, rotation = 0, color) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = color;

    switch (shape) {
      case 'square':
        ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -radius);
        ctx.lineTo(radius * Math.cos(Math.PI / 6), radius * Math.sin(Math.PI / 6));
        ctx.lineTo(-radius * Math.cos(Math.PI / 6), radius * Math.sin(Math.PI / 6));
        ctx.closePath();
        ctx.fill();
        break;

      case 'star':
        const spikes = 5;
        const outerRadius = radius;
        const innerRadius = radius * 0.4;

        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const r = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / spikes;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        break;

      default: // circle
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  };

  // Color transition helper
  const getTransitionColor = (progress, baseColor) => {
    if (!colorTransition) return baseColor;

    const startColor = d3.color(baseColor);
    const endColor = d3.color(baseColor).brighter(1);
    return d3.interpolateRgb(startColor, endColor)(progress);
  };

  // Animation function
  const animate = (timestamp) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!state.current.startTime) {
      state.current.startTime = timestamp;
    }

    const elapsed = timestamp - state.current.startTime - delay;

    if (elapsed < 0) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    let progress = Math.min(elapsed / duration, 1);
    if (isReversed) progress = 1 - progress;

    // Update rotation
    if (rotationEnabled) {
      state.current.rotation = progress * Math.PI * 2;
    }

    // Clear canvas with trail effect
    if (trailEffect) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Draw each object
    objects.forEach(obj => {
      const objProgress = (progress + obj.offset) % 1;
      const easedProgress = EASING_FUNCTIONS[selectedEasing](objProgress);
      const pos = pathGenerators[selectedPath](easedProgress, canvas);

      // Scale transform
      const currentScale = scale * (1 + Math.sin(objProgress * Math.PI) * 0.2);

      // Draw shape with current parameters
      drawShape(
        ctx,
        pos.x,
        pos.y,
        20 * currentScale,
        selectedShape,
        state.current.rotation,
        getTransitionColor(easedProgress, obj.color)
      );
    });

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (loop) {
      state.current.startTime = null;
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Initial render
    objects.forEach(obj => {
      const pos = pathGenerators[selectedPath](0, canvas);
      drawShape(ctx, pos.x, pos.y, 20, selectedShape, 0, obj.color);
    });
  }, [selectedShape, selectedPath]);

  // Animation control functions
  const startAnimation = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    state.current.startTime = null;
    animationRef.current = requestAnimationFrame(animate);
    setIsPaused(false);
  };

  const pauseAnimation = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsPaused(true);
  };

  const resumeAnimation = () => {
    if (isPaused) {
      state.current.startTime = null;
      animationRef.current = requestAnimationFrame(animate);
      setIsPaused(false);
    }
  };

  const resetAnimation = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    state.current = {
      startTime: null,
      progress: 0,
      trail: [],
      rotation: 0
    };

    objects.forEach(obj => {
      const pos = pathGenerators[selectedPath](0, canvas);
      drawShape(ctx, pos.x, pos.y, 20, selectedShape, 0, obj.color);
    });

    setIsPaused(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl p-4 space-y-4">
      <canvas
        ref={canvasRef}
        className="w-full h-96 border border-gray-300 rounded bg-white"
      />

      {/* Main Controls */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={isPaused ? resumeAnimation : pauseAnimation}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isPaused ? <PlayCircle className="w-5 h-5" /> : <PauseCircle className="w-5 h-5" />}
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        <button
          onClick={resetAnimation}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>

        <button
          onClick={() => setLoop(!loop)}
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            loop ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'
          } text-white`}
        >
          <Repeat className="w-5 h-5" />
          Loop
        </button>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          <Settings className="w-5 h-5" />
          {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
        </button>
      </div>

      {/* Advanced Controls */}
      {showAdvanced && (
        <div className="w-full space-y-4 p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Animation Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold">Animation Settings</h3>

              <div className="space-y-2">
                <label className="text-sm">Duration: {duration}ms</label>
                <Slider
                  value={[duration]}
                  onValueChange={([value]) => setDuration(value)}
                  min={100}
                  max={5000}
                  step={100}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm">Delay: {delay}ms</label>
                <Slider
                  value={[delay]}
                  onValueChange={([value]) => setDelay(value)}
                  min={0}
                  max={2000}
                  step={100}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm">Scale: {scale.toFixed(1)}x</label>
                <Slider
                  value={[scale]}
                  onValueChange={([value]) => setScale(value)}
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </div>
            </div>

            {/* Visual Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold">Visual Settings</h3>

              <div className="space-y-2">
                <label className="text-sm">Shape</label>
                <Select
                  value={selectedShape}
                  onValueChange={setSelectedShape}
                >
                  {SHAPES.map(shape => (
                    <option key={shape} value={shape}>
                      {shape.charAt(0).toUpperCase
```

create an even more advanced version with particle systems, physics interactions, and complex visual effects.

```tsx
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  PlayCircle,
  PauseCircle,
  Settings,
  Wind,
  Droplets,
  Zap,
  Sparkles,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Physics constants
const GRAVITY = 0.2;
const FRICTION = 0.99;
const BOUNCE = 0.7;

// Particle system presets
const PARTICLE_PRESETS = {
  FOUNTAIN: "fountain",
  EXPLOSION: "explosion",
  VORTEX: "vortex",
  SNAKE: "snake",
  CONFETTI: "confetti",
};

class Particle {
  constructor(x, y, color, size = 2) {
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.color = color;
    this.size = size;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.alpha = 1;
    this.life = 1;
    this.decay = 0.01 + Math.random() * 0.02;
    this.wind = 0;
    this.gravity = GRAVITY;
    this.friction = FRICTION;
    this.bounce = BOUNCE;
  }

  update(canvas, mousePosition, forces) {
    // Apply forces
    this.vx += forces.wind;
    this.vy += this.gravity;

    // Apply vortex effect if enabled
    if (forces.vortex) {
      const dx = this.x - canvas.width / 2;
      const dy = this.y - canvas.height / 2;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const vortexForce = 0.1;
      this.vx += Math.cos(angle + Math.PI / 2) * vortexForce;
      this.vy += Math.sin(angle + Math.PI / 2) * vortexForce;
    }

    // Mouse interaction
    if (mousePosition) {
      const dx = this.x - mousePosition.x;
      const dy = this.y - mousePosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 100) {
        const force = (100 - distance) / 100;
        this.vx += (dx / distance) * force * 0.2;
        this.vy += (dy / distance) * force * 0.2;
      }
    }

    // Apply velocity
    this.x += this.vx;
    this.y += this.vy;

    // Apply friction
    this.vx *= this.friction;
    this.vy *= this.friction;

    // Bounce off walls
    if (this.x < 0 || this.x > canvas.width) {
      this.vx *= -this.bounce;
      this.x = this.x < 0 ? 0 : canvas.width;
    }
    if (this.y < 0 || this.y > canvas.height) {
      this.vy *= -this.bounce;
      this.y = this.y < 0 ? 0 : canvas.height;
    }

    // Update life and alpha
    this.life -= this.decay;
    this.alpha = this.life;

    return this.life > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const ParticleAnimationSystem = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const mousePositionRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState(
    PARTICLE_PRESETS.FOUNTAIN
  );
  const [particleCount, setParticleCount] = useState(200);
  const [windForce, setWindForce] = useState(0);
  const [vortexEnabled, setVortexEnabled] = useState(false);
  const [showTrails, setShowTrails] = useState(false);
  const [particleSize, setParticleSize] = useState(2);
  const [colorMode, setColorMode] = useState("rainbow");
  const [interactionEnabled, setInteractionEnabled] = useState(true);

  const colorSchemes = {
    rainbow: () => `hsl(${Math.random() * 360}, 100%, 50%)`,
    fire: () => `hsl(${Math.random() * 60 + 0}, 100%, 50%)`,
    ocean: () => `hsl(${Math.random() * 60 + 180}, 100%, 50%)`,
    neon: () => {
      const neonColors = [
        "#ff0084",
        "#00ff9f",
        "#00b8ff",
        "#ff3300",
        "#fff35c",
      ];
      return neonColors[Math.floor(Math.random() * neonColors.length)];
    },
  };

  const presetConfigs = {
    [PARTICLE_PRESETS.FOUNTAIN]: {
      spawn: (canvas) => {
        const x = canvas.width / 2;
        const y = canvas.height;
        const particle = new Particle(
          x,
          y,
          colorSchemes[colorMode](),
          particleSize
        );
        particle.vy = -10 - Math.random() * 5;
        particle.vx = (Math.random() - 0.5) * 3;
        particle.gravity = 0.2;
        return particle;
      },
    },
    [PARTICLE_PRESETS.EXPLOSION]: {
      spawn: (canvas) => {
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        const particle = new Particle(
          x,
          y,
          colorSchemes[colorMode](),
          particleSize
        );
        const angle = Math.random() * Math.PI * 2;
        const velocity = 5 + Math.random() * 5;
        particle.vx = Math.cos(angle) * velocity;
        particle.vy = Math.sin(angle) * velocity;
        particle.gravity = 0.1;
        return particle;
      },
    },
    [PARTICLE_PRESETS.VORTEX]: {
      spawn: (canvas) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = (Math.random() * canvas.width) / 4;
        const x = canvas.width / 2 + Math.cos(angle) * radius;
        const y = canvas.height / 2 + Math.sin(angle) * radius;
        const particle = new Particle(
          x,
          y,
          colorSchemes[colorMode](),
          particleSize
        );
        particle.gravity = 0;
        return particle;
      },
    },
    [PARTICLE_PRESETS.SNAKE]: {
      spawn: (canvas) => {
        const time = Date.now() / 1000;
        const x = canvas.width / 2 + Math.sin(time) * 100;
        const y = canvas.height / 2 + Math.cos(time) * 100;
        const particle = new Particle(
          x,
          y,
          colorSchemes[colorMode](),
          particleSize
        );
        particle.gravity = 0;
        particle.decay = 0.02;
        return particle;
      },
    },
    [PARTICLE_PRESETS.CONFETTI]: {
      spawn: (canvas) => {
        const x = Math.random() * canvas.width;
        const y = -10;
        const particle = new Particle(
          x,
          y,
          colorSchemes[colorMode](),
          particleSize
        );
        particle.gravity = 0.1;
        particle.size = Math.random() * 4 + 2;
        return particle;
      },
    },
  };

  const animate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear or fade canvas
    if (showTrails) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter((particle) => {
      const isAlive = particle.update(canvas, mousePositionRef.current, {
        wind: windForce,
        vortex: vortexEnabled,
      });
      if (isAlive) {
        particle.draw(ctx);
      }
      return isAlive;
    });

    // Spawn new particles
    while (particlesRef.current.length < particleCount) {
      particlesRef.current.push(presetConfigs[selectedPreset].spawn(canvas));
    }

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  // Canvas setup and event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const handleMouseMove = (e) => {
      if (!interactionEnabled) return;
      const rect = canvas.getBoundingClientRect();
      mousePositionRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mousePositionRef.current = null;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, [interactionEnabled]);

  // Start/stop animation
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationRef.current);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [
    isPlaying,
    selectedPreset,
    particleCount,
    windForce,
    vortexEnabled,
    showTrails,
    particleSize,
    colorMode,
  ]);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl p-4 space-y-4">
      <div className="relative w-full">
        <canvas
          ref={canvasRef}
          className="w-full h-96 border border-gray-300 rounded bg-black"
        />
      </div>

      {/* Main Controls */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isPlaying ? (
            <PauseCircle className="w-5 h-5" />
          ) : (
            <PlayCircle className="w-5 h-5" />
          )}
          {isPlaying ? "Pause" : "Play"}
        </button>

        <Select
          value={selectedPreset}
          onValueChange={setSelectedPreset}
          className="w-40"
        >
          {Object.values(PARTICLE_PRESETS).map((preset) => (
            <option key={preset} value={preset}>
              {preset.charAt(0).toUpperCase() + preset.slice(1)}
            </option>
          ))}
        </Select>
      </div>

      {/* Advanced Controls */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
        <div className="space-y-4">
          <h3 className="font-semibold">Particle Settings</h3>

          <div className="space-y-2">
            <label className="text-sm">Count: {particleCount}</label>
            <Slider
              value={[particleCount]}
              onValueChange={([value]) => setParticleCount(value)}
              min={10}
              max={1000}
              step={10}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Size: {particleSize}px</label>
            <Slider
              value={[particleSize]}
              onValueChange={([value]) => setParticleSize(value)}
              min={1}
              max={10}
              step={0.5}
            />
          </div>

          <Select
            value={colorMode}
            onValueChange={setColorMode}
            className="w-full"
          >
            {Object.keys(colorSchemes).map((scheme) => (
              <option key={scheme} value={scheme}>
                {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Effects</h3>

          <div className="space-y-2">
            <label className="text-sm">
              Wind Force: {windForce.toFixed(2)}
            </label>
            <Slider
              value={[windForce]}
              onValueChange={([value]) => setWindForce(value)}
              min={-0.2}
              max={0.2}
              step={0.01}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm">Vortex Effect</label>
            <Switch
              checked={vortexEnabled}
              onCheckedChange={setVortexEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm">Show Trails</label>
            <Switch checked={showTrails} onCheckedChange={setShowTrails} />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm">Mouse Interaction</label>
            <Switch
              checked={interactionEnabled}
              onCheckedChange={setInteractionEnabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticleAnimationSystem;
```

I've created a highly advanced particle animation system with:

1. Physics Features:

   - Particle physics with gravity, friction, and bounce
   - Wind force effects
   - Vortex motion
   - Mouse interaction with force fields
   - Collision detection with boundaries

2. Particle Presets:
   - Fountain: Particles shoot upward and fall with gravity
   - Explosion: Particles burst from center
   - Vortex: Circular motion pattern
   - Snake: Sinusoidal
