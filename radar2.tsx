import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

// Example Data for Radar Chart
const radarData = [
  { axis: "Strength", value: 80 },
  { axis: "Speed", value: 70 },
  { axis: "Stamina", value: 90 },
  { axis: "Agility", value: 60 },
  { axis: "Flexibility", value: 85 },
];

const RadarChart: React.FC<{ data?: { axis: string; value: number }[] }> = ({
  data = radarData,
}) => {
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

    // Define radius, margin, and center of the radar chart
    const margin = 30;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - margin;

    // Define the angle between each axis (the number of axes depends on the number of data points)
    const angleSlice = (Math.PI * 2) / data.length;

    // Scale the data values (normalize to the range [0, 1] based on the max value)
    const maxValue = Math.max(...data.map((d) => d.value));
    const scale = d3.scaleLinear().domain([0, maxValue]).range([0, radius]);

    // Function to draw the radar chart axes
    const drawAxis = (index: number) => {
      const angle = angleSlice * index;
      const x = centerX + scale(maxValue) * Math.cos(angle);
      const y = centerY + scale(maxValue) * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "#ccc";
      ctx.stroke();
    };

    // Draw the grid circles
    const gridCount = 5;
    for (let i = 1; i <= gridCount; i++) {
      const gridRadius = (radius / gridCount) * i;
      ctx.beginPath();
      ctx.arc(centerX, centerY, gridRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = "#ccc";
      ctx.stroke();
    }

    // Draw the axes
    data.forEach((d, i) => drawAxis(i));

    // Draw the radar chart polygon
    ctx.beginPath();
    data.forEach((d, i) => {
      const angle = angleSlice * i;
      const x = centerX + scale(d.value) * Math.cos(angle);
      const y = centerY + scale(d.value) * Math.sin(angle);
      ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(0, 123, 255, 0.6)";
    ctx.fill();
    ctx.strokeStyle = "#007bff";
    ctx.stroke();

    // Draw axis labels
    data.forEach((d, i) => {
      const angle = angleSlice * i;
      const x = centerX + (radius + 10) * Math.cos(angle);
      const y = centerY + (radius + 10) * Math.sin(angle);
      ctx.fillStyle = "#333";
      ctx.font = "12px Arial";
      ctx.fillText(d.axis, x, y);
    });
  }, [data]);

  return <canvas ref={canvasRef} width="500" height="500"></canvas>;
};

export default RadarChart;
