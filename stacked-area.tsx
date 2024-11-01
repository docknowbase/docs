import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const StackedAreaChart = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Sample data
    const data = [
      { date: "2020-01", mobile: 30, desktop: 50, tablet: 20 },
      { date: "2020-02", mobile: 35, desktop: 45, tablet: 25 },
      { date: "2020-03", mobile: 40, desktop: 40, tablet: 30 },
      { date: "2020-04", mobile: 45, desktop: 35, tablet: 35 },
      { date: "2020-05", mobile: 50, desktop: 30, tablet: 40 },
      { date: "2020-06", mobile: 55, desktop: 25, tablet: 45 },
      { date: "2020-07", mobile: 60, desktop: 20, tablet: 50 },
    ];

    // Setup dimensions
    const width = 900;
    const height = 500;
    const margin = { top: 40, right: 120, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    context.translate(margin.left, margin.top);

    // Get keys for stacking
    const keys = ["mobile", "desktop", "tablet"];

    // Create the stack generator
    const stack = d3.stack().keys(keys);
    const series = stack(data);

    // Parse dates
    const parseDate = d3.timeParse("%Y-%m");
    const dates = data.map((d) => parseDate(d.date));

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(dates))
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(series, (layer) => d3.max(layer, (d) => d[1]))])
      .range([innerHeight, 0]);

    // Color scale
    const colorScale = d3
      .scaleOrdinal()
      .domain(keys)
      .range(["#ff7f0e", "#1f77b4", "#2ca02c"]);

    // Draw axes
    const drawAxes = () => {
      // X-axis
      context.beginPath();
      context.strokeStyle = "#000";
      context.moveTo(0, innerHeight);
      context.lineTo(innerWidth, innerHeight);
      context.stroke();

      // X-axis ticks and labels
      const xTicks = xScale.ticks(7);
      const formatDate = d3.timeFormat("%b %Y");
      xTicks.forEach((tick) => {
        const x = xScale(tick);

        // Draw tick
        context.beginPath();
        context.moveTo(x, innerHeight);
        context.lineTo(x, innerHeight + 5);
        context.stroke();

        // Draw label
        context.save();
        context.translate(x, innerHeight + 20);
        context.rotate((-45 * Math.PI) / 180);
        context.textAlign = "right";
        context.fillText(formatDate(tick), 0, 0);
        context.restore();
      });

      // Y-axis
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(0, innerHeight);
      context.stroke();

      // Y-axis ticks and labels
      const yTicks = yScale.ticks(10);
      yTicks.forEach((tick) => {
        // Draw tick
        context.beginPath();
        context.moveTo(-5, yScale(tick));
        context.lineTo(0, yScale(tick));
        context.stroke();

        // Draw gridline
        context.beginPath();
        context.strokeStyle = "#e0e0e0";
        context.moveTo(0, yScale(tick));
        context.lineTo(innerWidth, yScale(tick));
        context.stroke();

        // Draw label
        context.fillStyle = "#000";
        context.textAlign = "right";
        context.textBaseline = "middle";
        context.fillText(tick.toString(), -10, yScale(tick));
      });

      // Axis labels
      context.save();
      context.translate(-40, innerHeight / 2);
      context.rotate(-Math.PI / 2);
      context.textAlign = "center";
      context.fillText("Value", 0, 0);
      context.restore();

      // Title
      context.textAlign = "center";
      context.textBaseline = "top";
      context.font = "bold 16px Arial";
      context.fillText("Device Usage Over Time", innerWidth / 2, -20);
    };

    // Draw area
    const drawAreas = () => {
      series.forEach((layer, i) => {
        context.beginPath();
        context.fillStyle = colorScale(layer.key);
        context.globalAlpha = 0.8;

        layer.forEach((point, j) => {
          const x = xScale(parseDate(point.data.date));
          const y0 = yScale(point[0]);
          const y1 = yScale(point[1]);

          if (j === 0) {
            context.moveTo(x, y1);
          } else {
            const xPrev = xScale(parseDate(layer[j - 1].data.date));
            const y1Prev = yScale(layer[j - 1][1]);

            // Control points for curve
            const cp1x = xPrev + (x - xPrev) / 3;
            const cp1y = y1Prev;
            const cp2x = xPrev + ((x - xPrev) * 2) / 3;
            const cp2y = y1;

            context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y1);
          }
        });

        // Draw bottom curve in reverse
        for (let j = layer.length - 1; j >= 0; j--) {
          const x = xScale(parseDate(layer[j].data.date));
          const y0 = yScale(layer[j][0]);

          if (j === layer.length - 1) {
            context.lineTo(x, y0);
          } else {
            const xNext = xScale(parseDate(layer[j + 1].data.date));
            const y0Next = yScale(layer[j + 1][0]);

            // Control points for curve
            const cp1x = xNext - (xNext - x) / 3;
            const cp1y = y0Next;
            const cp2x = xNext - ((xNext - x) * 2) / 3;
            const cp2y = y0;

            context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y0);
          }
        }

        context.closePath();
        context.fill();
        context.strokeStyle = "rgba(255,255,255,0.3)";
        context.stroke();
      });
    };

    // Draw legend
    const drawLegend = () => {
      const legendX = innerWidth + 20;
      const legendY = 0;
      const boxSize = 15;
      const spacing = 25;

      keys.forEach((key, i) => {
        // Draw color box
        context.fillStyle = colorScale(key);
        context.fillRect(legendX, legendY + i * spacing, boxSize, boxSize);
        context.strokeStyle = "#000";
        context.strokeRect(legendX, legendY + i * spacing, boxSize, boxSize);

        // Draw label
        context.fillStyle = "#000";
        context.textAlign = "left";
        context.textBaseline = "middle";
        context.fillText(
          key.charAt(0).toUpperCase() + key.slice(1),
          legendX + boxSize + 10,
          legendY + i * spacing + boxSize / 2
        );
      });
    };

    // Clear and draw everything
    context.clearRect(-margin.left, -margin.top, width, height);
    drawAreas();
    drawAxes();
    drawLegend();
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

export default StackedAreaChart;
