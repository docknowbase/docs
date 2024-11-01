import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const CanvasComponent = () => {
  const canvasRef = useRef(null);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragElement, setDragElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Sample data with unique IDs
  const [data, setData] = useState([
    { id: 1, x: 100, y: 100, radius: 30, color: "#ff6b6b" },
    { id: 2, x: 200, y: 150, radius: 40, color: "#4ecdc4" },
    { id: 3, x: 300, y: 100, radius: 35, color: "#45b7d1" },
  ]);

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
        if (i === dragElement) {
          elementColor = d3.color(d.color).darker(0.3);
        } else if (i === selectedElement) {
          elementColor = d3.color(d.color).darker(0.5);
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

    const getElementAtPosition = (x, y) => {
      return data.findIndex((d) => {
        const dx = d.x * devicePixelRatio - x;
        const dy = d.y * devicePixelRatio - y;
        return Math.sqrt(dx * dx + dy * dy) < d.radius * devicePixelRatio;
      });
    };

    const getCanvasCoordinates = (event) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * devicePixelRatio,
        y: (event.clientY - rect.top) * devicePixelRatio,
      };
    };

    // Handle mouse move
    const handleMouseMove = (event) => {
      const coords = getCanvasCoordinates(event);

      if (isDragging && dragElement !== null) {
        // Update element position while dragging
        const newData = [...data];
        newData[dragElement] = {
          ...newData[dragElement],
          x: coords.x / devicePixelRatio - dragOffset.x,
          y: coords.y / devicePixelRatio - dragOffset.y,
        };
        setData(newData);
      } else {
        // Handle hover state
        const hoveredIndex = getElementAtPosition(coords.x, coords.y);
        if (hoveredIndex !== hoveredElement) {
          setHoveredElement(hoveredIndex === -1 ? null : hoveredIndex);
          canvas.style.cursor = hoveredIndex >= 0 ? "pointer" : "default";
        }
      }
    };

    // Handle mouse down (start drag)
    const handleMouseDown = (event) => {
      const coords = getCanvasCoordinates(event);
      const elementIndex = getElementAtPosition(coords.x, coords.y);

      if (elementIndex >= 0) {
        setIsDragging(true);
        setDragElement(elementIndex);
        setDragOffset({
          x: coords.x / devicePixelRatio - data[elementIndex].x,
          y: coords.y / devicePixelRatio - data[elementIndex].y,
        });
        canvas.style.cursor = "grabbing";
      }
    };

    // Handle mouse up (end drag)
    const handleMouseUp = () => {
      if (isDragging) {
        // If it was a short drag (more like a click), handle selection
        if (dragElement === hoveredElement) {
          setSelectedElement(
            dragElement === selectedElement ? null : dragElement
          );
        }
        setIsDragging(false);
        setDragElement(null);
        canvas.style.cursor = "pointer";
      }
    };

    // Handle mouse leave
    const handleMouseLeave = () => {
      setHoveredElement(null);
      setIsDragging(false);
      setDragElement(null);
      canvas.style.cursor = "default";
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Animation frame for smooth rendering
    let animationFrameId;
    const animate = () => {
      draw();
      animationFrameId = window.requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [
    data,
    hoveredElement,
    selectedElement,
    isDragging,
    dragElement,
    dragOffset,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "600px",
        height: "300px",
        border: "1px solid #ccc",
        touchAction: "none",
      }}
    />
  );
};

export default CanvasComponent;
