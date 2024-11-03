import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Bold, Italic, Underline } from "lucide-react";
import FormatToggleGroup from "./index";

// Mock the lucide-react icons
vi.mock("lucide-react", () => ({
  Bold: () => <div data-testid="bold-icon">Bold</div>,
  Italic: () => <div data-testid="italic-icon">Italic</div>,
  Underline: () => <div data-testid="underline-icon">Underline</div>,
}));

describe("FormatToggleGroup", () => {
  let onChange;

  beforeEach(() => {
    onChange = vi.fn();
    cleanup();
  });

  it("renders all format buttons with correct icons and labels", () => {
    render(<FormatToggleGroup onChange={onChange} />);

    // Check if all buttons are rendered
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);

    // Check if all icons are rendered
    expect(screen.getByTestId("bold-icon")).toBeInTheDocument();
    expect(screen.getByTestId("italic-icon")).toBeInTheDocument();
    expect(screen.getByTestId("underline-icon")).toBeInTheDocument();

    // Check if all buttons have correct aria-labels
    expect(screen.getByLabelText("Bold")).toBeInTheDocument();
    expect(screen.getByLabelText("Italic")).toBeInTheDocument();
    expect(screen.getByLabelText("Underline")).toBeInTheDocument();
  });

  it("initializes with default states when no initialStates provided", () => {
    render(<FormatToggleGroup onChange={onChange} />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveAttribute("aria-pressed", "false");
      expect(button.classList.contains("format-group__button--active")).toBe(
        false
      );
    });
  });

  it("initializes with provided initialStates", () => {
    const initialStates = {
      bold: true,
      italic: true,
      underline: false,
    };

    render(
      <FormatToggleGroup onChange={onChange} initialStates={initialStates} />
    );

    expect(screen.getByLabelText("Bold")).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByLabelText("Italic")).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByLabelText("Underline")).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("toggles format state when button is clicked", () => {
    render(<FormatToggleGroup onChange={onChange} />);

    const boldButton = screen.getByLabelText("Bold");

    // First click - activate
    fireEvent.click(boldButton);
    expect(boldButton).toHaveAttribute("aria-pressed", "true");
    expect(boldButton.classList.contains("format-group__button--active")).toBe(
      true
    );
    expect(onChange).toHaveBeenCalledWith({
      bold: true,
      italic: false,
      underline: false,
    });

    // Second click - deactivate
    fireEvent.click(boldButton);
    expect(boldButton).toHaveAttribute("aria-pressed", "false");
    expect(boldButton.classList.contains("format-group__button--active")).toBe(
      false
    );
    expect(onChange).toHaveBeenCalledWith({
      bold: false,
      italic: false,
      underline: false,
    });
  });

  it("maintains independent states for each format button", () => {
    render(<FormatToggleGroup onChange={onChange} />);

    const boldButton = screen.getByLabelText("Bold");
    const italicButton = screen.getByLabelText("Italic");
    const underlineButton = screen.getByLabelText("Underline");

    // Toggle bold
    fireEvent.click(boldButton);
    expect(boldButton).toHaveAttribute("aria-pressed", "true");
    expect(italicButton).toHaveAttribute("aria-pressed", "false");
    expect(underlineButton).toHaveAttribute("aria-pressed", "false");

    // Toggle italic
    fireEvent.click(italicButton);
    expect(boldButton).toHaveAttribute("aria-pressed", "true");
    expect(italicButton).toHaveAttribute("aria-pressed", "true");
    expect(underlineButton).toHaveAttribute("aria-pressed", "false");

    // Check final onChange call
    expect(onChange).toHaveBeenLastCalledWith({
      bold: true,
      italic: true,
      underline: false,
    });
  });

  it("works correctly without onChange prop", () => {
    render(<FormatToggleGroup />);

    const boldButton = screen.getByLabelText("Bold");

    // Should not throw an error when clicking without onChange prop
    expect(() => {
      fireEvent.click(boldButton);
    }).not.toThrow();

    expect(boldButton).toHaveAttribute("aria-pressed", "true");
  });

  it("renders correct tooltip text for each button", () => {
    render(<FormatToggleGroup onChange={onChange} />);

    const tooltips = screen.getAllByText(/(Bold|Italic|Underline)/);
    expect(tooltips).toHaveLength(6); // 3 for icons and 3 for tooltips

    expect(screen.getAllByText("Bold")).toHaveLength(2);
    expect(screen.getAllByText("Italic")).toHaveLength(2);
    expect(screen.getAllByText("Underline")).toHaveLength(2);
  });

  it("applies correct CSS classes based on active state", () => {
    render(<FormatToggleGroup onChange={onChange} />);

    const boldButton = screen.getByLabelText("Bold");

    // Check initial classes
    expect(boldButton).toHaveClass("format-group__button");
    expect(boldButton).not.toHaveClass("format-group__button--active");

    // Check classes after activation
    fireEvent.click(boldButton);
    expect(boldButton).toHaveClass("format-group__button");
    expect(boldButton).toHaveClass("format-group__button--active");
  });
});
