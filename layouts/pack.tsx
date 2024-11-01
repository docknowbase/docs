import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const PackLayout = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const width = 600;
    const height = 400;

    // Sample data
    const data = {
      name: "root",
      children: [
        {
          name: "A",
          value: 100,
          children: [
            { name: "A1", value: 30 },
            { name: "A2", value: 70 },
          ],
        },
        {
          name: "B",
          value: 80,
          children: [
            { name: "B1", value: 40 },
            { name: "B2", value: 40 },
          ],
        },
      ],
    };

    // Create pack layout
    const pack = d3
      .pack()
      .size([width - 100, height - 100])
      .padding(3);

    const root = d3.hierarchy(data).sum((d) => d.value);

    const nodes = pack(root);

    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Draw circles
    context.strokeStyle = "#999";
    context.lineWidth = 1;
    root.descendants().forEach((node) => {
      context.beginPath();
      context.arc(node.x + 50, node.y + 50, node.r, 0, 2 * Math.PI);
      context.stroke();
    });

    // Fill leaf nodes
    context.fillStyle = "rgba(105, 179, 162, 0.3)";
    root.leaves().forEach((node) => {
      context.beginPath();
      context.arc(node.x + 50, node.y + 50, node.r, 0, 2 * Math.PI);
      context.fill();
    });
  }, []);

  return <canvas ref={canvasRef} width={600} height={400} />;
};

export default PackLayout;
