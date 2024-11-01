import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const CanvasComponent = () => {
  const canvasRef = useRef(null);
  const [hoveredElement, setHoveredElement] = useState(null);

  // Sample data with additional information for tooltips
  const data = [
    {
      id: 1,
      x: 100,
      y: 100,
      radius: 30,
      color: "#ff6b6b",
      value: 245,
      label: "Node A",
    },
    {
      id: 2,
      x: 200,
      y: 150,
      radius: 40,
      color: "#4ecdc4",
      value: 312,
      label: "Node B",
    },
    {
      id: 3,
      x: 300,
      y: 100,
      radius: 35,
      color: "#45b7d1",
      value: 178,
      label: "Node C",
    },
    {
      id: 4,
      x: 400,
      y: 200,
      radius: 25,
      color: "#96ceb4",
      value: 401,
      label: "Node D",
    },
    {
      id: 5,
      x: 150,
      y: 250,
      radius: 35,
      color: "#88d8b0",
      value: 276,
      label: "Node E",
    },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Setup canvas for retina displays
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    context.scale(devicePixelRatio, devicePixelRatio);

    // Draw tooltip function
    const drawTooltip = (ctx, x, y, data) => {
      const padding = 10;
      const lineHeight = 20;
      const fontSize = 14;
      const arrowHeight = 8;

      // Set up text properties to measure width
      ctx.font = `${fontSize}px Arial`;
      const labelWidth = ctx.measureText(data.label).width;
      const valueWidth = ctx.measureText(`Value: ${data.value}`).width;
      const tooltipWidth = Math.max(labelWidth, valueWidth) + padding * 2;
      const tooltipHeight = lineHeight * 2 + padding * 2;

      // Calculate tooltip position
      const tooltipX = Math.min(
        Math.max(x - tooltipWidth / 2, padding),
        canvas.width / devicePixelRatio - tooltipWidth - padding
      );
      const tooltipY = y - tooltipHeight - arrowHeight - 5;

      // Draw tooltip background with shadow
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Draw rounded rectangle background
      ctx.beginPath();
      ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 6);
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fill();

      // Draw arrow
      ctx.beginPath();
      ctx.moveTo(x - 8, tooltipY + tooltipHeight);
      ctx.lineTo(x, tooltipY + tooltipHeight + arrowHeight);
      ctx.lineTo(x + 8, tooltipY + tooltipHeight);
      ctx.closePath();
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fill();

      ctx.restore();

      // Draw text
      ctx.fillStyle = "white";
      ctx.textBaseline = "top";
      ctx.textAlign = "left";

      // Draw label
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillText(data.label, tooltipX + padding, tooltipY + padding);

      // Draw value
      ctx.font = `${fontSize}px Arial`;
      ctx.fillText(
        `Value: ${data.value}`,
        tooltipX + padding,
        tooltipY + padding + lineHeight
      );
    };

    const draw = () => {
      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw elements
      data.forEach((d, index) => {
        context.beginPath();
        context.arc(d.x, d.y, d.radius, 0, 2 * Math.PI);

        // Create gradient fill
        const gradient = context.createRadialGradient(
          d.x,
          d.y,
          0,
          d.x,
          d.y,
          d.radius
        );

        if (hoveredElement === index) {
          gradient.addColorStop(0, d3.color(d.color).brighter(0.7));
          gradient.addColorStop(1, d3.color(d.color).brighter(0.3));
        } else {
          gradient.addColorStop(0, d3.color(d.color).brighter(0.5));
          gradient.addColorStop(1, d.color);
        }

        context.fillStyle = gradient;
        context.fill();

        // Add border
        context.strokeStyle = d3.color(d.color).darker(0.5);
        context.lineWidth = 2;
        context.stroke();

        // Draw tooltip if element is hovered
        if (hoveredElement === index) {
          drawTooltip(context, d.x, d.y - d.radius - 10, d);
        }
      });
    };

    // Get canvas coordinates
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

      // Find hovered element
      const hoveredIndex = data.findIndex((d) => {
        const dx = d.x * devicePixelRatio - coords.x;
        const dy = d.y * devicePixelRatio - coords.y;
        return Math.sqrt(dx * dx + dy * dy) < d.radius * devicePixelRatio;
      });

      if (hoveredIndex !== hoveredElement) {
        setHoveredElement(hoveredIndex === -1 ? null : hoveredIndex);
        canvas.style.cursor = hoveredIndex >= 0 ? "pointer" : "default";
      }
    };

    // Handle mouse leave
    const handleMouseLeave = () => {
      setHoveredElement(null);
      canvas.style.cursor = "default";
    };

    // Add event listeners
    canvas.addEventListener("mousemove", handleMouseMove);
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
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hoveredElement]);

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
    </div>
  );
};

export default CanvasComponent;
