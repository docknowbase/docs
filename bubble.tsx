import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

// Example Data: Each bubble has an x, y position and a size (radius)
const bubbleData = [
  { x: 50, y: 50, radius: 20 },
  { x: 150, y: 100, radius: 30 },
  { x: 250, y: 200, radius: 40 },
  { x: 350, y: 150, radius: 25 },
  { x: 450, y: 250, radius: 35 },
];

const BubbleChart: React.FC<{
  data?: { x: number; y: number; radius: number }[];
}> = ({ data = bubbleData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, width, height);

    // Define margins
    const margin = 20;

    // Draw each bubble (circle)
    data.forEach((d) => {
      const x = d.x;
      const y = d.y;
      const radius = d.radius;

      // Set the bubble color and draw it
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI); // Draw the circle
      ctx.fillStyle = d3.scaleOrdinal(d3.schemeCategory10)(Math.random()); // Random color from D3 color scheme
      ctx.fill(); // Fill the circle with color
      ctx.stroke(); // Stroke the circle outline
    });
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

export default BubbleChart;
