import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const NetworkGraph = () => {
  const canvasRef = useRef(null);
  const [simulation, setSimulation] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Sample data
    const data = {
      nodes: [
        { id: "A", group: 1, size: 20 },
        { id: "B", group: 1, size: 15 },
        { id: "C", group: 2, size: 25 },
        { id: "D", group: 2, size: 20 },
        { id: "E", group: 3, size: 15 },
        { id: "F", group: 3, size: 18 },
        { id: "G", group: 4, size: 22 },
        { id: "H", group: 4, size: 16 },
      ],
      links: [
        { source: "A", target: "B", value: 5 },
        { source: "A", target: "C", value: 3 },
        { source: "B", target: "D", value: 4 },
        { source: "C", target: "D", value: 6 },
        { source: "D", target: "E", value: 2 },
        { source: "E", target: "F", value: 5 },
        { source: "F", target: "G", value: 4 },
        { source: "G", target: "H", value: 3 },
        { source: "H", target: "A", value: 2 },
      ],
    };

    // Setup dimensions
    const width = 800;
    const height = 600;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Color scale for groups
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create force simulation
    const sim = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink(data.links)
          .id((d) => d.id)
          .distance(100)
          .strength(0.1)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collide",
        d3
          .forceCollide()
          .radius((d) => d.size + 10)
          .strength(0.7)
      );

    setSimulation(sim);

    // Draw function
    const draw = () => {
      context.clearRect(0, 0, width, height);

      // Draw links
      context.strokeStyle = "#999";
      context.lineWidth = 1;
      data.links.forEach((link) => {
        const source = link.source;
        const target = link.target;

        context.beginPath();
        context.moveTo(source.x, source.y);

        // Draw curved links
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const normalX = -dy;
        const normalY = dx;
        const length = Math.sqrt(normalX * normalX + normalY * normalY);
        const curvature = 0.2;

        const controlX = midX + (normalX / length) * 30 * curvature;
        const controlY = midY + (normalY / length) * 30 * curvature;

        context.quadraticCurveTo(controlX, controlY, target.x, target.y);
        context.stroke();

        // Draw arrow
        const angle = Math.atan2(target.y - controlY, target.x - controlX);
        const arrowLength = 10;
        const arrowWidth = 8;

        context.save();
        context.translate(target.x, target.y);
        context.rotate(angle);
        context.beginPath();
        context.moveTo(-arrowLength, -arrowWidth / 2);
        context.lineTo(0, 0);
        context.lineTo(-arrowLength, arrowWidth / 2);
        context.fillStyle = "#999";
        context.fill();
        context.restore();
      });

      // Draw nodes
      data.nodes.forEach((node) => {
        // Node shadow
        context.shadowColor = "rgba(0, 0, 0, 0.2)";
        context.shadowBlur = 5;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;

        // Node circle
        context.beginPath();
        context.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
        context.fillStyle = colorScale(node.group);
        context.fill();
        context.strokeStyle = "#fff";
        context.lineWidth = 2;
        context.stroke();

        // Reset shadow
        context.shadowColor = "transparent";

        // Node label
        context.fillStyle = "#000";
        context.font = "12px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(node.id, node.x, node.y);
      });
    };

    // Set up animation loop
    sim.on("tick", draw);

    // Add interactivity
    let draggedNode = null;
    let isClicked = false;

    const handleMouseMove = (event) => {
      if (!isClicked) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (draggedNode) {
        draggedNode.fx = x;
        draggedNode.fy = y;
        sim.alpha(0.5).restart();
      }
    };

    const handleMouseDown = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      isClicked = true;
      draggedNode = data.nodes.find((node) => {
        const dx = x - node.x;
        const dy = y - node.y;
        return Math.sqrt(dx * dx + dy * dy) < node.size;
      });

      if (draggedNode) {
        draggedNode.fx = x;
        draggedNode.fy = y;
        sim.alpha(0.5).restart();
      }
    };

    const handleMouseUp = () => {
      isClicked = false;
      if (draggedNode) {
        draggedNode.fx = null;
        draggedNode.fy = null;
        draggedNode = null;
        sim.alpha(0.5).restart();
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      sim.stop();
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto"
        style={{ touchAction: "none" }}
      />
    </div>
  );
};

export default NetworkGraph;
