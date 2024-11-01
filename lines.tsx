import React, { useRef, useEffect } from "react";

const lineData = [5, 10, 15, 20, 25, 30, 35];

const LineChart = ({ data = lineData }) => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height); // Clear the canvas

    const xScale = width / (data.length - 1);
    const yScale = height / Math.max(...data);

    ctx.beginPath();
    ctx.moveTo(0, height - data[0] * yScale);

    data.forEach((d, i) => {
      ctx.lineTo(i * xScale, height - d * yScale);
    });

    ctx.strokeStyle = "steelblue";
    ctx.stroke();
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

export default LineChart;
