import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const areaData = [10, 20, 30, 40, 50, 60, 70, 80];

const AreaChart = ({ data = areaData }) => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    // Create a D3 area generator
    const area = d3
      .area()
      .x((d, i) => i * (width / (data.length - 1)))
      .y0(height)
      .y1((d) => height - d);

    const pathData = area(data);

    ctx.clearRect(0, 0, width, height); // Clear the canvas
    ctx.beginPath();
    const path = new Path2D(pathData);
    ctx.fillStyle = "steelblue";
    ctx.fill(path);
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

export default AreaChart;
