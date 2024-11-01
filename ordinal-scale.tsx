import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const OrdinalAxis = ({
  width = 600,
  height = 80,
  data = ["Low", "Medium", "High"],
  colors = d3.schemeCategory10, // Default color scheme
  showColorBlocks = true,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Handle high-DPI displays
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.scale(pixelRatio, pixelRatio);

    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Create ordinal scale
    const ordinalScale = d3
      .scalePoint()
      .domain(data)
      .range([40, width - 40])
      .padding(0.5);

    // Create color scale
    const colorScale = d3
      .scaleOrdinal()
      .domain(data)
      .range(colors.slice(0, data.length));

    // Create axis
    const ordinalAxis = d3.axisBottom(ordinalScale);

    // Create temporary SVG to compute axis path
    const svg = d3.create("svg").attr("width", width).attr("height", height);

    const g = svg.append("g").attr("transform", `translate(0,${height / 2})`);

    ordinalAxis(g);

    // Draw main axis line
    context.beginPath();
    context.moveTo(40, height / 2);
    context.lineTo(width - 40, height / 2);
    context.strokeStyle = "#000";
    context.lineWidth = 1;
    context.stroke();

    // Draw points and labels
    g.selectAll(".tick").each((d, i, nodes) => {
      const tick = nodes[i];
      const x = parseFloat(tick.getAttribute("transform").split("(")[1]);

      // Draw point
      context.beginPath();
      context.arc(x, height / 2, 4, 0, 2 * Math.PI);
      context.fillStyle = colorScale(d);
      context.fill();
      context.strokeStyle = "#000";
      context.lineWidth = 1;
      context.stroke();

      // Draw tick line
      context.beginPath();
      context.moveTo(x, height / 2 - 6);
      context.lineTo(x, height / 2 + 6);
      context.strokeStyle = "#000";
      context.lineWidth = 1;
      context.stroke();

      // Draw label
      context.save();
      context.translate(x, height / 2 + 20);
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "#000";
      context.font = "12px Arial";
      context.fillText(d, 0, 0);
      context.restore();

      // Draw color block legend if enabled
      if (showColorBlocks) {
        const blockSize = 15;
        const blockY = height / 2 - 30;

        // Draw color block
        context.fillStyle = colorScale(d);
        context.fillRect(x - blockSize / 2, blockY, blockSize, blockSize);
        context.strokeStyle = "#000";
        context.lineWidth = 0.5;
        context.strokeRect(x - blockSize / 2, blockY, blockSize, blockSize);

        // Draw connecting line
        context.beginPath();
        context.moveTo(x, blockY + blockSize);
        context.lineTo(x, height / 2 - 6);
        context.strokeStyle = "#ccc";
        context.lineWidth = 1;
        context.stroke();
      }
    });

    // Draw scale indicators between points
    data.forEach((d, i) => {
      if (i < data.length - 1) {
        const x1 = ordinalScale(d);
        const x2 = ordinalScale(data[i + 1]);
        const y = height / 2 + 35;

        // Draw distance line
        context.beginPath();
        context.moveTo(x1, y);
        context.lineTo(x2, y);
        context.strokeStyle = "#666";
        context.lineWidth = 0.5;
        context.stroke();

        // Draw arrows
        context.beginPath();
        context.moveTo(x1, y);
        context.lineTo(x1 + 5, y - 3);
        context.lineTo(x1 + 5, y + 3);
        context.closePath();
        context.fillStyle = "#666";
        context.fill();

        context.beginPath();
        context.moveTo(x2, y);
        context.lineTo(x2 - 5, y - 3);
        context.lineTo(x2 - 5, y + 3);
        context.closePath();
        context.fill();

        // Draw distance label
        const distance = Math.round(x2 - x1);
        context.textAlign = "center";
        context.textBaseline = "top";
        context.fillStyle = "#666";
        context.font = "10px Arial";
        context.fillText(`${distance}px`, (x1 + x2) / 2, y + 5);
      }
    });
  }, [width, height, data, colors, showColorBlocks]);

  return (
    <div style={{ paddingBottom: "40px" }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default OrdinalAxis;
