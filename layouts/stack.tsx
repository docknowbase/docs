import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const StackLayout = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const width = 600;
    const height = 400;

    // Sample data
    const data = [
      { month: "Jan", a: 20, b: 30, c: 40 },
      { month: "Feb", a: 25, b: 35, c: 45 },
      { month: "Mar", a: 30, b: 40, c: 50 },
      { month: "Apr", a: 35, b: 45, c: 55 },
    ];

    // Stack generator
    const stack = d3
      .stack()
      .keys(["a", "b", "c"])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const series = stack(data);

    // Scales
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([50, width - 50])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(series, (d) => d3.max(d, (d) => d[1]))])
      .range([height - 50, 50]);

    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Draw stacks
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1"];
    series.forEach((s, i) => {
      context.fillStyle = colors[i];
      s.forEach((d) => {
        context.beginPath();
        context.rect(
          x(d.data.month),
          y(d[1]),
          x.bandwidth(),
          y(d[0]) - y(d[1])
        );
        context.fill();
      });
    });

    // Draw axes
    context.strokeStyle = "#000";
    context.beginPath();
    context.moveTo(50, 50);
    context.lineTo(50, height - 50);
    context.lineTo(width - 50, height - 50);
    context.stroke();
  }, []);

  return <canvas ref={canvasRef} width={600} height={400} />;
};

export default StackLayout;
