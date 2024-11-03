import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react";
import ProgressBar from "./ProgressBar";

describe("ProgressBar Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // Basic Rendering Tests
  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      const { container } = render(<ProgressBar />);
      expect(container).toBeTruthy();
    });

    it("renders with default props", () => {
      render(<ProgressBar />);
      const progressbar = screen.getByRole("progressbar");
      expect(progressbar).toHaveAttribute("aria-valuemin", "0");
      expect(progressbar).toHaveAttribute("aria-valuemax", "100");
      expect(progressbar).toHaveAttribute("aria-valuenow", "0");
    });
  });

  // Value and Percentage Tests
  describe("Value and Percentage Calculations", () => {
    it("correctly calculates and displays percentage", () => {
      render(<ProgressBar value={50} max={100} min={0} />);
      expect(screen.getByText("50%")).toBeTruthy();
    });

    it("handles values outside min-max range", () => {
      render(<ProgressBar value={150} max={100} min={0} />);
      expect(screen.getByText("100%")).toBeTruthy();
    });

    it("handles negative values correctly", () => {
      render(<ProgressBar value={-10} max={100} min={0} />);
      expect(screen.getByText("0%")).toBeTruthy();
    });

    it("calculates percentage with custom min-max range", () => {
      render(<ProgressBar value={75} max={200} min={50} />);
      expect(screen.getByText("17%")).toBeTruthy(); // (75-50)/(200-50) * 100 ≈ 17%
    });
  });

  // Label Tests
  describe("Label Rendering", () => {
    it("shows custom label when provided", () => {
      render(<ProgressBar customLabel="Loading..." />);
      expect(screen.getByText("Loading...")).toBeTruthy();
    });

    it("shows value when showValue is true", () => {
      render(<ProgressBar value={30} showValue={true} />);
      expect(screen.getByText("30%")).toBeTruthy();
    });

    it("hides value when showValue is false", () => {
      render(<ProgressBar value={30} showValue={false} showLabel={false} />);
      expect(screen.queryByText("30%")).toBeNull();
    });

    it("renders label in correct position", () => {
      const { container } = render(
        <ProgressBar value={50} labelPosition="top" />
      );
      expect(container.querySelector(".progress-bar__label--top")).toBeTruthy();
    });
  });

  // Variant and Style Tests
  describe("Styling and Variants", () => {
    it("applies variant class correctly", () => {
      const { container } = render(<ProgressBar variant="primary" />);
      expect(container.firstChild).toHaveClass("progress-bar--primary");
    });

    it("applies size class correctly", () => {
      const { container } = render(<ProgressBar size="medium" />);
      expect(container.firstChild).toHaveClass("progress-bar--medium");
    });

    it("applies thickness class correctly", () => {
      const { container } = render(<ProgressBar thickness="normal" />);
      expect(container.firstChild).toHaveClass("progress-bar--normal");
    });

    it("applies rounded corners when specified", () => {
      const { container } = render(<ProgressBar roundedCorners={true} />);
      expect(container.firstChild).toHaveClass("progress-bar--rounded");
    });
  });

  // Animation and State Tests
  describe("Animation and State Changes", () => {
    it("applies animation class when animated is true", () => {
      const { container } = render(<ProgressBar animated={true} />);
      expect(container.firstChild).toHaveClass("progress-bar--animated");
    });

    it("applies striped class when striped is true", () => {
      const { container } = render(<ProgressBar striped={true} />);
      expect(container.firstChild).toHaveClass("progress-bar--striped");
    });

    it("handles indeterminate state correctly", () => {
      const { container } = render(<ProgressBar indeterminate={true} />);
      expect(container.firstChild).toHaveClass("progress-bar--indeterminate");
      const progressbar = screen.getByRole("progressbar");
      expect(progressbar).not.toHaveAttribute("aria-valuenow");
    });

    it("detects value increase and applies appropriate class", () => {
      const { container, rerender } = render(<ProgressBar value={30} />);
      rerender(<ProgressBar value={50} />);
      expect(container.firstChild).toHaveClass("progress-bar--increasing");
    });

    it("detects value decrease and applies appropriate class", () => {
      const { container, rerender } = render(<ProgressBar value={50} />);
      rerender(<ProgressBar value={30} />);
      expect(container.firstChild).toHaveClass("progress-bar--decreasing");
    });
  });

  // Status Tests
  describe("Status Handling", () => {
    it("applies correct status class", () => {
      const { container } = render(<ProgressBar status="success" />);
      expect(container.firstChild).toHaveClass("progress-bar--success");
    });

    it("applies default status when not specified", () => {
      const { container } = render(<ProgressBar />);
      expect(container.firstChild).toHaveClass("progress-bar--default");
    });
  });

  // Callback Tests
  describe("Callback Handling", () => {
    it("calls onComplete when progress reaches 100%", () => {
      const onComplete = vi.fn();
      const { rerender } = render(
        <ProgressBar value={90} onComplete={onComplete} />
      );

      rerender(<ProgressBar value={100} onComplete={onComplete} />);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("does not call onComplete when progress is less than 100%", () => {
      const onComplete = vi.fn();
      const { rerender } = render(
        <ProgressBar value={50} onComplete={onComplete} />
      );

      rerender(<ProgressBar value={90} onComplete={onComplete} />);
      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  // Accessibility Tests
  describe("Accessibility", () => {
    it("has correct ARIA attributes", () => {
      render(<ProgressBar value={50} label="Loading Progress" />);
      const progressbar = screen.getByRole("progressbar");
      expect(progressbar).toHaveAttribute("aria-valuemin", "0");
      expect(progressbar).toHaveAttribute("aria-valuemax", "100");
      expect(progressbar).toHaveAttribute("aria-valuenow", "50");
      expect(progressbar).toHaveAttribute("aria-label", "Loading Progress");
    });

    it("uses default aria-label when none provided", () => {
      render(<ProgressBar value={50} />);
      const progressbar = screen.getByRole("progressbar");
      expect(progressbar).toHaveAttribute("aria-label", "Progress");
    });
  });

  // Custom Class Names
  describe("Custom Class Names", () => {
    it("applies custom className correctly", () => {
      const { container } = render(<ProgressBar className="custom-class" />);
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("maintains default classes when custom className is applied", () => {
      const { container } = render(
        <ProgressBar className="custom-class" variant="primary" size="medium" />
      );
      expect(container.firstChild).toHaveClass("custom-class");
      expect(container.firstChild).toHaveClass("progress-bar--primary");
      expect(container.firstChild).toHaveClass("progress-bar--medium");
    });
  });
});
