import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AlertDialog from "./AlertDialog";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  X: vi.fn(() => null),
  CheckCircle: vi.fn(() => null),
  AlertTriangle: vi.fn(() => null),
  Info: vi.fn(() => null),
}));

describe("AlertDialog Component", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: "Test Title",
    description: "Test Description",
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  // Rendering Tests
  describe("Rendering", () => {
    it("should not render when isOpen is false", () => {
      render(<AlertDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("should render when isOpen is true", () => {
      render(<AlertDialog {...defaultProps} />);
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("should render title and description", () => {
      render(<AlertDialog {...defaultProps} />);
      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
    });

    it("should render custom actions", () => {
      const actions = <button>Custom Action</button>;
      render(<AlertDialog {...defaultProps} actions={actions} />);
      expect(screen.getByText("Custom Action")).toBeInTheDocument();
    });
  });

  // Variant Tests
  describe("Variants", () => {
    it("should render success variant with correct icon", () => {
      render(<AlertDialog {...defaultProps} variant="success" />);
      expect(CheckCircle).toHaveBeenCalled();
    });

    it("should render warning variant with correct icon", () => {
      render(<AlertDialog {...defaultProps} variant="warning" />);
      expect(AlertTriangle).toHaveBeenCalled();
    });

    it("should render info variant with correct icon", () => {
      render(<AlertDialog {...defaultProps} variant="info" />);
      expect(Info).toHaveBeenCalled();
    });
  });

  // Close Button Tests
  describe("Close Button", () => {
    it("should render close button when showCloseButton is true", () => {
      render(<AlertDialog {...defaultProps} />);
      expect(screen.getByLabelText("Close dialog")).toBeInTheDocument();
    });

    it("should not render close button when showCloseButton is false", () => {
      render(<AlertDialog {...defaultProps} showCloseButton={false} />);
      expect(screen.queryByLabelText("Close dialog")).not.toBeInTheDocument();
    });

    it("should call onClose when close button is clicked", async () => {
      const onClose = vi.fn();
      render(<AlertDialog {...defaultProps} onClose={onClose} />);
      await userEvent.click(screen.getByLabelText("Close dialog"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // Escape Key Tests
  describe("Escape Key Handling", () => {
    it("should close on Escape key press when closeOnEsc is true", () => {
      const onClose = vi.fn();
      render(
        <AlertDialog {...defaultProps} onClose={onClose} closeOnEsc={true} />
      );
      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not close on Escape key press when closeOnEsc is false", () => {
      const onClose = vi.fn();
      render(
        <AlertDialog {...defaultProps} onClose={onClose} closeOnEsc={false} />
      );
      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // Outside Click Tests
  describe("Outside Click Handling", () => {
    it("should close on outside click when closeOnOutsideClick is true", async () => {
      const onClose = vi.fn();
      render(
        <AlertDialog
          {...defaultProps}
          onClose={onClose}
          closeOnOutsideClick={true}
        />
      );
      await userEvent.click(screen.getByRole("presentation"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not close on outside click when closeOnOutsideClick is false", async () => {
      const onClose = vi.fn();
      render(
        <AlertDialog
          {...defaultProps}
          onClose={onClose}
          closeOnOutsideClick={false}
        />
      );
      await userEvent.click(screen.getByRole("presentation"));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // Auto Close Tests
  describe("Auto Close", () => {
    it("should auto close after specified delay when autoClose is true", () => {
      const onClose = vi.fn();
      render(
        <AlertDialog
          {...defaultProps}
          onClose={onClose}
          autoClose={true}
          autoCloseDelay={5000}
        />
      );

      expect(onClose).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not auto close when autoClose is false", () => {
      const onClose = vi.fn();
      render(
        <AlertDialog
          {...defaultProps}
          onClose={onClose}
          autoClose={false}
          autoCloseDelay={5000}
        />
      );

      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(onClose).not.toHaveBeenCalled();
    });

    it("should clear auto close timer on unmount", () => {
      const onClose = vi.fn();
      const { unmount } = render(
        <AlertDialog
          {...defaultProps}
          onClose={onClose}
          autoClose={true}
          autoCloseDelay={5000}
        />
      );

      unmount();
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // Size Tests
  describe("Size Variants", () => {
    it("should apply correct size class", () => {
      const { container } = render(
        <AlertDialog {...defaultProps} size="small" />
      );
      expect(
        container.querySelector(".alert-dialog--small")
      ).toBeInTheDocument();
    });
  });

  // Accessibility Tests
  describe("Accessibility", () => {
    it("should have correct ARIA attributes", () => {
      render(<AlertDialog {...defaultProps} />);
      const dialog = screen.getByRole("alertdialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby", "alert-dialog-title");
      expect(dialog).toHaveAttribute(
        "aria-describedby",
        "alert-dialog-description"
      );
    });
  });

  // Body Overflow Tests
  describe("Body Overflow", () => {
    it("should set body overflow to hidden when opened", () => {
      render(<AlertDialog {...defaultProps} />);
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("should restore body overflow on unmount", () => {
      const { unmount } = render(<AlertDialog {...defaultProps} />);
      unmount();
      expect(document.body.style.overflow).toBe("");
    });
  });

  // Custom Class Tests
  describe("Custom Classes", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <AlertDialog {...defaultProps} className="custom-class" />
      );
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });
});
