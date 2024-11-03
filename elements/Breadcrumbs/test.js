import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Breadcrumb from "./Breadcrumb";
import React from "react";

describe("Breadcrumb", () => {
  // Test data
  const mockHomeIcon = () => <span data-testid="home-icon">🏠</span>;
  const mockIcon = () => <span data-testid="custom-icon">📁</span>;

  const defaultItems = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Electronics", href: "/products/electronics" },
  ];

  // Helper function to create custom separator
  const customSeparator = <span data-testid="custom-separator">/</span>;

  describe("Rendering", () => {
    test("renders empty breadcrumb when no items provided", () => {
      render(<Breadcrumb />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getByRole("list")).toBeInTheDocument();
    });

    test("renders all items correctly", () => {
      render(<Breadcrumb items={defaultItems} />);
      defaultItems.forEach((item) => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
    });

    test("renders home icon when provided", () => {
      render(<Breadcrumb items={defaultItems} homeIcon={mockHomeIcon} />);
      expect(screen.getByTestId("home-icon")).toBeInTheDocument();
    });

    test("renders custom icons for items", () => {
      const itemsWithIcon = [
        ...defaultItems.slice(0, -1),
        { ...defaultItems[defaultItems.length - 1], icon: mockIcon },
      ];
      render(<Breadcrumb items={itemsWithIcon} />);
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    test("renders custom separator when provided", () => {
      render(<Breadcrumb items={defaultItems} separator={customSeparator} />);
      // We expect separator count to be items.length - 1
      expect(screen.getAllByTestId("custom-separator")).toHaveLength(
        defaultItems.length - 1
      );
    });

    test("applies custom className when provided", () => {
      const { container } = render(
        <Breadcrumb items={defaultItems} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("Truncation", () => {
    const longItemsList = [
      { label: "Home", href: "/" },
      { label: "Category", href: "/category" },
      { label: "Subcategory", href: "/category/sub" },
      { label: "Product", href: "/category/sub/product" },
      { label: "Details", href: "/category/sub/product/details" },
    ];

    test("truncates items when maxItems is set", () => {
      render(<Breadcrumb items={longItemsList} maxItems={3} />);
      expect(screen.getByText("...")).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Details")).toBeInTheDocument();
    });

    test("shows all items when maxItems is greater than items length", () => {
      render(<Breadcrumb items={longItemsList} maxItems={10} />);
      expect(screen.queryByText("...")).not.toBeInTheDocument();
      longItemsList.forEach((item) => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    test("calls onNavigate when clicking a link", () => {
      const onNavigate = vi.fn();
      render(<Breadcrumb items={defaultItems} onNavigate={onNavigate} />);

      fireEvent.click(screen.getByText("Products"));
      expect(onNavigate).toHaveBeenCalledWith(defaultItems[1]);
    });

    test("prevents default when onClick handler is provided", () => {
      const onNavigate = vi.fn();
      render(<Breadcrumb items={defaultItems} onNavigate={onNavigate} />);

      const link = screen.getByText("Products");
      const clickEvent = createEvent.click(link);
      fireEvent(link, clickEvent);

      expect(clickEvent.defaultPrevented).toBe(true);
    });

    test("renders last item without link", () => {
      render(<Breadcrumb items={defaultItems} />);
      const lastItem = defaultItems[defaultItems.length - 1];
      const lastItemElement = screen.getByText(lastItem.label);
      expect(lastItemElement.closest("a")).toBeNull();
    });
  });

  describe("Accessibility", () => {
    test("has correct aria-label", () => {
      render(<Breadcrumb items={defaultItems} />);
      expect(screen.getByRole("navigation")).toHaveAttribute(
        "aria-label",
        "breadcrumb"
      );
    });

    test("marks last item as active", () => {
      const { container } = render(<Breadcrumb items={defaultItems} />);
      const lastItem = container.querySelector(".breadcrumb__item--active");
      expect(lastItem).toHaveTextContent(
        defaultItems[defaultItems.length - 1].label
      );
    });
  });

  describe("Edge Cases", () => {
    test("handles items without href properly", () => {
      const itemsWithoutHref = [
        { label: "Home" },
        { label: "Products" },
        { label: "Electronics" },
      ];
      render(<Breadcrumb items={itemsWithoutHref} />);
      itemsWithoutHref.forEach((item) => {
        const element = screen.getByText(item.label);
        expect(element.closest("a")).toBeNull();
      });
    });

    test("handles single item correctly", () => {
      const singleItem = [{ label: "Home", href: "/" }];
      render(<Breadcrumb items={singleItem} />);
      expect(screen.queryByTestId("custom-separator")).not.toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    test("handles empty labels correctly", () => {
      const itemsWithEmptyLabel = [
        { label: "Home", href: "/" },
        { label: "", href: "/empty" },
        { label: "Products", href: "/products" },
      ];
      render(<Breadcrumb items={itemsWithEmptyLabel} />);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
    });
  });
});
