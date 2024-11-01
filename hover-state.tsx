import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const CanvasComponent = () => {
  const canvasRef = useRef(null);
  const [hoveredElement, setHoveredElement] = useState(null);

  // Sample data - you can modify this as needed
  const data = [
    { x: 100, y: 100, radius: 30, color: "#ff6b6b" },
    { x: 200, y: 150, radius: 40, color: "#4ecdc4" },
    { x: 300, y: 100, radius: 35, color: "#45b7d1" },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Set up canvas for retina displays
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    context.scale(devicePixelRatio, devicePixelRatio);

    const draw = () => {
      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw elements
      data.forEach((d, i) => {
        context.beginPath();
        context.arc(d.x, d.y, d.radius, 0, 2 * Math.PI);
        context.fillStyle =
          i === hoveredElement ? d3.color(d.color).brighter(0.5) : d.color;
        context.fill();
      });
    };

    // Initial draw
    draw();

    // Handle mouse move
    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * devicePixelRatio;
      const y = (event.clientY - rect.top) * devicePixelRatio;

      // Check if mouse is over any element
      const hoveredIndex = data.findIndex((d) => {
        const dx = d.x * devicePixelRatio - x;
        const dy = d.y * devicePixelRatio - y;
        return Math.sqrt(dx * dx + dy * dy) < d.radius * devicePixelRatio;
      });

      if (hoveredIndex !== hoveredElement) {
        setHoveredElement(hoveredIndex === -1 ? null : hoveredIndex);
      }
    };

    // Handle mouse leave
    const handleMouseLeave = () => {
      setHoveredElement(null);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Cleanup
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hoveredElement]); // Re-run effect when hoveredElement changes

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "600px",
        height: "300px",
        border: "1px solid #ccc",
      }}
    />
  );
};

export default CanvasComponent;
