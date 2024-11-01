import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const SunburstChart = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Sample hierarchical data
    const data = {
      name: "root",
      value: 100,
      children: [
        {
          name: "A",
          children: [
            { name: "A1", value: 20 },
            { name: "A2", value: 10 },
            { name: "A3", value: 30 },
          ],
        },
        {
          name: "B",
          children: [
            { name: "B1", value: 15 },
            { name: "B2", value: 25 },
          ],
        },
      ],
    };

    const width = 600;
    const height = 600;
    const radius = Math.min(width, height) / 2;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    context.translate(width / 2, height / 2);

    // Create partition layout
    const partition = (data) => {
      const root = d3
        .hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value);
      return d3.partition().size([2 * Math.PI, radius])(root);
    };

    // Create color scale
    const color = d3.scaleOrdinal(
      d3.quantize(d3.interpolateRainbow, data.children.length + 1)
    );

    // Create arc generator
    const arc = d3
      .arc()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle(0.005)
      .padRadius(radius / 2)
      .innerRadius((d) => d.y0)
      .outerRadius((d) => d.y1 - 1)
      .context(context);

    // Process data
    const root = partition(data);
    const descendants = root.descendants();

    // Draw arcs
    descendants.forEach((d) => {
      if (d.depth === 0) return; // Skip root

      context.beginPath();
      arc(d);
      context.fillStyle = color(d.parent.data.name);
      context.globalAlpha = d.children ? 0.6 : 0.4;
      context.fill();
      context.strokeStyle = "white";
      context.lineWidth = 1;
      context.stroke();
    });

    // Add labels where there's enough space
    descendants.forEach((d) => {
      if (d.depth === 0) return; // Skip root

      const angleRange = d.x1 - d.x0;
      const radius = (d.y0 + d.y1) / 2;
      const angle = (d.x0 + d.x1) / 2;

      // Only draw labels if there's enough space
      if (angleRange * radius > 30) {
        const x = radius * Math.cos(angle - Math.PI / 2);
        const y = radius * Math.sin(angle - Math.PI / 2);

        context.save();
        context.translate(x, y);
        context.rotate(angle);
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "white";
        context.font = "12px Arial";
        context.globalAlpha = 1;
        context.fillText(d.data.name, 0, 0);
        context.restore();
      }
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

export default SunburstChart;
