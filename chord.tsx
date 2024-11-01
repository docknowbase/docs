import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const ChordDiagram = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const width = 600;
    const height = 600;
    const outerRadius = Math.min(width, height) * 0.5 - 60;
    const innerRadius = outerRadius - 20;

    // Sample data matrix - represents relationships between entities
    const matrix = [
      [0, 5, 8, 4],
      [5, 0, 3, 6],
      [8, 3, 0, 2],
      [4, 6, 2, 0],
    ];

    // Clear canvas and set dimensions
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.translate(width / 2, height / 2);

    // Create chord layout
    const chord = d3.chord().padAngle(0.05).sortSubgroups(d3.descending);

    const chords = chord(matrix);
    const ribbon = d3
      .ribbonArrow()
      .radius(innerRadius - 5)
      .padAngle(1 / innerRadius);

    // Color scale
    const color = d3
      .scaleOrdinal()
      .domain(d3.range(4))
      .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"]);

    // Draw the groups (outer arcs)
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

    // Draw groups
    chords.groups.forEach((group) => {
      context.beginPath();
      arc.context(context)(group);
      context.fillStyle = color(group.index);
      context.fill();
      context.stroke();
    });

    // Draw chords
    chords.forEach((chord) => {
      context.beginPath();
      ribbon.context(context)(chord);
      context.fillStyle = color(chord.source.index);
      context.globalAlpha = 0.7;
      context.fill();
      context.globalAlpha = 1;
      context.stroke();
    });
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="max-w-full h-auto" />
    </div>
  );
};

export default ChordDiagram;
