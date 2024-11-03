import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import Checkbox, {
  BasicCheckbox,
  IndeterminateCheckbox,
  ErrorCheckbox,
  CheckboxExample,
} from "./Checkbox";

// Mock styles import
vi.mock("./styles.scss", () => ({}));

describe("Checkbox Component", () => {
  beforeEach(() => {
    cleanup();
  });

  describe("Base Checkbox Functionality", () => {
    it("renders unchecked by default", () => {
      render(<Checkbox label="Test Checkbox" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox.checked).toBe(false);
    });

    it("renders with label when provided", () => {
      render(<Checkbox label="Test Label" />);
      expect(screen.getByText("Test Label")).toBeInTheDocument();
    });

    it("renders without label when not provided", () => {
      const { container } = render(<Checkbox />);
      expect(container.querySelector(".custom-checkbox__label")).toBeNull();
    });

    it("handles checked state change", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Checkbox label="Test Checkbox" onChange={onChange} />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(checkbox.checked).toBe(true);
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("applies disabled state correctly", () => {
      render(<Checkbox label="Disabled Checkbox" disabled />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeDisabled();
    });

    it("applies error state class correctly", () => {
      const { container } = render(<Checkbox label="Error Checkbox" error />);
      expect(container.firstChild).toHaveClass("custom-checkbox--error");
    });

    it("applies custom className correctly", () => {
      const { container } = render(<Checkbox className="custom-class" />);
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("Indeterminate State", () => {
    it("sets indeterminate state correctly", () => {
      render(<Checkbox label="Indeterminate" indeterminate />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox.indeterminate).toBe(true);
    });

    it("clears indeterminate state on change", async () => {
      const user = userEvent.setup();
      render(<Checkbox label="Indeterminate" indeterminate />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(checkbox.indeterminate).toBe(false);
    });
  });

  describe("Ref Forwarding", () => {
    it("forwards ref correctly", () => {
      const TestComponent = () => {
        const ref = useRef(null);
        render(<Checkbox ref={ref} label="Ref Test" />);
        expect(ref.current).toBeTruthy();
        expect(ref.current.type).toBe("checkbox");
      };

      TestComponent();
    });

    it("handles function ref correctly", () => {
      const refFn = vi.fn();
      render(<Checkbox ref={refFn} label="Function Ref Test" />);
      expect(refFn).toHaveBeenCalled();
    });
  });

  describe("BasicCheckbox Component", () => {
    it("manages its own state correctly", async () => {
      const user = userEvent.setup();
      render(<BasicCheckbox />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox.checked).toBe(false);

      await user.click(checkbox);
      expect(checkbox.checked).toBe(true);
    });
  });

  describe("IndeterminateCheckbox Component", () => {
    it("starts in indeterminate state", () => {
      render(<IndeterminateCheckbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox.indeterminate).toBe(true);
    });

    it("clears indeterminate state on click", async () => {
      const user = userEvent.setup();
      render(<IndeterminateCheckbox />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(checkbox.indeterminate).toBe(false);
      expect(checkbox.checked).toBe(true);
    });
  });

  describe("ErrorCheckbox Component", () => {
    it("renders with error state", () => {
      const { container } = render(<ErrorCheckbox />);
      expect(container.querySelector(".custom-checkbox--error")).toBeTruthy();
    });

    it("maintains functionality with error state", async () => {
      const user = userEvent.setup();
      render(<ErrorCheckbox />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(checkbox.checked).toBe(true);
    });
  });

  describe("CheckboxExample Component", () => {
    it("renders all example checkboxes", () => {
      render(<CheckboxExample />);

      expect(screen.getByText("Checkbox Examples")).toBeInTheDocument();
      expect(screen.getByText("Basic checkbox")).toBeInTheDocument();
      expect(screen.getByText("Indeterminate checkbox")).toBeInTheDocument();
      expect(screen.getByText("Disabled checkbox")).toBeInTheDocument();
      expect(screen.getByText("Error state checkbox")).toBeInTheDocument();
      expect(screen.getByText("Additional checkbox")).toBeInTheDocument();
    });

    it("maintains independent state for each checkbox", async () => {
      const user = userEvent.setup();
      render(<CheckboxExample />);

      const checkboxes = screen.getAllByRole("checkbox");

      await user.click(checkboxes[0]); // Basic checkbox
      expect(checkboxes[0].checked).toBe(true);
      expect(checkboxes[1].checked).toBe(false); // Other checkboxes should remain unchanged
    });
  });

  describe("Edge Cases", () => {
    it("handles rapid state changes correctly", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Checkbox label="Test Checkbox" onChange={onChange} />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);

      expect(onChange).toHaveBeenCalledTimes(3);
    });

    it("updates internal state when props change", () => {
      const { rerender } = render(<Checkbox checked={false} />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox.checked).toBe(false);

      rerender(<Checkbox checked={true} />);
      expect(checkbox.checked).toBe(true);
    });

    it("handles null and undefined props gracefully", () => {
      render(<Checkbox label={null} className={undefined} />);
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });
  });
});
