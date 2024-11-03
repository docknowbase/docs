// src/domain/types/date.types.ts
export interface DateVO {
  day: number;
  month: number;
  year: number;
}

export interface CalendarDay extends DateVO {
  isCurrentMonth: boolean;
}

export type NavigationDirection = "prev" | "next";

// src/domain/calendar.service.ts
export class CalendarService {
  private static readonly DAYS_IN_MONTH: number[] = [
    31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
  ];
  private static readonly DAYS_IN_CALENDAR: number = 42; // 6 weeks * 7 days

  private static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  private static getDaysInMonth(month: number, year: number): number {
    return month === 1 && this.isLeapYear(year)
      ? 29
      : this.DAYS_IN_MONTH[month];
  }

  private static getFirstDayOfMonth(month: number, year: number): number {
    return new Date(year, month, 1).getDay();
  }

  public static generateCalendarDays(
    displayMonth: number,
    displayYear: number
  ): CalendarDay[] {
    const daysInMonth: number = this.getDaysInMonth(displayMonth, displayYear);
    const firstDay: number = this.getFirstDayOfMonth(displayMonth, displayYear);
    const days: CalendarDay[] = [];

    // Calculate previous month days
    const prevMonth: number = displayMonth === 0 ? 11 : displayMonth - 1;
    const prevYear: number = displayMonth === 0 ? displayYear - 1 : displayYear;
    const prevMonthDays: number = this.getDaysInMonth(prevMonth, prevYear);

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: displayMonth,
        year: displayYear,
        isCurrentMonth: true,
      });
    }

    // Next month days
    const nextMonth: number = displayMonth === 11 ? 0 : displayMonth + 1;
    const nextYear: number =
      displayMonth === 11 ? displayYear + 1 : displayYear;
    let nextMonthDay: number = 1;

    while (days.length < this.DAYS_IN_CALENDAR) {
      days.push({
        day: nextMonthDay++,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
      });
    }

    return days;
  }

  public static isToday(date: DateVO): boolean {
    const today = new Date();
    return (
      date.day === today.getDate() &&
      date.month === today.getMonth() &&
      date.year === today.getFullYear()
    );
  }

  public static navigateMonth(
    currentMonth: number,
    currentYear: number,
    direction: NavigationDirection
  ): { month: number; year: number } {
    if (direction === "prev") {
      if (currentMonth === 0) {
        return { month: 11, year: currentYear - 1 };
      }
      return { month: currentMonth - 1, year: currentYear };
    } else {
      if (currentMonth === 11) {
        return { month: 0, year: currentYear + 1 };
      }
      return { month: currentMonth + 1, year: currentYear };
    }
  }
}

// src/application/ports/datePicker.port.ts
export interface DatePickerPort {
  onDateSelect: (date: Date) => void;
  initialDate?: Date;
}

export interface DateDisplayPort {
  formatDate: (date: DateVO) => string;
  formatMonth: (month: number, year: number) => string;
}

// src/infrastructure/adapters/dateFormatter.adapter.ts
export class DateFormatterAdapter implements DateDisplayPort {
  private static readonly MONTHS: readonly string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ] as const;

  public formatDate(date: DateVO): string {
    return `${DateFormatterAdapter.MONTHS[date.month]} ${date.day}, ${
      date.year
    }`;
  }

  public formatMonth(month: number, year: number): string {
    return `${DateFormatterAdapter.MONTHS[month]} ${year}`;
  }
}

// src/presentation/components/DatePickerHeader.tsx
import React from "react";
import { DateDisplayPort } from "../../application/ports/datePicker.port";
import { NavigationDirection } from "../../domain/types/date.types";

interface DatePickerHeaderProps {
  month: number;
  year: number;
  onNavigate: (direction: NavigationDirection) => void;
  dateFormatter: DateDisplayPort;
}

export const DatePickerHeader: React.FC<DatePickerHeaderProps> = ({
  month,
  year,
  onNavigate,
  dateFormatter,
}) => (
  <div className="datepicker__header">
    <button
      className="datepicker__nav_button datepicker__nav_button--prev"
      onClick={() => onNavigate("prev")}
      type="button"
      aria-label="Previous month"
    >
      ←
    </button>
    <div className="datepicker__month_display">
      {dateFormatter.formatMonth(month, year)}
    </div>
    <button
      className="datepicker__nav_button datepicker__nav_button--next"
      onClick={() => onNavigate("next")}
      type="button"
      aria-label="Next month"
    >
      →
    </button>
  </div>
);

// src/presentation/components/DatePickerGrid.tsx
import React from "react";
import classNames from "classnames";
import { CalendarDay, DateVO } from "../../domain/types/date.types";

