import React, { useRef, useEffect } from "react";

const scatterData = [
  [50, 70],
  [100, 150],
  [150, 200],
  [200, 250],
  [250, 300],
];

const ScatterPlot = ({ data = scatterData }) => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height); // Clear the canvas

    data.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, height - y, 5, 0, 2 * Math.PI); // Draw a point at (x, y)
      ctx.fillStyle = "steelblue";
      ctx.fill();
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

export default ScatterPlot;
