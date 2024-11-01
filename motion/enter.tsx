import React, { useEffect, useRef, useState } from "react";
import { easeElasticOut } from "d3-ease";

const CanvasEnterAnimation = () => {
  const canvasRef = useRef(null);
  const [circles, setCircles] = useState([]);

  const addCircle = () => {
    const newCircle = {
      id: Date.now(),
      x: 100 + Math.random() * 600,
      y: 100 + Math.random() * 200,
      radius: 20 + Math.random() * 30,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      progress: 0,
    };
    setCircles((prevCircles) => [...prevCircles, newCircle]);
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
    const startTimes = new Map();

    const draw = (timestamp) => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      circles.forEach((circle) => {
        if (!startTimes.has(circle.id)) {
          startTimes.set(circle.id, timestamp);
        }

        const startTime = startTimes.get(circle.id);
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easedProgress = easeElasticOut(progress);

        // Scale up from 0
        const currentRadius = circle.radius * easedProgress;

        // Fade in
        const opacity = progress;

        context.beginPath();
        context.arc(circle.x, circle.y, currentRadius, 0, 2 * Math.PI);

        // Create gradient with opacity
        const gradient = context.createRadialGradient(
          circle.x,
          circle.y,
          0,
          circle.x,
          circle.y,
          currentRadius
        );
        const color = circle.color.startsWith("hsl")
          ? circle.color
          : `hsl(${circle.color}, 70%, 60%)`;
        gradient.addColorStop(0, color.replace(")", `, ${opacity})`));
        gradient.addColorStop(1, color.replace(")", `, ${opacity * 0.7})`));

        context.fillStyle = gradient;
        context.fill();

        // Add ripple effect
        if (progress < 1) {
          context.beginPath();
          context.arc(
            circle.x,
            circle.y,
            currentRadius + 10 * (1 - progress),
            0,
            2 * Math.PI
          );
          context.strokeStyle = `rgba(255, 255, 255, ${0.5 * (1 - progress)})`;
          context.lineWidth = 2;
          context.stroke();
        }
      });

      // Continue animation if any circle is still animating
      if (
        [...startTimes.values()].some(
          (startTime) => (timestamp - startTime) / duration < 1
        )
      ) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [circles]);

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
        onClick={addCircle}
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
        Add Circle
      </button>
    </div>
  );
};

export default CanvasEnterAnimation;
