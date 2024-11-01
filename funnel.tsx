import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const FunnelChart = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Sample data
    const data = [
      { stage: "Visits", value: 5000 },
      { stage: "Cart", value: 2500 },
      { stage: "Checkout", value: 1200 },
      { stage: "Purchase", value: 600 },
      { stage: "Repeat", value: 200 },
    ];

    // Setup dimensions
    const width = 800;
    const height = 500;
    const margin = { top: 40, right: 200, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    context.translate(margin.left, margin.top);

    // Calculate percentages and additional metrics
    const maxValue = d3.max(data, (d) => d.value);
    data.forEach((d, i) => {
      d.percentage = (d.value / maxValue) * 100;
      if (i < data.length - 1) {
        d.dropoff = d.value - data[i + 1].value;
        d.dropoffPercentage = (d.dropoff / d.value) * 100;
      }
    });

    // Create scales
    const yScale = d3
      .scaleLinear()
      .domain([0, data.length - 1])
      .range([0, innerHeight]);

    const widthScale = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([0, innerWidth]);

    // Color scale
    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([data.length - 1, 0]);

    // Draw funnel
    const drawFunnel = () => {
      data.forEach((d, i) => {
        const y = yScale(i);
        const nextY = yScale(i + 1);
        const width = widthScale(d.value);
        const nextWidth =
          i < data.length - 1
            ? widthScale(data[i + 1].value)
            : widthScale(data[data.length - 1].value);
        const height = innerHeight / data.length;

        // Draw trapezoid
        context.beginPath();
        context.moveTo((innerWidth - width) / 2, y);
        context.lineTo((innerWidth - width) / 2 + width, y);
        context.lineTo((innerWidth - nextWidth) / 2 + nextWidth, y + height);
        context.lineTo((innerWidth - nextWidth) / 2, y + height);
        context.closePath();

        // Fill with gradient
        const gradient = context.createLinearGradient(
          (innerWidth - width) / 2,
          y,
          (innerWidth - width) / 2 + width,
          y
        );
        gradient.addColorStop(0, d3.color(colorScale(i)).brighter(0.5));
        gradient.addColorStop(1, colorScale(i));

        context.fillStyle = gradient;
        context.fill();

        // Add stroke
        context.strokeStyle = "#fff";
        context.stroke();

        // Add stage label
        context.fillStyle = "#000";
        context.textAlign = "right";
        context.textBaseline = "middle";
        context.font = "14px Arial";
        context.fillText(
          d.stage,
          (innerWidth - width) / 2 - 10,
          y + height / 2
        );

        // Add value and percentage on the right
        context.textAlign = "left";
        context.fillText(
          `${d.value.toLocaleString()} (${d.percentage.toFixed(1)}%)`,
          innerWidth + 20,
          y + height / 2
        );

        // Add dropoff information
        if (i < data.length - 1) {
          context.font = "12px Arial";
          context.fillStyle = "#666";
          context.fillText(
            `→ ${d.dropoff.toLocaleString()} drop (-${d.dropoffPercentage.toFixed(
              1
            )}%)`,
            innerWidth + 20,
            y + height / 2 + 20
          );
        }
      });
    };

    // Draw title
    const drawTitle = () => {
      context.fillStyle = "#000";
      context.font = "bold 16px Arial";
      context.textAlign = "center";
      context.textBaseline = "top";
      context.fillText("Sales Funnel Analysis", innerWidth / 2, -30);
    };

    // Draw conversion rate
    const drawConversionRate = () => {
      const overallConversion =
        (data[data.length - 1].value / data[0].value) * 100;
      context.fillStyle = "#666";
      context.font = "14px Arial";
      context.textAlign = "center";
      context.fillText(
        `Overall Conversion Rate: ${overallConversion.toFixed(1)}%`,
        innerWidth / 2,
        innerHeight + 30
      );
    };

    // Draw guides
    const drawGuides = () => {
      context.beginPath();
      context.strokeStyle = "#ddd";
      context.setLineDash([5, 5]);

      data.forEach((d, i) => {
        const y = yScale(i);
        const width = widthScale(d.value);

        // Vertical guides
        context.moveTo((innerWidth - width) / 2, y);
        context.lineTo((innerWidth - width) / 2, y - 5);
        context.moveTo((innerWidth - width) / 2 + width, y);
        context.lineTo((innerWidth - width) / 2 + width, y - 5);
      });

      context.stroke();
      context.setLineDash([]);
    };

    // Clear and draw everything
    context.clearRect(-margin.left, -margin.top, width, height);
    drawGuides();
    drawFunnel();
    drawTitle();
    drawConversionRate();
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

export default FunnelChart;
