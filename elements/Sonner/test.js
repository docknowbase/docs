import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react";
import { SonnerProvider, useSonner } from "./Sonner";
import { useContext } from "react";
import "@testing-library/jest-dom";

// Mock component to test hooks
const TestComponent = ({ onMount }) => {
  const sonner = useSonner();

  if (onMount) {
    onMount(sonner);
  }

  return null;
};

describe("Sonner Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe("SonnerProvider", () => {
    it("should render without crashing", () => {
      render(
        <SonnerProvider>
          <div>Test Child</div>
        </SonnerProvider>
      );
      expect(screen.getByText("Test Child")).toBeInTheDocument();
    });

    it("should render the notification container with correct position class", () => {
      const { container } = render(
        <SonnerProvider position="top-left">
          <div>Test</div>
        </SonnerProvider>
      );
      expect(
        container.querySelector(".sonner-container--top-left")
      ).toBeInTheDocument();
    });

    it("should use bottom-right as default position", () => {
      const { container } = render(
        <SonnerProvider>
          <div>Test</div>
        </SonnerProvider>
      );
      expect(
        container.querySelector(".sonner-container--bottom-right")
      ).toBeInTheDocument();
    });
  });

  describe("useSonner Hook", () => {
    it("should throw error when used outside SonnerProvider", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      expect(() => render(<TestComponent />)).toThrow(
        "useSonner must be used within a SonnerProvider"
      );
      consoleError.mockRestore();
    });

    it("should provide notification methods through context", () => {
      let sonnerMethods;
      render(
        <SonnerProvider>
          <TestComponent
            onMount={(s) => {
              sonnerMethods = s;
            }}
          />
        </SonnerProvider>
      );

      expect(sonnerMethods).toHaveProperty("success");
      expect(sonnerMethods).toHaveProperty("error");
      expect(sonnerMethods).toHaveProperty("info");
      expect(sonnerMethods).toHaveProperty("warning");
    });
  });

  describe("Notification Display", () => {
    it("should display success notification with correct styles and icon", () => {
      let sonner;
      const { container } = render(
        <SonnerProvider>
          <TestComponent
            onMount={(s) => {
              sonner = s;
            }}
          />
        </SonnerProvider>
      );

      act(() => {
        sonner.success("Success message");
      });

      const notification = container.querySelector(".sonner--success");
      expect(notification).toBeInTheDocument();
      expect(notification).toHaveTextContent("Success message");
      expect(notification.querySelector(".sonner__icon")).toBeInTheDocument();
    });

    it("should display multiple notifications in correct order", () => {
      let sonner;
      const { container } = render(
        <SonnerProvider>
          <TestComponent
            onMount={(s) => {
              sonner = s;
            }}
          />
        </SonnerProvider>
      );

      act(() => {
        sonner.success("First");
        sonner.error("Second");
        sonner.info("Third");
      });

      const notifications = container.querySelectorAll(".sonner");
      expect(notifications).toHaveLength(3);
      expect(notifications[0]).toHaveTextContent("Third");
      expect(notifications[1]).toHaveTextContent("Second");
      expect(notifications[2]).toHaveTextContent("First");
    });
  });

  describe("Notification Lifecycle", () => {
    it("should remove notification after default lifetime", () => {
      let sonner;
      const { container } = render(
        <SonnerProvider>
          <TestComponent
            onMount={(s) => {
              sonner = s;
            }}
          />
        </SonnerProvider>
      );

      act(() => {
        sonner.info("Test message");
      });

      expect(container.querySelectorAll(".sonner")).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(4000); // SONNER_LIFETIME
      });

      act(() => {
        vi.advanceTimersByTime(200); // SONNER_REMOVE_DELAY
      });

      expect(container.querySelectorAll(".sonner")).toHaveLength(0);
    });

    it("should remove notification when close button is clicked", () => {
      let sonner;
      const { container } = render(
        <SonnerProvider>
          <TestComponent
            onMount={(s) => {
              sonner = s;
            }}
          />
        </SonnerProvider>
      );

      act(() => {
        sonner.info("Test message");
      });

      const closeButton = container.querySelector(".sonner__close-button");
      expect(closeButton).toBeInTheDocument();

      fireEvent.click(closeButton);

      act(() => {
        vi.advanceTimersByTime(200); // SONNER_REMOVE_DELAY
      });

      expect(container.querySelectorAll(".sonner")).toHaveLength(0);
    });

    it("should add removing class before removing notification", () => {
      let sonner;
      const { container } = render(
        <SonnerProvider>
          <TestComponent
            onMount={(s) => {
              sonner = s;
            }}
          />
        </SonnerProvider>
      );

      act(() => {
        sonner.info("Test message");
      });

      const closeButton = container.querySelector(".sonner__close-button");
      fireEvent.click(closeButton);

      expect(container.querySelector(".sonner--removing")).toBeInTheDocument();
    });
  });

  describe("Notification Types", () => {
    let sonner;
    let container;

    beforeEach(() => {
      const rendered = render(
        <SonnerProvider>
          <TestComponent
            onMount={(s) => {
              sonner = s;
            }}
          />
        </SonnerProvider>
      );
      container = rendered.container;
    });

    it("should render success notification correctly", () => {
      act(() => {
        sonner.success("Success message");
      });
      expect(container.querySelector(".sonner--success")).toBeInTheDocument();
      expect(container.querySelector(".sonner__message")).toHaveTextContent(
        "Success message"
      );
    });

    it("should render error notification correctly", () => {
      act(() => {
        sonner.error("Error message");
      });
      expect(container.querySelector(".sonner--error")).toBeInTheDocument();
      expect(container.querySelector(".sonner__message")).toHaveTextContent(
        "Error message"
      );
    });

    it("should render info notification correctly", () => {
      act(() => {
        sonner.info("Info message");
      });
      expect(container.querySelector(".sonner--info")).toBeInTheDocument();
      expect(container.querySelector(".sonner__message")).toHaveTextContent(
        "Info message"
      );
    });

    it("should render warning notification correctly", () => {
      act(() => {
        sonner.warning("Warning message");
      });
      expect(container.querySelector(".sonner--warning")).toBeInTheDocument();
      expect(container.querySelector(".sonner__message")).toHaveTextContent(
        "Warning message"
      );
    });
  });
});
