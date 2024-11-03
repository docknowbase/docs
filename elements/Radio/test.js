import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RadioGroup from "./RadioGroup";
import { axe } from "jest-axe";

describe("RadioGroup Component", () => {
  beforeEach(() => {
    cleanup();
  });

  // Basic Rendering Tests
  describe("Rendering", () => {
    test("renders radio group with label", () => {
      render(
        <RadioGroup label="Select an option">
          <RadioGroup.Radio value="1" label="Option 1" />
          <RadioGroup.Radio value="2" label="Option 2" />
        </RadioGroup>
      );

      expect(screen.getByText("Select an option")).toBeInTheDocument();
      expect(screen.getByLabelText("Option 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Option 2")).toBeInTheDocument();
    });

    test("renders required asterisk when required prop is true", () => {
      render(
        <RadioGroup label="Select an option" required>
          <RadioGroup.Radio value="1" label="Option 1" />
        </RadioGroup>
      );

      expect(screen.getByText("*")).toBeInTheDocument();
    });

    test("renders error message when error prop is provided", () => {
      const errorMessage = "Please select an option";
      render(
        <RadioGroup label="Select an option" error={errorMessage}>
          <RadioGroup.Radio value="1" label="Option 1" />
        </RadioGroup>
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    test("renders description when provided", () => {
      render(
        <RadioGroup label="Select an option">
          <RadioGroup.Radio
            value="1"
            label="Option 1"
            description="This is a description"
          />
        </RadioGroup>
      );

      expect(screen.getByText("This is a description")).toBeInTheDocument();
    });
  });

  // Functionality Tests
  describe("Functionality", () => {
    test("calls onChange handler when radio is selected", async () => {
      const handleChange = vi.fn();
      render(
        <RadioGroup value="1" onChange={handleChange}>
          <RadioGroup.Radio value="1" label="Option 1" />
          <RadioGroup.Radio value="2" label="Option 2" />
        </RadioGroup>
      );

      const radio2 = screen.getByLabelText("Option 2");
      await userEvent.click(radio2);

      expect(handleChange).toHaveBeenCalledWith("2");
    });

    test("does not call onChange when disabled", async () => {
      const handleChange = vi.fn();
      render(
        <RadioGroup value="1" onChange={handleChange} disabled>
          <RadioGroup.Radio value="1" label="Option 1" />
          <RadioGroup.Radio value="2" label="Option 2" />
        </RadioGroup>
      );

      const radio2 = screen.getByLabelText("Option 2");
      await userEvent.click(radio2);

      expect(handleChange).not.toHaveBeenCalled();
    });

    test("individual radio can be disabled", async () => {
      const handleChange = vi.fn();
      render(
        <RadioGroup value="1" onChange={handleChange}>
          <RadioGroup.Radio value="1" label="Option 1" />
          <RadioGroup.Radio value="2" label="Option 2" disabled />
        </RadioGroup>
      );

      const radio2 = screen.getByLabelText("Option 2");
      await userEvent.click(radio2);

      expect(handleChange).not.toHaveBeenCalled();
      expect(radio2).toBeDisabled();
    });
  });

  // Style Classes Tests
  describe("Style Classes", () => {
    test("applies horizontal class when horizontal prop is true", () => {
      const { container } = render(
        <RadioGroup horizontal>
          <RadioGroup.Radio value="1" label="Option 1" />
        </RadioGroup>
      );

      expect(
        container.querySelector(".radio_group--horizontal")
      ).toBeInTheDocument();
    });

    test("applies size class correctly", () => {
      const { container } = render(
        <RadioGroup size="small">
          <RadioGroup.Radio value="1" label="Option 1" />
        </RadioGroup>
      );

      expect(
        container.querySelector(".radio_group--small")
      ).toBeInTheDocument();
    });

    test("applies variant class correctly", () => {
      const { container } = render(
        <RadioGroup variant="primary">
          <RadioGroup.Radio value="1" label="Option 1" />
        </RadioGroup>
      );

      expect(
        container.querySelector(".radio_group--primary")
      ).toBeInTheDocument();
    });

    test("applies custom className", () => {
      const { container } = render(
        <RadioGroup className="custom-class">
          <RadioGroup.Radio value="1" label="Option 1" />
        </RadioGroup>
      );

      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  // Context Tests
  describe("Context Behavior", () => {
    test("radio throws error when rendered outside RadioGroup", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<RadioGroup.Radio value="1" label="Option 1" />);
      }).toThrow();

      consoleError.mockRestore();
    });

    test("uses provided name prop over generated id", () => {
      const { container } = render(
        <RadioGroup name="custom-name">
          <RadioGroup.Radio value="1" label="Option 1" />
        </RadioGroup>
      );

      expect(
        container.querySelector('input[name="custom-name"]')
      ).toBeInTheDocument();
    });
  });

  // Accessibility Tests
  describe("Accessibility", () => {
    test("has no accessibility violations", async () => {
      const { container } = render(
        <RadioGroup label="Select an option" required>
          <RadioGroup.Radio value="1" label="Option 1" />
          <RadioGroup.Radio
            value="2"
            label="Option 2"
            description="Description"
          />
        </RadioGroup>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test("radio inputs are keyboard navigable", async () => {
      render(
        <RadioGroup value="1">
          <RadioGroup.Radio value="1" label="Option 1" />
          <RadioGroup.Radio value="2" label="Option 2" />
        </RadioGroup>
      );

      const radio1 = screen.getByLabelText("Option 1");
      const radio2 = screen.getByLabelText("Option 2");

      radio1.focus();
      expect(document.activeElement).toBe(radio1);

      await userEvent.tab();
      expect(document.activeElement).toBe(radio2);
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    test("handles empty children", () => {
      expect(() => {
        render(<RadioGroup label="Empty group" />);
      }).not.toThrow();
    });

    test("handles undefined onChange handler", async () => {
      render(
        <RadioGroup>
          <RadioGroup.Radio value="1" label="Option 1" />
        </RadioGroup>
      );

      const radio = screen.getByLabelText("Option 1");
      await userEvent.click(radio);
      // Should not throw
    });

    test("handles special characters in values and labels", () => {
      render(
        <RadioGroup>
          <RadioGroup.Radio value="<special>" label="Label & Special" />
        </RadioGroup>
      );

      expect(screen.getByLabelText("Label & Special")).toBeInTheDocument();
    });
  });
});
