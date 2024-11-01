import React, { useRef, useEffect } from "react";

const radarData = [60, 70, 90, 50, 80]; // Corresponds to different categories (e.g., 'A', 'B', 'C', 'D', 'E')
const radarLabels = ["A", "B", "C", "D", "E"];

const RadarChart = ({ data = radarData, labels = radarLabels }) => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2;
    const angleStep = (2 * Math.PI) / data.length;

    // Clear canvas before each render
    ctx.clearRect(0, 0, width, height);

    // Draw the background grid lines (spokes and circles)
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;

    // Draw the circular grid lines
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius / 5) * i, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw the radial lines (axes)
    labels.forEach((label, i) => {
      const angle = i * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // Draw each axis line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Draw label at the end of each axis
      ctx.fillText(label, x + 5, y); // Offset by 5px to avoid overlap
    });

    // Plot the data
    ctx.beginPath();
    data.forEach((d, i) => {
      const angle = i * angleStep;
      const x = centerX + (d / Math.max(...data)) * radius * Math.cos(angle);
      const y = centerY + (d / Math.max(...data)) * radius * Math.sin(angle);

      ctx.lineTo(x, y);
    });

    ctx.closePath();
    ctx.strokeStyle = "steelblue";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fill the area of the radar chart
    ctx.fillStyle = "rgba(70, 130, 180, 0.3)";
    ctx.fill();
  }, [data, labels]);

  return <canvas ref={canvasRef} width="500" height="500"></canvas>;
};

export default RadarChart;
