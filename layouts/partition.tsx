import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const PartitionLayout = () => {
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

    // Create partition layout
    const partition = d3.partition().size([width - 100, height - 100]);

    const root = d3.hierarchy(data).sum((d) => d.value);

    const nodes = partition(root);

    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Draw rectangles
    context.strokeStyle = "#999";
    context.lineWidth = 1;
    root.descendants().forEach((node) => {
      context.beginPath();
      context.rect(
        node.x0 + 50,
        node.y0 + 50,
        node.x1 - node.x0,
        node.y1 - node.y0
      );
      context.stroke();
    });

    // Fill rectangles
    context.fillStyle = "rgba(105, 179, 162, 0.3)";
    root.descendants().forEach((node) => {
      context.beginPath();
      context.rect(
        node.x0 + 50,
        node.y0 + 50,
        node.x1 - node.x0,
        node.y1 - node.y0
      );
      context.fill();
    });
  }, []);

  return <canvas ref={canvasRef} width={600} height={400} />;
};

export default PartitionLayout;
