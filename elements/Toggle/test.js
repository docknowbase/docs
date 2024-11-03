import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import LockToggle from "./index";

describe("LockToggle Component", () => {
  beforeEach(() => {
    cleanup();
  });

  // Rendering Tests
  describe("Rendering", () => {
    it("renders with default props", () => {
      render(<LockToggle />);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("lock-toggle", "lock-toggle--unlocked");
      expect(button).not.toBeDisabled();
      expect(screen.getByText("Unlocked")).toBeInTheDocument();
    });

    it("renders in locked state when initialState is true", () => {
      render(<LockToggle initialState={true} />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("lock-toggle--locked");
      expect(screen.getByText("Locked")).toBeInTheDocument();
    });

    it("renders with custom className", () => {
      render(<LockToggle className="custom-class" />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("renders in disabled state", () => {
      render(<LockToggle disabled={true} />);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveClass("lock-toggle--disabled");
    });

    it("renders correct icon based on locked state", () => {
      const { rerender } = render(<LockToggle initialState={false} />);
      expect(screen.getByText("Unlocked")).toBeInTheDocument();

      rerender(<LockToggle initialState={true} />);
      expect(screen.getByText("Locked")).toBeInTheDocument();
    });
  });

  // Interaction Tests
  describe("Interactions", () => {
    it("toggles state when clicked", () => {
      render(<LockToggle />);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("lock-toggle--unlocked");
      fireEvent.click(button);
      expect(button).toHaveClass("lock-toggle--locked");
      expect(screen.getByText("Locked")).toBeInTheDocument();

      fireEvent.click(button);
      expect(button).toHaveClass("lock-toggle--unlocked");
      expect(screen.getByText("Unlocked")).toBeInTheDocument();
    });

    it("calls onToggle callback with correct state", () => {
      const onToggle = vi.fn();
      render(<LockToggle onToggle={onToggle} />);
      const button = screen.getByRole("button");

      fireEvent.click(button);
      expect(onToggle).toHaveBeenCalledWith(true);

      fireEvent.click(button);
      expect(onToggle).toHaveBeenCalledWith(false);
      expect(onToggle).toHaveBeenCalledTimes(2);
    });

    it("does not toggle or call onToggle when disabled", () => {
      const onToggle = vi.fn();
      render(<LockToggle disabled={true} onToggle={onToggle} />);
      const button = screen.getByRole("button");

      fireEvent.click(button);
      expect(button).toHaveClass("lock-toggle--unlocked");
      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  // Accessibility Tests
  describe("Accessibility", () => {
    it("has correct aria-pressed attribute", () => {
      render(<LockToggle />);
      const button = screen.getByRole("button");

      expect(button).toHaveAttribute("aria-pressed", "false");
      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-pressed", "true");
    });

    it("maintains accessibility attributes when disabled", () => {
      render(<LockToggle disabled={true} />);
      const button = screen.getByRole("button");

      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-pressed", "false");
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("handles multiple rapid clicks correctly", () => {
      const onToggle = vi.fn();
      render(<LockToggle onToggle={onToggle} />);
      const button = screen.getByRole("button");

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(onToggle).toHaveBeenCalledTimes(3);
      expect(button).toHaveClass("lock-toggle--locked");
    });

    it("handles undefined onToggle prop", () => {
      render(<LockToggle onToggle={undefined} />);
      const button = screen.getByRole("button");

      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });
});
