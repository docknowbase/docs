import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const TreemapLayout = () => {
  const canvasRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set canvas size with proper scaling for retina displays
    const width = 800;
    const height = 600;
    const scale = window.devicePixelRatio || 1;
    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    context.scale(scale, scale);

    // Sample hierarchical data
    const data = {
      name: "Root",
      children: [
        {
          name: "Technology",
          children: [
            { name: "Hardware", value: 450 },
            { name: "Software", value: 800 },
            { name: "Services", value: 600 },
          ],
        },
        {
          name: "Finance",
          children: [
            { name: "Banking", value: 750 },
            { name: "Insurance", value: 500 },
            { name: "Investment", value: 350 },
          ],
        },
        {
          name: "Healthcare",
          children: [
            { name: "Pharmaceuticals", value: 700 },
            { name: "Equipment", value: 400 },
            { name: "Services", value: 550 },
          ],
        },
      ],
    };

    // Color scale for different depths
    const colorScale = d3
      .scaleOrdinal()
      .domain([0, 1, 2])
      .range(["#2c7bb6", "#abd9e9", "#ffffbf"]);

    // Create treemap layout
    const treemap = d3
      .treemap()
      .size([width - 40, height - 40])
      .paddingOuter(20)
      .paddingTop(20)
      .paddingInner(5)
      .round(true);

    // Create hierarchy and compute values
    const root = d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    // Generate treemap layout
    treemap(root);

    // Function to draw rounded rectangle
    const drawRoundedRect = (x, y, width, height, radius) => {
      context.beginPath();
      context.moveTo(x + radius, y);
      context.lineTo(x + width - radius, y);
      context.quadraticCurveTo(x + width, y, x + width, y + radius);
      context.lineTo(x + width, y + height - radius);
      context.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
      );
      context.lineTo(x + radius, y + height);
      context.quadraticCurveTo(x, y + height, x, y + height - radius);
      context.lineTo(x, y + radius);
      context.quadraticCurveTo(x, y, x + radius, y);
      context.closePath();
    };

    // Function to render the treemap
    const render = () => {
      // Clear canvas
      context.clearRect(0, 0, width * scale, height * scale);

      // Draw all nodes
      root.descendants().forEach((node) => {
        const isHovered = hoveredNode === node;
        const x = node.x0 + 20;
        const y = node.y0 + 20;
        const nodeWidth = node.x1 - node.x0;
        const nodeHeight = node.y1 - node.y0;

        // Draw node rectangle
        context.save();
        context.fillStyle = colorScale(node.depth);
        drawRoundedRect(x, y, nodeWidth, nodeHeight, 4);
        context.fill();

        // Draw border
        context.strokeStyle = isHovered ? "#000" : "#fff";
        context.lineWidth = isHovered ? 2 : 1;
        context.stroke();

        // Draw text if node is large enough
        if (nodeWidth > 50 && nodeHeight > 25) {
          context.fillStyle = "#000";
          context.font = isHovered ? "bold 12px Arial" : "12px Arial";
          context.textAlign = "center";
          context.textBaseline = "middle";

          // Draw node name
          const text = node.data.name;
          const textWidth = context.measureText(text).width;

          if (textWidth < nodeWidth - 10) {
            context.fillText(text, x + nodeWidth / 2, y + nodeHeight / 2);

            // Draw value for leaf nodes
            if (!node.children && nodeHeight > 40) {
              context.font = "10px Arial";
              context.fillText(
                `Value: ${node.value}`,
                x + nodeWidth / 2,
                y + nodeHeight / 2 + 15
              );
            }
          }
        }

        context.restore();
      });
    };

    // Handle mouse movements
    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Find node under cursor
      const found = root
        .descendants()
        .find(
          (node) =>
            x >= node.x0 + 20 &&
            x <= node.x1 + 20 &&
            y >= node.y0 + 20 &&
            y <= node.y1 + 20
        );

      if (found !== hoveredNode) {
        setHoveredNode(found);
        render();
      }
    };

    // Add mouse event listeners
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.style.cursor = "pointer";

    // Initial render
    render();

    // Cleanup
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [hoveredNode]);

  return (
    <div className="treemap-container">
      <canvas
        ref={canvasRef}
        style={{
          border: "1px solid #ddd",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      />
      {hoveredNode && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            padding: "10px",
            background: "rgba(255,255,255,0.9)",
            border: "1px solid #ddd",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <strong>{hoveredNode.data.name}</strong>
          <br />
          Value: {hoveredNode.value}
          {hoveredNode.parent && (
            <>
              <br />
              Parent: {hoveredNode.parent.data.name}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TreemapLayout;
