import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const smoothLineData = [15, 25, 30, 40, 50, 60, 80];

const SmoothLine = ({ data = smoothLineData }) => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    // Create a D3 line generator with curve
    const line = d3
      .line()
      .curve(d3.curveCatmullRom)
      .x((d, i) => i * (width / (data.length - 1)))
      .y((d) => height - d);

    const pathData = line(data);

    ctx.clearRect(0, 0, width, height); // Clear the canvas
    ctx.beginPath();
    const path = new Path2D(pathData);
    ctx.strokeStyle = "steelblue";
    ctx.stroke(path);
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

export default SmoothLine;
