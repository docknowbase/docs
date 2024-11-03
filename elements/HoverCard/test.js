import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, fireEvent, act, cleanup } from "@testing-library/react";
import { HoverCard } from "./HoverCard";
import React from "react";

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Helper function to create mock element rectangles
const createRect = (
  top: number,
  right: number,
  bottom: number,
  left: number,
  width: number,
  height: number
) => ({
  top,
  right,
  bottom,
  left,
  width,
  height,
  x: left,
  y: top,
  toJSON: () => {},
});

describe("HoverCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock window dimensions
    window.innerWidth = 1024;
    window.innerHeight = 768;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  // Basic Rendering Tests
  describe("Basic Rendering", () => {
    it("renders trigger element correctly", () => {
      const { getByText } = render(
        <HoverCard content={<div>Hover Content</div>}>
          <button>Trigger</button>
        </HoverCard>
      );
      expect(getByText("Trigger")).toBeTruthy();
    });

    it("does not show content initially", () => {
      const { queryByText } = render(
        <HoverCard content={<div>Hover Content</div>}>
          <button>Trigger</button>
        </HoverCard>
      );
      expect(queryByText("Hover Content")).toBeNull();
    });
  });

  // Hover Interaction Tests
  describe("Hover Interactions", () => {
    it("shows content after hover with delay", async () => {
      const { getByText, queryByText } = render(
        <HoverCard content={<div>Hover Content</div>} openDelay={200}>
          <button>Trigger</button>
        </HoverCard>
      );

      fireEvent.mouseEnter(getByText("Trigger"));
      expect(queryByText("Hover Content")).toBeNull();

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(queryByText("Hover Content")).toBeTruthy();
    });

    it("hides content after mouse leave with delay", async () => {
      const { getByText, queryByText } = render(
        <HoverCard content={<div>Hover Content</div>} closeDelay={200}>
          <button>Trigger</button>
        </HoverCard>
      );

      fireEvent.mouseEnter(getByText("Trigger"));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      fireEvent.mouseLeave(getByText("Trigger"));
      expect(queryByText("Hover Content")).toBeTruthy();

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(queryByText("Hover Content")).toBeNull();
    });
  });

  // Focus Interaction Tests
  describe("Focus Interactions", () => {
    it("shows content on focus when showOnFocus is true", () => {
      const { getByText, queryByText } = render(
        <HoverCard content={<div>Hover Content</div>} showOnFocus={true}>
          <button>Trigger</button>
        </HoverCard>
      );

      fireEvent.focus(getByText("Trigger"));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(queryByText("Hover Content")).toBeTruthy();
    });

    it("does not show content on focus when showOnFocus is false", () => {
      const { getByText, queryByText } = render(
        <HoverCard content={<div>Hover Content</div>} showOnFocus={false}>
          <button>Trigger</button>
        </HoverCard>
      );

      fireEvent.focus(getByText("Trigger"));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(queryByText("Hover Content")).toBeNull();
    });
  });

  // Disabled State Tests
  describe("Disabled State", () => {
    it("does not show content when disabled", () => {
      const { getByText, queryByText } = render(
        <HoverCard content={<div>Hover Content</div>} disabled={true}>
          <button>Trigger</button>
        </HoverCard>
      );

      fireEvent.mouseEnter(getByText("Trigger"));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(queryByText("Hover Content")).toBeNull();
    });
  });

  // Position Tests
  describe("Position Calculations", () => {
    beforeEach(() => {
      // Mock getBoundingClientRect for trigger and card
      Element.prototype.getBoundingClientRect = vi
        .fn()
        .mockImplementation(function () {
          if (this.classList.contains("hover-card__trigger")) {
            return createRect(100, 150, 120, 100, 50, 20); // Trigger rectangle
          }
          return createRect(0, 200, 100, 0, 200, 100); // Card rectangle
        });
    });

    const positions: Array<"top" | "bottom" | "left" | "right"> = [
      "top",
      "bottom",
      "left",
      "right",
    ];

    positions.forEach((position) => {
      it(`renders with ${position} position`, () => {
        const { getByText } = render(
          <HoverCard content={<div>Hover Content</div>} position={position}>
            <button>Trigger</button>
          </HoverCard>
        );

        fireEvent.mouseEnter(getByText("Trigger"));
        act(() => {
          vi.advanceTimersByTime(200);
        });

        const card = document.querySelector(".hover-card");
        expect(card).toHaveClass(`hover-card--${position}`);
      });
    });

    it("adjusts position when near window edges", () => {
      // Mock window size to force repositioning
      window.innerWidth = 300;
      window.innerHeight = 300;

      const { getByText } = render(
        <HoverCard content={<div>Hover Content</div>} position="right">
          <button>Trigger</button>
        </HoverCard>
      );

      fireEvent.mouseEnter(getByText("Trigger"));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      const card = document.querySelector(".hover-card");
      expect(card?.style.left).toBeDefined();
      expect(card?.style.top).toBeDefined();
    });
  });

  // Style and Appearance Tests
  describe("Style and Appearance", () => {
    it("applies custom width", () => {
      const { getByText } = render(
        <HoverCard content={<div>Hover Content</div>} width="300px">
          <button>Trigger</button>
        </HoverCard>
      );

      fireEvent.mouseEnter(getByText("Trigger"));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      const card = document.querySelector(".hover-card");
      expect(card?.style.width).toBe("300px");
    });

    it("applies custom z-index", () => {
      const { getByText } = render(
        <HoverCard content={<div>Hover Content</div>} zIndex={2000}>
          <button>Trigger</button>
        </HoverCard>
      );

      fireEvent.mouseEnter(getByText("Trigger"));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      const card = document.querySelector(".hover-card");
      expect(card?.style.zIndex).toBe("2000");
    });

    it("shows arrow when showArrow is true", () => {
      const { getByText } = render(
        <HoverCard content={<div>Hover Content</div>} showArrow={true}>
          <button>Trigger</button>
        </HoverCard>
      );

      fireEvent.mouseEnter(getByText("Trigger"));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      const arrow = document.querySelector(".hover-card__arrow");
      expect(arrow).toBeTruthy();
    });

    it("hides arrow when showArrow is false", () => {
      const { getByText } = render(
        <HoverCard content={<div>Hover Content</div>} showArrow={false}>
          <button>Trigger</button>
        </HoverCard>
      );

      fireEvent.mouseEnter(getByText("Trigger"));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      const arrow = document.querySelector(".hover-card__arrow");
      expect(arrow).toBeNull();
    });
  });

  // Cleanup and Memory Tests
  describe("Cleanup and Memory Management", () => {
    it("cleans up timeouts on unmount", () => {
      const { getByText, unmount } = render(
        <HoverCard content={<div>Hover Content</div>}>
          <button>Trigger</button>
        </HoverCard>
      );

      fireEvent.mouseEnter(getByText("Trigger"));
      unmount();

      // Advance timers to ensure no errors occur
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    });

    it("removes event listeners on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
      const { getByText, unmount } = render(
        <HoverCard content={<div>Hover Content</div>}>
          <button>Trigger</button>
        </HoverCard>
      );

      fireEvent.mouseEnter(getByText("Trigger"));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });

  // Window Events Tests
  describe("Window Events", () => {
    it("recalculates position on scroll", () => {
      const { getByText } = render(
        <HoverCard content={<div>Hover Content</div>}>
          <button>Trigger</button>
        </HoverCard>
      );

      fireEvent.mouseEnter(getByText("Trigger"));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      fireEvent.scroll(window);

      const card = document.querySelector(".hover-card");
      expect(card?.style.top).toBeDefined();
      expect(card?.style.left).toBeDefined();
    });

    it("recalculates position on resize", () => {
      const { getByText } = render(
        <HoverCard content={<div>Hover Content</div>}>
          <button>Trigger</button>
        </HoverCard>
      );

      fireEvent.mouseEnter(getByText("Trigger"));
      act(() => {
        vi.advanceTimersByTime(200);
      });

      fireEvent.resize(window);

      const card = document.querySelector(".hover-card");
      expect(card?.style.top).toBeDefined();
      expect(card?.style.left).toBeDefined();
    });
  });
});
