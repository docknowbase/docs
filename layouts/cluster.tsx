import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const ClusterLayout = () => {
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
          children: [{ name: "A1" }, { name: "A2" }],
        },
        {
          name: "B",
          children: [{ name: "B1" }, { name: "B2" }],
        },
      ],
    };

    // Create cluster layout
    const cluster = d3.cluster().size([width - 100, height - 100]);

    const root = d3.hierarchy(data);
    const nodes = cluster(root);

    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Draw links
    context.strokeStyle = "#999";
    context.lineWidth = 1;
    nodes.links().forEach((link) => {
      context.beginPath();
      context.moveTo(link.source.x + 50, link.source.y + 50);
      context.lineTo(link.target.x + 50, link.target.y + 50);
      context.stroke();
    });

    // Draw nodes
    context.fillStyle = "#69b3a2";
    root.descendants().forEach((node) => {
      context.beginPath();
      context.arc(node.x + 50, node.y + 50, 5, 0, 2 * Math.PI);
      context.fill();
    });
  }, []);

  return <canvas ref={canvasRef} width={600} height={400} />;
};

export default ClusterLayout;
