import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Popover from "./Popover";

describe("Popover Component", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const defaultProps = {
    trigger: <button>Open Popover</button>,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it("renders trigger element correctly", () => {
    render(<Popover {...defaultProps} />);
    expect(screen.getByText("Open Popover")).toBeInTheDocument();
  });

  it("shows popover content when trigger is clicked", async () => {
    render(<Popover {...defaultProps} />);
    const trigger = screen.getByText("Open Popover");

    await userEvent.click(trigger);

    expect(screen.getByPlaceholderText("Enter value...")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("handles input value changes", async () => {
    render(<Popover {...defaultProps} />);
    await userEvent.click(screen.getByText("Open Popover"));

    const input = screen.getByPlaceholderText("Enter value...");
    await userEvent.type(input, "test value");

    expect(input).toHaveValue("test value");
  });

  it("submits form with input value", async () => {
    render(<Popover {...defaultProps} />);
    await userEvent.click(screen.getByText("Open Popover"));

    const input = screen.getByPlaceholderText("Enter value...");
    await userEvent.type(input, "test value");
    await userEvent.click(screen.getByText("Submit"));

    expect(mockOnSubmit).toHaveBeenCalledWith("test value");
    expect(input).toHaveValue("");
    expect(screen.queryByText("Submit")).not.toBeInTheDocument();
  });

  it("handles form submission with enter key", async () => {
    render(<Popover {...defaultProps} />);
    await userEvent.click(screen.getByText("Open Popover"));

    const input = screen.getByPlaceholderText("Enter value...");
    await userEvent.type(input, "test value{enter}");

    expect(mockOnSubmit).toHaveBeenCalledWith("test value");
    expect(input).not.toBeInTheDocument();
  });

  it("cancels and clears input", async () => {
    render(<Popover {...defaultProps} />);
    await userEvent.click(screen.getByText("Open Popover"));

    const input = screen.getByPlaceholderText("Enter value...");
    await userEvent.type(input, "test value");
    await userEvent.click(screen.getByText("Cancel"));

    expect(mockOnCancel).toHaveBeenCalled();
    expect(screen.queryByText("Submit")).not.toBeInTheDocument();
  });

  it("closes when clicking outside", async () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <Popover {...defaultProps} />
      </div>
    );

    await userEvent.click(screen.getByText("Open Popover"));
    expect(screen.getByText("Submit")).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("outside"));
    expect(screen.queryByText("Submit")).not.toBeInTheDocument();
  });

  it("applies position classes correctly", () => {
    const { rerender } = render(<Popover {...defaultProps} position="top" />);
    const getPopover = () =>
      screen.getByText("Open Popover").parentElement?.nextElementSibling;

    expect(getPopover()).toHaveClass("popover--top");

    rerender(<Popover {...defaultProps} position="right" />);
    expect(getPopover()).toHaveClass("popover--right");

    rerender(<Popover {...defaultProps} position="bottom" />);
    expect(getPopover()).toHaveClass("popover--bottom");

    rerender(<Popover {...defaultProps} position="left" />);
    expect(getPopover()).toHaveClass("popover--left");
  });

  it("applies custom className correctly", () => {
    render(<Popover {...defaultProps} className="custom-class" />);
    const popover =
      screen.getByText("Open Popover").parentElement?.nextElementSibling;
    expect(popover).toHaveClass("custom-class");
  });

  it("maintains focus on input when popover is open", async () => {
    render(<Popover {...defaultProps} />);
    await userEvent.click(screen.getByText("Open Popover"));

    const input = screen.getByPlaceholderText("Enter value...");
    expect(document.activeElement).toBe(input);
  });

  it("handles multiple opens and closes correctly", async () => {
    render(<Popover {...defaultProps} />);
    const trigger = screen.getByText("Open Popover");

    // First open-close cycle
    await userEvent.click(trigger);
    expect(screen.getByText("Submit")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Submit")).not.toBeInTheDocument();

    // Second open-close cycle
    await userEvent.click(trigger);
    expect(screen.getByText("Submit")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Submit")).not.toBeInTheDocument();
  });

  it("cleans up event listeners on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(<Popover {...defaultProps} />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function)
    );
  });
});
