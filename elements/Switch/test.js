import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToggleSwitch } from "./ToggleSwitch";
import "@testing-library/jest-dom";

describe("ToggleSwitch Component", () => {
  // Basic rendering tests
  describe("Rendering", () => {
    it("renders without crashing", () => {
      render(<ToggleSwitch isOn={false} onToggle={() => {}} />);
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("renders with label when provided", () => {
      const label = "Test Label";
      render(<ToggleSwitch isOn={false} onToggle={() => {}} label={label} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    it("renders without label when not provided", () => {
      const { container } = render(
        <ToggleSwitch isOn={false} onToggle={() => {}} />
      );
      expect(
        container.querySelector(".toggle-switch__label")
      ).not.toBeInTheDocument();
    });
  });

  // State tests
  describe("State Management", () => {
    it("reflects the correct checked state when isOn is true", () => {
      render(<ToggleSwitch isOn={true} onToggle={() => {}} />);
      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("reflects the correct checked state when isOn is false", () => {
      render(<ToggleSwitch isOn={false} onToggle={() => {}} />);
      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("updates visual state when isOn prop changes", () => {
      const { rerender } = render(
        <ToggleSwitch isOn={false} onToggle={() => {}} />
      );
      expect(screen.getByRole("checkbox")).not.toBeChecked();

      rerender(<ToggleSwitch isOn={true} onToggle={() => {}} />);
      expect(screen.getByRole("checkbox")).toBeChecked();
    });
  });

  // Interaction tests
  describe("User Interactions", () => {
    it("calls onToggle when clicked", () => {
      const onToggle = vi.fn();
      render(<ToggleSwitch isOn={false} onToggle={onToggle} />);

      fireEvent.click(screen.getByRole("checkbox"));
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("does not call onToggle when disabled", () => {
      const onToggle = vi.fn();
      render(<ToggleSwitch isOn={false} onToggle={onToggle} disabled={true} />);

      fireEvent.click(screen.getByRole("checkbox"));
      expect(onToggle).not.toHaveBeenCalled();
    });

    it("is not clickable when disabled", () => {
      render(<ToggleSwitch isOn={false} onToggle={() => {}} disabled={true} />);
      expect(screen.getByRole("checkbox")).toBeDisabled();
    });
  });

  // Class name tests
  describe("CSS Classes", () => {
    it("applies correct classes when toggle is on", () => {
      const { container } = render(
        <ToggleSwitch isOn={true} onToggle={() => {}} />
      );
      expect(container.querySelector(".toggle-switch__track")).toHaveClass(
        "toggle-switch__track--active"
      );
    });

    it("applies correct classes when toggle is off", () => {
      const { container } = render(
        <ToggleSwitch isOn={false} onToggle={() => {}} />
      );
      expect(container.querySelector(".toggle-switch__track")).not.toHaveClass(
        "toggle-switch__track--active"
      );
    });

    it("applies disabled class when disabled prop is true", () => {
      const { container } = render(
        <ToggleSwitch isOn={false} onToggle={() => {}} disabled={true} />
      );
      expect(container.querySelector(".toggle-switch")).toHaveClass(
        "toggle-switch--disabled"
      );
    });

    it("does not apply disabled class when disabled prop is false", () => {
      const { container } = render(
        <ToggleSwitch isOn={false} onToggle={() => {}} disabled={false} />
      );
      expect(container.querySelector(".toggle-switch")).not.toHaveClass(
        "toggle-switch--disabled"
      );
    });
  });

  // Accessibility tests
  describe("Accessibility", () => {
    it("associates label with input using htmlFor", () => {
      const label = "Test Label";
      render(<ToggleSwitch isOn={false} onToggle={() => {}} label={label} />);

      const labelElement = screen.getByText(label);
      expect(labelElement.tagName).toBe("LABEL");
    });

    it("maintains tab focus when enabled", () => {
      render(<ToggleSwitch isOn={false} onToggle={() => {}} />);
      const checkbox = screen.getByRole("checkbox");

      checkbox.focus();
      expect(checkbox).toHaveFocus();
    });

    it("can be toggled with keyboard space key", () => {
      const onToggle = vi.fn();
      render(<ToggleSwitch isOn={false} onToggle={onToggle} />);

      const checkbox = screen.getByRole("checkbox");
      checkbox.focus();
      fireEvent.keyDown(checkbox, { key: " ", code: "Space" });

      expect(onToggle).toHaveBeenCalled();
    });
  });

  // Edge cases
  describe("Edge Cases", () => {
    it("handles multiple rapid toggles correctly", () => {
      const onToggle = vi.fn();
      render(<ToggleSwitch isOn={false} onToggle={onToggle} />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);

      expect(onToggle).toHaveBeenCalledTimes(3);
    });

    it("handles undefined label gracefully", () => {
      render(
        <ToggleSwitch isOn={false} onToggle={() => {}} label={undefined} />
      );
      expect(screen.queryByText(/undefined/i)).not.toBeInTheDocument();
    });

    it("handles empty string label gracefully", () => {
      render(<ToggleSwitch isOn={false} onToggle={() => {}} label="" />);
      const labelElement = screen.queryByText("");
      expect(labelElement).not.toBeInTheDocument();
    });
  });
});
