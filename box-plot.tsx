import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const BoxPlot = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Sample data - multiple sets of observations
    const data = {
      "Group A": [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
      "Group B": [5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33],
      "Group C": [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29],
      "Group D": [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32],
    };

    // Setup dimensions
    const width = 800;
    const height = 500;
    const margin = { top: 40, right: 60, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    context.translate(margin.left, margin.top);

    // Calculate statistics for each group
    const boxPlotData = Object.entries(data).map(([group, values]) => {
      const sorted = values.sort(d3.ascending);
      const q1 = d3.quantile(sorted, 0.25);
      const median = d3.quantile(sorted, 0.5);
      const q3 = d3.quantile(sorted, 0.75);
      const iqr = q3 - q1;
      const min = Math.max(d3.min(sorted), q1 - 1.5 * iqr);
      const max = Math.min(d3.max(sorted), q3 + 1.5 * iqr);
      const outliers = sorted.filter((d) => d < min || d > max);

      return {
        group,
        min,
        q1,
        median,
        q3,
        max,
        outliers,
      };
    });

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(Object.keys(data))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(Object.values(data).flat()),
        d3.max(Object.values(data).flat()),
      ])
      .range([innerHeight, 0])
      .nice();

    // Draw axes
    const drawAxes = () => {
      // X-axis
      context.beginPath();
      context.moveTo(0, innerHeight);
      context.lineTo(innerWidth, innerHeight);
      context.strokeStyle = "#000";
      context.stroke();

      // X-axis labels
      context.textAlign = "center";
      context.textBaseline = "top";
      context.fillStyle = "#000";
      context.font = "12px Arial";
      boxPlotData.forEach((d) => {
        context.fillText(
          d.group,
          xScale(d.group) + xScale.bandwidth() / 2,
          innerHeight + 20
        );
      });

      // Y-axis
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(0, innerHeight);
      context.stroke();

      // Y-axis ticks and labels
      const yTicks = yScale.ticks(10);
      yTicks.forEach((tick) => {
        context.beginPath();
        context.moveTo(-5, yScale(tick));
        context.lineTo(0, yScale(tick));
        context.stroke();

        // Grid lines
        context.beginPath();
        context.strokeStyle = "#e0e0e0";
        context.moveTo(0, yScale(tick));
        context.lineTo(innerWidth, yScale(tick));
        context.stroke();

        context.fillStyle = "#000";
        context.textAlign = "right";
        context.textBaseline = "middle";
        context.fillText(tick.toString(), -10, yScale(tick));
      });

      // Title
      context.fillStyle = "#000";
      context.font = "bold 16px Arial";
      context.textAlign = "center";
      context.textBaseline = "top";
      context.fillText("Distribution by Group", innerWidth / 2, -30);

      // Y-axis label
      context.save();
      context.translate(-60, innerHeight / 2);
      context.rotate(-Math.PI / 2);
      context.textAlign = "center";
      context.textBaseline = "bottom";
      context.font = "14px Arial";
      context.fillText("Value", 0, 0);
      context.restore();
    };

    // Draw box plots
    const drawBoxPlots = () => {
      boxPlotData.forEach((d) => {
        const boxWidth = xScale.bandwidth();
        const x = xScale(d.group);
        const boxX = x;

        // Box
        context.fillStyle = "#69b3a2";
        context.globalAlpha = 0.8;
        context.fillRect(
          boxX,
          yScale(d.q3),
          boxWidth,
          yScale(d.q1) - yScale(d.q3)
        );

        // Median line
        context.beginPath();
        context.moveTo(boxX, yScale(d.median));
        context.lineTo(boxX + boxWidth, yScale(d.median));
        context.strokeStyle = "#000";
        context.lineWidth = 2;
        context.stroke();

        // Whiskers
        context.beginPath();
        context.moveTo(boxX + boxWidth / 2, yScale(d.q3));
        context.lineTo(boxX + boxWidth / 2, yScale(d.max));
        context.moveTo(boxX + boxWidth / 2, yScale(d.q1));
        context.lineTo(boxX + boxWidth / 2, yScale(d.min));
        context.strokeStyle = "#000";
        context.lineWidth = 1;
        context.stroke();

        // Whisker ends
        context.beginPath();
        context.moveTo(boxX + boxWidth / 4, yScale(d.max));
        context.lineTo(boxX + (3 * boxWidth) / 4, yScale(d.max));
        context.moveTo(boxX + boxWidth / 4, yScale(d.min));
        context.lineTo(boxX + (3 * boxWidth) / 4, yScale(d.min));
        context.stroke();

        // Box border
        context.strokeRect(
          boxX,
          yScale(d.q3),
          boxWidth,
          yScale(d.q1) - yScale(d.q3)
        );

        // Outliers
        context.fillStyle = "#000";
        d.outliers.forEach((outlier) => {
          context.beginPath();
          context.arc(boxX + boxWidth / 2, yScale(outlier), 3, 0, 2 * Math.PI);
          context.fill();
        });
      });
    };

    // Clear and draw everything
    context.clearRect(-margin.left, -margin.top, width, height);
    drawAxes();
    drawBoxPlots();
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

export default BoxPlot;
