import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

// Example Data for Donut Chart
const donutData = [10, 20, 30, 40]; // Values of each segment

const DonutChart: React.FC<{ data?: number[] }> = ({ data = donutData }) => {
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

    // Define radius and center of the chart
    const radius = Math.min(width, height) / 3; // Outer radius of the donut
    const innerRadius = radius / 2; // Inner radius to create the "hole"
    const centerX = width / 2;
    const centerY = height / 2;

    // Compute total sum of data values
    const totalValue = data.reduce((acc, val) => acc + val, 0);

    // Create a color scale for the segments
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Function to draw each segment of the donut
    let startAngle = 0;
    data.forEach((value, index) => {
      const endAngle = startAngle + (value / totalValue) * (Math.PI * 2);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle, false); // Outer arc
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true); // Inner arc (creates the hole)
      ctx.closePath();
      ctx.fillStyle = colorScale(index); // Get color for the segment
      ctx.fill(); // Fill the segment with color

      // Update the start angle for the next segment
      startAngle = endAngle;
    });

    // Optionally: Add labels or other enhancements here
  }, [data]);

  return <canvas ref={canvasRef} width="400" height="400"></canvas>;
};

export default DonutChart;
