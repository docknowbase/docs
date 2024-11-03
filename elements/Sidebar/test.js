import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Sheet from "./Sheet";
import "@testing-library/jest-dom";

describe("Sheet Component", () => {
  // Mock createPortal
  const mockCreatePortal = vi.fn((element, container) => element);
  vi.mock("react-dom", () => ({
    createPortal: (element, container) => mockCreatePortal(element, container),
  }));

  beforeEach(() => {
    // Reset body overflow style before each test
    document.body.style.overflow = "";
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // Basic Rendering Tests
  describe("Rendering", () => {
    it("should not render when isOpen is false", () => {
      render(
        <Sheet isOpen={false} onClose={() => {}}>
          Content
        </Sheet>
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render when isOpen is true", () => {
      render(
        <Sheet isOpen={true} onClose={() => {}}>
          Content
        </Sheet>
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should render with different positions", () => {
      const { rerender } = render(
        <Sheet isOpen={true} position="left" onClose={() => {}}>
          Content
        </Sheet>
      );
      expect(screen.getByRole("dialog")).toHaveClass("sheet--left");

      rerender(
        <Sheet isOpen={true} position="right" onClose={() => {}}>
          Content
        </Sheet>
      );
      expect(screen.getByRole("dialog")).toHaveClass("sheet--right");
    });

    it("should render with different sizes", () => {
      const { rerender } = render(
        <Sheet isOpen={true} size="small" onClose={() => {}}>
          Content
        </Sheet>
      );
      expect(screen.getByRole("dialog")).toHaveClass("sheet--small");

      rerender(
        <Sheet isOpen={true} size="large" onClose={() => {}}>
          Content
        </Sheet>
      );
      expect(screen.getByRole("dialog")).toHaveClass("sheet--large");
    });
  });

  // Header and Footer Tests
  describe("Header and Footer", () => {
    it("should render header when provided", () => {
      render(
        <Sheet
          isOpen={true}
          onClose={() => {}}
          header={<div>Header Content</div>}
        >
          Content
        </Sheet>
      );
      expect(screen.getByText("Header Content")).toBeInTheDocument();
    });

    it("should render footer when provided", () => {
      render(
        <Sheet
          isOpen={true}
          onClose={() => {}}
          footer={<div>Footer Content</div>}
        >
          Content
        </Sheet>
      );
      expect(screen.getByText("Footer Content")).toBeInTheDocument();
    });
  });

  // Close Button Tests
  describe("Close Button", () => {
    it("should render close button by default", () => {
      render(
        <Sheet isOpen={true} onClose={() => {}}>
          Content
        </Sheet>
      );
      expect(screen.getByLabelText("Close sheet")).toBeInTheDocument();
    });

    it("should not render close button when showCloseButton is false", () => {
      render(
        <Sheet isOpen={true} showCloseButton={false} onClose={() => {}}>
          Content
        </Sheet>
      );
      expect(screen.queryByLabelText("Close sheet")).not.toBeInTheDocument();
    });

    it("should call onClose when close button is clicked", () => {
      const onClose = vi.fn();
      render(
        <Sheet isOpen={true} onClose={onClose}>
          Content
        </Sheet>
      );
      fireEvent.click(screen.getByLabelText("Close sheet"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // Keyboard Navigation Tests
  describe("Keyboard Navigation", () => {
    it("should close on Escape key press when closeOnEsc is true", () => {
      const onClose = vi.fn();
      render(
        <Sheet isOpen={true} onClose={onClose}>
          Content
        </Sheet>
      );
      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not close on Escape key press when closeOnEsc is false", () => {
      const onClose = vi.fn();
      render(
        <Sheet isOpen={true} closeOnEsc={false} onClose={onClose}>
          Content
        </Sheet>
      );
      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // Overlay Tests
  describe("Overlay", () => {
    it("should close when clicking overlay if closeOnOverlay is true", () => {
      const onClose = vi.fn();
      render(
        <Sheet isOpen={true} onClose={onClose}>
          Content
        </Sheet>
      );
      fireEvent.click(screen.getByClassName("sheet__overlay"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not close when clicking overlay if closeOnOverlay is false", () => {
      const onClose = vi.fn();
      render(
        <Sheet isOpen={true} closeOnOverlay={false} onClose={onClose}>
          Content
        </Sheet>
      );
      fireEvent.click(screen.getByClassName("sheet__overlay"));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // Scroll Prevention Tests
  describe("Scroll Prevention", () => {
    it("should prevent body scroll when preventScroll is true", () => {
      render(
        <Sheet isOpen={true} preventScroll={true} onClose={() => {}}>
          Content
        </Sheet>
      );
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("should not prevent body scroll when preventScroll is false", () => {
      render(
        <Sheet isOpen={true} preventScroll={false} onClose={() => {}}>
          Content
        </Sheet>
      );
      expect(document.body.style.overflow).not.toBe("hidden");
    });

    it("should restore body scroll on unmount", () => {
      const { unmount } = render(
        <Sheet isOpen={true} preventScroll={true} onClose={() => {}}>
          Content
        </Sheet>
      );
      expect(document.body.style.overflow).toBe("hidden");
      unmount();
      expect(document.body.style.overflow).toBe("");
    });
  });

  // Animation and Styling Tests
  describe("Animation and Styling", () => {
    it("should apply animation classes when animate is true", () => {
      render(
        <Sheet isOpen={true} animate={true} onClose={() => {}}>
          Content
        </Sheet>
      );
      expect(screen.getByRole("dialog")).toHaveClass("sheet--animate");
      expect(screen.getByClassName("sheet__overlay")).toHaveClass(
        "sheet__overlay--animate"
      );
    });

    it("should not apply animation classes when animate is false", () => {
      render(
        <Sheet isOpen={true} animate={false} onClose={() => {}}>
          Content
        </Sheet>
      );
      expect(screen.getByRole("dialog")).not.toHaveClass("sheet--animate");
      expect(screen.getByClassName("sheet__overlay")).not.toHaveClass(
        "sheet__overlay--animate"
      );
    });

    it("should apply glassmorphism class when enabled", () => {
      render(
        <Sheet isOpen={true} glassmorphism={true} onClose={() => {}}>
          Content
        </Sheet>
      );
      expect(screen.getByRole("dialog")).toHaveClass("sheet--glass");
    });

    it("should apply nested class when enabled", () => {
      render(
        <Sheet isOpen={true} nested={true} onClose={() => {}}>
          Content
        </Sheet>
      );
      expect(screen.getByRole("dialog")).toHaveClass("sheet--nested");
    });

    it("should apply custom className and overlayClassName", () => {
      render(
        <Sheet
          isOpen={true}
          className="custom-sheet"
          overlayClassName="custom-overlay"
          onClose={() => {}}
        >
          Content
        </Sheet>
      );
      expect(screen.getByRole("dialog")).toHaveClass("custom-sheet");
      expect(screen.getByClassName("sheet__overlay")).toHaveClass(
        "custom-overlay"
      );
    });
  });

  // Focus Management Tests
  describe("Focus Management", () => {
    it("should focus the first focusable element when opened", () => {
      render(
        <Sheet isOpen={true} onClose={() => {}}>
          <button>First Button</button>
          <button>Second Button</button>
        </Sheet>
      );
      expect(screen.getByText("First Button")).toHaveFocus();
    });

    it("should handle case when no focusable elements exist", () => {
      render(
        <Sheet isOpen={true} onClose={() => {}}>
          <div>No focusable elements</div>
        </Sheet>
      );
      // Test should not throw and sheet should still render
      expect(screen.getByText("No focusable elements")).toBeInTheDocument();
    });
  });
});
