import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const CanvasUpdateTransition = () => {
  const canvasRef = useRef(null);
  const [circles, setCircles] = useState([]);
  const [transitions, setTransitions] = useState(new Map());
  const [nextUpdate, setNextUpdate] = useState(null);

  // Initialize or update circles
  const updateCircles = () => {
    const newCircles = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 100 + i * 150,
      y: 200 + (Math.random() * 100 - 50),
      radius: 20 + Math.random() * 30,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    }));

    // Store current state for transition
    const newTransitions = new Map();
    newCircles.forEach((newCircle) => {
      const oldCircle = circles.find((c) => c.id === newCircle.id);
      if (oldCircle) {
        newTransitions.set(newCircle.id, {
          startTime: null,
          from: oldCircle,
          to: newCircle,
        });
      }
    });

    setTransitions(newTransitions);
    setCircles(newCircles);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const devicePixelRatio = window.devicePixelRatio || 1;

    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    context.scale(devicePixelRatio, devicePixelRatio);

    let animationFrameId;
    const duration = 1000;

    const interpolateCircle = (from, to, progress) => ({
      ...to,
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
      radius: from.radius + (to.radius - from.radius) * progress,
      color: d3.interpolateRgb(from.color, to.color)(progress),
    });

    const draw = (timestamp) => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid for reference
      const gridSize = 50;
      context.beginPath();
      context.strokeStyle = "#f0f0f0";
      context.lineWidth = 1;

      for (let x = 0; x < canvas.width; x += gridSize) {
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
      }
      context.stroke();

      // Draw update preview if available
      if (nextUpdate) {
        circles.forEach((circle, index) => {
          const nextCircle = nextUpdate[index];
          if (nextCircle) {
            // Draw path to next position
            context.beginPath();
            context.setLineDash([5, 5]);
            context.strokeStyle = "rgba(0, 0, 0, 0.2)";
            context.moveTo(circle.x, circle.y);
            context.lineTo(nextCircle.x, nextCircle.y);
            context.stroke();
            context.setLineDash([]);

            // Draw ghost circle
            context.beginPath();
            context.arc(
              nextCircle.x,
              nextCircle.y,
              nextCircle.radius,
              0,
              2 * Math.PI
            );
            context.fillStyle = `${nextCircle.color
              .replace("hsl", "hsla")
              .replace(")", ", 0.2)")}`;
            context.fill();
          }
        });
      }

      // Draw circles with transitions
      circles.forEach((circle) => {
        const transition = transitions.get(circle.id);
        let currentCircle = circle;

        if (transition) {
          if (!transition.startTime) {
            transition.startTime = timestamp;
            setTransitions(new Map(transitions));
          }

          const progress = Math.min(
            (timestamp - transition.startTime) / duration,
            1
          );
          const easedProgress = d3.easeCubicInOut(progress);
          currentCircle = interpolateCircle(
            transition.from,
            transition.to,
            easedProgress
          );

          if (progress >= 1) {
            const newTransitions = new Map(transitions);
            newTransitions.delete(circle.id);
            setTransitions(newTransitions);
          }
        }

        // Draw circle
        context.beginPath();
        context.arc(
          currentCircle.x,
          currentCircle.y,
          currentCircle.radius,
          0,
          2 * Math.PI
        );

        // Gradient fill
        const gradient = context.createRadialGradient(
          currentCircle.x,
          currentCircle.y,
          0,
          currentCircle.x,
          currentCircle.y,
          currentCircle.radius
        );
        gradient.addColorStop(0, currentCircle.color);
        gradient.addColorStop(
          1,
          typeof currentCircle.color === "string" &&
            currentCircle.color.startsWith("hsl")
            ? currentCircle.color.replace(")", ", 0.7)")
            : d3.color(currentCircle.color).copy({ opacity: 0.7 })
        );

        context.fillStyle = gradient;
        context.fill();

        // Draw value indicators
        context.fillStyle = "#333";
        context.font = "12px Arial";
        context.textAlign = "center";
        context.fillText(
          `y: ${Math.round(currentCircle.y)}`,
          currentCircle.x,
          currentCircle.y + currentCircle.radius + 20
        );
        context.fillText(
          `r: ${Math.round(currentCircle.radius)}`,
          currentCircle.x,
          currentCircle.y + currentCircle.radius + 35
        );
      });

      // Continue animation if there are active transitions
      if (transitions.size > 0) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    // Initial circles if empty
    if (circles.length === 0) {
      updateCircles();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [circles, transitions, nextUpdate]);

  // Preview next update on hover
  const handleMouseEnter = () => {
    const previewCircles = circles.map((circle) => ({
      ...circle,
      y: 200 + (Math.random() * 100 - 50),
      radius: 20 + Math.random() * 30,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    }));
    setNextUpdate(previewCircles);
  };

  const handleMouseLeave = () => {
    setNextUpdate(null);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        style={{
          width: "800px",
          height: "400px",
          border: "1px solid #ccc",
        }}
      />
      <button
        onClick={updateCircles}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          padding: "8px 16px",
          background: "#4a90e2",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Update Positions
      </button>
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          padding: "8px",
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "4px",
          fontSize: "14px",
        }}
      >
        Hover over button to preview changes
      </div>
    </div>
  );
};

export default CanvasUpdateTransition;
