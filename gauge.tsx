import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const GaugeChart = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Configuration
    const width = 500;
    const height = 300;
    const margin = 40;
    const value = 67; // Current value
    const minValue = 0;
    const maxValue = 100;

    // Gauge configuration
    const radius = Math.min(width, height * 2) / 2;
    const startAngle = -Math.PI * 0.75; // -135 degrees
    const endAngle = Math.PI * 0.75; // 135 degrees
    const angleRange = endAngle - startAngle;
    const centerX = width / 2;
    const centerY = height - margin;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);

    // Create scale for values to angles
    const valueScale = d3
      .scaleLinear()
      .domain([minValue, maxValue])
      .range([0, 1]);

    // Color scale for the gauge
    const colorScale = d3
      .scaleSequential(d3.interpolateRdYlGn)
      .domain([0, 100]);

    // Draw gauge background
    const drawGaugeBackground = () => {
      const segments = 100;
      const segmentAngle = angleRange / segments;

      for (let i = 0; i <= segments; i++) {
        const angle = startAngle + i * segmentAngle;
        const nextAngle = angle + segmentAngle;

        context.beginPath();
        context.arc(centerX, centerY, radius, angle, nextAngle);
        context.lineWidth = radius * 0.2;
        context.strokeStyle = colorScale(i);
        context.stroke();
      }

      // Draw inner white circle
      context.beginPath();
      context.arc(centerX, centerY, radius * 0.75, 0, 2 * Math.PI);
      context.fillStyle = "#fff";
      context.fill();
    };

    // Draw gauge ticks and labels
    const drawTicks = () => {
      const tickCount = 10;
      const tickLength = radius * 0.15;

      for (let i = 0; i <= tickCount; i++) {
        const value = minValue + i * ((maxValue - minValue) / tickCount);
        const angle = startAngle + valueScale(value) * angleRange;

        // Draw tick
        context.beginPath();
        context.moveTo(
          centerX + Math.cos(angle) * (radius - tickLength),
          centerY + Math.sin(angle) * (radius - tickLength)
        );
        context.lineTo(
          centerX + Math.cos(angle) * radius,
          centerY + Math.sin(angle) * radius
        );
        context.lineWidth = 2;
        context.strokeStyle = "#666";
        context.stroke();

        // Draw label
        context.save();
        context.translate(
          centerX + Math.cos(angle) * (radius - tickLength * 2),
          centerY + Math.sin(angle) * (radius - tickLength * 2)
        );
        context.rotate(angle + Math.PI / 2);
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "#666";
        context.font = "12px Arial";
        context.rotate(-angle - Math.PI / 2);
        context.fillText(value.toString(), 0, 0);
        context.restore();
      }
    };

    // Draw needle
    const drawNeedle = () => {
      const angle = startAngle + valueScale(value) * angleRange;
      const needleLength = radius * 0.8;
      const needleWidth = radius * 0.03;

      // Draw needle
      context.beginPath();
      context.moveTo(
        centerX + Math.cos(angle - Math.PI / 2) * needleWidth,
        centerY + Math.sin(angle - Math.PI / 2) * needleWidth
      );
      context.lineTo(
        centerX + Math.cos(angle) * needleLength,
        centerY + Math.sin(angle) * needleLength
      );
      context.lineTo(
        centerX + Math.cos(angle + Math.PI / 2) * needleWidth,
        centerY + Math.sin(angle + Math.PI / 2) * needleWidth
      );
      context.fillStyle = "#dc3545";
      context.fill();

      // Draw needle pivot
      context.beginPath();
      context.arc(centerX, centerY, radius * 0.08, 0, 2 * Math.PI);
      context.fillStyle = "#666";
      context.fill();
      context.strokeStyle = "#fff";
      context.lineWidth = 2;
      context.stroke();
    };

    // Draw value text
    const drawValue = () => {
      context.fillStyle = "#333";
      context.font = "bold 24px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(`${value}%`, centerX, centerY - radius * 0.3);

      // Draw label
      context.font = "14px Arial";
      context.fillStyle = "#666";
      context.fillText("Current Progress", centerX, centerY - radius * 0.15);
    };

    // Draw min/max labels
    const drawMinMax = () => {
      context.font = "bold 12px Arial";
      context.fillStyle = "#666";
      context.textAlign = "left";
      context.fillText("Min", 10, height - 10);
      context.textAlign = "right";
      context.fillText("Max", width - 10, height - 10);
    };

    // Draw title
    const drawTitle = () => {
      context.font = "bold 16px Arial";
      context.fillStyle = "#333";
      context.textAlign = "center";
      context.fillText("Performance Gauge", width / 2, 20);
    };

    // Draw everything
    drawGaugeBackground();
    drawTicks();
    drawNeedle();
    drawValue();
    drawMinMax();
    drawTitle();
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

export default GaugeChart;
