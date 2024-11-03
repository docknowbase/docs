import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Drawer from "./Drawer";

// Mock createPortal
vi.mock("react-dom", () => ({
  createPortal: (node) => node,
}));

// Mock Lucide icon
vi.mock("lucide-react", () => ({
  X: () => <div data-testid="close-icon">X</div>,
}));

describe("Drawer Component", () => {
  const mockSetDrawerOpen = vi.fn();

  // Basic setup for common test cases
  const renderDrawer = (props = {}) => {
    return render(
      <Drawer isDrawerOpen={true} setDrawerOpen={mockSetDrawerOpen} {...props}>
        <div>Drawer Content</div>
      </Drawer>
    );
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    // Reset body styles
    document.body.style.overflow = "";
    document.body.style.transform = "";
    document.body.style.height = "";
  });

  afterEach(() => {
    // Cleanup after each test
    vi.resetAllMocks();
  });

  // Visibility Tests
  describe("Visibility", () => {
    it("should not render when isDrawerOpen is false", () => {
      render(
        <Drawer isDrawerOpen={false} setDrawerOpen={mockSetDrawerOpen}>
          <div>Drawer Content</div>
        </Drawer>
      );
      expect(screen.queryByText("Drawer Content")).not.toBeInTheDocument();
    });

    it("should render when isDrawerOpen is true", () => {
      renderDrawer();
      expect(screen.getByText("Drawer Content")).toBeInTheDocument();
    });
  });

  // Close Button Tests
  describe("Close Button", () => {
    it("should show close button by default", () => {
      renderDrawer();
      expect(screen.getByTestId("close-icon")).toBeInTheDocument();
    });

    it("should hide close button when showDrawerCloseButton is false", () => {
      renderDrawer({ showDrawerCloseButton: false });
      expect(screen.queryByTestId("close-icon")).not.toBeInTheDocument();
    });

    it("should call setDrawerOpen when close button is clicked", async () => {
      renderDrawer();
      await userEvent.click(
        screen.getByRole("button", { name: /close drawer/i })
      );
      expect(mockSetDrawerOpen).toHaveBeenCalledWith(false);
    });
  });

  // Keyboard Navigation Tests
  describe("Keyboard Navigation", () => {
    it("should close on ESC key when closeDrawerOnEsc is true", () => {
      renderDrawer();
      fireEvent.keyDown(document, { key: "Escape" });
      expect(mockSetDrawerOpen).toHaveBeenCalledWith(false);
    });

    it("should not close on ESC key when closeDrawerOnEsc is false", () => {
      renderDrawer({ closeDrawerOnEsc: false });
      fireEvent.keyDown(document, { key: "Escape" });
      expect(mockSetDrawerOpen).not.toHaveBeenCalled();
    });
  });

  // Overlay Tests
  describe("Overlay Behavior", () => {
    it("should close when clicking overlay if closeDrawerOnOverlay is true", () => {
      renderDrawer();
      fireEvent.click(screen.getByClassName("drawer__container"));
      expect(mockSetDrawerOpen).toHaveBeenCalledWith(false);
    });

    it("should not close when clicking overlay if closeDrawerOnOverlay is false", () => {
      renderDrawer({ closeDrawerOnOverlay: false });
      fireEvent.click(screen.getByClassName("drawer__container"));
      expect(mockSetDrawerOpen).not.toHaveBeenCalled();
    });
  });

  // Dragging Behavior Tests
  describe("Dragging Behavior", () => {
    it("should render drag handle when isDrawerDraggable is true", () => {
      renderDrawer();
      expect(screen.getByClassName("drawer__drag-handle")).toBeInTheDocument();
    });

    it("should not render drag handle when isDrawerDraggable is false", () => {
      renderDrawer({ isDrawerDraggable: false });
      expect(
        screen.queryByClassName("drawer__drag-handle")
      ).not.toBeInTheDocument();
    });

    it("should handle touch events when draggable", () => {
      renderDrawer();
      const drawer = screen.getByRole("dialog");

      // Simulate touch start
      fireEvent.touchStart(drawer, {
        touches: [{ clientY: 0 }],
      });

      // Simulate touch move
      fireEvent.touchMove(window, {
        touches: [{ clientY: 100 }],
      });

      // Simulate touch end
      fireEvent.touchEnd(window);

      // If drag distance is greater than threshold, drawer should close
      expect(mockSetDrawerOpen).toHaveBeenCalledWith(false);
    });
  });

  // Style and Class Tests
  describe("Styling and Classes", () => {
    it("should apply custom className", () => {
      renderDrawer({ drawerClassName: "custom-drawer" });
      expect(screen.getByRole("dialog")).toHaveClass("custom-drawer");
    });

    it("should apply rounded class when isDrawerRounded is true", () => {
      renderDrawer();
      expect(screen.getByRole("dialog")).toHaveClass("drawer--rounded");
    });

    it("should not apply rounded class when isDrawerRounded is false", () => {
      renderDrawer({ isDrawerRounded: false });
      expect(screen.getByRole("dialog")).not.toHaveClass("drawer--rounded");
    });

    it("should apply nested class when isNestedDrawer is true", () => {
      renderDrawer({ isNestedDrawer: true });
      expect(screen.getByRole("dialog")).toHaveClass("drawer--nested");
    });
  });

  // Header and Footer Tests
  describe("Header and Footer", () => {
    it("should render header when provided", () => {
      renderDrawer({ drawerHeader: <div>Header Content</div> });
      expect(screen.getByText("Header Content")).toBeInTheDocument();
    });

    it("should render footer when provided", () => {
      renderDrawer({ drawerFooter: <div>Footer Content</div> });
      expect(screen.getByText("Footer Content")).toBeInTheDocument();
    });
  });

  // Body Scroll Tests
  describe("Body Scroll Behavior", () => {
    it("should prevent body scroll when preventDrawerScroll is true", () => {
      renderDrawer();
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("should not prevent body scroll when preventDrawerScroll is false", () => {
      renderDrawer({ preventDrawerScroll: false });
      expect(document.body.style.overflow).toBe("");
    });
  });

  // Background Scale Tests
  describe("Background Scale Effect", () => {
    it("should scale background when scaleDrawerBackground is true", () => {
      renderDrawer();
      expect(document.body.style.transform).toBe("scale(0.95)");
      expect(document.body.style.transformOrigin).toBe("center top");
    });

    it("should not scale background when scaleDrawerBackground is false", () => {
      renderDrawer({ scaleDrawerBackground: false });
      expect(document.body.style.transform).toBe("");
    });
  });

  // Height Properties Tests
  describe("Height Properties", () => {
    it("should apply custom height styles", () => {
      renderDrawer({
        drawerHeight: "500px",
        drawerMinHeight: "200px",
        drawerMaxHeight: "800px",
      });

      const drawer = screen.getByRole("dialog");
      const styles = window.getComputedStyle(drawer);

      expect(drawer.style.getPropertyValue("--drawer-height")).toBe("500px");
      expect(drawer.style.getPropertyValue("--drawer-min-height")).toBe(
        "200px"
      );
      expect(drawer.style.getPropertyValue("--drawer-max-height")).toBe(
        "800px"
      );
    });
  });

  // Animation Tests
  describe("Animation", () => {
    it("should apply animation class when animateDrawer is true", () => {
      renderDrawer();
      expect(screen.getByRole("dialog")).toHaveClass("drawer--animate");
    });

    it("should not apply animation class when animateDrawer is false", () => {
      renderDrawer({ animateDrawer: false });
      expect(screen.getByRole("dialog")).not.toHaveClass("drawer--animate");
    });
  });
});
