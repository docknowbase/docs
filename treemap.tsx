import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

// Example hierarchical data for Tree Map
const treeMapData = {
  name: "root",
  children: [
    {
      name: "Category 1",
      value: 100,
      children: [
        { name: "Subcategory 1", value: 60 },
        { name: "Subcategory 2", value: 40 },
      ],
    },
    {
      name: "Category 2",
      value: 150,
      children: [
        { name: "Subcategory 3", value: 90 },
        { name: "Subcategory 4", value: 60 },
      ],
    },
  ],
};

const TreeMap: React.FC<{ data?: any }> = ({ data = treeMapData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Define margins and dimensions for the chart
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create a D3 treemap layout
    const root = d3
      .hierarchy(data)
      .sum((d) => d.value) // Sum the values for the children
      .sort((a, b) => b.value - a.value); // Sort nodes by value

    d3
      .treemap()
      .size([chartWidth, chartHeight]) // Set the size of the tree map
      .padding(1)(
      // Set padding between rectangles
      root
    );

    // Draw the tree map
    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(root.descendants(), (d) => d.value)]);

    root.descendants().forEach((node) => {
      const x = node.x0 + margin.left;
      const y = node.y0 + margin.top;
      const width = node.x1 - node.x0;
      const height = node.y1 - node.y0;

      // Set fill color based on value
      ctx.fillStyle = colorScale(node.value);

      // Draw the rectangle for the node
      ctx.fillRect(x, y, width, height);

      // Optional: Add the label to the rectangle
      ctx.fillStyle = "white";
      ctx.font = "12px Arial";
      ctx.fillText(node.data.name, x + 5, y + 15);
    });
  }, [data]);

  return <canvas ref={canvasRef} width="600" height="400"></canvas>;
};

export default TreeMap;
