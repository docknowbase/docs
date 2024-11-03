import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Pagination from "./index";

describe("Pagination Component", () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    onPageChange: vi.fn(),
    pageSize: 10,
    onPageSizeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Rendering Tests
  describe("Rendering", () => {
    it("renders with default props", () => {
      render(<Pagination {...defaultProps} />);
      expect(screen.getByText("Page 1 of 10")).toBeInTheDocument();
    });

    it("renders correct number of page buttons for small number of pages", () => {
      render(<Pagination {...defaultProps} totalPages={5} />);
      const pageButtons = screen
        .getAllByRole("button")
        .filter((button) => /^[0-9]+$/.test(button.textContent || ""));
      expect(pageButtons).toHaveLength(5);
    });

    it("renders dots when there are many pages", () => {
      render(<Pagination {...defaultProps} currentPage={5} totalPages={20} />);
      const dots = screen.getAllByRole("img", { hidden: true });
      expect(dots).toHaveLength(2); // Should show dots on both sides
    });

    it("renders first/last navigation buttons when showFirstLast is true", () => {
      render(<Pagination {...defaultProps} showFirstLast={true} />);
      expect(screen.getAllByLabelText(/go to (first|last) page/i)).toHaveLength(
        2
      );
    });

    it("does not render first/last navigation buttons when showFirstLast is false", () => {
      render(<Pagination {...defaultProps} showFirstLast={false} />);
      expect(screen.queryByLabelText(/go to (first|last) page/i)).toBeNull();
    });
  });

  // Navigation Tests
  describe("Navigation", () => {
    it("calls onPageChange when clicking a page number", () => {
      render(<Pagination {...defaultProps} />);
      fireEvent.click(screen.getByText("2"));
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
    });

    it("calls onPageChange when clicking next button", () => {
      render(<Pagination {...defaultProps} />);
      fireEvent.click(screen.getByLabelText("Next page"));
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
    });

    it("calls onPageChange when clicking previous button", () => {
      render(<Pagination {...defaultProps} currentPage={2} />);
      fireEvent.click(screen.getByLabelText("Previous page"));
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
    });

    it("calls onPageChange when clicking first page button", () => {
      render(<Pagination {...defaultProps} currentPage={5} />);
      fireEvent.click(screen.getByLabelText("Go to first page"));
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
    });

    it("calls onPageChange when clicking last page button", () => {
      render(<Pagination {...defaultProps} currentPage={5} />);
      fireEvent.click(screen.getByLabelText("Go to last page"));
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(10);
    });
  });

  // Disabled State Tests
  describe("Disabled State", () => {
    it("disables all buttons when disabled prop is true", () => {
      render(<Pagination {...defaultProps} disabled={true} />);
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it("disables previous button on first page", () => {
      render(<Pagination {...defaultProps} currentPage={1} />);
      expect(screen.getByLabelText("Previous page")).toBeDisabled();
    });

    it("disables next button on last page", () => {
      render(<Pagination {...defaultProps} currentPage={10} />);
      expect(screen.getByLabelText("Next page")).toBeDisabled();
    });
  });

  // Page Size Selector Tests
  describe("Page Size Selector", () => {
    it("renders page size selector when showPageSize is true", () => {
      render(<Pagination {...defaultProps} showPageSize={true} />);
      expect(screen.getByText("Items per page:")).toBeInTheDocument();
    });

    it("does not render page size selector when showPageSize is false", () => {
      render(<Pagination {...defaultProps} showPageSize={false} />);
      expect(screen.queryByText("Items per page:")).not.toBeInTheDocument();
    });

    it("calls onPageSizeChange when selecting a different page size", () => {
      render(<Pagination {...defaultProps} />);
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "20" },
      });
      expect(defaultProps.onPageSizeChange).toHaveBeenCalledWith(20);
    });

    it("renders correct page size options", () => {
      const customOptions = [5, 10, 25];
      render(<Pagination {...defaultProps} pageSizeOptions={customOptions} />);
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(customOptions.length);
      options.forEach((option, index) => {
        expect(option.value).toBe(customOptions[index].toString());
      });
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("handles single page correctly", () => {
      render(<Pagination {...defaultProps} totalPages={1} />);
      expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Previous page")).toBeDisabled();
      expect(screen.getByLabelText("Next page")).toBeDisabled();
    });

    it("handles zero pages correctly", () => {
      render(<Pagination {...defaultProps} totalPages={0} />);
      expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
    });

    it("handles large number of pages correctly", () => {
      render(
        <Pagination {...defaultProps} totalPages={100} currentPage={50} />
      );
      expect(screen.getByText("50")).toHaveClass("pagination__button--active");
      const dots = screen.getAllByRole("img", { hidden: true });
      expect(dots).toHaveLength(2);
    });

    it("maintains correct range when current page is near start", () => {
      render(<Pagination {...defaultProps} totalPages={20} currentPage={2} />);
      expect(screen.getByText("2")).toHaveClass("pagination__button--active");
    });

    it("maintains correct range when current page is near end", () => {
      render(<Pagination {...defaultProps} totalPages={20} currentPage={19} />);
      expect(screen.getByText("19")).toHaveClass("pagination__button--active");
    });
  });

  // Custom Styling Tests
  describe("Custom Styling", () => {
    it("applies custom className correctly", () => {
      render(<Pagination {...defaultProps} className="custom-pagination" />);
      expect(
        screen.getByText("Page 1 of 10").parentElement?.parentElement
      ).toHaveClass("custom-pagination");
    });

    it("applies active state styling to current page", () => {
      render(<Pagination {...defaultProps} currentPage={3} />);
      expect(screen.getByText("3")).toHaveClass("pagination__button--active");
    });
  });

  // Accessibility Tests
  describe("Accessibility", () => {
    it("sets correct aria-current attribute on active page", () => {
      render(<Pagination {...defaultProps} currentPage={3} />);
      expect(screen.getByText("3")).toHaveAttribute("aria-current", "page");
    });

    it("provides accessible labels for navigation buttons", () => {
      render(<Pagination {...defaultProps} showFirstLast={true} />);
      expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
      expect(screen.getByLabelText("Next page")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to first page")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to last page")).toBeInTheDocument();
    });
  });
});
