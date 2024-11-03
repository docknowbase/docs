import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContextMenu from "./ContextMenu";

// Mock options for testing
const mockOptions = [
  {
    id: "1",
    label: "Option 1",
    icon: "📄",
    onClick: vi.fn(),
  },
  {
    id: "2",
    label: "Option 2",
    disabled: true,
    onClick: vi.fn(),
  },
  {
    id: "3",
    label: "Submenu",
    children: [
      {
        id: "3-1",
        label: "Submenu Option 1",
        onClick: vi.fn(),
      },
      {
        id: "3-2",
        label: "Submenu Option 2",
        onClick: vi.fn(),
      },
    ],
  },
  {
    id: "4",
    label: "Danger Option",
    danger: true,
    onClick: vi.fn(),
  },
];

// Mock window dimensions
const mockWindowDimensions = {
  innerWidth: 1024,
  innerHeight: 768,
};

describe("ContextMenu", () => {
  const defaultProps = {
    options: mockOptions,
    position: { x: 100, y: 100 },
    onClose: vi.fn(),
  };

  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: mockWindowDimensions.innerWidth,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: mockWindowDimensions.innerHeight,
    });

    // Mock offsetWidth/offsetHeight
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 200,
      height: 200,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // Basic Rendering Tests
  describe("Rendering", () => {
    it("should render all menu options", () => {
      render(<ContextMenu {...defaultProps} />);

      mockOptions.forEach((option) => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    it("should render icons when provided", () => {
      render(<ContextMenu {...defaultProps} />);

      const iconElement = screen.getByText("📄");
      expect(iconElement).toBeInTheDocument();
    });

    it("should apply disabled class to disabled options", () => {
      render(<ContextMenu {...defaultProps} />);

      const disabledOption = screen.getByText("Option 2");
      expect(disabledOption.parentElement).toHaveClass(
        "context-menu__item--disabled"
      );
    });

    it("should apply danger class to danger options", () => {
      render(<ContextMenu {...defaultProps} />);

      const dangerOption = screen.getByText("Danger Option");
      expect(dangerOption.parentElement).toHaveClass(
        "context-menu__item--danger"
      );
    });
  });

  // Position Tests
  describe("Positioning", () => {
    it("should position menu at specified coordinates", () => {
      render(<ContextMenu {...defaultProps} />);

      const menu = screen.getByRole("div", { name: /context-menu/ });
      expect(menu).toHaveStyle({
        left: "100px",
        top: "100px",
      });
    });

    it("should adjust submenu position when near viewport edge", () => {
      // Mock window dimensions to simulate edge of screen
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 300,
      });

      render(<ContextMenu {...defaultProps} />);

      // Trigger submenu
      const submenuTrigger = screen.getByText("Submenu");
      fireEvent.mouseEnter(submenuTrigger);

      // Check if submenu is positioned on the left instead of right
      const submenu = screen
        .getByText("Submenu Option 1")
        .closest(".context-menu");
      expect(submenu).toHaveStyle({
        left: expect.stringMatching(/^-/), // Should have negative left position
      });
    });
  });

  // Interaction Tests
  describe("Interactions", () => {
    it("should call onClick when clicking non-disabled option", async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);

      await user.click(screen.getByText("Option 1"));
      expect(mockOptions[0].onClick).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it("should not call onClick when clicking disabled option", async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);

      await user.click(screen.getByText("Option 2"));
      expect(mockOptions[1].onClick).not.toHaveBeenCalled();
    });

    it("should show submenu on hover", async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);

      await user.hover(screen.getByText("Submenu"));
      expect(screen.getByText("Submenu Option 1")).toBeInTheDocument();
      expect(screen.getByText("Submenu Option 2")).toBeInTheDocument();
    });

    it("should hide submenu on mouse leave", async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);

      const submenuTrigger = screen.getByText("Submenu");
      await user.hover(submenuTrigger);
      await user.unhover(submenuTrigger);

      // Use queryByText since elements should not exist
      expect(screen.queryByText("Submenu Option 1")).not.toBeInTheDocument();
    });
  });

  // Close Behavior Tests
  describe("Close Behavior", () => {
    it("should close menu when clicking outside", () => {
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <ContextMenu {...defaultProps} />
        </div>
      );

      fireEvent.click(screen.getByTestId("outside"));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it("should prevent default context menu", () => {
      render(<ContextMenu {...defaultProps} />);

      const menu = screen.getByRole("div", { name: /context-menu/ });
      const contextMenuEvent = fireEvent.contextMenu(menu);
      expect(contextMenuEvent.defaultPrevented).toBe(true);
    });
  });

  // Class Names Tests
  describe("Class Names", () => {
    it("should apply custom className", () => {
      const customClass = "custom-menu";
      render(<ContextMenu {...defaultProps} className={customClass} />);

      const menu = screen.getByRole("div", { name: /context-menu/ });
      expect(menu).toHaveClass(customClass);
    });

    it("should apply correct level classes to nested menus", async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);

      const rootMenu = screen.getByRole("div", { name: /context-menu/ });
      expect(rootMenu).toHaveClass("context-menu--level-0");

      await user.hover(screen.getByText("Submenu"));
      const submenu = screen
        .getByText("Submenu Option 1")
        .closest(".context-menu");
      expect(submenu).toHaveClass("context-menu--level-1");
    });
  });
});
