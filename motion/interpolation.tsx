import React, { useEffect, useRef, useState } from "react";
import { interpolateRgb, interpolateNumber } from "d3-interpolate";

const CanvasInterpolation = () => {
  const canvasRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const [circles] = useState([
    {
      id: 1,
      startProps: { x: 100, y: 200, radius: 30, color: "#ff6b6b" },
      endProps: { x: 100, y: 100, radius: 50, color: "#4ecdc4" },
    },
    {
      id: 2,
      startProps: { x: 300, y: 200, radius: 40, color: "#45b7d1" },
      endProps: { x: 300, y: 100, radius: 20, color: "#96ceb4" },
    },
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const devicePixelRatio = window.devicePixelRatio || 1;

    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    context.scale(devicePixelRatio, devicePixelRatio);

    let animationFrameId;
    let startTime = null;
    const duration = 2000;

    const interpolateCircle = (circle, progress) => {
      const { startProps, endProps } = circle;
      return {
        x: interpolateNumber(startProps.x, endProps.x)(progress),
        y: interpolateNumber(startProps.y, endProps.y)(progress),
        radius: interpolateNumber(startProps.radius, endProps.radius)(progress),
        color: interpolateRgb(startProps.color, endProps.color)(progress),
      };
    };

    const draw = (progress) => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw interpolation paths
      context.beginPath();
      context.strokeStyle = "#ddd";
      context.setLineDash([5, 5]);
      circles.forEach((circle) => {
        // Draw path from start to end
        context.moveTo(circle.startProps.x, circle.startProps.y);
        context.lineTo(circle.endProps.x, circle.endProps.y);
      });
      context.stroke();
      context.setLineDash([]);

      // Draw circles with interpolated properties
      circles.forEach((circle) => {
        const interpolated = interpolateCircle(circle, progress);

        context.beginPath();
        context.arc(
          interpolated.x,
          interpolated.y,
          interpolated.radius,
          0,
          2 * Math.PI
        );
        context.fillStyle = interpolated.color;
        context.fill();
        context.strokeStyle = "#333";
        context.lineWidth = 2;
        context.stroke();

        // Draw property values
        context.fillStyle = "#333";
        context.font = "12px Arial";
        context.textAlign = "center";
        context.fillText(
          `x: ${Math.round(interpolated.x)}, y: ${Math.round(interpolated.y)}`,
          interpolated.x,
          interpolated.y + interpolated.radius + 20
        );
        context.fillText(
          `radius: ${Math.round(interpolated.radius)}`,
          interpolated.x,
          interpolated.y + interpolated.radius + 35
        );
      });

      // Draw progress bar
      const barWidth = 200;
      const barHeight = 10;
      const barX = (canvas.width / devicePixelRatio - barWidth) / 2;
      const barY = canvas.height / devicePixelRatio - 30;

      context.fillStyle = "#eee";
      context.fillRect(barX, barY, barWidth, barHeight);
      context.fillStyle = "#4a90e2";
      context.fillRect(barX, barY, barWidth * progress, barHeight);

      // Draw progress percentage
      context.fillStyle = "#333";
      context.font = "14px Arial";
      context.textAlign = "center";
      context.fillText(
        `Progress: ${Math.round(progress * 100)}%`,
        canvas.width / devicePixelRatio / 2,
        barY - 10
      );
    };

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      draw(progress);

      if (progress < 1 && isAnimating) {
        animationFrameId = requestAnimationFrame(animate);
      } else if (progress >= 1) {
        setIsAnimating(false);
      }
    };

    if (isAnimating) {
      startTime = null;
      animationFrameId = requestAnimationFrame(animate);
    } else {
      draw(0);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isAnimating, circles]);

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
        onClick={() => setIsAnimating(true)}
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
          opacity: isAnimating ? 0.5 : 1,
          pointerEvents: isAnimating ? "none" : "auto",
        }}
      >
        Start Interpolation
      </button>
    </div>
  );
};

export default CanvasInterpolation;
