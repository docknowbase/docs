import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const CandlestickChart = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Sample data - format: date, open, high, low, close, volume
    const data = [
      {
        date: "2023-01-01",
        open: 150.23,
        high: 155.45,
        low: 149.89,
        close: 153.45,
        volume: 1200000,
      },
      {
        date: "2023-01-02",
        open: 153.45,
        high: 157.21,
        low: 152.88,
        close: 156.78,
        volume: 1500000,
      },
      {
        date: "2023-01-03",
        open: 156.78,
        high: 158.45,
        low: 154.67,
        close: 155.23,
        volume: 1300000,
      },
      {
        date: "2023-01-04",
        open: 155.23,
        high: 156.78,
        low: 151.34,
        close: 152.45,
        volume: 1400000,
      },
      {
        date: "2023-01-05",
        open: 152.45,
        high: 154.56,
        low: 148.78,
        close: 149.34,
        volume: 1600000,
      },
      {
        date: "2023-01-06",
        open: 149.34,
        high: 153.67,
        low: 148.56,
        close: 152.89,
        volume: 1700000,
      },
      {
        date: "2023-01-07",
        open: 152.89,
        high: 156.78,
        low: 151.45,
        close: 155.67,
        volume: 1400000,
      },
      {
        date: "2023-01-08",
        open: 155.67,
        high: 158.9,
        low: 154.56,
        close: 157.89,
        volume: 1500000,
      },
      {
        date: "2023-01-09",
        open: 157.89,
        high: 159.23,
        low: 155.67,
        close: 156.78,
        volume: 1300000,
      },
      {
        date: "2023-01-10",
        open: 156.78,
        high: 158.45,
        low: 154.23,
        close: 155.34,
        volume: 1400000,
      },
      {
        date: "2023-01-11",
        open: 155.34,
        high: 157.89,
        low: 153.45,
        close: 156.9,
        volume: 1500000,
      },
      {
        date: "2023-01-12",
        open: 156.9,
        high: 159.34,
        low: 155.78,
        close: 158.45,
        volume: 1600000,
      },
      {
        date: "2023-01-13",
        open: 158.45,
        high: 160.23,
        low: 157.34,
        close: 159.67,
        volume: 1700000,
      },
      {
        date: "2023-01-14",
        open: 159.67,
        high: 161.45,
        low: 158.23,
        close: 160.89,
        volume: 1800000,
      },
      {
        date: "2023-01-15",
        open: 160.89,
        high: 162.34,
        low: 159.45,
        close: 161.23,
        volume: 1900000,
      },
    ].map((d) => ({
      ...d,
      date: new Date(d.date),
      volume: +d.volume,
      open: +d.open,
      high: +d.high,
      low: +d.low,
      close: +d.close,
    }));

    // Setup dimensions
    const width = 1000;
    const height = 600;
    const margin = { top: 40, right: 60, bottom: 100, left: 70 };
    const volumeHeight = 100; // Height for volume bars
    const candlestickHeight =
      height - margin.top - margin.bottom - volumeHeight - 20; // Height for candlesticks

    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    context.translate(margin.left, margin.top);

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date))
      .range([0, width - margin.left - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.low) * 0.995,
        d3.max(data, (d) => d.high) * 1.005,
      ])
      .range([candlestickHeight, 0]);

    const volumeScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.volume)])
      .range([volumeHeight, 0]);

    // Calculate candlestick width
    const candlestickWidth = Math.min(
      ((width - margin.left - margin.right) / data.length) * 0.8,
      15
    );

    // Draw axes
    const drawAxes = () => {
      // X-axis
      context.beginPath();
      context.strokeStyle = "#000";
      context.moveTo(0, candlestickHeight);
      context.lineTo(width - margin.left - margin.right, candlestickHeight);
      context.stroke();

      // X-axis ticks and labels
      const xTicks = xScale.ticks(10);
      const formatDate = d3.timeFormat("%m/%d");
      xTicks.forEach((tick) => {
        const x = xScale(tick);

        // Draw tick
        context.beginPath();
        context.moveTo(x, candlestickHeight);
        context.lineTo(x, candlestickHeight + 5);
        context.stroke();

        // Draw label
        context.save();
        context.translate(x, candlestickHeight + 20);
        context.rotate((-45 * Math.PI) / 180);
        context.textAlign = "right";
        context.fillStyle = "#000";
        context.font = "12px Arial";
        context.fillText(formatDate(tick), 0, 0);
        context.restore();

        // Draw vertical grid
        context.beginPath();
        context.strokeStyle = "#e0e0e0";
        context.setLineDash([1, 3]);
        context.moveTo(x, 0);
        context.lineTo(x, candlestickHeight);
        context.stroke();
        context.setLineDash([]);
      });

      // Y-axis
      context.beginPath();
      context.strokeStyle = "#000";
      context.moveTo(0, 0);
      context.lineTo(0, candlestickHeight);
      context.stroke();

      // Y-axis ticks and labels
      const yTicks = yScale.ticks(8);
      yTicks.forEach((tick) => {
        const y = yScale(tick);

        // Draw tick
        context.beginPath();
        context.moveTo(-5, y);
        context.lineTo(0, y);
        context.stroke();

        // Draw label
        context.textAlign = "right";
        context.textBaseline = "middle";
        context.fillText(tick.toFixed(2), -10, y);

        // Draw horizontal grid
        context.beginPath();
        context.strokeStyle = "#e0e0e0";
        context.setLineDash([1, 3]);
        context.moveTo(0, y);
        context.lineTo(width - margin.left - margin.right, y);
        context.stroke();
        context.setLineDash([]);
      });

      // Volume y-axis
      const volumeStart = candlestickHeight + 20;
      context.beginPath();
      context.strokeStyle = "#000";
      context.moveTo(0, volumeStart);
      context.lineTo(0, volumeStart + volumeHeight);
      context.stroke();

      // Volume scale ticks
      const volumeTicks = volumeScale.ticks(3);
      volumeTicks.forEach((tick) => {
        const y = volumeScale(tick) + volumeStart;
        context.beginPath();
        context.moveTo(-5, y);
        context.lineTo(0, y);
        context.stroke();
        context.textAlign = "right";
        context.fillText((tick / 1000000).toFixed(1) + "M", -10, y);
      });
    };

    // Draw candlesticks and volume bars
    const drawCandlesticks = () => {
      data.forEach((d, i) => {
        const x = xScale(d.date);
        const high = yScale(d.high);
        const low = yScale(d.low);
        const open = yScale(d.open);
        const close = yScale(d.close);

        // Draw high-low line
        context.beginPath();
        context.strokeStyle = d.close > d.open ? "#2E8B57" : "#DC143C";
        context.moveTo(x, high);
        context.lineTo(x, low);
        context.stroke();

        // Draw candlestick body
        context.fillStyle = d.close > d.open ? "#2E8B57" : "#DC143C";
        context.fillRect(
          x - candlestickWidth / 2,
          Math.min(open, close),
          candlestickWidth,
          Math.abs(close - open)
        );

        // Draw volume bars
        const volumeY = volumeScale(d.volume) + candlestickHeight + 20;
        context.fillStyle =
          d.close > d.open
            ? "rgba(46, 139, 87, 0.5)"
            : "rgba(220, 20, 60, 0.5)";
        context.fillRect(
          x - candlestickWidth / 2,
          volumeY,
          candlestickWidth,
          volumeHeight - volumeScale(d.volume)
        );
      });
    };

    // Draw title and labels
    const drawLabels = () => {
      context.fillStyle = "#000";
      context.font = "bold 16px Arial";
      context.textAlign = "center";
      context.fillText(
        "Stock Price Chart",
        (width - margin.left - margin.right) / 2,
        -20
      );

      // Price label
      context.save();
      context.translate(-50, candlestickHeight / 2);
      context.rotate(-Math.PI / 2);
      context.textAlign = "center";
      context.font = "14px Arial";
      context.fillText("Price ($)", 0, 0);
      context.restore();

      // Volume label
      context.save();
      context.translate(-50, candlestickHeight + 20 + volumeHeight / 2);
      context.rotate(-Math.PI / 2);
      context.fillText("Volume", 0, 0);
      context.restore();
    };

    // Clear and draw everything
    context.clearRect(-margin.left, -margin.top, width, height);
    drawAxes();
    drawCandlesticks();
    drawLabels();
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

export default CandlestickChart;
