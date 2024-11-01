import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const CanvasComponent = () => {
  const canvasRef = useRef(null);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);

  // Sample data - can be modified as needed
  const data = [
    { id: 1, x: 100, y: 100, radius: 30, color: "#ff6b6b" },
    { id: 2, x: 200, y: 150, radius: 40, color: "#4ecdc4" },
    { id: 3, x: 300, y: 100, radius: 35, color: "#45b7d1" },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Setup canvas for retina displays
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

        // Determine element state and apply appropriate styles
        let elementColor = d.color;
        if (i === selectedElement) {
          elementColor = d3.color(d.color).darker(0.5);
          // Draw selection ring
          context.strokeStyle = "#000";
          context.lineWidth = 3;
          context.stroke();
        } else if (i === hoveredElement) {
          elementColor = d3.color(d.color).brighter(0.5);
        }

        context.fillStyle = elementColor;
        context.fill();
      });
    };

    // Initial draw
    draw();

    const getElementAtPosition = (x, y) => {
      return data.findIndex((d) => {
        const dx = d.x * devicePixelRatio - x;
        const dy = d.y * devicePixelRatio - y;
        return Math.sqrt(dx * dx + dy * dy) < d.radius * devicePixelRatio;
      });
    };

    // Handle mouse move
    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * devicePixelRatio;
      const y = (event.clientY - rect.top) * devicePixelRatio;

      const hoveredIndex = getElementAtPosition(x, y);

      if (hoveredIndex !== hoveredElement) {
        setHoveredElement(hoveredIndex === -1 ? null : hoveredIndex);
        canvas.style.cursor = hoveredIndex >= 0 ? "pointer" : "default";
      }
    };

    // Handle click
    const handleClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * devicePixelRatio;
      const y = (event.clientY - rect.top) * devicePixelRatio;

      const clickedIndex = getElementAtPosition(x, y);

      if (clickedIndex >= 0) {
        setSelectedElement(
          clickedIndex === selectedElement ? null : clickedIndex
        );
        // You can add your click handler here
        console.log("Clicked element:", data[clickedIndex]);
      } else {
        setSelectedElement(null);
      }
    };

    // Handle mouse leave
    const handleMouseLeave = () => {
      setHoveredElement(null);
      canvas.style.cursor = "default";
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("click", handleClick);

    // Cleanup
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("click", handleClick);
    };
  }, [hoveredElement, selectedElement]); // Re-run effect when states change

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
