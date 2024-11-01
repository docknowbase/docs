import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const ForceLayout = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const width = 600;
    const height = 400;

    // Sample data
    const nodes = Array.from({ length: 30 }, (_, i) => ({ id: i }));
    const links = Array.from({ length: 40 }, () => ({
      source: Math.floor(Math.random() * nodes.length),
      target: Math.floor(Math.random() * nodes.length),
    }));

    // Force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink(links).distance(50))
      .force("charge", d3.forceManyBody().strength(-50))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", render);

    function render() {
      context.clearRect(0, 0, width, height);

      // Draw links
      context.strokeStyle = "#999";
      context.lineWidth = 1;
      links.forEach((link) => {
        context.beginPath();
        context.moveTo(link.source.x, link.source.y);
        context.lineTo(link.target.x, link.target.y);
        context.stroke();
      });

      // Draw nodes
      context.fillStyle = "#69b3a2";
      nodes.forEach((node) => {
        context.beginPath();
        context.arc(node.x, node.y, 5, 0, 2 * Math.PI);
        context.fill();
      });
    }

    return () => simulation.stop();
  }, []);

  return <canvas ref={canvasRef} width={600} height={400} />;
};

export default ForceLayout;
