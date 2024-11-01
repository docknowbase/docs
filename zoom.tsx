import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const CanvasComponent = () => {
  const canvasRef = useRef(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);

  // Sample data
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

    // Create zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 4]) // Min and max zoom scale
      .on("zoom", (event) => {
        setTransform(event.transform);
      });

    // Apply zoom to canvas
    d3.select(canvas).call(zoom).call(zoom.transform, transform);

    const draw = () => {
      // Clear canvas
      context.save();
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Apply zoom transform
      context.translate(transform.x, transform.y);
      context.scale(transform.k, transform.k);

      // Draw elements
      data.forEach((d) => {
        context.beginPath();
        context.arc(d.x, d.y, d.radius, 0, 2 * Math.PI);
        context.fillStyle = d.color;
        context.fill();

        // Add border
        context.strokeStyle = d3.color(d.color).darker(0.5);
        context.lineWidth = 2;
        context.stroke();
      });

      // Draw zoom level indicator
      context.restore();
      context.fillStyle = "#333";
      context.font = "14px Arial";
      context.fillText(`Zoom: ${transform.k.toFixed(2)}x`, 10, 20);
    };

    // Animation frame for smooth rendering
    let animationFrameId;
    const animate = () => {
      draw();
      animationFrameId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [transform]); // Re-run effect when transform changes

  // Reset zoom handler
  const handleResetZoom = () => {
    d3.select(canvasRef.current)
      .transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        style={{
          width: "600px",
          height: "300px",
          border: "1px solid #ccc",
          touchAction: "none",
        }}
      />
      <button
        onClick={handleResetZoom}
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
        Reset Zoom
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
        Use mouse wheel or pinch gesture to zoom
      </div>
    </div>
  );
};

export default CanvasComponent;
