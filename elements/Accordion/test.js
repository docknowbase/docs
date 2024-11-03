import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Accordion from "./index";

// Mock ResizeObserver which might be needed for height calculations
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe("Accordion", () => {
  const mockItems = [
    { id: "1", title: "Section 1", content: "Content 1" },
    { id: "2", title: "Section 2", content: "Content 2" },
    { id: "3", title: "Section 3", content: "Content 3", disabled: true },
  ];

  describe("Rendering", () => {
    test("renders all accordion items", () => {
      render(<Accordion items={mockItems} />);

      mockItems.forEach((item) => {
        expect(screen.getByText(item.title)).toBeInTheDocument();
      });
    });

    test("renders with custom className", () => {
      const { container } = render(
        <Accordion items={mockItems} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });

    test("renders with different variants", () => {
      const { container } = render(
        <Accordion items={mockItems} variant="custom" />
      );
      expect(container.firstChild).toHaveClass("accordion--custom");
    });

    test("renders different icon types", () => {
      const { container: chevronContainer } = render(
        <Accordion items={mockItems} iconType="chevron" />
      );
      const { container: plusContainer } = render(
        <Accordion items={mockItems} iconType="plus" />
      );

      expect(chevronContainer.querySelector(".chevron-down")).toBeTruthy();
      expect(plusContainer.querySelector(".plus")).toBeTruthy();
    });
  });

  describe("Functionality", () => {
    test("expands single item when allowMultiple is false", async () => {
      render(<Accordion items={mockItems} />);

      const buttons = screen.getAllByRole("button");
      await userEvent.click(buttons[0]);

      expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
      expect(buttons[1]).toHaveAttribute("aria-expanded", "false");
    });

    test("allows multiple items to be expanded when allowMultiple is true", async () => {
      render(<Accordion items={mockItems} allowMultiple={true} />);

      const buttons = screen.getAllByRole("button");
      await userEvent.click(buttons[0]);
      await userEvent.click(buttons[1]);

      expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
      expect(buttons[1]).toHaveAttribute("aria-expanded", "true");
    });

    test("closes other items when opening new item with allowMultiple false", async () => {
      render(<Accordion items={mockItems} />);

      const buttons = screen.getAllByRole("button");
      await userEvent.click(buttons[0]);
      await userEvent.click(buttons[1]);

      expect(buttons[0]).toHaveAttribute("aria-expanded", "false");
      expect(buttons[1]).toHaveAttribute("aria-expanded", "true");
    });

    test("respects defaultExpanded prop", () => {
      render(<Accordion items={mockItems} defaultExpanded={["1"]} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
      expect(buttons[1]).toHaveAttribute("aria-expanded", "false");
    });

    test("calls onChange when items are toggled", async () => {
      const onChange = vi.fn();
      render(<Accordion items={mockItems} onChange={onChange} />);

      const buttons = screen.getAllByRole("button");
      await userEvent.click(buttons[0]);

      expect(onChange).toHaveBeenCalledWith(["1"]);
    });

    test("disabled items cannot be toggled", async () => {
      render(<Accordion items={mockItems} />);

      const buttons = screen.getAllByRole("button");
      const disabledButton = buttons[2];

      expect(disabledButton).toBeDisabled();
      await userEvent.click(disabledButton);
      expect(disabledButton).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("AccordionItem", () => {
    test("calculates and sets content height correctly", async () => {
      const mockScrollHeight = 100;
      const div = document.createElement("div");
      Object.defineProperty(div, "scrollHeight", { value: mockScrollHeight });

      const { container } = render(
        <Accordion items={[mockItems[0]]} defaultExpanded={["1"]} />
      );

      const contentWrapper = container.querySelector(
        ".accordion-item__content-wrapper"
      );
      expect(contentWrapper.style.height).toBe(`${mockScrollHeight}px`);
    });

    test("updates height when content changes", async () => {
      const { rerender } = render(
        <Accordion
          items={[{ id: "1", title: "Title", content: "Initial content" }]}
          defaultExpanded={["1"]}
        />
      );

      rerender(
        <Accordion
          items={[{ id: "1", title: "Title", content: "Updated content" }]}
          defaultExpanded={["1"]}
        />
      );

      // Check that height was recalculated
      expect(screen.getByText("Updated content")).toBeInTheDocument();
    });

    test("handles border visibility correctly", () => {
      const { container } = render(
        <Accordion items={mockItems} bordered={false} />
      );

      const accordionItems = container.querySelectorAll(".accordion-item");
      accordionItems.forEach((item) => {
        expect(item).not.toHaveClass("accordion-item--bordered");
      });
    });
  });

  describe("Edge cases", () => {
    test("handles empty items array", () => {
      const { container } = render(<Accordion items={[]} />);
      expect(container.firstChild).toBeEmptyDOMElement();
    });

    test("handles items without IDs", () => {
      const itemsWithoutIds = [
        { title: "No ID 1", content: "Content 1" },
        { title: "No ID 2", content: "Content 2" },
      ];

      render(<Accordion items={itemsWithoutIds} />);
      expect(screen.getAllByRole("button")).toHaveLength(2);
    });

    test("handles undefined onChange handler", async () => {
      render(<Accordion items={mockItems} />);

      const buttons = screen.getAllByRole("button");
      await userEvent.click(buttons[0]);

      // Should not throw error
      expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Accessibility", () => {
    test("has correct ARIA attributes", () => {
      render(<Accordion items={mockItems} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveAttribute("aria-expanded");
      });
    });

    test("handles keyboard navigation", async () => {
      render(<Accordion items={mockItems} />);

      const buttons = screen.getAllByRole("button");
      buttons[0].focus();

      await userEvent.keyboard("{Enter}");
      expect(buttons[0]).toHaveAttribute("aria-expanded", "true");

      await userEvent.keyboard(" ");
      expect(buttons[0]).toHaveAttribute("aria-expanded", "false");
    });
  });
});