interface DatePickerGridProps {
  days: CalendarDay[];
  selectedDate: DateVO;
  onDateSelect: (date: CalendarDay) => void;
  isToday: (date: DateVO) => boolean;
}

const WEEKDAYS: readonly string[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

export const DatePickerGrid: React.FC<DatePickerGridProps> = ({
  days,
  selectedDate,
  onDateSelect,
  isToday,
}) => {
  const isSelected = (date: CalendarDay): boolean => {
    return (
      date.day === selectedDate.day &&
      date.month === selectedDate.month &&
      date.year === selectedDate.year
    );
  };

  const getDateButtonClasses = (date: CalendarDay): string => {
    return classNames("datepicker__day", {
      "datepicker__day--other-month": !date.isCurrentMonth,
      "datepicker__day--selected": isSelected(date),
      "datepicker__day--today": isToday(date),
    });
  };

  return (
    <>
      <div className="datepicker__weekdays">
        {WEEKDAYS.map((day) => (
          <div key={day} className="datepicker__weekday">
            {day}
          </div>
        ))}
      </div>
      <div className="datepicker__days_grid">
        {days.map((date) => (
          <button
            key={`${date.year}-${date.month}-${date.day}`}
            onClick={() => onDateSelect(date)}
            className={getDateButtonClasses(date)}
            type="button"
            aria-label={`Select ${date.day}`}
            aria-pressed={isSelected(date)}
          >
            {date.day}
          </button>
        ))}
      </div>
    </>
  );
};

// src/hooks/useClickOutside.ts
import { RefObject, useEffect } from "react";

export function useClickOutside(
  ref: RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// src/presentation/DatePicker.tsx
import React, { useState, useRef } from "react";
import classNames from "classnames";
import { DatePickerPort } from "../application/ports/datePicker.port";
import { DateFormatterAdapter } from "../infrastructure/adapters/dateFormatter.adapter";
import { CalendarService } from "../domain/calendar.service";
import { DatePickerHeader } from "./components/DatePickerHeader";
import { DatePickerGrid } from "./components/DatePickerGrid";
import {
  DateVO,
  CalendarDay,
  NavigationDirection,
} from "../domain/types/date.types";
import { useClickOutside } from "../hooks/useClickOutside";

export const DatePicker: React.FC<DatePickerPort> = ({
  onDateSelect,
  initialDate,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<DateVO>({
    day: initialDate?.getDate() || new Date().getDate(),
    month: initialDate?.getMonth() || new Date().getMonth(),
    year: initialDate?.getFullYear() || new Date().getFullYear(),
  });

  const [displayMonth, setDisplayMonth] = useState<number>(selectedDate.month);
  const [displayYear, setDisplayYear] = useState<number>(selectedDate.year);

  const datePickerRef = useRef<HTMLDivElement>(null);
  const dateFormatter = new DateFormatterAdapter();

  useClickOutside(datePickerRef, () => setIsOpen(false));

  const handleDateClick = (dateObj: CalendarDay): void => {
    setSelectedDate({
      day: dateObj.day,
      month: dateObj.month,
      year: dateObj.year,
    });

    if (dateObj.month !== displayMonth) {
      setDisplayMonth(dateObj.month);
      setDisplayYear(dateObj.year);
    }

    const selectedDateObj = new Date(dateObj.year, dateObj.month, dateObj.day);
    onDateSelect(selectedDateObj);
    setIsOpen(false);
  };

  const handleNavigateMonth = (direction: NavigationDirection): void => {
    const { month, year } = CalendarService.navigateMonth(
      displayMonth,
      displayYear,
      direction
    );
    setDisplayMonth(month);
    setDisplayYear(year);
  };

  const calendarDays = CalendarService.generateCalendarDays(
    displayMonth,
    displayYear
  );

  return (
    <div className="datepicker" ref={datePickerRef}>
      <div
        className={classNames("datepicker__input", {
          "datepicker__input--focused": isOpen,
        })}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {dateFormatter.formatDate(selectedDate)}
      </div>

      {isOpen && (
        <div
          className="datepicker__calendar datepicker__calendar--visible"
          role="dialog"
          aria-label="Calendar"
        >
          <DatePickerHeader
            month={displayMonth}
            year={displayYear}
            onNavigate={handleNavigateMonth}
            dateFormatter={dateFormatter}
          />
          <DatePickerGrid
            days={calendarDays}
            selectedDate={selectedDate}
            onDateSelect={handleDateClick}
            isToday={CalendarService.isToday}
          />
        </div>
      )}
    </div>
  );
};

export default DatePicker;
