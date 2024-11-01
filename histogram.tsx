import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const HistogramChart = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Generate sample data
    const data = d3.range(1000).map(d3.randomNormal(50, 15));

    // Chart dimensions
    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);

    // Create histogram generator
    const histogram = d3.histogram().domain(d3.extent(data)).thresholds(40);

    // Generate bins
    const bins = histogram(data);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([bins[0].x0, bins[bins.length - 1].x1])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (d) => d.length)])
      .range([height - margin.bottom, margin.top]);

    // Draw axes
    const drawAxes = () => {
      // X-axis
      context.beginPath();
      context.moveTo(margin.left, height - margin.bottom);
      context.lineTo(width - margin.right, height - margin.bottom);
      context.stroke();

      // Y-axis
      context.beginPath();
      context.moveTo(margin.left, margin.top);
      context.lineTo(margin.left, height - margin.bottom);
      context.stroke();

      // X-axis ticks
      const xTicks = xScale.ticks(10);
      xTicks.forEach((tick) => {
        context.beginPath();
        context.moveTo(xScale(tick), height - margin.bottom);
        context.lineTo(xScale(tick), height - margin.bottom + 5);
        context.stroke();

        context.fillStyle = "#000";
        context.textAlign = "center";
        context.textBaseline = "top";
        context.fillText(
          tick.toFixed(1),
          xScale(tick),
          height - margin.bottom + 10
        );
      });

      // Y-axis ticks
      const yTicks = yScale.ticks(10);
      yTicks.forEach((tick) => {
        context.beginPath();
        context.moveTo(margin.left - 5, yScale(tick));
        context.lineTo(margin.left, yScale(tick));
        context.stroke();

        context.fillStyle = "#000";
        context.textAlign = "right";
        context.textBaseline = "middle";
        context.fillText(tick.toString(), margin.left - 10, yScale(tick));
      });

      // Axis labels
      context.fillStyle = "#000";
      context.textAlign = "center";
      context.textBaseline = "bottom";
      context.font = "14px Arial";
      context.fillText("Value", width / 2, height - 5);

      context.save();
      context.translate(15, height / 2);
      context.rotate(-Math.PI / 2);
      context.textAlign = "center";
      context.textBaseline = "bottom";
      context.fillText("Frequency", 0, 0);
      context.restore();

      // Title
      context.fillStyle = "#000";
      context.textAlign = "center";
      context.textBaseline = "top";
      context.font = "bold 16px Arial";
      context.fillText("Distribution Histogram", width / 2, 10);
    };

    // Draw histogram bars
    const drawBars = () => {
      bins.forEach((bin) => {
        const x = xScale(bin.x0);
        const y = yScale(bin.length);
        const width = xScale(bin.x1) - xScale(bin.x0) - 1;
        const height = yScale(0) - yScale(bin.length);

        context.beginPath();
        context.rect(x, y, width, height);
        context.fillStyle = "#69b3a2";
        context.fill();
        context.strokeStyle = "#fff";
        context.stroke();
      });
    };

    // Add grid lines
    const drawGrid = () => {
      const yTicks = yScale.ticks(10);

      context.beginPath();
      context.strokeStyle = "#e0e0e0";
      context.lineWidth = 0.5;

      yTicks.forEach((tick) => {
        context.moveTo(margin.left, yScale(tick));
        context.lineTo(width - margin.right, yScale(tick));
      });

      context.stroke();
    };

    // Draw everything
    drawGrid();
    drawBars();
    drawAxes();
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

export default HistogramChart;
