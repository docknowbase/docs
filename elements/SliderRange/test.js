import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DualRangeSlider from "./DualRangeSlider";

describe("DualRangeSlider", () => {
  const defaultProps = {
    min: 0,
    max: 100,
    step: 1,
    defaultMinValue: 25,
    defaultMaxValue: 75,
    label: "Test Range",
    onChange: vi.fn(),
  };

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // Render Tests
  describe("Rendering", () => {
    it("renders with default props", () => {
      const { container } = render(<DualRangeSlider {...defaultProps} />);

      expect(container.querySelector(".dual-range-slider")).toBeTruthy();
      expect(screen.getByText("Test Range")).toBeTruthy();
      expect(container.querySelectorAll('input[type="number"]')).toHaveLength(
        2
      );
      expect(
        container.querySelectorAll(".dual-range-slider__handle")
      ).toHaveLength(2);
    });

    it("renders with custom class name", () => {
      const { container } = render(
        <DualRangeSlider {...defaultProps} className="custom-class" />
      );

      expect(container.querySelector(".custom-class")).toBeTruthy();
    });

    it("renders with different theme", () => {
      const { container } = render(
        <DualRangeSlider {...defaultProps} theme="secondary" />
      );

      expect(
        container.querySelector(".dual-range-slider--secondary")
      ).toBeTruthy();
    });

    it("renders min and max limits", () => {
      render(<DualRangeSlider {...defaultProps} />);

      expect(screen.getByText("0")).toBeTruthy();
      expect(screen.getByText("100")).toBeTruthy();
    });
  });

  // Input Interaction Tests
  describe("Input Interactions", () => {
    it("updates min value on min input change", async () => {
      const user = userEvent.setup();
      render(<DualRangeSlider {...defaultProps} />);

      const minInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(minInput);
      await user.type(minInput, "30");

      expect(defaultProps.onChange).toHaveBeenCalledWith({ min: 30, max: 75 });
    });

    it("updates max value on max input change", async () => {
      const user = userEvent.setup();
      render(<DualRangeSlider {...defaultProps} />);

      const maxInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(maxInput);
      await user.type(maxInput, "80");

      expect(defaultProps.onChange).toHaveBeenCalledWith({ min: 25, max: 80 });
    });

    it("prevents min value from exceeding max value", async () => {
      const user = userEvent.setup();
      render(<DualRangeSlider {...defaultProps} />);

      const minInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(minInput);
      await user.type(minInput, "80");

      expect(defaultProps.onChange).toHaveBeenCalledWith({ min: 74, max: 75 });
    });

    it("prevents max value from going below min value", async () => {
      const user = userEvent.setup();
      render(<DualRangeSlider {...defaultProps} />);

      const maxInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(maxInput);
      await user.type(maxInput, "20");

      expect(defaultProps.onChange).toHaveBeenCalledWith({ min: 25, max: 26 });
    });
  });

  // Slider Interaction Tests
  describe("Slider Interactions", () => {
    it("handles slider track click", () => {
      const { container } = render(<DualRangeSlider {...defaultProps} />);
      const track = container.querySelector(".dual-range-slider__track");

      // Simulate click at 50% of track width
      fireEvent.click(track, {
        clientX: track.getBoundingClientRect().left + track.offsetWidth * 0.5,
      });

      expect(defaultProps.onChange).toHaveBeenCalled();
    });

    it("updates values when dragging min handle", () => {
      const { container } = render(<DualRangeSlider {...defaultProps} />);
      const minHandle = container.querySelector(
        ".dual-range-slider__handle--min"
      );

      fireEvent.mouseDown(minHandle);
      fireEvent.mouseMove(document, {
        clientX: minHandle.getBoundingClientRect().left + 50,
      });
      fireEvent.mouseUp(document);

      expect(defaultProps.onChange).toHaveBeenCalled();
    });

    it("updates values when dragging max handle", () => {
      const { container } = render(<DualRangeSlider {...defaultProps} />);
      const maxHandle = container.querySelector(
        ".dual-range-slider__handle--max"
      );

      fireEvent.mouseDown(maxHandle);
      fireEvent.mouseMove(document, {
        clientX: maxHandle.getBoundingClientRect().left - 50,
      });
      fireEvent.mouseUp(document);

      expect(defaultProps.onChange).toHaveBeenCalled();
    });
  });

  // Disabled State Tests
  describe("Disabled State", () => {
    it("renders in disabled state", () => {
      const { container } = render(
        <DualRangeSlider {...defaultProps} disabled={true} />
      );

      expect(
        container.querySelector(".dual-range-slider--disabled")
      ).toBeTruthy();
      expect(screen.getAllByRole("spinbutton")[0]).toBeDisabled();
      expect(screen.getAllByRole("spinbutton")[1]).toBeDisabled();
    });

    it("prevents interactions when disabled", () => {
      const { container } = render(
        <DualRangeSlider {...defaultProps} disabled={true} />
      );

      const track = container.querySelector(".dual-range-slider__track");
      fireEvent.click(track);

      expect(defaultProps.onChange).not.toHaveBeenCalled();
    });
  });

  // Focus State Tests
  describe("Focus States", () => {
    it("adds focused class when input is focused", () => {
      const { container } = render(<DualRangeSlider {...defaultProps} />);
      const minInput = screen.getAllByRole("spinbutton")[0];

      fireEvent.focus(minInput);
      expect(
        container.querySelector(".dual-range-slider--focused")
      ).toBeTruthy();

      fireEvent.blur(minInput);
      expect(
        container.querySelector(".dual-range-slider--focused")
      ).toBeFalsy();
    });
  });

  // Step Functionality Tests
  describe("Step Functionality", () => {
    it("respects step value for min input", async () => {
      const user = userEvent.setup();
      render(<DualRangeSlider {...defaultProps} step={5} />);

      const minInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(minInput);
      await user.type(minInput, "28");

      // Should round to nearest step
      expect(defaultProps.onChange).toHaveBeenCalledWith({ min: 30, max: 75 });
    });

    it("respects step value for max input", async () => {
      const user = userEvent.setup();
      render(<DualRangeSlider {...defaultProps} step={5} />);

      const maxInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(maxInput);
      await user.type(maxInput, "78");

      // Should round to nearest step
      expect(defaultProps.onChange).toHaveBeenCalledWith({ min: 25, max: 80 });
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("handles min/max value at boundaries", async () => {
      const user = userEvent.setup();
      render(<DualRangeSlider {...defaultProps} />);

      const minInput = screen.getAllByRole("spinbutton")[0];
      await user.clear(minInput);
      await user.type(minInput, "-10");

      expect(defaultProps.onChange).toHaveBeenCalledWith({ min: 0, max: 75 });

      const maxInput = screen.getAllByRole("spinbutton")[1];
      await user.clear(maxInput);
      await user.type(maxInput, "110");

      expect(defaultProps.onChange).toHaveBeenCalledWith({ min: 0, max: 100 });
    });

    it("handles equal min/max values", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <DualRangeSlider
          {...defaultProps}
          defaultMinValue={50}
          defaultMaxValue={50}
        />
      );

      const progress = container.querySelector(".dual-range-slider__progress");
      expect(progress.style.width).toBe("0%");
    });
  });
});
