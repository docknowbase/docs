import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const CanvasComponent = () => {
  const canvasRef = useRef(null);
  const [brushStart, setBrushStart] = useState(null);
  const [brushEnd, setBrushEnd] = useState(null);
  const [selectedElements, setSelectedElements] = useState([]);
  const [isBrushing, setIsBrushing] = useState(false);

  // Sample data
  const data = [
    { id: 1, x: 100, y: 100, radius: 30, color: "#ff6b6b" },
    { id: 2, x: 200, y: 150, radius: 40, color: "#4ecdc4" },
    { id: 3, x: 300, y: 100, radius: 35, color: "#45b7d1" },
    { id: 4, x: 400, y: 200, radius: 25, color: "#96ceb4" },
    { id: 5, x: 150, y: 250, radius: 35, color: "#88d8b0" },
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
      data.forEach((d, index) => {
        context.beginPath();
        context.arc(d.x, d.y, d.radius, 0, 2 * Math.PI);

        // Change fill color if selected
        const isSelected = selectedElements.includes(index);
        context.fillStyle = isSelected
          ? d3.color(d.color).brighter(0.5)
          : d.color;
        context.fill();

        // Add highlight border if selected
        if (isSelected) {
          context.strokeStyle = "#2196f3";
          context.lineWidth = 3;
          context.stroke();
        }
      });

      // Draw brush selection box if brushing
      if (isBrushing && brushStart && brushEnd) {
        context.setLineDash([5, 5]);
        context.strokeStyle = "#2196f3";
        context.lineWidth = 1;
        context.strokeRect(
          brushStart.x,
          brushStart.y,
          brushEnd.x - brushStart.x,
          brushEnd.y - brushStart.y
        );
        context.setLineDash([]);

        // Fill selection box with semi-transparent color
        context.fillStyle = "rgba(33, 150, 243, 0.1)";
        context.fillRect(
          brushStart.x,
          brushStart.y,
          brushEnd.x - brushStart.x,
          brushEnd.y - brushStart.y
        );
      }
    };

    // Get canvas coordinates
    const getCanvasCoordinates = (event) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * devicePixelRatio,
        y: (event.clientY - rect.top) * devicePixelRatio,
      };
    };

    // Check if a point is inside the brush selection
    const isInsideBrush = (point) => {
      if (!brushStart || !brushEnd) return false;
      const minX = Math.min(brushStart.x, brushEnd.x);
      const maxX = Math.max(brushStart.x, brushEnd.x);
      const minY = Math.min(brushStart.y, brushEnd.y);
      const maxY = Math.max(brushStart.y, brushEnd.y);

      return (
        point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
      );
    };

    // Handle mouse down (start brushing)
    const handleMouseDown = (event) => {
      if (event.button === 0) {
        // Left click only
        const coords = getCanvasCoordinates(event);
        setBrushStart(coords);
        setBrushEnd(coords);
        setIsBrushing(true);

        // Clear selection if not holding shift
        if (!event.shiftKey) {
          setSelectedElements([]);
        }
      }
    };

    // Handle mouse move (update brush)
    const handleMouseMove = (event) => {
      if (isBrushing) {
        const coords = getCanvasCoordinates(event);
        setBrushEnd(coords);

        // Update selected elements
        const newSelection = data.reduce((selected, d, index) => {
          const point = {
            x: d.x * devicePixelRatio,
            y: d.y * devicePixelRatio,
          };
          if (isInsideBrush(point)) {
            selected.push(index);
          }
          return selected;
        }, []);

        if (event.shiftKey) {
          // Add to existing selection
          setSelectedElements([
            ...new Set([...selectedElements, ...newSelection]),
          ]);
        } else {
          setSelectedElements(newSelection);
        }
      }
    };

    // Handle mouse up (end brushing)
    const handleMouseUp = () => {
      setIsBrushing(false);
      setBrushStart(null);
      setBrushEnd(null);
    };

    // Handle mouse leave
    const handleMouseLeave = () => {
      if (isBrushing) {
        setIsBrushing(false);
        setBrushStart(null);
        setBrushEnd(null);
      }
    };

    // Add event listeners
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
      window.cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [brushStart, brushEnd, isBrushing, selectedElements]);

  const handleClearSelection = () => {
    setSelectedElements([]);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        style={{
          width: "800px",
          height: "400px",
          border: "1px solid #ccc",
          touchAction: "none",
        }}
      />
      <button
        onClick={handleClearSelection}
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
          display: selectedElements.length > 0 ? "block" : "none",
        }}
      >
        Clear Selection
      </button>
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          padding: "4px 8px",
          background: "rgba(255, 255, 255, 0.8)",
          borderRadius: "4px",
          fontSize: "12px",
        }}
      >
        Click and drag to select • Hold Shift for multiple selection
      </div>
    </div>
  );
};

export default CanvasComponent;
