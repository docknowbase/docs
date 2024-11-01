import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const ViolinPlot = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Sample data - multiple sets of observations
    const data = {
      "Group A": [2, 4, 4, 4, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 9],
      "Group B": [3, 4, 4, 5, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9],
      "Group C": [1, 2, 2, 3, 3, 4, 5, 5, 6, 6, 7, 8, 8, 9, 9, 10],
      "Group D": [2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9],
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

    // Kernel density estimation function
    const kde = (kernel, thresholds, data) => {
      return thresholds.map((t) => [t, d3.mean(data, (d) => kernel(t - d))]);
    };

    // Epanechnikov kernel function
    const epanechnikov = (bandwidth) => (x) =>
      Math.abs((x /= bandwidth)) <= 1 ? (0.75 * (1 - x * x)) / bandwidth : 0;

    // Calculate violin data for each group
    const violinData = Object.entries(data).map(([group, values]) => {
      const min = d3.min(values);
      const max = d3.max(values);
      const q1 = d3.quantile(values, 0.25);
      const q2 = d3.quantile(values, 0.5);
      const q3 = d3.quantile(values, 0.75);

      // Generate density data
      const thresholds = d3.range(min, max, (max - min) / 40);
      const density = kde(epanechnikov(2), thresholds, values);
      const densityMax = d3.max(density, (d) => d[1]);

      return {
        group,
        min,
        max,
        q1,
        q2,
        q3,
        density,
        densityMax,
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
      violinData.forEach((d) => {
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

    // Draw violins
    const drawViolins = () => {
      violinData.forEach((d) => {
        const bandwidth = xScale.bandwidth() / 2;
        const x = xScale(d.group) + bandwidth;

        // Draw violin shape
        context.beginPath();
        d.density.forEach(([y, density], i) => {
          const xPos = x + (density / d.densityMax) * bandwidth;
          const yPos = yScale(y);
          if (i === 0) {
            context.moveTo(xPos, yPos);
          } else {
            context.lineTo(xPos, yPos);
          }
        });

        // Draw mirror side
        d.density.reverse().forEach(([y, density]) => {
          const xPos = x - (density / d.densityMax) * bandwidth;
          const yPos = yScale(y);
          context.lineTo(xPos, yPos);
        });

        context.closePath();
        context.fillStyle = "rgba(105, 179, 162, 0.6)";
        context.fill();
        context.strokeStyle = "rgba(105, 179, 162, 0.9)";
        context.stroke();

        // Draw box plot inside violin
        const boxWidth = bandwidth * 0.2;

        // Draw median line
        context.beginPath();
        context.moveTo(x - boxWidth, yScale(d.q2));
        context.lineTo(x + boxWidth, yScale(d.q2));
        context.strokeStyle = "#000";
        context.lineWidth = 2;
        context.stroke();

        // Draw box
        context.beginPath();
        context.rect(
          x - boxWidth,
          yScale(d.q3),
          boxWidth * 2,
          yScale(d.q1) - yScale(d.q3)
        );
        context.fillStyle = "rgba(255, 255, 255, 0.7)";
        context.fill();
        context.strokeStyle = "#000";
        context.lineWidth = 1;
        context.stroke();

        // Draw whiskers
        context.beginPath();
        context.moveTo(x, yScale(d.q3));
        context.lineTo(x, yScale(d.max));
        context.moveTo(x, yScale(d.q1));
        context.lineTo(x, yScale(d.min));
        context.stroke();

        // Draw whisker ends
        context.beginPath();
        context.moveTo(x - boxWidth / 2, yScale(d.max));
        context.lineTo(x + boxWidth / 2, yScale(d.max));
        context.moveTo(x - boxWidth / 2, yScale(d.min));
        context.lineTo(x + boxWidth / 2, yScale(d.min));
        context.stroke();
      });
    };

    // Clear and draw everything
    context.clearRect(-margin.left, -margin.top, width, height);
    drawAxes();
    drawViolins();
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

export default ViolinPlot;
