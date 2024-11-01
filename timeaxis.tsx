import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const TimeAxis = ({
  width = 600,
  height = 60,
  startDate = new Date(2024, 0, 1),
  endDate = new Date(2024, 11, 31),
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

    // Create time scale
    const timeScale = d3
      .scaleTime()
      .domain([startDate, endDate])
      .range([40, width - 40]);

    // Create axis with appropriate time formatting
    const timeAxis = d3
      .axisBottom(timeScale)
      .ticks(d3.timeMonth.every(1))
      .tickFormat(d3.timeFormat("%b %Y"));

    // Create temporary SVG to compute axis path
    const svg = d3.create("svg").attr("width", width).attr("height", height);

    const g = svg.append("g").attr("transform", `translate(0,${height / 2})`);

    timeAxis(g);

    // Draw axis line
    context.beginPath();
    context.moveTo(40, height / 2);
    context.lineTo(width - 40, height / 2);
    context.strokeStyle = "#000";
    context.lineWidth = 1;
    context.stroke();

    // Draw ticks and labels
    g.selectAll(".tick").each((d, i, nodes) => {
      const tick = nodes[i];
      const x = parseFloat(tick.getAttribute("transform").split("(")[1]);

      // Draw tick line
      context.beginPath();
      context.moveTo(x, height / 2 - 6);
      context.lineTo(x, height / 2 + 6);
      context.strokeStyle = "#000";
      context.lineWidth = 1;
      context.stroke();

      // Draw tick label
      context.save();
      context.translate(x, height / 2 + 8);
      context.rotate(Math.PI / 4); // Rotate labels for better readability
      context.textAlign = "start";
      context.textBaseline = "middle";
      context.fillStyle = "#000";
      context.font = "12px Arial";
      context.fillText(d3.timeFormat("%b %Y")(d), 0, 0);
      context.restore();
    });
  }, [width, height, startDate, endDate]);

  return (
    <div style={{ paddingBottom: "20px" }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default TimeAxis;
