import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DateRangePicker from "./DateRangePicker";

describe("DateRangePicker", () => {
  beforeEach(() => {
    // Mock new Date() to return a consistent date for testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 15)); // January 15, 2024
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe("Initial Render", () => {
    it("renders with default state", () => {
      render(<DateRangePicker />);
      expect(screen.getByText("Select date range")).toBeInTheDocument();
    });

    it("renders with initial dates", () => {
      const initialStartDate = new Date(2024, 0, 1);
      const initialEndDate = new Date(2024, 0, 5);
      render(
        <DateRangePicker
          initialStartDate={initialStartDate}
          initialEndDate={initialEndDate}
        />
      );
      expect(
        screen.getByText("January 1, 2024 - January 5, 2024")
      ).toBeInTheDocument();
    });

    it("shows current month and year in calendar header", () => {
      render(<DateRangePicker />);
      fireEvent.click(screen.getByText("Select date range"));
      expect(screen.getByText("January 2024")).toBeInTheDocument();
    });

    it("displays weekday headers", () => {
      render(<DateRangePicker />);
      fireEvent.click(screen.getByText("Select date range"));
      ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((day) => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });
  });

  describe("Calendar Navigation", () => {
    it("navigates to previous month", async () => {
      render(<DateRangePicker />);
      fireEvent.click(screen.getByText("Select date range"));

      const prevButton = screen.getByText("←");
      fireEvent.click(prevButton);

      expect(screen.getByText("December 2023")).toBeInTheDocument();
    });

    it("navigates to next month", () => {
      render(<DateRangePicker />);
      fireEvent.click(screen.getByText("Select date range"));

      const nextButton = screen.getByText("→");
      fireEvent.click(nextButton);

      expect(screen.getByText("February 2024")).toBeInTheDocument();
    });

    it("handles year transition when navigating months", () => {
      render(<DateRangePicker />);
      fireEvent.click(screen.getByText("Select date range"));

      // Go to previous month (December 2023)
      fireEvent.click(screen.getByText("←"));
      expect(screen.getByText("December 2023")).toBeInTheDocument();

      // Go to next month (back to January 2024)
      fireEvent.click(screen.getByText("→"));
      expect(screen.getByText("January 2024")).toBeInTheDocument();
    });
  });

  describe("Date Selection", () => {
    it("selects start date on first click", () => {
      render(<DateRangePicker />);
      fireEvent.click(screen.getByText("Select date range"));

      // Click on January 1
      const dayButton = screen.getByText("1");
      fireEvent.click(dayButton);

      expect(
        screen.getByText("January 1, 2024 - Select end date")
      ).toBeInTheDocument();
    });

    it("selects date range when clicking two dates", () => {
      const onRangeSelect = vi.fn();
      render(<DateRangePicker onRangeSelect={onRangeSelect} />);

      fireEvent.click(screen.getByText("Select date range"));

      // Select start date (January 1)
      fireEvent.click(screen.getByText("1"));

      // Select end date (January 5)
      fireEvent.click(screen.getByText("5"));

      expect(
        screen.getByText("January 1, 2024 - January 5, 2024")
      ).toBeInTheDocument();
      expect(onRangeSelect).toHaveBeenCalledWith({
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 5),
      });
    });

    it("handles reverse date selection (end date before start date)", () => {
      const onRangeSelect = vi.fn();
      render(<DateRangePicker onRangeSelect={onRangeSelect} />);

      fireEvent.click(screen.getByText("Select date range"));

      // Select start date (January 5)
      fireEvent.click(screen.getByText("5"));

      // Select end date (January 1)
      fireEvent.click(screen.getByText("1"));

      expect(
        screen.getByText("January 1, 2024 - January 5, 2024")
      ).toBeInTheDocument();
      expect(onRangeSelect).toHaveBeenCalledWith({
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 5),
      });
    });

    it("resets selection when clicking after a complete range", () => {
      render(<DateRangePicker />);
      fireEvent.click(screen.getByText("Select date range"));

      // Select initial range
      fireEvent.click(screen.getByText("1"));
      fireEvent.click(screen.getByText("5"));

      // Start new selection
      fireEvent.click(screen.getByText("10"));

      expect(
        screen.getByText("January 10, 2024 - Select end date")
      ).toBeInTheDocument();
    });
  });

  describe("Click Outside Behavior", () => {
    it("closes calendar when clicking outside", () => {
      render(
        <div>
          <DateRangePicker />
          <div data-testid="outside">Outside Element</div>
        </div>
      );

      // Open calendar
      fireEvent.click(screen.getByText("Select date range"));
      expect(screen.getByText("January 2024")).toBeInTheDocument();

      // Click outside
      fireEvent.mouseDown(screen.getByTestId("outside"));

      // Calendar should be closed (header text should not be visible)
      expect(screen.queryByText("January 2024")).not.toBeInTheDocument();
    });
  });

  describe("Special Date Handling", () => {
    it("correctly identifies and styles today's date", () => {
      render(<DateRangePicker />);
      fireEvent.click(screen.getByText("Select date range"));

      const todayButton = screen.getByText("15");
      expect(todayButton).toHaveClass("datepicker__day--today");
    });

    it("correctly displays and handles dates from previous month", () => {
      render(<DateRangePicker />);
      fireEvent.click(screen.getByText("Select date range"));

      const prevMonthDates = screen.getAllByText("31");
      expect(prevMonthDates[0]).toHaveClass("datepicker__day--other-month");
    });

    it("correctly displays and handles dates from next month", () => {
      render(<DateRangePicker />);
      fireEvent.click(screen.getByText("Select date range"));

      const nextMonthDates = screen.getAllByText("1");
      expect(nextMonthDates[nextMonthDates.length - 1]).toHaveClass(
        "datepicker__day--other-month"
      );
    });
  });

  describe("Leap Year Handling", () => {
    it("correctly displays February in a leap year", () => {
      vi.setSystemTime(new Date(2024, 1, 1)); // February 1, 2024 (leap year)

      render(<DateRangePicker />);
      fireEvent.click(screen.getByText("Select date range"));

      // Should find day 29 in February
      expect(screen.getByText("29")).toBeInTheDocument();
    });

    it("correctly displays February in a non-leap year", () => {
      vi.setSystemTime(new Date(2023, 1, 1)); // February 1, 2023 (non-leap year)

      render(<DateRangePicker />);
      fireEvent.click(screen.getByText("Select date range"));

      // Should not find day 29 in February
      expect(screen.queryByText("29")).not.toBeInTheDocument();
    });
  });

  describe("Range Highlighting", () => {
    it("highlights dates within selected range", () => {
      render(<DateRangePicker />);
      fireEvent.click(screen.getByText("Select date range"));

      // Select start date
      fireEvent.click(screen.getByText("1"));

      // Select end date
      fireEvent.click(screen.getByText("5"));

      // Check if dates in between are highlighted
      const day3 = screen.getByText("3");
      expect(day3).toHaveClass("datepicker__day--in-range");
    });
  });

  describe("Accessibility", () => {
    it("handles keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<DateRangePicker />);

      // Open calendar with keyboard
      const input = screen.getByText("Select date range");
      await user.tab();
      await user.keyboard("[Enter]");

      expect(screen.getByText("January 2024")).toBeInTheDocument();
    });

    it("maintains proper button types for all interactive elements", () => {
      render(<DateRangePicker />);
      fireEvent.click(screen.getByText("Select date range"));

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveAttribute("type", "button");
      });
    });
  });
});
