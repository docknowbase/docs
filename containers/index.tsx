import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

// Group (g element) implementation
const GroupExample = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Start a new path for the group
    ctx.save();
    ctx.translate(50, 50);

    // Draw grouped elements
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, 50, 50);

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(25, 25, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="border border-gray-300"
    />
  );
};

// Layer implementation
const LayerExample = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background layer
    ctx.fillStyle = "#e0e0e0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Middle layer
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "blue";
    ctx.fillRect(25, 25, 100, 100);

    // Top layer
    ctx.globalAlpha = 1;
    ctx.fillStyle = "red";
    ctx.fillRect(50, 50, 50, 50);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="border border-gray-300"
    />
  );
};

// Clipping Path implementation
const ClippingPathExample = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create clipping path
    ctx.beginPath();
    ctx.arc(100, 100, 50, 0, Math.PI * 2);
    ctx.clip();

    // Draw content that will be clipped
    ctx.fillStyle = "blue";
    ctx.fillRect(50, 50, 100, 100);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="border border-gray-300"
    />
  );
};

// Gradient implementation
const GradientExample = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create gradient
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, "blue");
    gradient.addColorStop(1, "red");

    // Apply gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="border border-gray-300"
    />
  );
};

// Pattern implementation
const PatternExample = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create pattern
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = 20;
    patternCanvas.height = 20;
    const patternCtx = patternCanvas.getContext("2d");

    patternCtx.fillStyle = "blue";
    patternCtx.fillRect(0, 0, 10, 10);
    patternCtx.fillRect(10, 10, 10, 10);

    const pattern = ctx.createPattern(patternCanvas, "repeat");
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="border border-gray-300"
    />
  );
};

// Generator function implementation using D3
const GeneratorExample = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create data
    const data = Array.from({ length: 10 }, (_, i) => ({
      x: i * 20,
      y: Math.random() * 100,
    }));

    // Create line generator
    const lineGenerator = d3
      .line()
      .x((d) => d.x)
      .y((d) => d.y)
      .context(ctx);

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    lineGenerator(data);
    ctx.stroke();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="border border-gray-300"
    />
  );
};

// Hull implementation using D3
const HullExample = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create random points
    const points = Array.from({ length: 15 }, () => [
      Math.random() * canvas.width,
      Math.random() * canvas.height,
    ]);

    // Compute hull
    const hull = d3.polygonHull(points);

    // Draw points
    ctx.fillStyle = "blue";
    points.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw hull
    if (hull) {
      ctx.beginPath();
      ctx.moveTo(hull[0][0], hull[0][1]);
      hull.slice(1).forEach(([x, y]) => {
        ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = "red";
      ctx.stroke();
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="border border-gray-300"
    />
  );
};

// Main component to display all examples
const ContainersAndGenerators = () => {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Group Example</h3>
        <GroupExample />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Layer Example</h3>
        <LayerExample />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Clipping Path Example</h3>
        <ClippingPathExample />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Gradient Example</h3>
        <GradientExample />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Pattern Example</h3>
        <PatternExample />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Generator Example</h3>
        <GeneratorExample />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Hull Example</h3>
        <HullExample />
      </div>
    </div>
  );
};

export default ContainersAndGenerators;
