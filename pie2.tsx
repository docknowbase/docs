import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

// Example Data for Pie Chart
const pieData = [10, 20, 30, 40]; // Values for each pie slice

const PieChart: React.FC<{ data?: number[] }> = ({ data = pieData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, width, height);

    // Define the radius of the pie chart
    const radius = Math.min(width, height) / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    // Compute total sum of data values
    const totalValue = data.reduce((acc, val) => acc + val, 0);

    // Create a color scale for the segments
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Function to draw each pie slice
    let startAngle = 0;
    data.forEach((value, index) => {
      const endAngle = startAngle + (value / totalValue) * (Math.PI * 2);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY); // Move to center of pie
      ctx.arc(centerX, centerY, radius, startAngle, endAngle); // Draw outer arc
      ctx.closePath();
      ctx.fillStyle = colorScale(index); // Get color for the slice
      ctx.fill(); // Fill the slice with color

      // Update the start angle for the next slice
      startAngle = endAngle;
    });

    // Optionally: Add labels or other enhancements here
  }, [data]);

  return <canvas ref={canvasRef} width="400" height="400"></canvas>;
};

export default PieChart;
