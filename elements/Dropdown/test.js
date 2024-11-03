import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import Dropdown from "./Dropdown";

describe("Dropdown Component", () => {
  const defaultOptions = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "orange", label: "Orange" },
  ];

  const defaultProps = {
    options: defaultOptions,
    value: "",
    onChange: vi.fn(),
    placeholder: "Select an option",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Basic Rendering Tests
  describe("Rendering", () => {
    it("renders with placeholder when no value is selected", () => {
      render(<Dropdown {...defaultProps} />);
      expect(screen.getByText("Select an option")).toBeInTheDocument();
    });

    it("renders with selected value when provided", () => {
      render(<Dropdown {...defaultProps} value="apple" />);
      expect(screen.getByText("Apple")).toBeInTheDocument();
    });

    it("renders all options when opened", async () => {
      render(<Dropdown {...defaultProps} />);
      await userEvent.click(screen.getByRole("button"));

      defaultOptions.forEach((option) => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    it("renders in disabled state when disabled prop is true", () => {
      render(<Dropdown {...defaultProps} disabled={true} />);
      const trigger = screen.getByRole("button");
      expect(trigger).toHaveAttribute("aria-disabled", "true");
      expect(trigger).toHaveClass("dropdown__trigger--disabled");
    });
  });

  // Interaction Tests
  describe("User Interactions", () => {
    it("opens dropdown menu on click", async () => {
      render(<Dropdown {...defaultProps} />);
      const trigger = screen.getByRole("button");

      await userEvent.click(trigger);
      expect(screen.getByRole("listbox")).toHaveClass("dropdown__menu--open");
    });

    it("closes dropdown menu when clicking outside", async () => {
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <Dropdown {...defaultProps} />
        </div>
      );

      await userEvent.click(screen.getByRole("button"));
      await userEvent.click(screen.getByTestId("outside"));

      expect(screen.getByRole("listbox")).not.toHaveClass(
        "dropdown__menu--open"
      );
    });

    it("selects option on click and calls onChange", async () => {
      render(<Dropdown {...defaultProps} />);

      await userEvent.click(screen.getByRole("button"));
      await userEvent.click(screen.getByText("Banana"));

      expect(defaultProps.onChange).toHaveBeenCalledWith("banana");
      expect(screen.getByRole("listbox")).not.toHaveClass(
        "dropdown__menu--open"
      );
    });

    it("does not open when disabled", async () => {
      render(<Dropdown {...defaultProps} disabled={true} />);

      await userEvent.click(screen.getByRole("button"));
      expect(screen.getByRole("listbox")).not.toHaveClass(
        "dropdown__menu--open"
      );
    });
  });

  // Keyboard Navigation Tests
  describe("Keyboard Navigation", () => {
    it("opens menu and focuses first option with ArrowDown", async () => {
      render(<Dropdown {...defaultProps} />);
      const trigger = screen.getByRole("button");

      await userEvent.type(trigger, "{ArrowDown}");

      expect(screen.getByRole("listbox")).toHaveClass("dropdown__menu--open");
      expect(screen.getByText("Apple")).toHaveClass(
        "dropdown__option--focused"
      );
    });

    it("opens menu and focuses last option with ArrowUp", async () => {
      render(<Dropdown {...defaultProps} />);
      const trigger = screen.getByRole("button");

      await userEvent.type(trigger, "{ArrowUp}");

      expect(screen.getByRole("listbox")).toHaveClass("dropdown__menu--open");
      expect(screen.getByText("Orange")).toHaveClass(
        "dropdown__option--focused"
      );
    });

    it("cycles through options with ArrowDown", async () => {
      render(<Dropdown {...defaultProps} />);
      const trigger = screen.getByRole("button");

      await userEvent.type(trigger, "{ArrowDown}"); // Opens menu
      await userEvent.type(trigger, "{ArrowDown}"); // Moves to second option

      expect(screen.getByText("Banana")).toHaveClass(
        "dropdown__option--focused"
      );
    });

    it("cycles through options with ArrowUp", async () => {
      render(<Dropdown {...defaultProps} />);
      const trigger = screen.getByRole("button");

      await userEvent.type(trigger, "{ArrowUp}"); // Opens menu
      await userEvent.type(trigger, "{ArrowUp}"); // Moves to second-to-last option

      expect(screen.getByText("Banana")).toHaveClass(
        "dropdown__option--focused"
      );
    });

    it("selects focused option with Enter", async () => {
      render(<Dropdown {...defaultProps} />);
      const trigger = screen.getByRole("button");

      await userEvent.type(trigger, "{ArrowDown}"); // Opens menu
      await userEvent.type(trigger, "{ArrowDown}"); // Moves to second option
      await userEvent.type(trigger, "{Enter}"); // Selects option

      expect(defaultProps.onChange).toHaveBeenCalledWith("banana");
      expect(screen.getByRole("listbox")).not.toHaveClass(
        "dropdown__menu--open"
      );
    });

    it("closes menu with Escape", async () => {
      render(<Dropdown {...defaultProps} />);
      const trigger = screen.getByRole("button");

      await userEvent.type(trigger, "{ArrowDown}"); // Opens menu
      await userEvent.type(trigger, "{Escape}"); // Closes menu

      expect(screen.getByRole("listbox")).not.toHaveClass(
        "dropdown__menu--open"
      );
    });
  });

  // Accessibility Tests
  describe("Accessibility", () => {
    it("has correct ARIA attributes when closed", () => {
      render(<Dropdown {...defaultProps} />);
      const trigger = screen.getByRole("button");

      expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("has correct ARIA attributes when open", async () => {
      render(<Dropdown {...defaultProps} />);
      const trigger = screen.getByRole("button");

      await userEvent.click(trigger);

      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("sets correct aria-selected on options", async () => {
      render(<Dropdown {...defaultProps} value="banana" />);
      await userEvent.click(screen.getByRole("button"));

      const options = screen.getAllByRole("option");
      const bananaOption = screen.getByText("Banana");

      expect(bananaOption).toHaveAttribute("aria-selected", "true");
      options
        .filter((option) => option !== bananaOption)
        .forEach((option) => {
          expect(option).toHaveAttribute("aria-selected", "false");
        });
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("handles empty options array", () => {
      render(<Dropdown {...defaultProps} options={[]} />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("handles option click when onChange is not provided", async () => {
      render(<Dropdown {...defaultProps} onChange={undefined} />);

      await userEvent.click(screen.getByRole("button"));
      await userEvent.click(screen.getByText("Banana"));

      // Should not throw error
      expect(screen.getByRole("listbox")).not.toHaveClass(
        "dropdown__menu--open"
      );
    });

    it("maintains focus state when options change", async () => {
      const { rerender } = render(<Dropdown {...defaultProps} />);
      const trigger = screen.getByRole("button");

      await userEvent.type(trigger, "{ArrowDown}");

      rerender(
        <Dropdown
          {...defaultProps}
          options={[...defaultOptions, { value: "grape", label: "Grape" }]}
        />
      );

      expect(screen.getByText("Apple")).toHaveClass(
        "dropdown__option--focused"
      );
    });
  });
});
