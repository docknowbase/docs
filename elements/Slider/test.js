import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RangeSlider from "./RangeSlider";

describe("RangeSlider", () => {
  const defaultProps = {
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 50,
    label: "Test Range",
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Rendering tests
  describe("Rendering", () => {
    it("renders with default props", () => {
      render(<RangeSlider {...defaultProps} />);
      expect(screen.getByLabelText("Test Range")).toBeInTheDocument();
      expect(screen.getByRole("spinbutton")).toHaveValue(50);
      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <RangeSlider {...defaultProps} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("applies different themes", () => {
      const { container: primary } = render(
        <RangeSlider {...defaultProps} theme="primary" />
      );
      expect(primary.firstChild).toHaveClass("range-slider--primary");

      const { container: secondary } = render(
        <RangeSlider {...defaultProps} theme="secondary" />
      );
      expect(secondary.firstChild).toHaveClass("range-slider--secondary");

      const { container: success } = render(
        <RangeSlider {...defaultProps} theme="success" />
      );
      expect(success.firstChild).toHaveClass("range-slider--success");
    });
  });

  // Input handling tests
  describe("Input Handling", () => {
    it("updates value when number input changes", () => {
      render(<RangeSlider {...defaultProps} />);
      const input = screen.getByRole("spinbutton");

      fireEvent.change(input, { target: { value: "75" } });
      expect(input).toHaveValue(75);
      expect(defaultProps.onChange).toHaveBeenCalledWith(75);
    });

    it("clamps input value to min/max range", () => {
      render(<RangeSlider {...defaultProps} />);
      const input = screen.getByRole("spinbutton");

      fireEvent.change(input, { target: { value: "150" } });
      expect(input).toHaveValue(100);

      fireEvent.change(input, { target: { value: "-10" } });
      expect(input).toHaveValue(0);
    });
  });

  // Click handling tests
  describe("Click Handling", () => {
    it("updates value when clicking on track", () => {
      const { container } = render(<RangeSlider {...defaultProps} />);
      const track = container.querySelector(".range-slider__track");

      // Mock getBoundingClientRect
      const mockRect = {
        left: 0,
        width: 200,
      };
      vi.spyOn(track, "getBoundingClientRect").mockReturnValue(mockRect);

      // Simulate click at 75% of track width
      fireEvent.click(track, {
        clientX: 150, // 75% of 200px
      });

      expect(screen.getByRole("spinbutton")).toHaveValue(75);
      expect(defaultProps.onChange).toHaveBeenCalledWith(75);
    });
  });

  // Drag handling tests
  describe("Drag Handling", () => {
    it("handles drag operations", () => {
      const { container } = render(<RangeSlider {...defaultProps} />);
      const handle = container.querySelector(".range-slider__handle");
      const track = container.querySelector(".range-slider__track");

      // Mock getBoundingClientRect
      const mockRect = {
        left: 0,
        width: 200,
      };
      vi.spyOn(track, "getBoundingClientRect").mockReturnValue(mockRect);

      // Start drag
      fireEvent.mouseDown(handle);
      expect(container.firstChild).toHaveClass("range-slider--dragging");

      // Move to 25% of width
      act(() => {
        fireEvent.mouseMove(window, {
          clientX: 50, // 25% of 200px
        });
      });
      expect(screen.getByRole("spinbutton")).toHaveValue(25);

      // End drag
      fireEvent.mouseUp(window);
      expect(container.firstChild).not.toHaveClass("range-slider--dragging");
    });
  });

  // Disabled state tests
  describe("Disabled State", () => {
    it("disables all interactions when disabled prop is true", () => {
      const { container } = render(<RangeSlider {...defaultProps} disabled />);
      const input = screen.getByRole("spinbutton");
      const track = container.querySelector(".range-slider__track");
      const handle = container.querySelector(".range-slider__handle");

      expect(container.firstChild).toHaveClass("range-slider--disabled");
      expect(input).toBeDisabled();

      // Mock getBoundingClientRect
      const mockRect = {
        left: 0,
        width: 200,
      };
      vi.spyOn(track, "getBoundingClientRect").mockReturnValue(mockRect);

      // Try to interact
      fireEvent.click(track, { clientX: 150 });
      fireEvent.mouseDown(handle);
      fireEvent.mouseMove(window, { clientX: 50 });

      // Value should remain unchanged
      expect(screen.getByRole("spinbutton")).toHaveValue(50);
      expect(defaultProps.onChange).not.toHaveBeenCalled();
    });
  });

  // Focus state tests
  describe("Focus State", () => {
    it("handles focus and blur events", () => {
      const { container } = render(<RangeSlider {...defaultProps} />);
      const input = screen.getByRole("spinbutton");

      fireEvent.focus(input);
      expect(container.firstChild).toHaveClass("range-slider--focused");

      fireEvent.blur(input);
      expect(container.firstChild).not.toHaveClass("range-slider--focused");
    });
  });

  // Edge cases
  describe("Edge Cases", () => {
    it("handles step prop correctly", () => {
      render(<RangeSlider {...defaultProps} step={5} />);
      const input = screen.getByRole("spinbutton");

      fireEvent.change(input, { target: { value: "77" } });
      // Should round to nearest step
      expect(input).toHaveValue(75);
    });

    it("handles non-zero min value", () => {
      render(
        <RangeSlider {...defaultProps} min={20} max={120} defaultValue={70} />
      );
      const input = screen.getByRole("spinbutton");

      expect(input).toHaveValue(70);
      expect(screen.getByText("20")).toBeInTheDocument();
      expect(screen.getByText("120")).toBeInTheDocument();
    });

    it("handles cleanup of event listeners", () => {
      const { container, unmount } = render(<RangeSlider {...defaultProps} />);
      const handle = container.querySelector(".range-slider__handle");

      // Start drag
      fireEvent.mouseDown(handle);

      // Unmount while dragging
      unmount();

      // Verify no errors when moving mouse after unmount
      fireEvent.mouseMove(window, { clientX: 50 });
      fireEvent.mouseUp(window);
    });
  });
});
