import React, { useEffect, useRef, useState } from "react";
import { easeLinear, easeElastic, easeBounce, easeCircleInOut } from "d3-ease";

const CanvasEasingTransition = () => {
  const canvasRef = useRef(null);
  const [activeTransition, setActiveTransition] = useState(false);
  const [selectedEasing, setSelectedEasing] = useState("easeInOutCubic");

  const [circles] = useState([
    { id: 1, x: 100, y: 200, radius: 30, color: "#ff6b6b" },
    { id: 2, x: 200, y: 200, radius: 40, color: "#4ecdc4" },
    { id: 3, x: 300, y: 200, radius: 35, color: "#45b7d1" },
  ]);

  const easingFunctions = {
    easeLinear: easeLinear,
    easeElastic: easeElastic,
    easeBounce: easeBounce,
    easeCircle: easeCircleInOut,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const devicePixelRatio = window.devicePixelRatio || 1;

    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    context.scale(devicePixelRatio, devicePixelRatio);

    let animationFrameId;
    let transitionStart = null;
    const duration = 1000;

    const draw = (progress) => {
      // Get the easing function and apply it to the progress
      const easingFn = easingFunctions[selectedEasing] || easeLinear;
      const easedProgress = easingFn(progress);

      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw motion path
      context.beginPath();
      context.strokeStyle = "#ddd";
      context.setLineDash([5, 5]);
      circles.forEach((circle) => {
        context.moveTo(circle.x, 200);
        context.lineTo(circle.x, 100);
      });
      context.stroke();
      context.setLineDash([]);

      // Draw circles
      circles.forEach((circle) => {
        const targetY = activeTransition ? 100 : 200;
        const currentY = circle.y + (targetY - 200) * easedProgress;

        context.beginPath();
        context.arc(circle.x, currentY, circle.radius, 0, 2 * Math.PI);

        // Create gradient
        const gradient = context.createRadialGradient(
          circle.x,
          currentY,
          0,
          circle.x,
          currentY,
          circle.radius
        );
        gradient.addColorStop(0, `${circle.color}99`); // Semi-transparent
        gradient.addColorStop(1, circle.color);

        context.fillStyle = gradient;
        context.fill();

        // Add border
        context.strokeStyle = circle.color;
        context.lineWidth = 2;
        context.stroke();
      });

      // Draw easing info
      context.fillStyle = "#333";
      context.font = "14px Arial";
      context.fillText(`Easing: ${selectedEasing}`, 10, 30);
      context.fillText(`Progress: ${progress.toFixed(2)}`, 10, 50);
      context.fillText(`Eased Progress: ${easedProgress.toFixed(2)}`, 10, 70);
    };

    const animate = (timestamp) => {
      if (!transitionStart) transitionStart = timestamp;
      const progress = Math.min((timestamp - transitionStart) / duration, 1);

      draw(progress);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    transitionStart = null;
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeTransition, circles, selectedEasing]);

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
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
          padding: "10px",
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "4px",
        }}
      >
        <select
          value={selectedEasing}
          onChange={(e) => setSelectedEasing(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            background: "white",
          }}
        >
          {Object.keys(easingFunctions).map((easing) => (
            <option key={easing} value={easing}>
              {easing}
            </option>
          ))}
        </select>
        <button
          onClick={() => setActiveTransition(!activeTransition)}
          style={{
            padding: "8px 16px",
            background: "#4a90e2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {activeTransition ? "Move Down" : "Move Up"}
        </button>
      </div>
    </div>
  );
};

export default CanvasEasingTransition;
