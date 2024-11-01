import React, { useRef, useEffect } from "react";
const barData = [30, 50, 80, 45, 60];

const BarChart = ({ data = barData }) => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / data.length;

    ctx.clearRect(0, 0, width, height); // Clear the canvas

    data.forEach((d, i) => {
      const barHeight = (d / Math.max(...data)) * height;
      ctx.fillStyle = "steelblue";
      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
    });
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      width="500"
      height="300"
      style={{ border: "1px solid black", margin: "10px" }}
    ></canvas>
  );
};

export default BarChart;
