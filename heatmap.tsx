import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

// Example data: 5x5 heatmap grid
const heatmapData = [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20],
  [21, 22, 23, 24, 25],
];

const Heatmap: React.FC<{ data?: number[][] }> = ({ data = heatmapData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Define margins
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Cell dimensions
    const cellWidth = chartWidth / data[0].length;
    const cellHeight = chartHeight / data.length;

    // Create a color scale using D3
    const colorScale = d3
      .scaleSequential(d3.interpolateInferno)
      .domain([d3.min(data.flat()) || 0, d3.max(data.flat()) || 1]);

    // Draw the heatmap
    data.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        const x = margin.left + colIndex * cellWidth;
        const y = margin.top + rowIndex * cellHeight;

        // Set fill color based on the data value
        ctx.fillStyle = colorScale(value);

        // Draw the cell
        ctx.fillRect(x, y, cellWidth, cellHeight);
      });
    });

    // Optional: Add axis or labels if needed
    // Example of adding grid lines for clarity
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 0.5;

    // Draw vertical grid lines
    for (let i = 0; i <= data[0].length; i++) {
      const x = margin.left + i * cellWidth;
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + chartHeight);
      ctx.stroke();
    }

    // Draw horizontal grid lines
    for (let i = 0; i <= data.length; i++) {
      const y = margin.top + i * cellHeight;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
    }
  }, [data]);

  return <canvas ref={canvasRef} width="600" height="600"></canvas>;
};

export default Heatmap;
