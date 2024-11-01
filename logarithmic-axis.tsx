import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const LogAxis = ({
  width = 600,
  height = 60,
  domain = [1, 1000000], // Default domain from 1 to 1M
  base = 10, // Default base for log scale
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

    // Create logarithmic scale
    const logScale = d3
      .scaleLog()
      .domain(domain)
      .base(base)
      .range([40, width - 40]);

    // Create axis with appropriate tick formatting
    const logAxis = d3.axisBottom(logScale).tickFormat((d) => {
      const log = Math.log(d) / Math.log(base);
      if (Math.abs(Math.round(log) - log) < 1e-6) {
        return base === 10
          ? `10${d3.format("d")(log)}`
          : `${base}${d3.format("d")(log)}`;
      }
      return "";
    });

    // Create temporary SVG to compute axis path
    const svg = d3.create("svg").attr("width", width).attr("height", height);

    const g = svg.append("g").attr("transform", `translate(0,${height / 2})`);

    logAxis(g);

    // Draw main axis line
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

      // Draw major tick lines
      const log = Math.log(d) / Math.log(base);
      const isMajorTick = Math.abs(Math.round(log) - log) < 1e-6;

      const tickHeight = isMajorTick ? 6 : 4;

      context.beginPath();
      context.moveTo(x, height / 2 - tickHeight);
      context.lineTo(x, height / 2 + tickHeight);
      context.strokeStyle = "#000";
      context.lineWidth = isMajorTick ? 1 : 0.5;
      context.stroke();

      // Draw labels for major ticks only
      if (isMajorTick) {
        context.save();
        context.translate(x, height / 2 + 8);
        context.textAlign = "center";
        context.textBaseline = "top";
        context.fillStyle = "#000";
        context.font = "12px Arial";
        const label =
          base === 10
            ? `10${d3.format("d")(log)}`
            : `${base}${d3.format("d")(log)}`;
        context.fillText(label, 0, 0);
        context.restore();
      }

      // Draw minor ticks between major ticks
      if (isMajorTick && i < nodes.length - 1) {
        const nextTick = nodes[i + 1];
        const nextX = parseFloat(
          nextTick.getAttribute("transform").split("(")[1]
        );

        // Draw minor ticks
        for (let j = 2; j < base; j++) {
          const minorX = logScale(d * j);
          if (minorX < nextX) {
            context.beginPath();
            context.moveTo(minorX, height / 2 - 3);
            context.lineTo(minorX, height / 2 + 3);
            context.strokeStyle = "#000";
            context.lineWidth = 0.5;
            context.stroke();
          }
        }
      }
    });
  }, [width, height, domain, base]);

  return <canvas ref={canvasRef} />;
};

export default LogAxis;
