import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { ChevronDown } from "lucide-react";
import ExpandablePanel from "./index";

// Mock lucide-react
vi.mock("lucide-react", () => ({
  ChevronDown: vi.fn(() => null),
}));

describe("ExpandablePanel", () => {
  const defaultProps = {
    title: "Test Panel",
    children: <div>Test Content</div>,
  };

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders with minimum required props", () => {
      const { container } = render(<ExpandablePanel {...defaultProps} />);
      expect(container.querySelector(".expandable")).toBeTruthy();
      expect(screen.getByText("Test Panel")).toBeTruthy();
      expect(screen.getByText("Test Content")).toBeTruthy();
    });

    it("renders with custom className", () => {
      const { container } = render(
        <ExpandablePanel {...defaultProps} className="custom-class" />
      );
      expect(container.querySelector(".expandable.custom-class")).toBeTruthy();
    });

    it("renders with icon when provided", () => {
      const testIcon = <span data-testid="test-icon">🔍</span>;
      render(<ExpandablePanel {...defaultProps} icon={testIcon} />);
      expect(screen.getByTestId("test-icon")).toBeTruthy();
    });

    it("does not render icon container when no icon provided", () => {
      const { container } = render(<ExpandablePanel {...defaultProps} />);
      expect(container.querySelector(".expandable__icon")).toBeFalsy();
    });
  });

  describe("Expansion Behavior", () => {
    it("starts collapsed by default", () => {
      const { container } = render(<ExpandablePanel {...defaultProps} />);
      const content = container.querySelector(".expandable__content");
      expect(content).not.toHaveClass("expandable__content--expanded");
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-expanded",
        "false"
      );
    });

    it("starts expanded when isInitiallyExpanded is true", () => {
      const { container } = render(
        <ExpandablePanel {...defaultProps} isInitiallyExpanded />
      );
      const content = container.querySelector(".expandable__content");
      expect(content).toHaveClass("expandable__content--expanded");
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
    });

    it("toggles expansion state on header click", () => {
      const { container } = render(<ExpandablePanel {...defaultProps} />);
      const button = screen.getByRole("button");
      const content = container.querySelector(".expandable__content");

      // Initial state
      expect(content).not.toHaveClass("expandable__content--expanded");
      expect(button).toHaveAttribute("aria-expanded", "false");

      // Click to expand
      fireEvent.click(button);
      expect(content).toHaveClass("expandable__content--expanded");
      expect(button).toHaveAttribute("aria-expanded", "true");

      // Click to collapse
      fireEvent.click(button);
      expect(content).not.toHaveClass("expandable__content--expanded");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("Content Height Calculation", () => {
    it("sets content height CSS variable based on scrollHeight", () => {
      // Mock scrollHeight
      const mockScrollHeight = 100;
      const div = document.createElement("div");
      Object.defineProperty(div, "scrollHeight", {
        configurable: true,
        value: mockScrollHeight,
      });

      vi.spyOn(document, "createElement").mockImplementation(() => div);

      const { container } = render(<ExpandablePanel {...defaultProps} />);
      const content = container.querySelector(".expandable__content");

      expect(content.style.getPropertyValue("--content-height")).toBe("0px");

      // Trigger expansion
      fireEvent.click(screen.getByRole("button"));

      // Check if the height is set correctly
      expect(content.style.getPropertyValue("--content-height")).toBe(
        `${mockScrollHeight}px`
      );
    });
  });

  describe("Accessibility", () => {
    it("has accessible button with correct aria attributes", () => {
      render(<ExpandablePanel {...defaultProps} />);
      const button = screen.getByRole("button");

      expect(button).toHaveAttribute("aria-expanded", "false");
      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("correctly toggles arrow icon rotation class", () => {
      const { container } = render(<ExpandablePanel {...defaultProps} />);
      const arrow = container.querySelector(".expandable__arrow");

      expect(arrow).not.toHaveClass("expandable__arrow--expanded");

      fireEvent.click(screen.getByRole("button"));
      expect(arrow).toHaveClass("expandable__arrow--expanded");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty children", () => {
      const { container } = render(<ExpandablePanel title="Empty Panel" />);
      expect(
        container.querySelector(".expandable__content-inner")
      ).toBeTruthy();
    });

    it("handles empty title", () => {
      const { container } = render(
        <ExpandablePanel title="" children={<div>Content</div>} />
      );
      expect(container.querySelector(".expandable__title")).toHaveTextContent(
        ""
      );
    });

    it("handles complex nested content", () => {
      const complexContent = (
        <div>
          <h1>Nested Header</h1>
          <p>Nested paragraph</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      );

      render(<ExpandablePanel {...defaultProps} children={complexContent} />);
      expect(screen.getByText("Nested Header")).toBeTruthy();
      expect(screen.getByText("Nested paragraph")).toBeTruthy();
      expect(screen.getByText("Item 1")).toBeTruthy();
      expect(screen.getByText("Item 2")).toBeTruthy();
    });
  });
});
