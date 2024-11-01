import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const axisData = [10, 20, 30, 40, 50];

const AxisChart = ({ data = axisData }) => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext("2d");

    // Clear canvas before drawing
    ctx.clearRect(0, 0, width, height);

    // Define scales
    const margin = 40;
    const xScale = (d, index) =>
      margin + (index * (width - 2 * margin)) / data.length;
    const yScale = (d) =>
      height - margin - (d / Math.max(...data)) * (height - 2 * margin);

    // Draw X Axis
    ctx.beginPath();
    ctx.moveTo(margin, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.strokeStyle = "black";
    ctx.stroke();

    // Draw Y Axis
    ctx.beginPath();
    ctx.moveTo(margin, height - margin);
    ctx.lineTo(margin, margin);
    ctx.stroke();

    // Draw X Axis Ticks
    const tickSize = 10;
    data.forEach((d, index) => {
      const x = xScale(d, index);
      ctx.beginPath();
      ctx.moveTo(x, height - margin);
      ctx.lineTo(x, height - margin + tickSize);
      ctx.stroke();
      // Add text labels for X axis
      ctx.fillStyle = "black";
      ctx.font = "12px Arial";
      ctx.fillText(index + 1, x - 5, height - margin + tickSize + 15);
    });

    // Draw Y Axis Ticks and Labels
    const yTickCount = 5;
    for (let i = 0; i <= yTickCount; i++) {
      const yValue = (i / yTickCount) * Math.max(...data);
      const y = yScale(yValue);

      // Draw tick mark
      ctx.beginPath();
      ctx.moveTo(margin - tickSize, y);
      ctx.lineTo(margin, y);
      ctx.stroke();

      // Add text labels for Y axis
      ctx.fillText(yValue.toFixed(0), margin - tickSize - 30, y + 5);
    }

    // Cleanup function to reset canvas on rerender or unmount
    return () => {
      ctx.clearRect(0, 0, width, height); // Clears canvas when component re-renders
    };
  }, [data]); // Re-run effect only when 'data' changes

  return (
    <canvas
      ref={canvasRef}
      width="500"
      height="300"
      style={{ border: "1px solid black", margin: "10px" }}
    ></canvas>
  );
};

export default AxisChart;
