import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DatePicker from "./DatePicker";

describe("DatePicker Component", () => {
  // Mock date to ensure consistent testing
  const mockDate = new Date(2024, 0, 15); // January 15, 2024

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Initial Rendering", () => {
    test("renders with current date when no initial date is provided", () => {
      render(<DatePicker />);
      expect(screen.getByText("January 15, 2024")).toBeInTheDocument();
    });

    test("renders with provided initial date", () => {
      const initialDate = new Date(2023, 11, 25); // December 25, 2023
      render(<DatePicker initialDate={initialDate} />);
      expect(screen.getByText("December 25, 2023")).toBeInTheDocument();
    });

    test("calendar is hidden by default", () => {
      render(<DatePicker />);
      expect(screen.queryByText("Sun")).not.toBeInTheDocument();
    });
  });

  describe("Calendar Toggle", () => {
    test("opens calendar when input is clicked", async () => {
      render(<DatePicker />);
      await userEvent.click(screen.getByText("January 15, 2024"));
      expect(screen.getByText("Sun")).toBeInTheDocument();
      expect(screen.getAllByRole("button")).toHaveLength(44); // 42 days + 2 navigation buttons
    });

    test("closes calendar when clicking outside", () => {
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <DatePicker />
        </div>
      );

      fireEvent.click(screen.getByText("January 15, 2024"));
      fireEvent.mouseDown(screen.getByTestId("outside"));

      expect(screen.queryByText("Sun")).not.toBeInTheDocument();
    });
  });

  describe("Date Selection", () => {
    test("selects date when clicked", async () => {
      const onDateSelect = vi.fn();
      render(<DatePicker onDateSelect={onDateSelect} />);

      await userEvent.click(screen.getByText("January 15, 2024"));
      await userEvent.click(screen.getByText("20"));

      expect(screen.getByText("January 20, 2024")).toBeInTheDocument();
      expect(onDateSelect).toHaveBeenCalledWith(new Date(2024, 0, 20));
    });

    test("handles selection of dates from previous month", async () => {
      const onDateSelect = vi.fn();
      render(<DatePicker onDateSelect={onDateSelect} />);

      await userEvent.click(screen.getByText("January 15, 2024"));
      const prevMonthDays = screen
        .getAllByRole("button")
        .filter((button) =>
          button.classList.contains("datepicker__day--other-month")
        );
      await userEvent.click(prevMonthDays[0]);

      expect(onDateSelect).toHaveBeenCalled();
    });

    test("handles selection of dates from next month", async () => {
      const onDateSelect = vi.fn();
      render(<DatePicker onDateSelect={onDateSelect} />);

      await userEvent.click(screen.getByText("January 15, 2024"));
      const nextMonthDays = screen
        .getAllByRole("button")
        .filter((button) =>
          button.classList.contains("datepicker__day--other-month")
        );
      await userEvent.click(nextMonthDays[nextMonthDays.length - 1]);

      expect(onDateSelect).toHaveBeenCalled();
    });
  });

  describe("Month Navigation", () => {
    test("navigates to previous month", async () => {
      render(<DatePicker />);

      await userEvent.click(screen.getByText("January 15, 2024"));
      await userEvent.click(screen.getByText("←"));

      expect(screen.getByText("December 2023")).toBeInTheDocument();
    });

    test("navigates to next month", async () => {
      render(<DatePicker />);

      await userEvent.click(screen.getByText("January 15, 2024"));
      await userEvent.click(screen.getByText("→"));

      expect(screen.getByText("February 2024")).toBeInTheDocument();
    });

    test("handles year change when navigating backwards from January", async () => {
      const initialDate = new Date(2024, 0, 15); // January 15, 2024
      render(<DatePicker initialDate={initialDate} />);

      await userEvent.click(screen.getByText("January 15, 2024"));
      await userEvent.click(screen.getByText("←"));

      expect(screen.getByText("December 2023")).toBeInTheDocument();
    });

    test("handles year change when navigating forward from December", async () => {
      const initialDate = new Date(2023, 11, 15); // December 15, 2023
      render(<DatePicker initialDate={initialDate} />);

      await userEvent.click(screen.getByText("December 15, 2023"));
      await userEvent.click(screen.getByText("→"));

      expect(screen.getByText("January 2024")).toBeInTheDocument();
    });
  });

  describe("Special Cases", () => {
    test("handles leap year correctly", async () => {
      const initialDate = new Date(2024, 1, 15); // February 15, 2024 (leap year)
      render(<DatePicker initialDate={initialDate} />);

      await userEvent.click(screen.getByText("February 15, 2024"));

      expect(screen.getByText("29")).toBeInTheDocument();
    });

    test("highlights today's date", () => {
      render(<DatePicker />);

      fireEvent.click(screen.getByText("January 15, 2024"));

      const todayButton = screen.getByText("15").closest("button");
      expect(todayButton).toHaveClass("datepicker__day--today");
    });

    test("highlights selected date", async () => {
      render(<DatePicker />);

      await userEvent.click(screen.getByText("January 15, 2024"));
      await userEvent.click(screen.getByText("20"));

      await userEvent.click(screen.getByText("January 20, 2024"));
      const selectedButton = screen.getByText("20").closest("button");
      expect(selectedButton).toHaveClass("datepicker__day--selected");
    });
  });

  describe("Edge Cases", () => {
    test("handles undefined onDateSelect prop", async () => {
      render(<DatePicker />);

      await userEvent.click(screen.getByText("January 15, 2024"));
      await userEvent.click(screen.getByText("20"));

      expect(screen.getByText("January 20, 2024")).toBeInTheDocument();
    });

    test("handles multiple rapid month navigation clicks", async () => {
      render(<DatePicker />);

      await userEvent.click(screen.getByText("January 15, 2024"));
      await userEvent.click(screen.getByText("→"));
      await userEvent.click(screen.getByText("→"));
      await userEvent.click(screen.getByText("→"));

      expect(screen.getByText("April 2024")).toBeInTheDocument();
    });

    test("maintains selected date when navigating months", async () => {
      render(<DatePicker />);

      await userEvent.click(screen.getByText("January 15, 2024"));
      await userEvent.click(screen.getByText("20"));
      await userEvent.click(screen.getByText("→"));
      await userEvent.click(screen.getByText("←"));

      expect(screen.getByText("January 20, 2024")).toBeInTheDocument();
    });
  });
});
