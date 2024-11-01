import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const d3DrawEls = ({ width = 600, height = 400 }) => {
  // Define the canvas names array
  const canvasTypes = [
    "bar",
    "axes",
    "line",
    "scatter",
    "smoothline",
    "area",
    "barr",
    "pie",
    "histogram",
  ];

  // Create an object of refs for each canvas dynamically
  const canvasRefs = useRef(
    canvasTypes.reduce((acc, type) => {
      acc[type] = null;
      return acc;
    }, {})
  );

  // Bar Chart - useEffect for "bar" canvas
  useEffect(() => {
    const cur = "bar";
    const canvas = canvasRefs.current[cur];
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Sample data for the bar chart
    const data = [100, 200, 150, 300, 250];

    // Chart settings
    const barWidth = 50;
    const barGap = 20;
    const maxDataValue = Math.max(...data);
    const scaleY = height / maxDataValue;

    // Clear canvas before drawing
    ctx.clearRect(0, 0, width, height);

    // Draw bars
    data.forEach((value, index) => {
      const barHeight = value * scaleY;
      const x = index * (barWidth + barGap);
      const y = height - barHeight;

      ctx.fillStyle = "teal";
      ctx.fillRect(x, y, barWidth, barHeight);
    });
  }, [width, height]);

  useEffect(() => {
    const cur = "axes";
    const canvas = canvasRefs.current[cur];
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Sample data
    const data = [100, 200, 150, 300, 250];

    // Define the scales
    const margin = 40;
    const xScale = (d, index) =>
      margin + (index * (width - 2 * margin)) / data.length;
    const yScale = (d) =>
      height - margin - (d / Math.max(...data)) * (height - 2 * margin);

    // Clear canvas before drawing
    ctx.clearRect(0, 0, width, height);

    // Draw X Axis
    ctx.beginPath();
    ctx.moveTo(margin, height - margin); // Starting point (left-bottom)
    ctx.lineTo(width - margin, height - margin); // Ending point (right-bottom)
    ctx.strokeStyle = "black";
    ctx.stroke();

    // Draw Y Axis
    ctx.beginPath();
    ctx.moveTo(margin, height - margin); // Starting point (left-bottom)
    ctx.lineTo(margin, margin); // Ending point (top-left)
    ctx.stroke();

    // Draw X Axis Ticks
    const tickSize = 10;
    data.forEach((d, index) => {
      const x = xScale(d, index);
      ctx.beginPath();
      ctx.moveTo(x, height - margin); // Starting at the axis
      ctx.lineTo(x, height - margin + tickSize); // Draw tick mark
      ctx.stroke();
      // Optional: Add text labels for X axis
      ctx.fillStyle = "black";
      ctx.font = "12px Arial";
      ctx.fillText(index + 1, x - 5, height - margin + tickSize + 15);
    });

    // Draw Y Axis Ticks and Labels
    const yTickCount = 5;
    for (let i = 0; i <= yTickCount; i++) {
      const yValue = (i / yTickCount) * Math.max(...data); // Scale between 0 and max data value
      const y = yScale(yValue);

      // Draw tick mark
      ctx.beginPath();
      ctx.moveTo(margin - tickSize, y);
      ctx.lineTo(margin, y);
      ctx.stroke();

      // Optional: Add text labels for Y axis
      ctx.fillText(yValue.toFixed(0), margin - tickSize - 30, y + 5);
    }
  }, [width, height]);

  // Line Chart - useEffect for "line" canvas
  useEffect(() => {
    const cur = "line";
    const canvas = canvasRefs.current[cur];
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Sample data for the line graph
    const data = [100, 200, 150, 300, 250];

    // Define scales to map data to canvas coordinates
    const margin = 40;
    const xScale = d3
      .scaleLinear()
      .domain([0, data.length - 1]) // Data index: 0, 1, 2, 3, ...
      .range([margin, width - margin]); // Canvas x-axis range

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data)]) // Data values range from 0 to max data value
      .range([height - margin, margin]); // Canvas y-axis range (inverted)

    // Clear canvas before drawing
    ctx.clearRect(0, 0, width, height);

    // Begin drawing the line
    ctx.beginPath();

    // Set the first point (move to the first data point)
    ctx.moveTo(xScale(0), yScale(data[0]));

    // Loop through the data points and draw lines
    for (let i = 1; i < data.length; i++) {
      const x = xScale(i);
      const y = yScale(data[i]);
      ctx.lineTo(x, y); // Draw a line to the next point
    }

    // Set line color and style
    ctx.strokeStyle = "steelblue";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [width, height]);

  // Scatter Plot - useEffect for "scatter" canvas
  useEffect(() => {
    const cur = "scatter";
    const canvas = canvasRefs.current[cur];
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Sample data for the scatter plot (x, y)
    const data = [
      { x: 30, y: 80 },
      { x: 70, y: 120 },
      { x: 110, y: 180 },
      { x: 150, y: 200 },
      { x: 200, y: 160 },
      { x: 250, y: 220 },
      { x: 300, y: 150 },
    ];

    // Define scales to map data values to canvas coordinates
    const margin = 40;
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.x)]) // Data range for x-axis
      .range([margin, width - margin]); // Canvas x-axis range

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.y)]) // Data range for y-axis
      .range([height - margin, margin]); // Canvas y-axis range (inverted)

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, width, height);

    // Set the point size and color
    ctx.fillStyle = "steelblue";
    const pointRadius = 5;

    // Draw the scatter plot points
    data.forEach((d) => {
      const x = xScale(d.x);
      const y = yScale(d.y);

      // Draw each point as a filled circle
      ctx.beginPath();
      ctx.arc(x, y, pointRadius, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [width, height]);

  // Smooth Line Chart - useEffect for "smoothline" canvas
  useEffect(() => {
    const cur = "smoothline";
    const canvas = canvasRefs.current[cur];
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Sample data for the line graph
    const data = [100, 200, 150, 300, 250, 350, 200, 100];

    // Define scales to map data values to canvas coordinates
    const margin = 40;
    const xScale = d3
      .scaleLinear()
      .domain([0, data.length - 1]) // Data range for x-axis (indexes)
      .range([margin, width - margin]); // Canvas x-axis range

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data)]) // Data range for y-axis
      .range([height - margin, margin]); // Canvas y-axis range (inverted)

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, width, height);

    // Define the line function using D3
    const line = d3
      .line()
      .x((d, i) => xScale(i)) // X position is based on the index of the data point
      .y((d) => yScale(d)) // Y position is based on the data value
      .curve(d3.curveMonotoneX); // Smooth the line with a monotone curve

    // Begin drawing the line
    ctx.beginPath();
    const pathData = line(data); // Generate the path data for the line

    // Draw the path directly on the canvas using ctx
    const path = new Path2D(pathData);
    ctx.strokeStyle = "steelblue";
    ctx.lineWidth = 2;
    ctx.stroke(path);
  }, [width, height]);

  // Area Chart - useEffect for "area" canvas
  useEffect(() => {
    const cur = "area";
    const canvas = canvasRefs.current[cur];
    const ctx = canvas.getContext("2d");

    // Sample data for the area plot
    const data = [100, 200, 150, 300, 250, 350, 200, 100];

    // Define scales to map data values to canvas coordinates
    const margin = 40;
    const xScale = d3
      .scaleLinear()
      .domain([0, data.length - 1]) // Data range for x-axis (indexes)
      .range([margin, width - margin]); // Canvas x-axis range

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data)]) // Data range for y-axis
      .range([height - margin, margin]); // Canvas y-axis range (inverted)

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, width, height);

    // Define the area function using D3
    const area = d3
      .area()
      .x((d, i) => xScale(i)) // X position is based on the index of the data point
      .y0(height - margin) // Start the area at the bottom (y=height)
      .y1((d) => yScale(d)) // Y position is based on the data value
      .curve(d3.curveMonotoneX); // Smooth the curve with a monotone curve

    // Generate the area path data
    const areaPathData = area(data);
    const areaPath = new Path2D(areaPathData);

    // Fill the area with color
    ctx.fillStyle = "steelblue";
    ctx.fill(areaPath);
  }, [width, height]);

  useEffect(() => {
    const cur = "barr";
    const canvas = canvasRefs.current[cur];
    const ctx = canvas.getContext("2d");

    // Sample data for the bar chart (e.g., Y-values of each bar)
    const data = [100, 200, 150, 300, 250, 350, 200, 100];

    // Define scales to map data values to canvas coordinates
    const margin = 40;
    const xScale = d3
      .scaleBand()
      .domain(d3.range(data.length)) // Create a scale for the data indices
      .range([margin, width - margin]) // Canvas x-axis range
      .padding(0.1); // Space between bars

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data)]) // Data range for y-axis
      .range([height - margin, margin]); // Canvas y-axis range (inverted)

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, width, height);

    // Draw the bars
    data.forEach((d, i) => {
      const barWidth = xScale.bandwidth(); // Width of each bar
      const x = xScale(i); // X position of the bar
      const y = yScale(d); // Y position of the top of the bar
      const barHeight = height - margin - y; // Height of the bar

      // Set the fill color and draw the bar
      ctx.fillStyle = "steelblue";
      ctx.fillRect(x, y, barWidth, barHeight); // Draw the rectangle (bar)
    });
  }, [width, height]);

  useEffect(() => {
    const cur = "pie";
    const canvas = canvasRefs.current[cur];
    const ctx = canvas.getContext("2d");

    // Sample data for the pie chart (values should sum up to 100 for percentages)
    const data = [25, 35, 15, 25];

    // Define color scale for the pie slices
    const colorScale = d3
      .scaleOrdinal()
      .domain(data)
      .range(d3.schemeCategory10); // Predefined color scheme for discrete colors

    // Compute the pie chart layout
    const pie = d3.pie()(data); // Computes the angles for each slice

    // Set up the radius and center for the pie chart
    const radius = Math.min(width, height) / 2 - 40;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, width, height);

    // Draw each slice of the pie chart
    pie.forEach((slice, i) => {
      // Calculate the start and end angles for this slice
      const startAngle = slice.startAngle;
      const endAngle = slice.endAngle;

      // Set the fill color for this slice
      ctx.fillStyle = colorScale(i);

      // Draw the slice (sector) using arc
      ctx.beginPath();
      ctx.moveTo(centerX, centerY); // Move to the center
      ctx.arc(centerX, centerY, radius, startAngle, endAngle); // Draw the arc (slice)
      ctx.fill(); // Fill the slice with the color
    });
  }, [width, height]);

  useEffect(() => {
    const cur = "histogram";
    const canvas = canvasRefs.current[cur];
    const ctx = canvas.getContext("2d");

    // Sample data for the histogram (array of values)
    const data = [1, 2, 2, 3, 3, 3, 4, 4, 5, 6, 6, 6, 7, 8, 9, 9, 9, 10];

    // Define the number of bins for the histogram
    const numBins = 5;

    // Create a histogram using D3
    const histogram = d3
      .histogram()
      .domain([0, d3.max(data)]) // Define the range of the data
      .thresholds(numBins)(
      // Define the number of bins
      data
    ); // Apply to the data

    // Set up the scales for x and y axes
    const margin = 40;
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(histogram, (d) => d.x1)]) // Maximum value from histogram bins
      .range([margin, width - margin]); // Canvas x-axis range

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(histogram, (d) => d.length)]) // Max frequency from histogram bins
      .range([height - margin, margin]); // Canvas y-axis range (inverted)

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, width, height);

    // Draw each bin as a bar in the histogram
    histogram.forEach((bin) => {
      const x = xScale(bin.x0); // Start of the bin on x-axis
      const barWidth = xScale(bin.x1) - x; // Width of each bar (bin width)
      const y = yScale(bin.length); // Height of the bar based on frequency
      const barHeight = height - margin - y; // Inverted y-axis for drawing the bar

      // Set the fill color for the bars
      ctx.fillStyle = "steelblue";
      ctx.fillRect(x, y, barWidth, barHeight); // Draw the bar
    });
  }, [width, height]);

  return (
    <>
      {canvasTypes.map((canvasType) => (
        <canvas
          key={canvasType}
          ref={(el) => (canvasRefs.current[canvasType] = el)} // Dynamically assign canvas refs
          width={width}
          height={height}
          style={{ border: "1px solid black", margin: "10px" }}
        />
      ))}
    </>
  );
};

export default d3DrawEls;
