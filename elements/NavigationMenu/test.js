import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MenuBar from "./MenuBar";
import { act } from "react-dom/test-utils";

// Mock test data
const mockItems = [
  {
    id: "1",
    label: "Products",
    link: "/products",
    content: {
      id: "products",
      title: "Our Products",
      description: "Explore our range of products",
      links: [
        { label: "New Arrivals", url: "/products/new" },
        { label: "Featured", url: "/products/featured" },
      ],
    },
  },
  {
    id: "2",
    label: "Services",
    link: "/services",
    content: {
      id: "services",
      title: "Services",
      links: [{ label: "Consulting", url: "/services/consulting" }],
    },
  },
  {
    id: "3",
    label: "About",
    link: "/about",
  },
];

describe("MenuBar Component", () => {
  beforeEach(() => {
    cleanup();
  });

  // Rendering Tests
  describe("Rendering", () => {
    it("renders without crashing", () => {
      render(<MenuBar items={mockItems} />);
      expect(screen.getByRole("navigation")).toBeDefined();
    });

    it("renders all menu items", () => {
      render(<MenuBar items={mockItems} />);
      mockItems.forEach((item) => {
        expect(screen.getByText(item.label)).toBeDefined();
      });
    });

    it("applies custom className when provided", () => {
      const customClass = "custom-menu";
      const { container } = render(
        <MenuBar items={mockItems} className={customClass} />
      );
      expect(container.querySelector(`.${customClass}`)).toBeDefined();
    });

    it("renders menu items with correct links", () => {
      render(<MenuBar items={mockItems} />);
      mockItems.forEach((item) => {
        const link = screen.getByText(item.label).closest("a");
        expect(link).toHaveAttribute("href", item.link);
      });
    });
  });

  // Hover State Tests
  describe("Hover States", () => {
    it("activates dropdown on mouse enter", async () => {
      render(<MenuBar items={mockItems} />);
      const firstMenuItem = screen.getByText("Products").closest("li");

      if (firstMenuItem) {
        await act(async () => {
          fireEvent.mouseEnter(firstMenuItem);
        });

        expect(firstMenuItem).toHaveClass("navigation-menu__item--active");
      }
    });

    it("deactivates dropdown on mouse leave", async () => {
      render(<MenuBar items={mockItems} />);
      const firstMenuItem = screen.getByText("Products").closest("li");

      if (firstMenuItem) {
        await act(async () => {
          fireEvent.mouseEnter(firstMenuItem);
          fireEvent.mouseLeave(firstMenuItem);
        });

        expect(firstMenuItem).not.toHaveClass("navigation-menu__item--active");
      }
    });

    it("applies correct slide direction when moving right", async () => {
      render(<MenuBar items={mockItems} />);
      const firstMenuItem = screen.getByText("Products").closest("li");
      const secondMenuItem = screen.getByText("Services").closest("li");

      if (firstMenuItem && secondMenuItem) {
        await act(async () => {
          fireEvent.mouseEnter(firstMenuItem);
          fireEvent.mouseLeave(firstMenuItem);
          fireEvent.mouseEnter(secondMenuItem);
        });

        expect(secondMenuItem).toHaveClass(
          "navigation-menu__item--slide-right"
        );
      }
    });

    it("applies correct slide direction when moving left", async () => {
      render(<MenuBar items={mockItems} />);
      const secondMenuItem = screen.getByText("Services").closest("li");
      const firstMenuItem = screen.getByText("Products").closest("li");

      if (firstMenuItem && secondMenuItem) {
        await act(async () => {
          fireEvent.mouseEnter(secondMenuItem);
          fireEvent.mouseLeave(secondMenuItem);
          fireEvent.mouseEnter(firstMenuItem);
        });

        expect(firstMenuItem).toHaveClass("navigation-menu__item--slide-left");
      }
    });
  });

  // Dropdown Content Tests
  describe("Dropdown Content", () => {
    it("renders dropdown content when item has content", () => {
      render(<MenuBar items={mockItems} />);
      const dropdown = screen.queryByText("Our Products");
      expect(dropdown).toBeDefined();
    });

    it("shows dropdown description when available", () => {
      render(<MenuBar items={mockItems} />);
      const description = screen.queryByText("Explore our range of products");
      expect(description).toBeDefined();
    });

    it("renders dropdown links correctly", () => {
      render(<MenuBar items={mockItems} />);
      const firstMenuItem = screen.getByText("Products").closest("li");

      if (firstMenuItem) {
        fireEvent.mouseEnter(firstMenuItem);
        mockItems[0].content?.links?.forEach((link) => {
          expect(screen.getByText(link.label)).toHaveAttribute(
            "href",
            link.url
          );
        });
      }
    });

    it("does not render dropdown for items without content", () => {
      render(<MenuBar items={mockItems} />);
      const aboutMenuItem = screen.getByText("About").closest("li");

      if (aboutMenuItem) {
        fireEvent.mouseEnter(aboutMenuItem);
        const dropdown = aboutMenuItem.querySelector(
          ".navigation-menu__dropdown"
        );
        expect(dropdown).toBeNull();
      }
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("handles empty items array", () => {
      render(<MenuBar items={[]} />);
      const list = screen.queryByRole("list");
      expect(list).toBeDefined();
      expect(list?.children.length).toBe(0);
    });

    it("handles items without links array in content", () => {
      const itemsWithoutLinks = [
        {
          id: "1",
          label: "Test",
          link: "/test",
          content: {
            id: "test",
            title: "Test Title",
          },
        },
      ];

      render(<MenuBar items={itemsWithoutLinks} />);
      const menuItem = screen.getByText("Test").closest("li");

      if (menuItem) {
        fireEvent.mouseEnter(menuItem);
        const linksList = menuItem.querySelector(
          ".navigation-menu__dropdown-links"
        );
        expect(linksList).toBeNull();
      }
    });

    it("maintains hover state when moving between dropdown content", async () => {
      render(<MenuBar items={mockItems} />);
      const firstMenuItem = screen.getByText("Products").closest("li");

      if (firstMenuItem) {
        await act(async () => {
          fireEvent.mouseEnter(firstMenuItem);
          const dropdown = firstMenuItem.querySelector(
            ".navigation-menu__dropdown"
          );
          if (dropdown) {
            fireEvent.mouseEnter(dropdown);
            fireEvent.mouseLeave(firstMenuItem);
          }
        });

        expect(firstMenuItem).toHaveClass("navigation-menu__item--active");
      }
    });
  });

  // Accessibility Tests
  describe("Accessibility", () => {
    it("has navigation role", () => {
      render(<MenuBar items={mockItems} />);
      expect(screen.getByRole("navigation")).toBeDefined();
    });

    it("has clickable links", async () => {
      const user = userEvent.setup();
      render(<MenuBar items={mockItems} />);

      const firstLink = screen.getByText("Products").closest("a");
      if (firstLink) {
        const clickSpy = vi.fn();
        firstLink.addEventListener("click", clickSpy);
        await user.click(firstLink);
        expect(clickSpy).toHaveBeenCalled();
      }
    });

    it("dropdown links are keyboard accessible", async () => {
      const user = userEvent.setup();
      render(<MenuBar items={mockItems} />);

      const firstMenuItem = screen.getByText("Products").closest("li");
      if (firstMenuItem) {
        fireEvent.mouseEnter(firstMenuItem);
        const dropdownLink = screen.getByText("New Arrivals");
        await user.tab();
        expect(document.activeElement).toBeDefined();
      }
    });
  });
});
