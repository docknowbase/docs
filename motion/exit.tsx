import React, { useEffect, useRef, useState } from "react";
import { easeBackIn } from "d3-ease";

const CanvasExitAnimation = () => {
  const canvasRef = useRef(null);
  const [circles, setCircles] = useState([]);
  const [exitingCircles, setExitingCircles] = useState([]);

  // Add new circle
  const addCircle = () => {
    const newCircle = {
      id: Date.now(),
      x: 100 + Math.random() * 600,
      y: 100 + Math.random() * 200,
      radius: 20 + Math.random() * 30,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    };
    setCircles((prev) => [...prev, newCircle]);
  };

  // Remove circle with exit animation
  const removeCircle = (circleId) => {
    const circleToRemove = circles.find((c) => c.id === circleId);
    if (circleToRemove) {
      setExitingCircles((prev) => [
        ...prev,
        { ...circleToRemove, startTime: null },
      ]);
      setCircles((prev) => prev.filter((c) => c.id !== circleId));
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const devicePixelRatio = window.devicePixelRatio || 1;

    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    context.scale(devicePixelRatio, devicePixelRatio);

    let animationFrameId;
    const exitDuration = 800;

    const draw = (timestamp) => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw static circles
      circles.forEach((circle) => {
        context.beginPath();
        context.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);

        // Gradient fill
        const gradient = context.createRadialGradient(
          circle.x,
          circle.y,
          0,
          circle.x,
          circle.y,
          circle.radius
        );
        gradient.addColorStop(0, circle.color);
        gradient.addColorStop(1, circle.color.replace(")", ", 0.7)"));

        context.fillStyle = gradient;
        context.fill();

        // Add click area indicator
        context.beginPath();
        context.arc(circle.x, circle.y, circle.radius + 5, 0, 2 * Math.PI);
        context.strokeStyle = "rgba(255, 255, 255, 0.3)";
        context.lineWidth = 2;
        context.stroke();
      });

      // Draw exiting circles with animation
      setExitingCircles((prevExiting) => {
        return prevExiting.filter((circle) => {
          if (!circle.startTime) circle.startTime = timestamp;

          const elapsed = timestamp - circle.startTime;
          const progress = Math.min(elapsed / exitDuration, 1);
          const easedProgress = easeBackIn(progress);

          // Scale down and fade out
          const currentRadius = circle.radius * (1 - easedProgress);
          const opacity = 1 - easedProgress;

          // Spiral movement
          const angle = easedProgress * Math.PI * 4;
          const spiralRadius = 50 * easedProgress;
          const currentX = circle.x + Math.cos(angle) * spiralRadius;
          const currentY = circle.y + Math.sin(angle) * spiralRadius;

          context.beginPath();
          context.arc(currentX, currentY, currentRadius, 0, 2 * Math.PI);

          // Gradient with opacity
          const gradient = context.createRadialGradient(
            currentX,
            currentY,
            0,
            currentX,
            currentY,
            currentRadius
          );
          const color = circle.color.replace(")", `, ${opacity})`);
          gradient.addColorStop(0, color);
          gradient.addColorStop(
            1,
            circle.color.replace(")", `, ${opacity * 0.7})`)
          );

          context.fillStyle = gradient;
          context.fill();

          // Trail effect
          if (progress < 0.8) {
            for (let i = 1; i <= 3; i++) {
              const trailProgress = Math.max(0, progress - i * 0.1);
              const trailAngle = trailProgress * Math.PI * 4;
              const trailRadius = 50 * trailProgress;
              const trailX = circle.x + Math.cos(trailAngle) * trailRadius;
              const trailY = circle.y + Math.sin(trailAngle) * trailRadius;

              context.beginPath();
              context.arc(
                trailX,
                trailY,
                currentRadius * (1 - i * 0.2),
                0,
                2 * Math.PI
              );
              context.fillStyle = circle.color.replace(
                ")",
                `, ${opacity * 0.2})`
              );
              context.fill();
            }
          }

          return progress < 1;
        });
      });

      // Continue animation if there are exiting circles
      if (exitingCircles.length > 0) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [circles, exitingCircles]);

  // Handle canvas click for circle removal
  const handleCanvasClick = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if click is within any circle
    circles.forEach((circle) => {
      const dx = circle.x - x;
      const dy = circle.y - y;
      if (Math.sqrt(dx * dx + dy * dy) <= circle.radius) {
        removeCircle(circle.id);
      }
    });
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          width: "800px",
          height: "400px",
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      />
      <button
        onClick={addCircle}
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          padding: "8px 16px",
          background: "#4a90e2",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Add Circle
      </button>
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          padding: "8px",
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "4px",
          fontSize: "14px",
        }}
      >
        Click on circles to remove them
      </div>
    </div>
  );
};

export default CanvasExitAnimation;
