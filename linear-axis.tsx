import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const LinearAxis = ({ width = 400, height = 60 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set up scale for high-DPI displays
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.scale(pixelRatio, pixelRatio);

    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Create scale
    const scale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([30, width - 30]);

    // Create axis
    const axis = d3.axisBottom(scale);

    // Create a temporary SVG to compute the axis path
    const svg = d3.create("svg").attr("width", width).attr("height", height);

    const g = svg.append("g").attr("transform", `translate(0,${height / 2})`);

    axis(g);

    // Draw axis line
    context.beginPath();
    context.moveTo(30, height / 2);
    context.lineTo(width - 30, height / 2);
    context.strokeStyle = "#000";
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
      context.stroke();

      // Draw tick label
      context.textAlign = "center";
      context.textBaseline = "top";
      context.fillStyle = "#000";
      context.fillText(d, x, height / 2 + 8);
    });
  }, [width, height]);

  return <canvas ref={canvasRef} />;
};

export default LinearAxis;
