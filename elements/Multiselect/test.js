import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import MultiselectDropdown from "./MultiselectDropdown";

describe("MultiselectDropdown", () => {
  const defaultOptions = [
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" },
  ];

  const defaultProps = {
    options: defaultOptions,
    value: [],
    onChange: vi.fn(),
    placeholder: "Select options",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders with default props", () => {
      render(<MultiselectDropdown {...defaultProps} />);
      expect(screen.getByText("Select options")).toBeInTheDocument();
    });

    it("renders with pre-selected values", () => {
      render(<MultiselectDropdown {...defaultProps} value={["react"]} />);
      expect(screen.getByText("React")).toBeInTheDocument();
    });

    it("renders in disabled state", () => {
      render(<MultiselectDropdown {...defaultProps} disabled={true} />);
      const control = screen
        .getByText("Select options")
        .closest(".multiselect__control");
      expect(control).toHaveClass("multiselect__control--is-disabled");
    });

    it("renders without search input when searchable is false", () => {
      render(<MultiselectDropdown {...defaultProps} searchable={false} />);
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });
  });

  describe("Dropdown Functionality", () => {
    it("opens dropdown on click", async () => {
      render(<MultiselectDropdown {...defaultProps} />);
      const control = screen
        .getByText("Select options")
        .closest(".multiselect__control");
      fireEvent.click(control);

      await waitFor(() => {
        expect(screen.getByText("React")).toBeVisible();
        expect(screen.getByText("Vue")).toBeVisible();
        expect(screen.getByText("Angular")).toBeVisible();
      });
    });

    it("closes dropdown when clicking outside", async () => {
      render(
        <div>
          <MultiselectDropdown {...defaultProps} />
          <div data-testid="outside">Outside</div>
        </div>
      );

      const control = screen
        .getByText("Select options")
        .closest(".multiselect__control");
      fireEvent.click(control);

      await waitFor(() => {
        expect(screen.getByText("React")).toBeVisible();
      });

      fireEvent.mouseDown(screen.getByTestId("outside"));

      await waitFor(() => {
        expect(screen.queryByText("React")).not.toBeVisible();
      });
    });
  });

  describe("Selection Functionality", () => {
    it("selects an option on click", async () => {
      render(<MultiselectDropdown {...defaultProps} />);

      const control = screen
        .getByText("Select options")
        .closest(".multiselect__control");
      fireEvent.click(control);

      await waitFor(() => {
        fireEvent.click(screen.getByText("React"));
      });

      expect(defaultProps.onChange).toHaveBeenCalledWith(["react"]);
    });

    it("deselects an option on clicking selected option", async () => {
      render(<MultiselectDropdown {...defaultProps} value={["react"]} />);

      const control = screen
        .getByText("React")
        .closest(".multiselect__control");
      fireEvent.click(control);

      await waitFor(() => {
        fireEvent.click(screen.getByText("React"));
      });

      expect(defaultProps.onChange).toHaveBeenCalledWith([]);
    });

    it("respects maxItems limit", async () => {
      render(
        <MultiselectDropdown {...defaultProps} value={["react"]} maxItems={1} />
      );

      const control = screen
        .getByText("React")
        .closest(".multiselect__control");
      fireEvent.click(control);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Vue"));
      });

      expect(defaultProps.onChange).not.toHaveBeenCalled();
    });

    it("removes selected option using tag remove button", () => {
      render(<MultiselectDropdown {...defaultProps} value={["react"]} />);

      const removeButton = screen.getByText("×");
      fireEvent.click(removeButton);

      expect(defaultProps.onChange).toHaveBeenCalledWith([]);
    });

    it("clears all selected options using clear button", () => {
      render(
        <MultiselectDropdown {...defaultProps} value={["react", "vue"]} />
      );

      const clearButton = screen.getAllByText("×")[2]; // Last × is clear all button
      fireEvent.click(clearButton);

      expect(defaultProps.onChange).toHaveBeenCalledWith([]);
    });
  });

  describe("Search Functionality", () => {
    it("filters options based on search input", async () => {
      render(<MultiselectDropdown {...defaultProps} />);

      const control = screen
        .getByText("Select options")
        .closest(".multiselect__control");
      fireEvent.click(control);

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "rea");

      expect(screen.getByText("React")).toBeVisible();
      expect(screen.queryByText("Vue")).not.toBeVisible();
    });

    it("shows no options message when search has no results", async () => {
      render(<MultiselectDropdown {...defaultProps} />);

      const control = screen
        .getByText("Select options")
        .closest(".multiselect__control");
      fireEvent.click(control);

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "xyz");

      expect(screen.getByText("No options available")).toBeVisible();
    });
  });

  describe("Keyboard Navigation", () => {
    it("opens dropdown on arrow down", () => {
      render(<MultiselectDropdown {...defaultProps} />);

      const control = screen
        .getByText("Select options")
        .closest(".multiselect__control");
      fireEvent.keyDown(control, { key: "ArrowDown" });

      expect(screen.getByText("React")).toBeVisible();
    });

    it("moves focus through options with arrow keys", async () => {
      render(<MultiselectDropdown {...defaultProps} />);

      const control = screen
        .getByText("Select options")
        .closest(".multiselect__control");
      fireEvent.keyDown(control, { key: "ArrowDown" });
      fireEvent.keyDown(control, { key: "ArrowDown" });

      const options = screen.getAllByRole("option");
      expect(options[1]).toHaveClass("multiselect__option--is-focused");
    });

    it("selects focused option with Enter key", async () => {
      render(<MultiselectDropdown {...defaultProps} />);

      const control = screen
        .getByText("Select options")
        .closest(".multiselect__control");
      fireEvent.keyDown(control, { key: "ArrowDown" });
      fireEvent.keyDown(control, { key: "Enter" });

      expect(defaultProps.onChange).toHaveBeenCalledWith(["react"]);
    });

    it("closes dropdown with Escape key", async () => {
      render(<MultiselectDropdown {...defaultProps} />);

      const control = screen
        .getByText("Select options")
        .closest(".multiselect__control");
      fireEvent.click(control);
      fireEvent.keyDown(control, { key: "Escape" });

      await waitFor(() => {
        expect(screen.queryByText("React")).not.toBeVisible();
      });
    });

    it("removes last selected option with Backspace when search is empty", () => {
      render(
        <MultiselectDropdown {...defaultProps} value={["react", "vue"]} />
      );

      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "Backspace" });

      expect(defaultProps.onChange).toHaveBeenCalledWith(["react"]);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty options array", () => {
      render(<MultiselectDropdown {...defaultProps} options={[]} />);

      const control = screen
        .getByText("Select options")
        .closest(".multiselect__control");
      fireEvent.click(control);

      expect(screen.getByText("No options available")).toBeVisible();
    });

    it("handles non-existing value in options", () => {
      render(
        <MultiselectDropdown {...defaultProps} value={["non-existing"]} />
      );
      expect(screen.queryByText("non-existing")).not.toBeInTheDocument();
    });

    it("prevents selection when disabled", async () => {
      render(<MultiselectDropdown {...defaultProps} disabled={true} />);

      const control = screen
        .getByText("Select options")
        .closest(".multiselect__control");
      fireEvent.click(control);

      expect(screen.queryByText("React")).not.toBeVisible();
      expect(defaultProps.onChange).not.toHaveBeenCalled();
    });
  });
});
