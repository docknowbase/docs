import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const BandAxis = ({
  width = 600,
  height = 80,
  data = ["Category A", "Category B", "Category C", "Category D", "Category E"],
  padding = 0.2, // Space between bands
  alignment = "center", // 'start', 'center', or 'end'
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

    // Create band scale
    const bandScale = d3
      .scaleBand()
      .domain(data)
      .range([40, width - 40])
      .padding(padding);

    // Create axis
    const bandAxis = d3.axisBottom(bandScale);

    // Create temporary SVG to compute axis path
    const svg = d3.create("svg").attr("width", width).attr("height", height);

    const g = svg.append("g").attr("transform", `translate(0,${height / 2})`);

    bandAxis(g);

    // Draw main axis line
    context.beginPath();
    context.moveTo(40, height / 2);
    context.lineTo(width - 40, height / 2);
    context.strokeStyle = "#000";
    context.lineWidth = 1;
    context.stroke();

    // Draw bands with alternating background
    data.forEach((category, i) => {
      const x = bandScale(category);
      const bandWidth = bandScale.bandwidth();

      // Draw band background (alternating)
      context.fillStyle = i % 2 === 0 ? "#f8f8f8" : "#f0f0f0";
      context.fillRect(x, height / 2 - 20, bandWidth, 20);

      // Draw band borders
      context.beginPath();
      context.strokeStyle = "#ddd";
      context.lineWidth = 1;
      context.rect(x, height / 2 - 20, bandWidth, 20);
      context.stroke();
    });

    // Draw ticks and labels
    g.selectAll(".tick").each((d, i, nodes) => {
      const tick = nodes[i];
      let x = parseFloat(tick.getAttribute("transform").split("(")[1]);

      if (alignment === "center") {
        x += bandScale.bandwidth() / 2;
      } else if (alignment === "end") {
        x += bandScale.bandwidth();
      }

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
      context.fillText(d, 0, 0);
      context.restore();

      // Draw band width indicator
      const bandWidth = bandScale.bandwidth();
      if (i < data.length) {
        // Draw small markers at band edges
        context.beginPath();
        context.moveTo(x - bandWidth / 2, height / 2 - 15);
        context.lineTo(x - bandWidth / 2, height / 2 - 10);
        context.moveTo(x + bandWidth / 2, height / 2 - 15);
        context.lineTo(x + bandWidth / 2, height / 2 - 10);
        context.strokeStyle = "#666";
        context.lineWidth = 0.5;
        context.stroke();

        // Draw width indicator line
        context.beginPath();
        context.moveTo(x - bandWidth / 2, height / 2 - 12);
        context.lineTo(x + bandWidth / 2, height / 2 - 12);
        context.stroke();
      }
    });
  }, [width, height, data, padding, alignment]);

  return (
    <div style={{ paddingBottom: "20px" }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default BandAxis;
