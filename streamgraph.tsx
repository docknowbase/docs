import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const Streamgraph = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Generate sample data
    const numLayers = 5;
    const numPoints = 40;
    const layers = [];

    // Create sample data with multiple layers over time
    for (let layer = 0; layer < numLayers; layer++) {
      const layerData = [];
      for (let point = 0; point < numPoints; point++) {
        layerData.push({
          x: point,
          y: 10 + Math.random() * 20 + Math.sin(point / 3) * 5,
        });
      }
      layers.push(layerData);
    }

    // Setup dimensions
    const width = 900;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    context.translate(margin.left, margin.top);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([0, numPoints - 1])
      .range([0, innerWidth]);

    // Stack the data
    const stackLayout = d3
      .stack()
      .offset(d3.stackOffsetWiggle) // This creates the streamgraph effect
      .order(d3.stackOrderInsideOut);

    // Reshape data for stacking
    const stackData = d3.range(numPoints).map((point) => {
      const obj = { x: point };
      layers.forEach((layer, i) => {
        obj[`layer${i}`] = layer[point].y;
      });
      return obj;
    });

    const keys = layers.map((_, i) => `layer${i}`);
    const stacked = stackLayout.keys(keys)(stackData);

    // Calculate y scale based on stacked data
    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(stacked, (layer) => d3.min(layer, (d) => d[0])),
        d3.max(stacked, (layer) => d3.max(layer, (d) => d[1])),
      ])
      .range([innerHeight, 0]);

    // Color scale
    const colorScale = d3
      .scaleSequential(d3.interpolateViridis)
      .domain([0, numLayers - 1]);

    // Draw axes
    const drawAxes = () => {
      // X-axis
      context.beginPath();
      context.strokeStyle = "#000";
      context.moveTo(0, innerHeight);
      context.lineTo(innerWidth, innerHeight);
      context.stroke();

      // X-axis ticks
      const xTicks = xScale.ticks(10);
      xTicks.forEach((tick) => {
        context.beginPath();
        context.moveTo(xScale(tick), innerHeight);
        context.lineTo(xScale(tick), innerHeight + 5);
        context.stroke();

        context.fillStyle = "#000";
        context.textAlign = "center";
        context.textBaseline = "top";
        context.fillText(tick.toString(), xScale(tick), innerHeight + 10);
      });

      // Title
      context.fillStyle = "#000";
      context.textAlign = "center";
      context.textBaseline = "top";
      context.font = "bold 16px Arial";
      context.fillText("Streamgraph Visualization", innerWidth / 2, -30);
    };

    // Draw streams
    const drawStreams = () => {
      stacked.forEach((layer, i) => {
        context.beginPath();
        context.fillStyle = colorScale(i);
        context.globalAlpha = 0.8;

        // Move to the first point
        const x0 = xScale(layer[0].data.x);
        const y0 = yScale(layer[0][0]);
        context.moveTo(x0, y0);

        // Draw the top curve
        layer.forEach((point, j) => {
          const x = xScale(point.data.x);
          const y = yScale(point[1]);

          if (j === 0) {
            context.moveTo(x, y);
          } else {
            const xPrev = xScale(layer[j - 1].data.x);
            const yPrev = yScale(layer[j - 1][1]);

            // Control points for curve
            const cp1x = xPrev + (x - xPrev) / 3;
            const cp1y = yPrev;
            const cp2x = xPrev + ((x - xPrev) * 2) / 3;
            const cp2y = y;

            context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
          }
        });

        // Draw the bottom curve (in reverse)
        for (let j = layer.length - 1; j >= 0; j--) {
          const x = xScale(layer[j].data.x);
          const y = yScale(layer[j][0]);

          if (j === layer.length - 1) {
            context.lineTo(x, y);
          } else {
            const xNext = xScale(layer[j + 1].data.x);
            const yNext = yScale(layer[j + 1][0]);

            // Control points for curve
            const cp1x = xNext - (xNext - x) / 3;
            const cp1y = yNext;
            const cp2x = xNext - ((xNext - x) * 2) / 3;
            const cp2y = y;

            context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
          }
        }

        context.closePath();
        context.fill();

        // Add subtle stroke
        context.strokeStyle = "rgba(255,255,255,0.2)";
        context.stroke();
      });
    };

    // Draw legend
    const drawLegend = () => {
      const legendWidth = 20;
      const legendHeight = 100;
      const legendX = innerWidth + 10;
      const legendY = 0;

      // Draw gradient legend
      const gradient = context.createLinearGradient(
        0,
        legendY,
        0,
        legendY + legendHeight
      );
      d3.range(numLayers).forEach((_, i) => {
        gradient.addColorStop(i / (numLayers - 1), colorScale(i));
      });

      context.fillStyle = gradient;
      context.fillRect(legendX, legendY, legendWidth, legendHeight);
      context.strokeRect(legendX, legendY, legendWidth, legendHeight);

      // Legend labels
      context.fillStyle = "#000";
      context.textAlign = "left";
      context.textBaseline = "middle";
      context.fillText("High", legendX + legendWidth + 5, legendY);
      context.fillText(
        "Low",
        legendX + legendWidth + 5,
        legendY + legendHeight
      );
    };

    // Clear and draw everything
    context.clearRect(-margin.left, -margin.top, width, height);
    drawStreams();
    drawAxes();
    drawLegend();
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

export default Streamgraph;
