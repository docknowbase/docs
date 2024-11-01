import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const ColorScale = ({
  width = 600,
  height = 200,
  type = "sequential", // 'sequential', 'diverging', 'categorical'
  domain = [0, 100],
  colors = {
    sequential: ["#fee5d9", "#fcae91", "#fb6a4a", "#de2d26", "#a50f15"],
    diverging: ["#2166ac", "#92c5de", "#f7f7f7", "#f4a582", "#b2182b"],
    categorical: d3.schemeCategory10,
  },
  showLabels = true,
  steps = 20, // Number of steps for continuous scales
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

    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create appropriate color scale based on type
    let colorScale;
    let values;

    switch (type) {
      case "sequential":
        colorScale = d3.scaleLinear().domain(domain).range(colors.sequential);
        values = d3.range(
          domain[0],
          domain[1],
          (domain[1] - domain[0]) / steps
        );
        break;

      case "diverging":
        colorScale = d3
          .scaleLinear()
          .domain([domain[0], (domain[0] + domain[1]) / 2, domain[1]])
          .range(colors.diverging);
        values = d3.range(
          domain[0],
          domain[1],
          (domain[1] - domain[0]) / steps
        );
        break;

      case "categorical":
        colorScale = d3.scaleOrdinal().domain(domain).range(colors.categorical);
        values = domain;
        break;
    }

    // Create scale for positioning
    const xScale = d3
      .scaleLinear()
      .domain(domain)
      .range([margin.left, width - margin.right]);

    // Draw title
    context.textAlign = "center";
    context.textBaseline = "top";
    context.fillStyle = "#000";
    context.font = "bold 14px Arial";
    context.fillText(
      `${type.charAt(0).toUpperCase() + type.slice(1)} Color Scale`,
      width / 2,
      10
    );

    // Draw color blocks
    if (type === "categorical") {
      const blockWidth = innerWidth / values.length;
      values.forEach((value, i) => {
        const x = margin.left + i * blockWidth;

        // Draw color block
        context.fillStyle = colorScale(value);
        context.fillRect(x, margin.top, blockWidth, innerHeight);

        // Draw border
        context.strokeStyle = "#fff";
        context.lineWidth = 1;
        context.strokeRect(x, margin.top, blockWidth, innerHeight);

        if (showLabels) {
          // Draw label
          context.save();
          context.translate(x + blockWidth / 2, margin.top + innerHeight + 15);
          context.textAlign = "center";
          context.textBaseline = "top";
          context.fillStyle = "#000";
          context.font = "12px Arial";
          context.fillText(value.toString(), 0, 0);
          context.restore();
        }
      });
    } else {
      // Draw continuous gradient
      const blockWidth = innerWidth / steps;
      values.forEach((value, i) => {
        const x = margin.left + i * blockWidth;

        // Draw gradient block
        context.fillStyle = colorScale(value);
        context.fillRect(x, margin.top, blockWidth + 1, innerHeight); // +1 to avoid gaps
      });

      // Draw border around gradient
      context.strokeStyle = "#000";
      context.lineWidth = 1;
      context.strokeRect(margin.left, margin.top, innerWidth, innerHeight);

      if (showLabels) {
        // Draw axis for continuous scales
        const numLabels = 5;
        for (let i = 0; i < numLabels; i++) {
          const value =
            domain[0] + (i * (domain[1] - domain[0])) / (numLabels - 1);
          const x = xScale(value);

          // Draw tick
          context.beginPath();
          context.moveTo(x, margin.top + innerHeight);
          context.lineTo(x, margin.top + innerHeight + 5);
          context.strokeStyle = "#000";
          context.stroke();

          // Draw label
          context.save();
          context.translate(x, margin.top + innerHeight + 15);
          context.textAlign = "center";
          context.textBaseline = "top";
          context.fillStyle = "#000";
          context.font = "12px Arial";
          context.fillText(value.toFixed(1), 0, 0);
          context.restore();
        }
      }
    }

    // Draw legend title
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.fillStyle = "#000";
    context.font = "12px Arial";
    context.fillText("Value →", margin.left, margin.top - 15);
  }, [width, height, type, domain, colors, showLabels, steps]);

  return <canvas ref={canvasRef} />;
};

export default ColorScale;
