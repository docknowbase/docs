import React, { useRef, useEffect } from "react";

const pieData = [10, 30, 20, 40];

const PieChart = ({ data = pieData }) => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;
    const radius = Math.min(width, height) / 2;

    const total = data.reduce((sum, d) => sum + d, 0);
    let startAngle = 0;

    ctx.clearRect(0, 0, width, height); // Clear the canvas
    ctx.translate(width / 2, height / 2);

    data.forEach((d) => {
      const endAngle = startAngle + (d / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 60%)`;
      ctx.fill();
      startAngle = endAngle;
    });
  }, [data]);

  return <canvas ref={canvasRef} width="500" height="500"></canvas>;
};

export default PieChart;
