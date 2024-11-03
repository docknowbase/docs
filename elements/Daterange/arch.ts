// src/domain/types.ts
export interface DateObject {
  day: number;
  month: number;
  year: number;
}

export interface DateRange {
  startDate: DateObject | null;
  endDate: DateObject | null;
}

export interface CalendarDay extends DateObject {
  isCurrentMonth: boolean;
}

export enum NavigationDirection {
  PREV = "prev",
  NEXT = "next",
}

// src/domain/constants.ts
export const DAYS: readonly string[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;
export const MONTHS: readonly string[] = [
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

// src/domain/date.service.ts
export interface IDateService {
  isLeapYear(year: number): boolean;
  getDaysInMonth(month: number, year: number): number;
  getFirstDayOfMonth(month: number, year: number): number;
  getDateTimestamp(dateObj: DateObject): number;
  isToday(dateObj: DateObject): boolean;
  toDateObject(date: Date): DateObject;
  fromDateObject(dateObj: DateObject): Date;
}

export class DateService implements IDateService {
  public isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  public getDaysInMonth(month: number, year: number): number {
    const daysInMonth: readonly number[] = [
      31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
    ] as const;
    return month === 1 && this.isLeapYear(year) ? 29 : daysInMonth[month];
  }

  public getFirstDayOfMonth(month: number, year: number): number {
    return new Date(year, month, 1).getDay();
  }

  public getDateTimestamp(dateObj: DateObject): number {
    return new Date(dateObj.year, dateObj.month, dateObj.day).getTime();
  }

  public isToday(dateObj: DateObject): boolean {
    const today = new Date();
    return (
      dateObj.day === today.getDate() &&
      dateObj.month === today.getMonth() &&
      dateObj.year === today.getFullYear()
    );
  }

  public toDateObject(date: Date): DateObject {
    return {
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
    };
  }

  public fromDateObject(dateObj: DateObject): Date {
    return new Date(dateObj.year, dateObj.month, dateObj.day);
  }
}

// src/application/calendar.service.ts
export interface ICalendarService {
  generateCalendarDays(
    displayMonth: number,
    displayYear: number
  ): CalendarDay[];
}

export class CalendarService implements ICalendarService {
  constructor(private dateService: IDateService) {}

  public generateCalendarDays(
    displayMonth: number,
    displayYear: number
  ): CalendarDay[] {
    const daysInMonth = this.dateService.getDaysInMonth(
      displayMonth,
      displayYear
    );
    const firstDay = this.dateService.getFirstDayOfMonth(
      displayMonth,
      displayYear
    );
    const days: CalendarDay[] = [];

    // Previous month days
    const prevMonth = displayMonth === 0 ? 11 : displayMonth - 1;
    const prevYear = displayMonth === 0 ? displayYear - 1 : displayYear;
    const prevMonthDays = this.dateService.getDaysInMonth(prevMonth, prevYear);

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
    const nextMonth = displayMonth === 11 ? 0 : displayMonth + 1;
    const nextYear = displayMonth === 11 ? displayYear + 1 : displayYear;
    let nextMonthDay = 1;

    while (days.length < 42) {
      days.push({
        day: nextMonthDay,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
      });
      nextMonthDay++;
    }

    return days;
  }
}

// src/application/date-range.service.ts
export interface DateRangeSelectionResult {
  startDate: Date;
  endDate: Date;
}

export interface IDateRangeService {
  isInRange(dateObj: DateObject, range: DateRange): boolean;
  handleDateSelection(dateObj: DateObject, currentRange: DateRange): DateRange;
}

export class DateRangeService implements IDateRangeService {
  constructor(private dateService: IDateService) {}

  public isInRange(dateObj: DateObject, range: DateRange): boolean {
    if (!range.startDate || !range.endDate) return false;

    const currentTimestamp = this.dateService.getDateTimestamp(dateObj);
    const startTimestamp = this.dateService.getDateTimestamp(range.startDate);
    const endTimestamp = this.dateService.getDateTimestamp(range.endDate);

    return currentTimestamp > startTimestamp && currentTimestamp < endTimestamp;
  }

  public handleDateSelection(
    dateObj: DateObject,
    currentRange: DateRange
  ): DateRange {
    const { startDate, endDate } = currentRange;

    if (!startDate || (startDate && endDate)) {
      return { startDate: dateObj, endDate: null };
    }

    const startTimestamp = this.dateService.getDateTimestamp(startDate);
    const clickedTimestamp = this.dateService.getDateTimestamp(dateObj);

    return clickedTimestamp < startTimestamp
      ? { startDate: dateObj, endDate: startDate }
      : { startDate, endDate: dateObj };
  }
}

// src/adapters/ui/components/DatePickerHeader.tsx
import React from "react";

interface DatePickerHeaderProps {
  displayMonth: number;
  displayYear: number;
  onNavigateMonth: (direction: NavigationDirection) => void;
}

export const DatePickerHeader: React.FC<DatePickerHeaderProps> = ({
  displayMonth,
  displayYear,
  onNavigateMonth,
}) => (
  <div className="datepicker__header">
    <button
      className="datepicker__nav_button datepicker__nav_button--prev"
      onClick={() => onNavigateMonth(NavigationDirection.PREV)}
      type="button"
    >
      ←
    </button>
    <div className="datepicker__month_display">
      {MONTHS[displayMonth]} {displayYear}
    </div>
    <button
      className="datepicker__nav_button datepicker__nav_button--next"
      onClick={() => onNavigateMonth(NavigationDirection.NEXT)}
      type="button"
    >
      →
    </button>
  </div>
);

// src/adapters/ui/components/CalendarGrid.tsx
import React from "react";
import classNames from "classnames";

interface CalendarGridProps {
  calendarDays: CalendarDay[];
  dateRange: DateRange;
  dateRangeService: IDateRangeService;
  onDateClick: (dateObj: DateObject) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  calendarDays,
  dateRange,
  dateRangeService,
  onDateClick,
}) => {
  const isSelected = (dateObj: DateObject): boolean => {
    const { startDate, endDate } = dateRange;
    return (
      (startDate &&
        dateObj.day === startDate.day &&
        dateObj.month === startDate.month &&
        dateObj.year === startDate.year) ||
      (endDate &&
        dateObj.day === endDate.day &&
        dateObj.month === endDate.month &&
        dateObj.year === endDate.year)
    );
  };

  const getDateButtonClasses = (dateObj: CalendarDay): string => {
    return classNames("datepicker__day", {
      "datepicker__day--other-month": !dateObj.isCurrentMonth,
      "datepicker__day--selected": isSelected(dateObj),
      "datepicker__day--in-range": dateRangeService.isInRange(
        dateObj,
        dateRange
      ),
    });
  };

  return (
    <div className="datepicker__days_grid">
      {calendarDays.map((dateObj) => (
        <button
          key={`${dateObj.year}-${dateObj.month}-${dateObj.day}`}
          onClick={() => onDateClick(dateObj)}
          className={getDateButtonClasses(dateObj)}
          type="button"
        >
          {dateObj.day}
        </button>
      ))}
    </div>
  );
};

// src/adapters/ui/DateRangePicker.tsx
import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";

interface DateRangePickerProps {
  onRangeSelect?: (range: DateRangeSelectionResult) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onRangeSelect,
  initialStartDate,
  initialEndDate,
}) => {
  // Initialize services
  const dateService = new DateService();
  const calendarService = new CalendarService(dateService);
  const dateRangeService = new DateRangeService(dateService);

  // State
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: initialStartDate
      ? dateService.toDateObject(initialStartDate)
      : null,
    endDate: initialEndDate ? dateService.toDateObject(initialEndDate) : null,
  });

  const [displayMonth, setDisplayMonth] = useState<number>(
    initialStartDate?.getMonth() || new Date().getMonth()
  );
  const [displayYear, setDisplayYear] = useState<number>(
    initialStartDate?.getFullYear() || new Date().getFullYear()
  );

  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateClick = (dateObj: DateObject): void => {
    const newRange = dateRangeService.handleDateSelection(dateObj, dateRange);
    setDateRange(newRange);

    if (newRange.startDate && newRange.endDate && onRangeSelect) {
      onRangeSelect({
        startDate: dateService.fromDateObject(newRange.startDate),
        endDate: dateService.fromDateObject(newRange.endDate),
      });
    }
  };

  const navigateMonth = (direction: NavigationDirection): void => {
    if (direction === NavigationDirection.PREV) {
      if (displayMonth === 0) {
        setDisplayMonth(11);
        setDisplayYear((prev) => prev - 1);
      } else {
        setDisplayMonth((prev) => prev - 1);
      }
    } else {
      if (displayMonth === 11) {
        setDisplayMonth(0);
        setDisplayYear((prev) => prev + 1);
      } else {
        setDisplayMonth((prev) => prev + 1);
      }
    }
  };

  const formatDisplayDate = (): string => {
    if (!dateRange.startDate) return "Select date range";

    const formatDate = (date: DateObject): string => {
      return `${MONTHS[date.month]} ${date.day}, ${date.year}`;
    };

    if (!dateRange.endDate) {
      return `${formatDate(dateRange.startDate)} - Select end date`;
    }
    return `${formatDate(dateRange.startDate)} - ${formatDate(
      dateRange.endDate
    )}`;
  };

  const calendarDays = calendarService.generateCalendarDays(
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
      >
        {formatDisplayDate()}
      </div>

      {isOpen && (
        <div className="datepicker__calendar datepicker__calendar--visible">
          <DatePickerHeader
            displayMonth={displayMonth}
            displayYear={displayYear}
            onNavigateMonth={navigateMonth}
          />

          <div className="datepicker__weekdays">
            {DAYS.map((day) => (
              <div key={day} className="datepicker__weekday">
                {day}
              </div>
            ))}
          </div>

          <CalendarGrid
            calendarDays={calendarDays}
            dateRange={dateRange}
            dateRangeService={dateRangeService}
            onDateClick={handleDateClick}
          />
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
