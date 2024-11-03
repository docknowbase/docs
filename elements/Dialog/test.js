import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dialog from "./Dialog";

describe("Dialog Component", () => {
  // Mock functions
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // Rendering Tests
  describe("Rendering", () => {
    it("should not render when isOpen is false", () => {
      render(<Dialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("should render when isOpen is true", () => {
      render(<Dialog {...defaultProps} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should render with default props", () => {
      render(<Dialog {...defaultProps} />);
      expect(screen.getByText("Dialog Title")).toBeInTheDocument();
      expect(screen.getByText("Submit")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter value...")).toBeInTheDocument();
    });

    it("should render with custom props", () => {
      const customProps = {
        ...defaultProps,
        title: "Custom Title",
        submitButtonText: "Save",
        cancelButtonText: "Exit",
        placeholder: "Custom placeholder",
      };
      render(<Dialog {...customProps} />);
      expect(screen.getByText("Custom Title")).toBeInTheDocument();
      expect(screen.getByText("Save")).toBeInTheDocument();
      expect(screen.getByText("Exit")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Custom placeholder")
      ).toBeInTheDocument();
    });

    it("should apply correct size class", () => {
      const { rerender } = render(<Dialog {...defaultProps} size="small" />);
      expect(screen.getByRole("dialog")).toHaveClass("dialog--small");

      rerender(<Dialog {...defaultProps} size="large" />);
      expect(screen.getByRole("dialog")).toHaveClass("dialog--large");
    });

    it("should apply custom className", () => {
      render(<Dialog {...defaultProps} className="custom-class" />);
      expect(screen.getByRole("dialog")).toHaveClass("custom-class");
    });
  });

  // Interaction Tests
  describe("Interactions", () => {
    it("should call onClose when clicking close button", async () => {
      render(<Dialog {...defaultProps} />);
      const closeButton = screen.getByLabelText("Close dialog");
      await userEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when clicking cancel button", async () => {
      render(<Dialog {...defaultProps} />);
      const cancelButton = screen.getByText("Cancel");
      await userEvent.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when clicking backdrop", async () => {
      render(<Dialog {...defaultProps} />);
      const backdrop = screen.getByClassName("dialog-wrapper");
      await userEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should not call onClose when clicking dialog content", async () => {
      render(<Dialog {...defaultProps} />);
      const dialogContent = screen.getByRole("dialog");
      await userEvent.click(dialogContent);
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("should handle form submission", async () => {
      render(<Dialog {...defaultProps} />);
      const input = screen.getByRole("textbox");
      const submitButton = screen.getByText("Submit");

      await userEvent.type(input, "test value");
      await userEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith("test value");
      expect(mockOnClose).toHaveBeenCalled();
      expect(input).toHaveValue("");
    });

    it("should handle initial value", async () => {
      render(<Dialog {...defaultProps} initialValue="initial test" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("initial test");
    });

    it("should reset input value when dialog reopens", () => {
      const { rerender } = render(
        <Dialog {...defaultProps} initialValue="initial" />
      );
      const input = screen.getByRole("textbox");

      fireEvent.change(input, { target: { value: "changed value" } });
      expect(input).toHaveValue("changed value");

      // Simulate closing and reopening
      rerender(
        <Dialog {...defaultProps} isOpen={false} initialValue="initial" />
      );
      rerender(
        <Dialog {...defaultProps} isOpen={true} initialValue="initial" />
      );

      expect(screen.getByRole("textbox")).toHaveValue("initial");
    });
  });

  // Keyboard Interaction Tests
  describe("Keyboard Interactions", () => {
    it("should handle Escape key press", () => {
      render(<Dialog {...defaultProps} />);
      fireEvent.keyDown(document, { key: "Escape" });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should not handle Escape key press when dialog is closed", () => {
      render(<Dialog {...defaultProps} isOpen={false} />);
      fireEvent.keyDown(document, { key: "Escape" });
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("should handle form submission with Enter key", async () => {
      render(<Dialog {...defaultProps} />);
      const input = screen.getByRole("textbox");

      await userEvent.type(input, "test value{enter}");

      expect(mockOnSubmit).toHaveBeenCalledWith("test value");
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  // Accessibility Tests
  describe("Accessibility", () => {
    it("should have correct ARIA attributes", () => {
      render(<Dialog {...defaultProps} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("should set focus on input when opened", () => {
      render(<Dialog {...defaultProps} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveFocus();
    });

    it("should have proper form labeling", () => {
      render(<Dialog {...defaultProps} />);
      const input = screen.getByLabelText("Input");
      expect(input).toBeInTheDocument();
    });
  });

  // Document Body Tests
  describe("Document Body Manipulation", () => {
    it("should set body overflow to hidden when opened", () => {
      render(<Dialog {...defaultProps} />);
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("should reset body overflow when closed", () => {
      const { unmount } = render(<Dialog {...defaultProps} />);
      unmount();
      expect(document.body.style.overflow).toBe("unset");
    });
  });
});
