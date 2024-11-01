import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const CanvasLinearTransition = () => {
  const canvasRef = useRef(null);
  const [activeTransition, setActiveTransition] = useState(false);
  const [circles, setCircles] = useState([
    { id: 1, x: 100, y: 200, radius: 30, color: "#ff6b6b" },
    { id: 2, x: 200, y: 200, radius: 40, color: "#4ecdc4" },
    { id: 3, x: 300, y: 200, radius: 35, color: "#45b7d1" },
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Setup canvas for retina displays
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    context.scale(devicePixelRatio, devicePixelRatio);

    let animationFrameId;
    let transitionStart = null;
    const duration = 1000; // 1 second transition

    const draw = (progress) => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      circles.forEach((circle, i) => {
        const targetY = activeTransition ? 100 : 200;
        const currentY = circle.y + (targetY - 200) * progress;

        context.beginPath();
        context.arc(circle.x, currentY, circle.radius, 0, 2 * Math.PI);
        context.fillStyle = circle.color;
        context.fill();
      });
    };

    const animate = (timestamp) => {
      if (!transitionStart) transitionStart = timestamp;
      const progress = Math.min((timestamp - transitionStart) / duration, 1);

      draw(progress);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    if (activeTransition !== null) {
      transitionStart = null;
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeTransition, circles]);

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
        onClick={() => setActiveTransition(!activeTransition)}
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
        Trigger Transition
      </button>
    </div>
  );
};

export default CanvasLinearTransition;
