import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  render,
  fireEvent,
  screen,
  cleanup,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Tooltip from "./index";

describe("Tooltip Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  // Basic Rendering Tests
  describe("Rendering", () => {
    it("renders children correctly", () => {
      render(
        <Tooltip content="Test tooltip">
          <button>Hover me</button>
        </Tooltip>
      );
      expect(screen.getByText("Hover me")).toBeInTheDocument();
    });

    it("does not show tooltip initially", () => {
      render(
        <Tooltip content="Test tooltip">
          <button>Hover me</button>
        </Tooltip>
      );
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  // Interaction Tests
  describe("Interactions", () => {
    it("shows tooltip on mouse enter after delay", async () => {
      render(
        <Tooltip content="Test tooltip" delay={200}>
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText("Hover me"));

      // Tooltip should not be visible immediately
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.getByRole("tooltip")).toBeInTheDocument();
      expect(screen.getByText("Test tooltip")).toBeInTheDocument();
    });

    it("hides tooltip on mouse leave", async () => {
      render(
        <Tooltip content="Test tooltip" delay={200}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText("Hover me");

      // Show tooltip
      fireEvent.mouseEnter(trigger);
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Hide tooltip
      fireEvent.mouseLeave(trigger);
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("shows tooltip on focus", async () => {
      render(
        <Tooltip content="Test tooltip" delay={200}>
          <button>Focus me</button>
        </Tooltip>
      );

      const trigger = screen.getByText("Focus me");
      fireEvent.focus(trigger);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    it("hides tooltip on blur", async () => {
      render(
        <Tooltip content="Test tooltip" delay={200}>
          <button>Focus me</button>
        </Tooltip>
      );

      const trigger = screen.getByText("Focus me");

      // Show tooltip
      fireEvent.focus(trigger);
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Hide tooltip
      fireEvent.blur(trigger);
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  // Props Tests
  describe("Props", () => {
    it("respects disabled prop", () => {
      render(
        <Tooltip content="Test tooltip" disabled={true}>
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText("Hover me"));
      act(() => {
        vi.advanceTimersByTime(1000); // Even with long delay
      });

      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("applies correct position class", () => {
      render(
        <Tooltip content="Test tooltip" position="bottom">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText("Hover me"));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toHaveClass("tooltip--bottom");
    });

    it("applies correct theme class", () => {
      render(
        <Tooltip content="Test tooltip" theme="light">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText("Hover me"));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toHaveClass("tooltip--light");
    });

    it("applies custom className", () => {
      render(
        <Tooltip content="Test tooltip" className="custom-class">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText("Hover me"));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toHaveClass("custom-class");
    });

    it("respects maxWidth prop", () => {
      render(
        <Tooltip content="Test tooltip" maxWidth={300}>
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText("Hover me"));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toHaveStyle({ maxWidth: 300 });
    });

    it("shows/hides arrow based on showArrow prop", () => {
      render(
        <Tooltip content="Test tooltip" showArrow={false}>
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText("Hover me"));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = screen.getByRole("tooltip");
      expect(tooltip.querySelector(".tooltip__arrow")).not.toBeInTheDocument();
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("cleans up timeout on unmount", () => {
      const { unmount } = render(
        <Tooltip content="Test tooltip">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText("Hover me"));
      unmount();

      // Ensure no errors when advancing timers after unmount
      act(() => {
        vi.advanceTimersByTime(200);
      });
    });

    it("handles rapid mouse enter/leave events", () => {
      render(
        <Tooltip content="Test tooltip" delay={200}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText("Hover me");

      // Rapid mouse enter/leave events
      fireEvent.mouseEnter(trigger);
      fireEvent.mouseLeave(trigger);
      fireEvent.mouseEnter(trigger);
      fireEvent.mouseLeave(trigger);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("handles empty content", () => {
      render(
        <Tooltip content="">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText("Hover me"));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = screen.getByRole("tooltip");
      expect(tooltip.querySelector(".tooltip__content")).toBeEmpty();
    });
  });
});
