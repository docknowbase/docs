import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const SankeyDiagram = () => {
  const canvasRef = useRef(null);

  // Custom Sankey layout calculation
  const computeNodeLinks = (nodes, links, width, height, padding) => {
    const nodeMap = new Map(
      nodes.map((node, i) => [node.name, { ...node, id: i }])
    );

    // Compute node depths (x-position layers)
    const computeDepths = () => {
      const visited = new Set();
      const depths = new Map();

      const visit = (nodeName, depth = 0) => {
        if (visited.has(nodeName)) return;
        visited.add(nodeName);
        depths.set(nodeName, Math.max(depth, depths.get(nodeName) || 0));

        links.forEach((link) => {
          if (link.source === nodeName) {
            visit(link.target, depth + 1);
          }
        });
      };

      nodes.forEach((node) => visit(node.name));
      return depths;
    };

    const depths = computeDepths();
    const maxDepth = Math.max(...Array.from(depths.values()));
    const layerWidth = (width - 2 * padding) / (maxDepth + 1);
    const nodeWidth = 20;

    // Assign x coordinates based on depth
    nodes.forEach((node) => {
      const depth = depths.get(node.name);
      node.x0 = padding + depth * layerWidth;
      node.x1 = node.x0 + nodeWidth;
    });

    // Compute node values based on incoming/outgoing links
    nodes.forEach((node) => {
      node.sourceLinks = links.filter((l) => l.source === node.name);
      node.targetLinks = links.filter((l) => l.target === node.name);
      node.value = Math.max(
        d3.sum(node.sourceLinks, (l) => l.value),
        d3.sum(node.targetLinks, (l) => l.value)
      );
    });

    // Assign y coordinates
    const nodesByDepth = d3.group(nodes, (n) => depths.get(n.name));
    const maxValue = d3.max(nodes, (n) => n.value);
    const nodeSpacing = 10;

    nodesByDepth.forEach((depthNodes) => {
      let y = padding;
      depthNodes.sort((a, b) => a.value - b.value);

      depthNodes.forEach((node) => {
        const nodeHeight =
          (node.value / maxValue) *
          (height - 2 * padding - (depthNodes.length - 1) * nodeSpacing);
        node.y0 = y;
        node.y1 = y + nodeHeight;
        y += nodeHeight + nodeSpacing;
      });
    });

    // Process links
    links.forEach((link) => {
      link.sourceNode = nodes.find((n) => n.name === link.source);
      link.targetNode = nodes.find((n) => n.name === link.target);
      link.width = ((link.value / maxValue) * (height - 2 * padding)) / 4;
    });

    return { nodes, links };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Sample data
    const data = {
      nodes: [
        { name: "A" },
        { name: "B" },
        { name: "C" },
        { name: "D" },
        { name: "E" },
      ],
      links: [
        { source: "A", target: "C", value: 20 },
        { source: "B", target: "C", value: 15 },
        { source: "C", target: "D", value: 25 },
        { source: "C", target: "E", value: 10 },
      ],
    };

    const width = 800;
    const height = 500;
    const padding = 30;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);

    // Process data
    const { nodes, links } = computeNodeLinks(
      data.nodes,
      data.links,
      width,
      height,
      padding
    );

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Draw links
    context.globalAlpha = 0.4;
    links.forEach((link) => {
      const sourceY =
        link.sourceNode.y0 + (link.sourceNode.y1 - link.sourceNode.y0) / 2;
      const targetY =
        link.targetNode.y0 + (link.targetNode.y1 - link.targetNode.y0) / 2;

      context.beginPath();
      context.moveTo(link.sourceNode.x1, sourceY);
      context.bezierCurveTo(
        (link.sourceNode.x1 + link.targetNode.x0) / 2,
        sourceY,
        (link.sourceNode.x1 + link.targetNode.x0) / 2,
        targetY,
        link.targetNode.x0,
        targetY
      );

      context.lineWidth = link.width;
      context.strokeStyle = color(link.sourceNode.name);
      context.stroke();
    });

    // Draw nodes
    context.globalAlpha = 1;
    nodes.forEach((node) => {
      // Draw rectangle
      context.fillStyle = color(node.name);
      context.fillRect(node.x0, node.y0, node.x1 - node.x0, node.y1 - node.y0);

      // Add label
      context.fillStyle = "#000";
      context.font = "12px Arial";
      context.textAlign = "left";
      context.textBaseline = "middle";
      context.fillText(
        `${node.name} (${Math.round(node.value)})`,
        node.x1 + 5,
        (node.y0 + node.y1) / 2
      );
    });
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

export default SankeyDiagram;
