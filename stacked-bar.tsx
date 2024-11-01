import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const StackedBarChart = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Sample data
    const data = [
      { year: "2020", product: 20, service: 30, consulting: 15 },
      { year: "2021", product: 25, service: 35, consulting: 20 },
      { year: "2022", product: 30, service: 25, consulting: 25 },
      { year: "2023", product: 35, service: 30, consulting: 30 },
    ];

    // Setup dimensions
    const width = 800;
    const height = 500;
    const margin = { top: 40, right: 100, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);

    // Get keys for stacking
    const keys = ["product", "service", "consulting"];

    // Create the stack generator
    const stack = d3.stack().keys(keys);
    const series = stack(data);

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.year))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const yMax = d3.max(series, (layer) => d3.max(layer, (d) => d[1]));
    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .range([height - margin.bottom, margin.top]);

    // Color scale
    const colorScale = d3
      .scaleOrdinal()
      .domain(keys)
      .range(["#458588", "#b16286", "#98971a"]);

    // Draw axes
    const drawAxes = () => {
      // X-axis
      context.beginPath();
      context.moveTo(margin.left, height - margin.bottom);
      context.lineTo(width - margin.right, height - margin.bottom);
      context.strokeStyle = "#000";
      context.stroke();

      // Y-axis
      context.beginPath();
      context.moveTo(margin.left, margin.top);
      context.lineTo(margin.left, height - margin.bottom);
      context.stroke();

      // X-axis labels
      context.textAlign = "center";
      context.textBaseline = "top";
      context.fillStyle = "#000";
      data.forEach((d) => {
        context.fillText(
          d.year,
          xScale(d.year) + xScale.bandwidth() / 2,
          height - margin.bottom + 20
        );
      });

      // Y-axis ticks and labels
      const yTicks = yScale.ticks(10);
      context.textAlign = "right";
      context.textBaseline = "middle";
      yTicks.forEach((tick) => {
        context.beginPath();
        context.moveTo(margin.left - 5, yScale(tick));
        context.lineTo(margin.left, yScale(tick));
        context.stroke();
        context.fillText(tick.toString(), margin.left - 10, yScale(tick));

        // Grid lines
        context.beginPath();
        context.strokeStyle = "#e0e0e0";
        context.moveTo(margin.left, yScale(tick));
        context.lineTo(width - margin.right, yScale(tick));
        context.stroke();
      });

      // Axis labels
      context.save();
      context.translate(15, height / 2);
      context.rotate(-Math.PI / 2);
      context.textAlign = "center";
      context.font = "14px Arial";
      context.fillText("Value", 0, 0);
      context.restore();

      // Title
      context.textAlign = "center";
      context.textBaseline = "top";
      context.font = "bold 16px Arial";
      context.fillText("Revenue by Category", width / 2, 10);

      // Legend
      const legendX = width - margin.right + 40;
      const legendY = margin.top;
      keys.forEach((key, i) => {
        const y = legendY + i * 25;

        // Legend color box
        context.fillStyle = colorScale(key);
        context.fillRect(legendX, y, 15, 15);

        // Legend text
        context.fillStyle = "#000";
        context.textAlign = "left";
        context.textBaseline = "middle";
        context.font = "12px Arial";
        context.fillText(
          key.charAt(0).toUpperCase() + key.slice(1),
          legendX + 25,
          y + 7
        );
      });
    };

    // Draw bars
    const drawBars = () => {
      series.forEach((layer) => {
        context.fillStyle = colorScale(layer.key);

        layer.forEach((d) => {
          const x = xScale(d.data.year);
          const y = yScale(d[1]);
          const height = yScale(d[0]) - yScale(d[1]);
          const width = xScale.bandwidth();

          context.fillRect(x, y, width, height);
          context.strokeStyle = "#fff";
          context.strokeRect(x, y, width, height);
        });
      });
    };

    // Draw chart
    drawAxes();
    drawBars();
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto"
        style={{ touchAction: "none" }}
      />
    </div>
  );
};

export default StackedBarChart;
