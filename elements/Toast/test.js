import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast, ToastContext } from "./ToastManager";
import React from "react";

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  XCircle: () => <div data-testid="x-circle-icon" />,
  Info: () => <div data-testid="info-icon" />,
  X: () => <div data-testid="close-icon" />,
}));

// Mock createPortal
vi.mock("react-dom", () => ({
  createPortal: (node) => node,
}));

// Test Component using the useToast hook
const TestComponent = ({ onToastShow }) => {
  const toast = useToast();

  return (
    <div>
      <button
        onClick={() => toast.success("Success message", { duration: 1000 })}
      >
        Show Success
      </button>
      <button
        onClick={() => toast.error("Error message", { duration: Infinity })}
      >
        Show Error
      </button>
      <button onClick={() => toast.warning("Warning message")}>
        Show Warning
      </button>
      <button onClick={() => toast.info("Info message")}>Show Info</button>
    </div>
  );
};

describe("Toast System", () => {
  beforeEach(() => {
    // Setup DOM environment
    document.body.innerHTML = "";
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe("ToastProvider", () => {
    it("renders children correctly", () => {
      render(
        <ToastProvider>
          <div data-testid="child">Child content</div>
        </ToastProvider>
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("creates toast container in the DOM", () => {
      render(<ToastProvider />);
      expect(document.querySelector(".toast-container")).toBeInTheDocument();
    });
  });

  describe("useToast Hook", () => {
    it("throws error when used outside ToastProvider", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      expect(() => render(<TestComponent />)).toThrow(
        "useToast must be used within a ToastProvider"
      );
      consoleError.mockRestore();
    });

    it("provides toast methods", () => {
      const TestHook = () => {
        const toast = useToast();
        expect(toast.success).toBeDefined();
        expect(toast.error).toBeDefined();
        expect(toast.warning).toBeDefined();
        expect(toast.info).toBeDefined();
        return null;
      };

      render(
        <ToastProvider>
          <TestHook />
        </ToastProvider>
      );
    });
  });

  describe("Toast Notifications", () => {
    it("shows success toast with correct styling and icon", async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await userEvent.click(screen.getByText("Show Success"));

      const toast = screen.getByRole("alert");
      expect(toast).toHaveClass("toast--success");
      expect(toast).toContainElement(screen.getByTestId("check-circle-icon"));
      expect(screen.getByText("Success message")).toBeInTheDocument();
    });

    it("shows error toast that stays until dismissed", async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await userEvent.click(screen.getByText("Show Error"));

      const toast = screen.getByRole("alert");
      expect(toast).toHaveClass("toast--error");
      expect(toast).toContainElement(screen.getByTestId("x-circle-icon"));

      // Verify toast doesn't auto-dismiss
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(toast).toBeInTheDocument();
    });

    it("auto-dismisses toast after duration", async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await userEvent.click(screen.getByText("Show Success"));

      const toast = screen.getByRole("alert");
      expect(toast).toBeInTheDocument();

      // Advance timer by duration
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Wait for animation timeout
      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });

    it("manually closes toast when close button clicked", async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await userEvent.click(screen.getByText("Show Warning"));

      const closeButton = screen.getByLabelText("Close notification");
      await userEvent.click(closeButton);

      // Wait for animation timeout
      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });

    it("shows multiple toasts simultaneously", async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await userEvent.click(screen.getByText("Show Success"));
      await userEvent.click(screen.getByText("Show Error"));
      await userEvent.click(screen.getByText("Show Warning"));

      const toasts = screen.getAllByRole("alert");
      expect(toasts).toHaveLength(3);
    });

    it("applies animation classes correctly", async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await userEvent.click(screen.getByText("Show Info"));

      const toast = screen.getByRole("alert");
      expect(toast).toHaveClass("toast--animate-in");

      const closeButton = screen.getByLabelText("Close notification");
      await userEvent.click(closeButton);

      expect(document.getElementById(toast.parentElement.id)).toHaveClass(
        "toast--animate-out"
      );
    });

    it("shows progress bar for auto-dismissing toasts", async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await userEvent.click(screen.getByText("Show Success"));

      const progressBar = document.querySelector(".toast__progress");
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveStyle({ animationDuration: "1000ms" });
    });

    it("does not show progress bar for infinite duration toasts", async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await userEvent.click(screen.getByText("Show Error"));

      const progressBar = document.querySelector(".toast__progress");
      expect(progressBar).not.toBeInTheDocument();
    });
  });

  describe("Toast Context", () => {
    it("provides addToast and removeToast methods", () => {
      const TestContextConsumer = () => {
        const context = React.useContext(ToastContext);
        expect(context.addToast).toBeDefined();
        expect(context.removeToast).toBeDefined();
        return null;
      };

      render(
        <ToastProvider>
          <TestContextConsumer />
        </ToastProvider>
      );
    });

    it("generates unique IDs for each toast", async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await userEvent.click(screen.getByText("Show Success"));
      await userEvent.click(screen.getByText("Show Success"));

      const toastWrappers = document.querySelectorAll(".toast-wrapper");
      const ids = Array.from(toastWrappers).map((wrapper) => wrapper.id);
      const uniqueIds = new Set(ids);

      expect(ids.length).toBe(uniqueIds.size);
    });
  });
});
